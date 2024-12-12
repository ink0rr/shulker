import { Entity, Vector3 } from "@minecraft/server";

type Getter<T> = (entity: Entity) => T;
type Setter<T> = (entity: Entity, value: T) => void;

export function property<T extends string | number | boolean>(identifier: string) {
  const get: Getter<T> = (entity) => {
    return entity.getProperty(identifier) as T;
  };
  const set: Setter<T> = (entity, value) => {
    entity.setProperty(identifier, value);
  };
  return [get, set] as const;
}

// https://stackoverflow.com/a/53955431
type IsUnion<T, U extends T = T> = (
  T extends any ? (U extends T ? false : true) : never
) extends false
  ? false
  : true;

type ToPrimitive<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : Vector3;

export function dynamicProperty<T extends string | number | boolean | Vector3>(
  identifier: string,
  defaultValue: T,
) {
  // Prevent TypeScript from inferring literal values unless it's a union type
  type R = true extends IsUnion<T> ? T : ToPrimitive<T>;
  const get: Getter<R> = (entity) => {
    const value = entity.getDynamicProperty(identifier);
    if (value === undefined) {
      entity.setDynamicProperty(identifier, defaultValue);
      return defaultValue as R;
    }
    return value as R;
  };
  const set: Setter<R> = (entity, value) => {
    entity.setDynamicProperty(identifier, value);
  };
  return [get, set] as const;
}
