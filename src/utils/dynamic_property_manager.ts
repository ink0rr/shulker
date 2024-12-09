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
type Properties = {
  [key: string]: UnionProperty;
};

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
export class DynamicPropertyManager<P extends Properties> {
  #properties: P;
  #title?: RawMessage;
  #callbacks: Partial<Record<keyof P, Function[]>> = {};
  constructor({ properties, title }: DynamicPropertyManagerArgs<P>) {
    this.#properties = properties;
    this.#title = title;
  }

  private resolveType<V>(value: unknown, property: UnionProperty): value is V {
    if (property.type === "boolean") return typeof value === "boolean";
    if (property.type === "number") return typeof value === "number";
    if (property.type === "enum")
      return typeof value === "string" && property.values.includes(value as V & string);
    return false;
  }

  get<
    K extends keyof P & string,
    V extends P[K] extends PropertyEnum<infer S>
      ? S
      : P[K]["default"] extends boolean
        ? boolean
        : number,
  >(holder: SetableProperty, key: K): V {
    const property = this.#properties[key];
    const value = holder.getDynamicProperty(key);
    return this.resolveType(value, property) ? (value as V) : (property.default as V);
  }
  set<
    K extends keyof P & string,
    V extends P[K] extends PropertyEnum<infer S>
      ? S
      : P[K]["default"] extends boolean
        ? boolean
        : number,
  >(holder: SetableProperty, key: K, value?: V): void {
    const oldValue = this.get(holder, key);
    if (oldValue === value) return;

    this.#callbacks[key]?.forEach((callback) => {
      callback({ holder, oldValue, newValue: value });
    });

    holder.setDynamicProperty(key, value as string | number | boolean | undefined);
  }
  async show(holder: SetableProperty, player: Player) {
    const form = new ModalFormData().title(this.#title ?? "Settings");
    for (const [k, v] of Object.entries(this.#properties)) {
      const currentValue = this.get(holder, k as keyof P & string);
      if (v.type === "boolean") {
        form.toggle(v.lang ?? k, currentValue as boolean);
      }
      if (v.type === "number") {
        form.slider(v.lang ?? k, v.min, v.max, v.step, currentValue as number);
      }
      if (v.type === "enum") {
        form.dropdown(v.lang ?? k, v.values, v.values.indexOf(currentValue as string));
      }
    }
    const { canceled, formValues } = await form.show(player);
    if (canceled || !formValues) return;

    let index = 0;
    for (const [k, v] of Object.entries(this.#properties)) {
      const formValue = formValues[index];
      if (v.type === "boolean") {
        this.set(holder, k, formValue as never);
      }
      if (v.type === "number") {
        this.set(holder, k, formValue as never);
      }
      if (v.type === "enum") {
        this.set(holder, k, v.values[formValue as number] as never);
      }
      index++;
    }
  }
  subscribe<
    K extends keyof P & string,
    V extends P[K] extends PropertyEnum<infer S>
      ? S
      : P[K]["default"] extends boolean
        ? boolean
        : number,
  >(key: K, callback: DynamicPropertyManagerCallback<V>) {
    if (!this.#callbacks[key]) {
      this.#callbacks[key] = [];
    }
    this.#callbacks[key].push(callback);
  }
  [Symbol.iterator]<
    K extends keyof P & string,
    V extends P[K] extends PropertyEnum<infer S>
      ? S
      : P[K]["default"] extends boolean
        ? boolean
        : number,
  >(): Iterator<[K, V]> {
    const properties = this.#properties;
    const keys = Object.keys(properties) as K[];
    let index = 0;
    return {
      next: () => {
        if (index < keys.length) {
          const key = keys[index];
          const value = properties[key].default;
          index++;
          return { value: [key, value as V], done: false };
        } else {
          return { value: undefined, done: true };
        }
      },
    };
  }
}
