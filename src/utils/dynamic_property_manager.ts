import { Entity, Player, RawMessage } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

type SetableProperty = Pick<Entity, "getDynamicProperty" | "setDynamicProperty">;

interface BaseProperty {
  type: string;
  lang?: RawMessage;
}

export interface PropertyBoolean extends BaseProperty {
  type: "boolean";
  default: boolean;
}

export interface PropertyNumber extends BaseProperty {
  type: "number";
  default: number;
  min: number;
  max: number;
  step: number;
}

export interface PropertyEnum<T extends string = string> extends BaseProperty {
  type: "enum";
  default: T;
  values: T[];
}

type UnionProperty = PropertyBoolean | PropertyNumber | PropertyEnum<string>;
type Properties = Record<string, UnionProperty>;

type DynamicPropertyManagerCallbackArgs<T> = {
  holder: SetableProperty;
  oldValue: T;
  newValue: T;
};

type DynamicPropertyManagerCallback<T> = (args: DynamicPropertyManagerCallbackArgs<T>) => void;

export type DynamicPropertyManagerArgs<P extends Properties> = {
  properties: P;
  title?: RawMessage;
};

type PropertyValue<P extends UnionProperty> = P extends PropertyEnum<infer S>
  ? S
  : P extends PropertyBoolean
    ? boolean
    : number;

export class DynamicPropertyManager<P extends Properties> {
  #properties: P;
  #title?: RawMessage;
  #callbacks: Map<keyof P, DynamicPropertyManagerCallback<PropertyValue<P[keyof P]>>[]> = new Map();

  constructor({ properties, title }: DynamicPropertyManagerArgs<P>) {
    this.#properties = properties;
    this.#title = title;
  }

  private resolveType<V>(value: unknown, property: UnionProperty): value is V {
    if (property.type === "boolean") return typeof value === "boolean";
    if (property.type === "number") return typeof value === "number";
    if (property.type === "enum") return typeof value === "string" && property.values.includes(value as V & string);
    return false;
  }

  private default<K extends keyof P & string>(key: K): PropertyValue<P[K]> {
    return this.#properties[key].default as PropertyValue<P[K]>;
  }

  get<K extends keyof P & string>(holder: SetableProperty, key: K): PropertyValue<P[K]> {
    const property = this.#properties[key];
    const value = holder.getDynamicProperty(key);
    return this.resolveType(value, property) ? (value as PropertyValue<P[K]>) : this.default(key);
  }

  set<K extends keyof P & string>(holder: SetableProperty, key: K, value?: PropertyValue<P[K]>): void {
    const oldValue = this.get(holder, key);
    if (oldValue === value) return;

    this.#callbacks.get(key)?.forEach((callback) => {
      callback({ holder, oldValue, newValue: value ?? this.default(key) });
    });

    holder.setDynamicProperty(key, value as string | number | boolean | undefined);
  }

  async show(holder: SetableProperty, player: Player) {
    const form = new ModalFormData().title(this.#title ?? "Settings");
    const entries = Object.entries(this.#properties);

    for (const [k, v] of entries) {
      const currentValue = this.get(holder, k as keyof P & string);
      if (v.type === "boolean") {
        form.toggle(v.lang ?? {translate: k}, currentValue as boolean);
      } else if (v.type === "number") {
        form.slider(v.lang ?? {translate: k}, v.min, v.max, v.step, currentValue as number);
      } else if (v.type === "enum") {
        form.dropdown(v.lang ?? {translate: k}, v.values, v.values.indexOf(currentValue as string));
      }
    }

    const { canceled, formValues } = await form.show(player);
    if (canceled || !formValues) return;

    entries.forEach(([k, v], index) => {
      const formValue = formValues[index];
      if (v.type === "boolean") {
        this.set(holder, k, formValue as never);
      } else if (v.type === "number") {
        this.set(holder, k, formValue as never);
      } else if (v.type === "enum") {
        this.set(holder, k, v.values[formValue as number] as never);
      }
    });
  }

  subscribe<K extends keyof P & string>(key: K, callback: DynamicPropertyManagerCallback<PropertyValue<P[K]>>) {
    if (!this.#callbacks.has(key)) {
      this.#callbacks.set(key, []);
    }
    this.#callbacks.get(key)!.push(callback);
  }

  [Symbol.iterator](): Iterator<[keyof P & string, PropertyValue<P[keyof P]>]> {
    const properties = this.#properties;
    const keys = Object.keys(properties) as (keyof P & string)[];
    let index = 0;

    return {
      next: () => {
        if (index < keys.length) {
          const key = keys[index];
          const value = this.default(key);
          index++;
          return { value: [key, value as PropertyValue<P[keyof P]>], done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }
}