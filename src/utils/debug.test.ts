import { Dimension, Entity, Vector3, world } from "@minecraft/server";
import { Mock, describe, expect, it } from "bun:test";
import { debug } from "./debug.js";

type MockEntity = Omit<Partial<Entity>, "dimension"> & {
  dimension?: Pick<Dimension, "id" | "heightRange" | "localizationKey">;
};
class MockEntityClass implements MockEntity {
  id = Math.random().toString(36);
  typeId = "minecraft:mock_entity";
  isValid = true;
  #tags = new Set<string>();
  addTag(tag: string): boolean {
    this.#tags.add(tag);
    return true;
  }
  getTags(): string[] {
    return Array.from(this.#tags);
  }
  get location(): Readonly<Vector3> {
    return {
      x: 0,
      y: 1,
      z: 2,
    };
  }
  get dimension() {
    return {
      id: "mock_dimension",
      heightRange: { min: 0, max: 0 },
      localizationKey: "dimension.mock",
    };
  }
}

const unformat = (str: string) => str.replace(/§[0-9a-fk-or]/gi, "");
const stringify = (obj: unknown): string => {
  const proto = Object.getPrototypeOf(obj);
  if (!(proto === null || proto === Object.prototype) && !(obj instanceof Array)) {
    // Obj is a class instance; convert to plain object
    obj = Object.fromEntries(
      Object.getOwnPropertyNames(proto).map((key) => [key, (obj as Record<string, unknown>)[key]]),
    );
  }
  return JSON.stringify(obj, null, 2).replace(/"([^"]+)":/g, "$1:");
};

const fn = world.sendMessage as Mock<(message: string) => void>;
const match = (str: string) => {
  const retval = fn.mock.results[fn.mock.results.length - 1].value as string;
  expect(unformat(retval)).toBe(unformat(str));
};

describe("Debug messages", () => {
  const helloWorld = "Hello, World!";
  it("successfully logs a simple string", () => {
    debug.log(helloWorld);
    match(`[LOG] ${helloWorld}`);
  });
  it("successfully logs an empty string", () => {
    debug.log("");
    match(`[LOG] `);
  });
  it("successfully logs a number", () => {
    debug.info(42);
    match(`[INFO] 42`);
  });
  it("successfully logs a float", () => {
    debug.info(3.14159);
    match(`[INFO] 3.14159`);
  });
  it("successfully logs an empty object", () => {
    const obj = {};
    debug.log(obj);
    match(`[LOG] ${stringify(obj)}`);
  });
  it("successfully logs an empty array", () => {
    const arr: unknown[] = [];
    debug.log(arr);
    match(`[LOG] ${stringify(arr)}`);
  });
  it("successfully logs an object", () => {
    const obj = { hello: "world", value: 42, arr: [1, 2, 3, [2]] };
    debug.info(obj);
    match(`[INFO] ${stringify(obj)}`);
  });
  it("successfully logs a warning", () => {
    debug.warn("This is a warning");
    match(`[WARN] This is a warning`);
  });
  it("successfully logs an error", () => {
    const err = new Error("Something went wrong");
    debug.error(err);
    match(`[ERROR] ${stringify(err)}`);
  });
  it("succesfully logs an entity", () => {
    const mockEntity = new MockEntityClass();
    debug.log(mockEntity);
    match(`[LOG] ${stringify(mockEntity)}`);
  });
  it("successfully logs multiple arguments", () => {
    const num = 123;
    const str = "Test string";
    const arr = [1, 2, 3];
    debug.info(num, str, arr);
    match(`[INFO] 123 Test string ${stringify(arr)}`);
  });
  it("successfully logs a nested object", () => {
    const nestedObj = {
      level1: {
        level2: {
          level3: "deep value",
        },
      },
      foo: "bar",
      arr: [1, { nested: "object in array" }, 3, ["foo", "bar"]],
    };
    debug.warn(nestedObj);
    match(`[WARN] ${stringify(nestedObj)}`);
  });
  it("successfully logs complex array", () => {
    const complexArray = [1, ["key", 2], "two", { three: 3 }, [4, 5, { six: 6 }]];
    debug.error(complexArray);
    match(`[ERROR] ${stringify(complexArray)}`);
  });
  it("successfully logs bigints and booleans", () => {
    const bigIntValue = 9007199254741991n;
    const boolValue = true;
    debug.log(bigIntValue, boolValue);
    match(`[LOG] ${bigIntValue}n ${boolValue}`);
  });
});

describe("Debug.run", () => {
  it("executes without error", () => {
    let executed = false;
    debug.run(() => {
      executed = true;
    });
    expect(executed).toBe(true);
  });
  it("catches and logs errors", () => {
    let executed = false;
    debug.run(() => {
      JSON.parse("");
      executed = true;
    });
    let err: Error | undefined;
    try {
      JSON.parse("");
    } catch (e) {
      if (e instanceof Error) {
        err = e;
      }
    }
    if (err) {
      match(`[ERROR] ${stringify(err)}`);
    }
    expect(executed).toBe(false);
  });
});
