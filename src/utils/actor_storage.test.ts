import { type Vector3 } from "@minecraft/server";
import { describe, expect, expectTypeOf, it } from "bun:test";
import {
  ActorStorage,
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

describe("PrimitiveStorage", () => {
  it.each([false, 0, ""] as const)("persists and caches %j", (value) => {
    const actor = new MockActor();
    const storage = new ActorStorage<string | number | boolean>(
      storageId("values"),
    );
    storage.set(actor, "value", value);
    expect(storage.get(actor, "value")).toBe(value);
    expect(storage.get(actor.reload(), "value")).toBe(value);
  });

  it("stores vectors", () => {
    const actor = new MockActor();
    const storage = new ActorStorage<Vector3>(storageId("vectors"));
    const value = { x: 1, y: 64, z: -2 };
    storage.set(actor, "position", value);
    expectTypeOf(storage.get(actor, "position")).toEqualTypeOf<
      Vector3 | undefined
    >();
    expect(storage.get(actor.reload(), "position")).toEqual(value);
  });

  it("returns undefined for missing keys and lists only stored entries", () => {
    const actor = new MockActor();
    const storage = new ActorStorage<number>(storageId("values"));
    expect(storage.get(actor, "missing")).toBeUndefined();
    storage.set(actor, "first", 1);
    storage.set(actor, "second", 2);
    expect(storage.keys(actor)).toEqual(["first", "second"]);
    expect(storage.entries(actor)).toEqual([
      ["first", 1],
      ["second", 2],
    ]);
    storage.delete(actor, "first");
    expect(storage.get(actor, "first")).toBeUndefined();
    expect(storage.get(actor.reload(), "first")).toBeUndefined();
    expect(storage.keys(actor)).toEqual(["second"]);
    storage.clear(actor);
    expect(storage.entries(actor)).toEqual([]);
  });

  it("keeps actors and different storage IDs independent", () => {
    const actor = new MockActor();
    const otherActor = new MockActor();
    const first = new ActorStorage<number>(storageId("first"));
    const second = new ActorStorage<number>(storageId("second"));
    first.set(actor, "value", 1);
    first.set(otherActor, "value", 2);
    second.set(actor, "value", 3);
    first.clear(actor);
    expect(first.get(actor, "value")).toBeUndefined();
    expect(first.get(otherActor, "value")).toBe(2);
    expect(second.get(actor, "value")).toBe(3);
  });
});

describe("PrimitiveStorage property schemas", () => {
  it("stores each property with its declared type", () => {
    const actor = new MockActor();
    const storage = new ActorStorage<{
      name: string;
      count: number;
      active: boolean;
    }>(storageId("typed"));
    storage.set(actor, "name", "Alex");
    storage.set(actor, "count", 0);
    storage.set(actor, "active", false);
    const name: string | undefined = storage.get(actor, "name");
    const count: number | undefined = storage.get(actor, "count");
    const active: boolean | undefined = storage.get(actor, "active");
    expectTypeOf(storage.get(actor, "name")).toEqualTypeOf<
      string | undefined
    >();
    expectTypeOf(storage.get(actor, "count")).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf(storage.get(actor, "active")).toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<
      Parameters<typeof storage.set<"name">>[2]
    >().toEqualTypeOf<string>();
    expectTypeOf<
      Parameters<typeof storage.set<"count">>[2]
    >().toEqualTypeOf<number>();
    expectTypeOf<
      Parameters<typeof storage.set<"active">>[2]
    >().toEqualTypeOf<boolean>();
    expectTypeOf<Parameters<typeof storage.get>[1]>().toEqualTypeOf<
      "name" | "count" | "active"
    >();
    expect([name, count, active]).toEqual(["Alex", 0, false]);
    const reloaded = actor.reload();
    expect(storage.get(reloaded, "count")).toBe(0);
    expect(storage.get(reloaded, "active")).toBe(false);
  });

  it("accepts interface schemas with vector-valued properties", () => {
    interface Properties {
      position: Vector3;
      damage: number;
    }
    const actor = new MockActor();
    const storage = new ActorStorage<Properties>(storageId("interface"));
    const position = { x: 1, y: 64, z: -2 };
    storage.set(actor, "position", position);
    storage.set(actor, "damage", 10);
    expectTypeOf(storage.get(actor, "position")).toEqualTypeOf<
      Vector3 | undefined
    >();
    expectTypeOf(storage.get(actor, "damage")).toEqualTypeOf<
      number | undefined
    >();
    expectTypeOf<Parameters<typeof storage.delete>[1]>().toEqualTypeOf<
      "position" | "damage"
    >();
    expectTypeOf(storage.keys(actor)).toEqualTypeOf<
      Array<"position" | "damage">
    >();
    const reloaded = actor.reload();
    expect(storage.get(reloaded, "position")).toEqual(position);
    expect(storage.get(reloaded, "damage")).toBe(10);
    storage.delete(actor, "damage");
    expect(storage.entries(actor)).toEqual([["position", position]]);
    expect(storage.get(actor.reload(), "damage")).toBeUndefined();
  });

  it("preserves homogeneous unions and explicit key restrictions", () => {
    const actor = new MockActor();
    const storage = new ActorStorage<number | boolean, "damage" | "enabled">(
      storageId("restricted"),
    );
    storage.set(actor, "damage", 10);
    storage.set(actor, "enabled", false);
    expectTypeOf(storage.get(actor, "damage")).toEqualTypeOf<
      number | boolean | undefined
    >();
    expectTypeOf<Parameters<typeof storage.set<"enabled">>[2]>().toEqualTypeOf<
      number | boolean
    >();
    expectTypeOf<Parameters<typeof storage.get>[1]>().toEqualTypeOf<
      "damage" | "enabled"
    >();
    expectTypeOf(storage.keys(actor)).toEqualTypeOf<
      Array<"damage" | "enabled">
    >();
    expect(storage.get(actor.reload(), "enabled")).toBe(false);
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
