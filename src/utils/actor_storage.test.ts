import { type Vector3 } from "@minecraft/server";
import { describe, expect, expectTypeOf, it } from "bun:test";
import {
  ActorStorage,
  type ActorStorageSchema,
  ArrayStorage,
  SerializedStorage,
} from "./actor_storage.js";

type PropertyValue = string | number | boolean | Vector3;
interface Item {
  id: string;
}

let storageSequence = 0;
const storageId = (name: string): string => `${name}:${storageSequence++}`;

class MockActor {
  reads = 0;
  enumerations = 0;
  writeAttempts = 0;
  failAt = Infinity;

  constructor(private readonly properties = new Map<string, PropertyValue>()) {}

  getDynamicProperty(key: string): PropertyValue | undefined {
    this.reads++;
    return this.properties.get(key);
  }
  getDynamicPropertyIds(): string[] {
    this.enumerations++;
    return [...this.properties.keys()];
  }
  setDynamicProperty(key: string, value?: PropertyValue): void {
    this.writeAttempts++;
    if (this.writeAttempts === this.failAt) {
      throw new Error("Write rejected");
    }
    if (value === undefined) {
      this.properties.delete(key);
    } else {
      this.properties.set(key, value);
    }
  }
  reload(): MockActor {
    return new MockActor(new Map(this.properties));
  }
  rejectWriteAfter(successfulWrites = 0): void {
    this.failAt = this.writeAttempts + successfulWrites + 1;
  }
}

const ids = (storage: ArrayStorage<Item>, actor: MockActor): string[] =>
  storage.get(actor).map((item) => item.id);

const setupArray = (
  values = ["A", "B", "C"],
): {
  actor: MockActor;
  storage: ArrayStorage<Item>;
  prefix: string;
} => {
  const actor = new MockActor();
  const prefix = storageId("items");
  const storage = new ArrayStorage<Item>(prefix);
  for (const id of values) {
    storage.add(actor, { id });
  }
  return { actor, storage, prefix };
};

describe("ActorStorage runtime schema", () => {
  it("infers values from descriptors and preserves false, zero, and empty strings", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("values"), {
      active: { type: "boolean" },
      amount: { type: "number" },
      name: { type: "string" },
    });
    storage.set(actor, "active", false);
    storage.set(actor, "amount", 0);
    storage.set(actor, "name", "");
    const reloaded = actor.reload();
    expect(storage.get(reloaded, "active")).toBe(false);
    expect(storage.get(reloaded, "amount")).toBe(0);
    expect(storage.get(reloaded, "name")).toBe("");
    expectTypeOf(storage.get(actor, "active")).toEqualTypeOf<boolean | undefined>();
    expectTypeOf(storage.get(actor, "amount")).toEqualTypeOf<number | undefined>();
    expectTypeOf(storage.get(actor, "name")).toEqualTypeOf<string | undefined>();
    expectTypeOf<Parameters<typeof storage.set<"active">>[2]>().toEqualTypeOf<boolean>();
    expectTypeOf<Parameters<typeof storage.set<"amount">>[2]>().toEqualTypeOf<number>();
    expectTypeOf<Parameters<typeof storage.set<"name">>[2]>().toEqualTypeOf<string>();
    expectTypeOf<Parameters<typeof storage.get>[1]>().toEqualTypeOf<"active" | "amount" | "name">();
    expectTypeOf<Parameters<typeof storage.delete>[1]>().toEqualTypeOf<
      "active" | "amount" | "name"
    >();
  });

  it("returns defaults without persisting them and caches fallback values", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("defaults"), {
      active: { type: "boolean", default: false },
      amount: { type: "number", default: 0 },
      name: { type: "string", default: "" },
    });
    expect(storage.get(actor, "active")).toBe(false);
    expect(storage.get(actor, "amount")).toBe(0);
    expect(storage.get(actor, "name")).toBe("");
    expectTypeOf(storage.get(actor, "active")).toEqualTypeOf<boolean>();
    expectTypeOf(storage.get(actor, "amount")).toEqualTypeOf<number>();
    expectTypeOf(storage.get(actor, "name")).toEqualTypeOf<string>();
    const reads = actor.reads;
    expect(storage.get(actor, "amount")).toBe(0);
    expect(actor.reads).toBe(reads);
    expect(actor.writeAttempts).toBe(0);
    expect(actor.getDynamicPropertyIds()).toEqual([]);
    storage.set(actor, "active", true);
    storage.set(actor, "amount", 25);
    storage.set(actor, "name", "Alex");
    expect(storage.get(actor, "active")).toBe(true);
    expect(storage.get(actor, "amount")).toBe(25);
    expect(storage.get(actor, "name")).toBe("Alex");
  });

  it("allows omitted defaults and infers undefined only for those keys", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("optional"), {
      damage: { type: "number", default: 10 },
      name: { type: "string" },
      active: { type: "boolean", default: undefined },
    });
    expect(storage.get(actor, "damage")).toBe(10);
    expect(storage.get(actor, "name")).toBeUndefined();
    expect(storage.get(actor, "active")).toBeUndefined();
    expectTypeOf(storage.get(actor, "damage")).toEqualTypeOf<number>();
    expectTypeOf(storage.get(actor, "name")).toEqualTypeOf<string | undefined>();
    expectTypeOf(storage.get(actor, "active")).toEqualTypeOf<boolean | undefined>();
    expect(actor.writeAttempts).toBe(0);
  });

  it("preserves stored false, zero, and empty strings over nonempty defaults", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("overrides"), {
      active: { type: "boolean", default: true },
      amount: { type: "number", default: 10 },
      name: { type: "string", default: "Unnamed" },
    });
    storage.set(actor, "active", false);
    storage.set(actor, "amount", 0);
    storage.set(actor, "name", "");
    const reloaded = actor.reload();
    expect(storage.get(reloaded, "active")).toBe(false);
    expect(storage.get(reloaded, "amount")).toBe(0);
    expect(storage.get(reloaded, "name")).toBe("");
  });

  it("restores defaults after delete and clear", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("reset"), {
      damage: { type: "number", default: 10 },
      name: { type: "string" },
      active: { type: "boolean", default: false },
    });
    storage.set(actor, "damage", 25);
    storage.set(actor, "name", "Alex");
    storage.set(actor, "active", true);
    storage.delete(actor, "damage");
    expect(storage.get(actor, "damage")).toBe(10);
    expect(storage.get(actor.reload(), "damage")).toBe(10);
    storage.clear(actor);
    expect(storage.get(actor, "damage")).toBe(10);
    expect(storage.get(actor, "active")).toBe(false);
    expect(storage.get(actor, "name")).toBeUndefined();
    expect(actor.getDynamicPropertyIds()).toEqual([]);
  });

  it("lists stored overrides without materializing default properties", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("entries"), {
      first: { type: "number", default: 10 },
      second: { type: "number" },
    });
    expect(storage.get(actor, "first")).toBe(10);
    expect([...storage.keys(actor)]).toEqual([]);
    expect([...storage.entries(actor)]).toEqual([]);
    storage.set(actor, "second", 2);
    expect([...storage.keys(actor)]).toEqual(["second"]);
    expect([...storage.entries(actor)]).toEqual([["second", 2]]);
    expectTypeOf(storage.keys(actor)).toEqualTypeOf<IterableIterator<"first" | "second">>();
    expectTypeOf(storage.entries(actor)).toEqualTypeOf<
      IterableIterator<["first" | "second", number]>
    >();
    storage.delete(actor, "second");
    expect([...storage.entries(actor)]).toEqual([]);
    expect(storage.get(actor.reload(), "second")).toBeUndefined();
  });

  it("enumerates keys lazily and loads entries only as they are consumed", () => {
    const prefix = storageId("iterators");
    const actor = new MockActor(
      new Map([
        ["unrelated", 99],
        [`__${prefix}|first`, 1],
        [`__${prefix}|second`, 2],
      ]),
    );
    const storage = new ActorStorage(prefix, {
      first: { type: "number" },
      second: { type: "number" },
    });
    const keys = storage.keys(actor);
    const entries = storage.entries(actor);
    expect(actor.enumerations).toBe(0);
    expect(actor.reads).toBe(0);
    expect(keys.next()).toEqual({ value: "first", done: false });
    expect([...keys]).toEqual(["second"]);
    expect(keys.next()).toEqual({ value: undefined, done: true });
    expect(actor.reads).toBe(0);
    expect(entries.next()).toEqual({ value: ["first", 1], done: false });
    expect(actor.reads).toBe(1);
    expect([...entries]).toEqual([["second", 2]]);
    expect(actor.reads).toBe(2);
    expect(entries.next()).toEqual({ value: undefined, done: true });
  });

  it("accepts reusable schemas and vector-valued properties", () => {
    const schema = {
      position: { type: "vector3" },
      damage: { type: "number", default: 10 },
    } satisfies ActorStorageSchema;
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("vectors"), schema);
    const position = { x: 1, y: 64, z: -2 };
    storage.set(actor, "position", position);
    expectTypeOf(storage.get(actor, "position")).toEqualTypeOf<Vector3 | undefined>();
    expectTypeOf(storage.get(actor, "damage")).toEqualTypeOf<number>();
    const reloaded = actor.reload();
    expect(storage.get(reloaded, "position")).toEqual(position);
    expect(storage.get(reloaded, "damage")).toBe(10);
  });

  it("isolates vector defaults between actors and the schema", () => {
    const schema = {
      position: { type: "vector3", default: { x: 1, y: 64, z: -2 } },
    } satisfies ActorStorageSchema;
    const actor = new MockActor();
    const otherActor = new MockActor();
    const storage = new ActorStorage(storageId("vector-defaults"), schema);
    const position = storage.get(actor, "position");
    expectTypeOf(position).toEqualTypeOf<Vector3>();
    expect(position).toEqual(schema.position.default);
    position.x = 99;
    expect(schema.position.default.x).toBe(1);
    expect(storage.get(otherActor, "position").x).toBe(1);
    expect(actor.writeAttempts).toBe(0);
    expect(otherActor.writeAttempts).toBe(0);
  });

  it("keeps actors and different storage IDs independent", () => {
    const actor = new MockActor();
    const otherActor = new MockActor();
    const first = new ActorStorage(storageId("first"), {
      value: { type: "number", default: 0 },
    });
    const second = new ActorStorage(storageId("second"), {
      value: { type: "number", default: 10 },
    });
    first.set(actor, "value", 1);
    first.set(otherActor, "value", 2);
    second.set(actor, "value", 3);
    first.clear(actor);
    expect(first.get(actor, "value")).toBe(0);
    expect(first.get(otherActor, "value")).toBe(2);
    expect(second.get(actor, "value")).toBe(3);
  });

  it("rejects invalid runtime keys and values before writing properties", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("validation"), {
      amount: { type: "number" },
      position: { type: "vector3" },
    });
    const unchecked = storage as unknown as {
      get(actor: MockActor, key: string): unknown;
      set(actor: MockActor, key: string, value: unknown): void;
      delete(actor: MockActor, key: string): void;
    };
    expect(() => unchecked.set(actor, "amount", "wrong")).toThrow(TypeError);
    expect(() => unchecked.set(actor, "position", null)).toThrow(TypeError);
    expect(() => unchecked.set(actor, "position", { x: 1, y: 2 })).toThrow(TypeError);
    expect(() => unchecked.set(actor, "position", { x: 1, y: "wrong", z: 3 })).toThrow(TypeError);
    expect(() => unchecked.set(actor, "unknown", 1)).toThrow();
    expect(() => unchecked.get(actor, "unknown")).toThrow();
    expect(() => unchecked.delete(actor, "unknown")).toThrow();
    expect(actor.writeAttempts).toBe(0);
  });

  it("rejects invalid defaults before reserving the storage ID", () => {
    const prefix = storageId("bad-default");
    const invalid = {
      amount: { type: "number", default: "wrong" },
    } as unknown as ActorStorageSchema;
    expect(() => new ActorStorage(prefix, invalid)).toThrow(TypeError);
    const storage = new ActorStorage(prefix, { amount: { type: "number", default: 10 } });
    expect(storage.get(new MockActor(), "amount")).toBe(10);
  });

  it("rejects mismatched stored values without replacing them with defaults", () => {
    const prefix = storageId("stored-validation");
    const actor = new MockActor(new Map([[`__${prefix}|amount`, "wrong"]]));
    const storage = new ActorStorage(prefix, {
      amount: { type: "number", default: 10 },
    });
    expect(() => storage.get(actor, "amount")).toThrow(TypeError);
    expect(() => storage.get(actor, "amount")).toThrow(TypeError);
    expect(actor.getDynamicProperty(`__${prefix}|amount`)).toBe("wrong");
    expect(actor.writeAttempts).toBe(0);
    storage.set(actor, "amount", 20);
    expect(storage.get(actor, "amount")).toBe(20);
  });

  it("rejects unsupported descriptor types", () => {
    const invalid = { value: { type: "object" } } as unknown as ActorStorageSchema;
    expect(() => new ActorStorage(storageId("bad-type"), invalid)).toThrow(TypeError);
  });

  it("keeps the previous value when a property write is rejected", () => {
    const actor = new MockActor();
    const storage = new ActorStorage(storageId("write-failure"), {
      amount: { type: "number", default: 10 },
    });
    storage.set(actor, "amount", 20);
    actor.rejectWriteAfter();
    expect(() => storage.set(actor, "amount", 30)).toThrow("Write rejected");
    expect(storage.get(actor, "amount")).toBe(20);
    expect(storage.get(actor.reload(), "amount")).toBe(20);
  });
});

describe("SerializedStorage", () => {
  it("persists nested JSON objects and caches loaded values", () => {
    const actor = new MockActor();
    const storage = new SerializedStorage<{ name: string; tags: string[] }>(
      storageId("objects"),
    );
    const value = { name: "Alex", tags: ["builder", "admin"] };
    storage.set(actor, "profile", value);
    expect(storage.get(actor, "profile")).toEqual(value);
    const reloaded = actor.reload();
    expect(storage.get(reloaded, "profile")).toEqual(value);
    const reads = reloaded.reads;
    expect(storage.get(reloaded, "profile")).toEqual(value);
    expect(reloaded.reads).toBe(reads);
    storage.delete(actor, "profile");
    expect(storage.get(actor, "profile")).toBeUndefined();
    expect(storage.get(actor.reload(), "profile")).toBeUndefined();
  });

  it("iterates stored keys and skips malformed serialized entries", () => {
    const prefix = storageId("serialized-iterators");
    const actor = new MockActor(
      new Map([
        [`__${prefix}|broken`, "invalid JSON"],
        ["unrelated", '{"id":"unrelated"}'],
        [`__${prefix}|valid`, '{"id":"A"}'],
      ]),
    );
    const storage = new SerializedStorage<Item>(prefix);
    expect([...storage.keys(actor)]).toEqual(["broken", "valid"]);
    expect([...storage.entries(actor)]).toEqual([["valid", { id: "A" }]]);
    expect([...storage.keys(actor)]).toEqual(["valid"]);
    expectTypeOf(storage.keys(actor)).toEqualTypeOf<IterableIterator<string>>();
    expectTypeOf(storage.entries(actor)).toEqualTypeOf<IterableIterator<[string, Item]>>();
  });
});

describe("ArrayStorage supported usage", () => {
  it("returns and caches an empty array", () => {
    const { actor, storage } = setupArray([]);
    const empty = storage.get(actor);
    expect(empty).toEqual([]);
    const reads = actor.reads;
    expect(storage.get(actor)).toBe(empty);
    expect(actor.reads).toBe(reads);
    expect(actor.enumerations).toBe(0);
  });

  it("loads contiguous items in append order after an actor reload", () => {
    const values = Array.from({ length: 12 }, (_, index) => String(index));
    const { actor, storage } = setupArray(values);
    const reloaded = actor.reload();
    expect(ids(storage, reloaded)).toEqual(values);
    expect(reloaded.reads).toBe(values.length + 1);
    expect(reloaded.enumerations).toBe(0);
    const reads = reloaded.reads;
    expect(ids(storage, reloaded)).toEqual(values);
    expect(reloaded.reads).toBe(reads);
  });

  it("appends with one property write and no reads or enumeration on a warm cache", () => {
    const { actor, storage } = setupArray(["A"]);
    const reads = actor.reads;
    const writes = actor.writeAttempts;
    storage.add(actor, { id: "B" });
    expect(actor.reads).toBe(reads);
    expect(actor.enumerations).toBe(0);
    expect(actor.writeAttempts).toBe(writes + 1);
    expect(ids(storage, actor.reload())).toEqual(["A", "B"]);
  });

  it("keeps arrays for different actors independent", () => {
    const { actor, storage } = setupArray(["A"]);
    const otherActor = new MockActor();
    storage.add(otherActor, { id: "B" });
    storage.clear(actor);
    expect(ids(storage, actor)).toEqual([]);
    expect(ids(storage, otherActor)).toEqual(["B"]);
    expect(ids(storage, otherActor.reload())).toEqual(["B"]);
  });

  it.each([0, 1, 2])(
    "removes index %i, returns its item, and persists a contiguous array",
    (index) => {
      const { actor, storage, prefix } = setupArray();
      const expected = ["A", "B", "C"];
      const removed = expected.splice(index, 1)[0];
      expect(storage.removeAt(actor, index)).toEqual({ id: removed });
      expect(ids(storage, actor)).toEqual(expected);
      expect(ids(storage, actor.reload())).toEqual(expected);
      expect(actor.getDynamicProperty(`__${prefix}|index.2`)).toBeUndefined();
      storage.add(actor, { id: "D" });
      expect(ids(storage, actor.reload())).toEqual([...expected, "D"]);
    },
  );

  it("removes predicate matches and reports the count", () => {
    const { actor, storage } = setupArray();
    expect(storage.remove(actor, (item) => item.id !== "B")).toBe(2);
    expect(ids(storage, actor)).toEqual(["B"]);
    expect(ids(storage, actor.reload())).toEqual(["B"]);
    storage.add(actor, { id: "D" });
    expect(ids(storage, actor.reload())).toEqual(["B", "D"]);
  });

  it("avoids writes when a removal or update predicate matches nothing", () => {
    const { actor, storage } = setupArray();
    const writes = actor.writeAttempts;
    expect(storage.remove(actor, () => false)).toBe(0);
    expect(storage.update(actor, () => false, { id: "X" })).toBe(0);
    expect(actor.writeAttempts).toBe(writes);
    expect(ids(storage, actor)).toEqual(["A", "B", "C"]);
  });

  it("removes all items and starts the next append at index zero", () => {
    const { actor, storage, prefix } = setupArray();
    expect(storage.remove(actor, () => true)).toBe(3);
    expect(ids(storage, actor.reload())).toEqual([]);
    expect(actor.getDynamicPropertyIds()).toEqual([]);
    storage.add(actor, { id: "D" });
    expect(actor.getDynamicProperty(`__${prefix}|index.0`)).toBe('{"id":"D"}');
    expect(ids(storage, actor.reload())).toEqual(["D"]);
  });

  it("updates one existing index with one property write", () => {
    const { actor, storage } = setupArray();
    const writes = actor.writeAttempts;
    storage.updateAt(actor, 1, { id: "X" });
    expect(actor.writeAttempts).toBe(writes + 1);
    expect(ids(storage, actor)).toEqual(["A", "X", "C"]);
    expect(ids(storage, actor.reload())).toEqual(["A", "X", "C"]);
  });

  it("updates predicate matches and writes only those items", () => {
    const { actor, storage } = setupArray();
    const writes = actor.writeAttempts;
    expect(storage.update(actor, (item) => item.id !== "B", { id: "X" })).toBe(
      2,
    );
    expect(actor.writeAttempts).toBe(writes + 2);
    expect(ids(storage, actor)).toEqual(["X", "B", "X"]);
    expect(ids(storage, actor.reload())).toEqual(["X", "B", "X"]);
  });

  it.each([-1, 3, Infinity, NaN])(
    "ignores an out-of-range index %s",
    (index) => {
      const { actor, storage } = setupArray();
      const writes = actor.writeAttempts;
      expect(storage.removeAt(actor, index)).toBeUndefined();
      storage.updateAt(actor, index, { id: "X" });
      expect(actor.writeAttempts).toBe(writes);
      expect(ids(storage, actor)).toEqual(["A", "B", "C"]);
    },
  );

  it("saves edits to an existing cached item", () => {
    const { actor, storage } = setupArray();
    storage.get(actor)[1].id = "changed";
    storage.save(actor);
    expect(ids(storage, actor.reload())).toEqual(["A", "changed", "C"]);
  });

  it("clears only its own storage ID and can be reused", () => {
    const { actor, storage } = setupArray();
    const other = new ArrayStorage<Item>(storageId("other"));
    other.add(actor, { id: "other" });
    storage.clear(actor);
    expect(ids(storage, actor)).toEqual([]);
    expect(ids(storage, actor.reload())).toEqual([]);
    expect(ids(other, actor)).toEqual(["other"]);
    storage.add(actor, { id: "D" });
    expect(ids(storage, actor.reload())).toEqual(["D"]);
  });
});

describe("ArrayStorage regressions", () => {
  it.each(["add", "removeAt", "updateAt", "update"] as const)(
    "%s keeps cached contents consistent with persistence when the write is rejected",
    (operation) => {
      const { actor, storage } = setupArray();
      actor.rejectWriteAfter();
      expect(() => {
        switch (operation) {
          case "add":
            storage.add(actor, { id: "D" });
            break;
          case "removeAt":
            storage.removeAt(actor, 0);
            break;
          case "updateAt":
            storage.updateAt(actor, 0, { id: "X" });
            break;
          case "update":
            storage.update(actor, () => true, { id: "X" });
            break;
        }
      }).toThrow("Write rejected");
      expect(ids(storage, actor.reload())).toEqual(["A", "B", "C"]);
      expect(ids(storage, actor)).toEqual(["A", "B", "C"]);
    },
  );

  it("can append again after a rejected append without creating an internal gap", () => {
    const { actor, storage } = setupArray(["A"]);
    actor.rejectWriteAfter();
    expect(() => storage.add(actor, { id: "B" })).toThrow("Write rejected");
    storage.add(actor, { id: "C" });
    expect(ids(storage, actor.reload())).toEqual(["A", "C"]);
    expect(ids(storage, actor)).toEqual(["A", "C"]);
  });

  it.each([1, 2])(
    "reloads the committed data when predicate removal fails after %i successful writes",
    (successfulWrites) => {
      const { actor, storage } = setupArray();
      actor.rejectWriteAfter(successfulWrites);
      expect(() => storage.remove(actor, (item) => item.id !== "B")).toThrow(
        "Write rejected",
      );
      const persisted = ids(storage, actor.reload());
      expect(ids(storage, actor)).toEqual(persisted);
    },
  );

  it("keeps a partially completed update consistent with persisted items", () => {
    const { actor, storage } = setupArray();
    actor.rejectWriteAfter(1);
    expect(() => storage.update(actor, () => true, { id: "X" })).toThrow(
      "Write rejected",
    );
    expect(ids(storage, actor.reload())).toEqual(["X", "B", "C"]);
    expect(ids(storage, actor)).toEqual(["X", "B", "C"]);
  });
});
