import { type Entity, type Vector3 } from "@minecraft/server";

type Actor = Pick<
  Entity,
  "getDynamicProperty" | "setDynamicProperty" | "getDynamicPropertyIds"
>;

type StorageValue = Exclude<
  ReturnType<Entity["getDynamicProperty"]>,
  undefined
>;
type StorageTypes = {
  string: string;
  number: number;
  boolean: boolean;
  vector3: Vector3;
};
export type ActorStorageProperty = {
  [T in keyof StorageTypes]: { type: T; default?: StorageTypes[T] };
}[keyof StorageTypes];
export type ActorStorageSchema = Record<string, ActorStorageProperty>;
type StorageValues<S extends ActorStorageSchema> = {
  [K in keyof S]: StorageTypes[S[K]["type"]];
};
type StorageRead<P extends ActorStorageProperty> =
  | StorageTypes[P["type"]]
  | (P extends { default: StorageValue } ? never : undefined);

function matchesStorageType(
  type: keyof StorageTypes,
  value: unknown,
): value is StorageValue {
  if (type !== "vector3") {
    return typeof value === type;
  }
  return (
    typeof value === "object" &&
    value !== null &&
    "x" in value &&
    typeof value.x === "number" &&
    "y" in value &&
    typeof value.y === "number" &&
    "z" in value &&
    typeof value.z === "number"
  );
}

abstract class BaseStorage<
  T,
  K extends string = string,
  U = Map<K, T | undefined>,
> {
  private static readonly ids = new Set<string>();
  protected cache = new WeakMap<Actor, U>();
  constructor(protected readonly prefix: string) {
    if (BaseStorage.ids.has(prefix)) {
      throw new Error(`Storage prefix "${prefix}" is already used.`);
    }
    BaseStorage.ids.add(prefix);
  }
  protected getActorPrefix(): string {
    return `__${this.prefix}|`;
  }
  clear(actor: Actor): void {
    const actorPrefix = this.getActorPrefix();
    this.cache.delete(actor);
    for (const key of actor.getDynamicPropertyIds()) {
      if (key.startsWith(actorPrefix)) {
        actor.setDynamicProperty(key, undefined);
      }
    }
  }
}

abstract class MapStorage<T, K extends string = string> extends BaseStorage<
  T,
  K
> {
  protected abstract loadCache(actor: Actor, key: K): void;
  protected getActorKey(key: K): string {
    return `${this.getActorPrefix()}${key}`;
  }
  delete(actor: Actor, key: K): void {
    const actorKey = this.getActorKey(key);
    actor.setDynamicProperty(actorKey, undefined);
    const actorCache = this.cache.get(actor);
    if (actorCache) {
      actorCache.delete(key);
    }
  }
  get(actor: Actor, key: K): T | undefined {
    if (!this.cache.has(actor)) {
      this.cache.set(actor, new Map());
    }
    const actorCache = this.cache.get(actor)!;
    if (!actorCache.has(key)) {
      this.loadCache(actor, key);
      if (actorCache.get(key) === undefined) {
        actorCache.delete(key);
      }
    }
    return actorCache.get(key);
  }
  keys(actor: Actor): K[] {
    const prefix = this.getActorPrefix();
    const out: K[] = [];
    for (const id of actor.getDynamicPropertyIds()) {
      if (id.startsWith(prefix)) {
        out.push(id.slice(prefix.length) as K);
      }
    }
    return out;
  }
  entries(actor: Actor): Array<[K, T]> {
    const out: Array<[K, T]> = [];
    for (const key of this.keys(actor)) {
      const value = this.get(actor, key);
      if (value !== undefined) {
        out.push([key, value]);
      }
    }
    return out;
  }
  abstract set(actor: Actor, key: K, value: T): void;
}

/**
 * Storage for dynamic properties on actors.
 */
export class ActorStorage<
  const S extends ActorStorageSchema,
> extends MapStorage<StorageValues<S>[keyof S], keyof S & string> {
  constructor(
    prefix: string,
    private readonly schema: S,
  ) {
    for (const key in schema) {
      const property = schema[key];
      if (
        !property ||
        (property.type !== "string" &&
          property.type !== "number" &&
          property.type !== "boolean" &&
          property.type !== "vector3")
      ) {
        throw new TypeError(`Invalid storage type for "${key}".`);
      }
      if (
        property.default !== undefined &&
        !matchesStorageType(property.type, property.default)
      ) {
        throw new TypeError(
          `Invalid default for "${key}": expected ${property.type}.`,
        );
      }
    }
    super(prefix);
  }
  private getProperty<P extends keyof S & string>(key: P): S[P] {
    if (!Object.prototype.hasOwnProperty.call(this.schema, key)) {
      throw new Error(`Unknown storage key "${key}".`);
    }
    return this.schema[key];
  }
  protected override loadCache(actor: Actor, key: keyof S & string): void {
    const property = this.getProperty(key);
    let value = actor.getDynamicProperty(this.getActorKey(key));
    if (value !== undefined && !matchesStorageType(property.type, value)) {
      throw new TypeError(
        `Invalid value for "${key}": expected ${property.type}.`,
      );
    }
    if (value === undefined) {
      value = property.default;
      if (property.type === "vector3" && property.default !== undefined) {
        const { x, y, z } = property.default;
        value = { x, y, z };
      }
    }
    this.cache
      .get(actor)!
      .set(key, value as StorageValues<S>[keyof S] | undefined);
  }
  override get<P extends keyof S & string>(
    actor: Actor,
    key: P,
  ): StorageRead<S[P]> {
    this.getProperty(key);
    return super.get(actor, key) as StorageRead<S[P]>;
  }
  override set<P extends keyof S & string>(
    actor: Actor,
    key: P,
    value: StorageValues<S>[P],
  ): void {
    const property = this.getProperty(key);
    if (!matchesStorageType(property.type, value)) {
      throw new TypeError(
        `Invalid value for "${key}": expected ${property.type}.`,
      );
    }
    actor.setDynamicProperty(this.getActorKey(key), value);
    if (!this.cache.has(actor)) {
      this.cache.set(actor, new Map());
    }
    this.cache.get(actor)!.set(key, value);
  }
  override delete(actor: Actor, key: keyof S & string): void {
    this.getProperty(key);
    super.delete(actor, key);
  }
}

/**
 * Storage for serialized objects on actors.
 * Objects are serialized to JSON strings before being stored as dynamic properties.
 * @example
 * ```ts
 * interface MyData {
 *   name: string;
 *   location: Vector3;
 * }
 * const storage = new SerializedStorage<MyData>("mySerializedStorage");
 * const myData: MyData = { name: "Test", location: { x: 0, y: 64, z: 0 } };
 * storage.set(actor, "dataKey", myData);
 * const retrievedData = storage.get(actor, "dataKey"); // { name: "Test", location: { x: 0, y: 64, z: 0 } }
 * ```
 */
export class SerializedStorage<
  T extends object,
  K extends string = string,
> extends MapStorage<T, K> {
  protected override loadCache(actor: Actor, key: K): void {
    const actorKey = this.getActorKey(key);
    const value = actor.getDynamicProperty(actorKey);
    let flag = false;
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value) as T;
        this.cache.get(actor)!.set(key, parsed);
        flag = true;
      } catch {}
    }
    if (!flag) {
      this.cache.get(actor)!.set(key, undefined);
      actor.setDynamicProperty(actorKey, undefined);
    }
  }
  override set(actor: Actor, key: K, value: T): void {
    const actorKey = this.getActorKey(key);
    actor.setDynamicProperty(actorKey, JSON.stringify(value));
    if (!this.cache.has(actor)) {
      this.cache.set(actor, new Map());
    }
    this.cache.get(actor)!.set(key, value);
  }
}

/**
 * Storage for arrays of serialized objects.
 * Order might be changed if some elements are removed or updated.
 * @example
 * ```ts
 * interface Item {
 *   id: string;
 *   quantity: number;
 * }
 * const storage = new ArrayStorage<Item>("myArrayStorage");
 * storage.add(actor, { id: "item1", quantity: 10 });
 * storage.add(actor, { id: "item2", quantity: 5 });
 * const items = storage.get(actor); // [{ id: "item1", quantity: 10 }, { id: "item2", quantity: 5 }]
 * storage.removeAt(actor, 0);
 * const updatedItems = storage.get(actor); // [{ id: "item2", quantity: 5 }]
 * ```
 */
export class ArrayStorage<T extends object> extends BaseStorage<
  T,
  string,
  T[]
> {
  protected override getActorPrefix(): string {
    return `__${this.prefix}|index`;
  }
  protected getActorKey(index: number): string {
    return `${this.getActorPrefix()}.${index}`;
  }
  removeAt(actor: Actor, index: number): T | undefined {
    const arr = this.get(actor) as T[];
    if (index >= 0 && index < arr.length) {
      const [result] = arr.splice(index, 1);
      try {
        this.saveArray(actor, arr, 1);
        return result;
      } catch (err) {
        arr.splice(index, 0, result);
        this.cache.delete(actor);
        this.saveArray(actor, arr);
        throw err;
      }
    }
  }
  remove(actor: Actor, predicate: (item: T, array: T[]) => boolean): number {
    const arr = this.get(actor) as T[];
    const originalLength = arr.length;

    const newArr = arr.filter((item) => !predicate(item, arr));
    const removedCount = originalLength - newArr.length;

    if (removedCount > 0) {
      try {
        this.saveArray(actor, newArr, removedCount);
      } catch (err) {
        this.saveArray(actor, arr);
        throw err;
      }
    }

    return removedCount;
  }
  updateAt(actor: Actor, index: number, value: T): void {
    const arr = this.get(actor) as T[];
    if (index >= 0 && index < arr.length) {
      const copy = arr[index];
      arr[index] = value;
      try {
        this.saveArrayAt(actor, arr, index);
      } catch (err) {
        arr[index] = copy;
        throw err;
      }
    }
  }
  update(
    actor: Actor,
    predicate: (item: T, array: T[]) => boolean,
    value: T,
  ): number {
    const arr = this.get(actor) as T[];
    let updatedCount = 0;

    for (let i = 0; i < arr.length; i++) {
      if (predicate(arr[i], arr)) {
        const copy = arr[i];
        arr[i] = value;
        try {
          this.saveArrayAt(actor, arr, i);
          updatedCount++;
        } catch (err) {
          arr[i] = copy;
          throw err;
        }
      }
    }

    return updatedCount;
  }
  add(actor: Actor, value: T): void {
    const arr = this.get(actor) as T[];
    const strValue = JSON.stringify(value);
    const key = this.getActorKey(arr.length);
    actor.setDynamicProperty(key, strValue);
    arr.push(value);
    this.cache.set(actor, arr);
  }
  get(actor: Actor): Readonly<T[]> {
    if (!this.cache.has(actor)) {
      const result: T[] = [];
      let malformed = 0;
      for (let i = 0;; i++) {
        const key = this.getActorKey(i);
        const value = actor.getDynamicProperty(key);
        if (typeof value !== "string") {
          break;
        }
        try {
          result.push(JSON.parse(value) as T);
        } catch {
          malformed++;
        }
      }
      this.cache.set(actor, result);
      if (malformed > 0) {
        this.saveArray(actor, result, malformed);
      }
    }
    return this.cache.get(actor)!;
  }
  save(actor: Actor): void {
    this.saveArray(actor, this.get(actor) as T[]);
  }
  private saveArray(actor: Actor, arr: T[], removedCount?: number): void {
    if (arr.length > 0) {
      for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const key = this.getActorKey(i);
        const value = JSON.stringify(item);
        actor.setDynamicProperty(key, value);
      }
    }
    if (removedCount !== undefined && removedCount > 0) {
      for (let i = arr.length; i < arr.length + removedCount; i++) {
        const key = this.getActorKey(i);
        actor.setDynamicProperty(key, undefined);
      }
    }
    this.cache.set(actor, arr);
  }
  private saveArrayAt(actor: Actor, arr: T[], index: number): void {
    const key = this.getActorKey(index);
    if (index >= 0 && index < arr.length) {
      const value = JSON.stringify(arr[index]);
      actor.setDynamicProperty(key, value);
    } else {
      actor.setDynamicProperty(key, undefined);
    }
    this.cache.set(actor, arr);
  }
}
