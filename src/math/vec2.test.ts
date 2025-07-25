import { Vector2 } from "@minecraft/server";
import { describe, expect, it } from "bun:test";
import { Vec2 } from "./vec2.js";

describe("Vec2 static", () => {
  const v1: Vector2 = { x: 1, y: 2 };
  const v2: Vector2 = { x: 4, y: 5 };

  it("successfully compares vectors", () => {
    const v3: Vector2 = { x: 1, y: 2 };
    expect(Vec2.equals(v1, v3)).toBe(true);
    expect(Vec2.equals(v1, v2)).toBe(false);
  });

  it("successfully adds vectors and returns a new vector", () => {
    const result: Vector2 = Vec2.add(v1, v2);
    expect(result).toEqual({ x: 5, y: 7 });
    expect(result).not.toBe(v1);
  });

  it("successfully subtracts vectors and returns a new vector", () => {
    const result: Vector2 = Vec2.subtract(v1, v2);
    expect(result).toEqual({ x: -3, y: -3 });
    expect(result).not.toBe(v1);
  });

  it("successfully scales a vector and returns a new vector", () => {
    const result: Vector2 = Vec2.scale(v1, 2);
    expect(result).toEqual({ x: 2, y: 4 });
    expect(result).not.toBe(v1);
  });

  it("successfully computes the dot product of a vector", () => {
    const result: number = Vec2.dot(v1, v2);
    expect(result).toBe(14);
  });

  it("successfully computes the dot product of a vector with a 0 vector", () => {
    const result: number = Vec2.dot(v1, { x: 0, y: 0 });
    expect(result).toBe(0);
  });

  it("successfully computes the cross product of a vector", () => {
    const result = Vec2.cross(v1, v2);
    expect(result).toEqual(-3);
  });

  it("returns zero for a cross product of parallel vectors", () => {
    const result = Vec2.cross({ x: 3, y: 0 }, { x: 7, y: 0 });
    expect(result).toEqual(0);
  });

  it("returns zero for a cross product of with a zero vector", () => {
    const result = Vec2.cross(v1, { x: 0, y: 0 });
    expect(result).toEqual(0);
    expect(result).not.toBe(v1);
  });

  it("calculates the magnitude", () => {
    const result: number = Vec2.magnitude(v1);
    expect(result).toBeCloseTo(2.24, 2);
  });

  it("calculates the distance between two vectors", () => {
    const result: number = Vec2.distance(v1, v2);
    expect(result).toBeCloseTo(4.24, 2);
  });

  it("computes the floor of the vector", () => {
    const result: Vector2 = Vec2.floor({ x: 1.33, y: 2.14 });
    expect(result).toEqual({ x: 1, y: 2 });
  });

  it("computes the floor of negative vectors", () => {
    const result: Vector2 = Vec2.floor({ x: -1.33, y: -2.14 });
    expect(result).toEqual({ x: -2, y: -3 });
  });

  it("computes the ceil of the vector", () => {
    const result: Vector2 = Vec2.ceil({ x: 1.33, y: 2.14 });
    expect(result).toEqual({ x: 2, y: 3 });
  });

  it("computes the center of the vector", () => {
    const result: Vector2 = Vec2.center({ x: 1.33, y: 2.14 });
    expect(result).toEqual({ x: 1.5, y: 2.5 });
  });

  it("normalizes the vector", () => {
    const result: Vector2 = Vec2.normalize(v1);
    expect(result.x).toBeCloseTo(0.45, 2);
    expect(result.y).toBeCloseTo(0.89, 2);
  });

  it("converts a vector to a string with default options", () => {
    const vector: Vector2 = { x: 1, y: 2 };
    const expectedString = "1.00 2.00";
    expect(Vec2.toString(vector)).toBe(expectedString);
    expect(Vec2.toString(vector, undefined)).toBe(expectedString);
    expect(Vec2.toString(vector, { decimals: undefined, delimiter: undefined })).toBe(
      expectedString,
    );
  });

  it("converts a vector to a string with overridden options", () => {
    const vector: Vector2 = { x: 1.23456789, y: 2.99 };
    const expectedString1 = "1.2346|2.9900";
    expect(Vec2.toString(vector, { decimals: 4, delimiter: "|" })).toBe(expectedString1);
    const expectedString2 = "1|3";
    expect(Vec2.toString(vector, { decimals: 0, delimiter: "|" })).toBe(expectedString2);
    const expectedString3 = "1 3";
    expect(Vec2.toString(vector, { decimals: 0 })).toBe(expectedString3);
    const expectedString4 = "1.23|2.99";
    expect(Vec2.toString(vector, { delimiter: "|" })).toBe(expectedString4);
  });

  describe("clamp", () => {
    const v: Vector2 = { x: 1, y: 1 };
    const minVec: Partial<Vector2> = { x: 0, y: 1.5 };
    const maxVec: Partial<Vector2> = { x: 2 };

    it("clamps with defaults (no min or max)", () => {
      const result: Vector2 = Vec2.clamp(v);
      expect(result).toEqual({ x: 1, y: 1 });
    });

    it("clamps properly with both min and max", () => {
      const result: Vector2 = Vec2.clamp(v, { min: minVec, max: maxVec });
      expect(result).toEqual({ x: 1, y: 1.5 });
    });

    it("clamps with min only", () => {
      const result: Vector2 = Vec2.clamp(v, { min: minVec });
      expect(result).toEqual({ x: 1, y: 1.5 });
    });

    it("clamps with max only", () => {
      const result: Vector2 = Vec2.clamp(v, { max: maxVec });
      expect(result).toEqual({ x: 1, y: 1 });
    });

    it("clamp with zero vector and positive mins and negative max", () => {
      const vZero: Vector2 = { x: 0, y: 0 };
      const min: Partial<Vector2> = { x: 1.5 };
      const max: Partial<Vector2> = { y: -2.5 };
      const result: Vector2 = Vec2.clamp(vZero, { min, max });
      expect(result).toEqual({ x: 1.5, y: -2.5 });
    });

    // Test clamp function with large vector
    const vLarge: Vector2 = { x: 1e6, y: 1e6 };
    it("clamp with large vector", () => {
      const result: Vector2 = Vec2.clamp(vLarge, { min: minVec, max: maxVec });
      expect(result).toEqual({ x: 2, y: 1e6 });
    });
  });

  it("calculates the lerp halfway between two vectors", () => {
    const result: Vector2 = Vec2.lerp(v1, v2, 0.5);
    expect(result).toEqual({ x: 2.5, y: 3.5 });
  });

  it("calculates two vectors multiplied together", () => {
    const result: Vector2 = Vec2.multiply(v1, v2);
    expect(result).toEqual({ x: 4, y: 10 });
  });

  describe("Vector2 add partial", () => {
    it(`add a single axis`, () => {
      const result = Vec2.add(Vec2.Up, { y: 4 });
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(5);
    });

    it(`add two axis`, () => {
      const result = Vec2.add(Vec2.Up, { x: 2, y: 7 });
      expect(result.x).toBeCloseTo(2);
      expect(result.y).toBeCloseTo(8);
    });
  });

  describe("Vector2 subtract partial", () => {
    it(`subtract a single axis`, () => {
      const result = Vec2.subtract(Vec2.Up, { y: 4 });
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(-3);
    });

    it(`subtract two axis`, () => {
      const result = Vec2.subtract(Vec2.Up, { x: 2, y: 7 });
      expect(result.x).toBeCloseTo(-2);
      expect(result.y).toBeCloseTo(-6);
    });
  });
});

/**
 * Underlying functionality is validated by static tests, primary concern here is consistency of results
 * between the two implementations
 */
describe("Vec2 instance", () => {
  it("should be able to be constructed from a Vector2 or three nunmbers", () => {
    const vectorA = new Vec2({ x: 1, y: 2 });
    const vectorB = new Vec2(1, 2);
    expect(vectorA.x).toBe(1);
    expect(vectorA.y).toBe(2);
    expect(vectorA).toEqual(vectorB);
  });

  it("should be able to assign a Vector2", () => {
    const vector = new Vec2(1, 2);
    const updated = vector.assign({ x: 4, y: 5 });
    expect(updated.x).toBe(4);
    expect(updated.y).toBe(5);
    expect(updated).toBe(vector); // Referential equality must be preserved
  });

  it("should be able to check equality with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB = new Vec2(1, 2);
    const vectorC = new Vec2(4, 5);

    expect(vectorA.equals(vectorB)).toBe(Vec2.equals(vectorA, vectorB));
    expect(vectorA.equals(vectorC)).toBe(Vec2.equals(vectorA, vectorC));
  });

  it("should be able to add a vector2 with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB = new Vec2(4, 5);
    const vectorC = Vec2.add(vectorA, vectorB);

    const result = vectorA.add(vectorB);
    expect(result).toEqual(vectorC);

    // Subsequent chained adds should work as expected
    const toAdd: Vector2 = { x: 1, y: 1 };
    const resultTwo: Vector2 = result.add(toAdd).add(toAdd).add(toAdd);
    expect(resultTwo).toEqual({ x: 8, y: 10 });
  });

  it("should be able to add a partial vector2 with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB: Partial<Vector2> = { x: 4 };
    const vectorC = Vec2.add(vectorA, vectorB);

    const result = vectorA.add(vectorB);
    expect(result).toEqual(vectorC);
  });

  it("should be able to subtract a vector2 with the same result as the static method", () => {
    const vectorA = new Vec2(5, 7);
    const vectorB = new Vec2(4, 5);
    const vectorC = Vec2.subtract(vectorA, vectorB);

    const result = vectorA.subtract(vectorB);
    expect(result).toEqual(vectorC);

    // Subsequent chained subtracts should work as expected
    const toSubtract: Vector2 = { x: 1, y: 1 };
    const resultTwo: Vector2 = result
      .subtract(toSubtract)
      .subtract(toSubtract)
      .subtract(toSubtract);
    expect(resultTwo).toEqual({ x: -2, y: -1 });
  });

  it("should be able to subtract a partial vector2 with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB: Partial<Vector2> = { x: 4 };
    const vectorC = Vec2.subtract(vectorA, vectorB);

    const result = vectorA.subtract(vectorB);
    expect(result).toEqual(vectorC);
  });

  it("should be able to scale a vector2 with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB = Vec2.scale(vectorA, 3);

    const result = vectorA.scale(3);
    expect(result).toEqual(vectorB);

    // Subsequent chained subtracts should work as expected
    const resultTwo: Vector2 = result.scale(3).scale(3);
    expect(resultTwo).toEqual({ x: 27, y: 54 });
  });

  it("should be able to compute the dot product with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB = new Vec2(4, 5);
    const dotProduct = Vec2.dot(vectorA, vectorB);

    const result = vectorA.dot(vectorB);
    expect(result).toEqual(dotProduct);
  });

  it("should be able to compute the cross product with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB = new Vec2(4, 5);
    const vectorC = Vec2.cross(vectorA, vectorB);

    const result = vectorA.cross(vectorB);
    expect(result).toEqual(vectorC);
  });

  it("should be able to compute the magnitude with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const mag = Vec2.magnitude(vectorA);

    expect(vectorA.magnitude()).toEqual(mag);
  });

  it("should be able to compute the distance between two vectors with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB = new Vec2(4, 5);
    const mag = Vec2.distance(vectorA, vectorB);

    expect(vectorA.distanceTo(vectorB)).toEqual(mag);
  });

  it("should be able to normalize the vector with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const vectorB = Vec2.normalize(vectorA);

    const result = vectorA.normalize();
    expect(result).toEqual(vectorB);
  });

  it("should be able to compute the floor of the vector with the same result as the static method", () => {
    const vectorA = new Vec2(1.33, 2.14);
    const vectorB = Vec2.floor(vectorA);

    const result = vectorA.floor();
    expect(result).toEqual(vectorB);
  });

  it("should be able to compute the ceil of the vector with the same result as the static method", () => {
    const vectorA = new Vec2(1.33, 2.14);
    const vectorB = Vec2.ceil(vectorA);

    const result = vectorA.ceil();
    expect(result).toEqual(vectorB);
  });

  it("should be able to compute the center of the vector with the same result as the static method", () => {
    const vectorA = new Vec2(1.33, 2.14);
    const vectorB = Vec2.center(vectorA);

    const result = vectorA.center();
    expect(result).toEqual(vectorB);
  });

  it("should be able to clamp the vector with the same result as the static method", () => {
    const vectorA = new Vec2(1, 2);
    const minVec: Partial<Vector2> = { x: 0, y: 1.5 };
    const maxVec: Partial<Vector2> = { x: 2 };
    const vectorB = Vec2.clamp(vectorA, { min: minVec, max: maxVec });

    const result = vectorA.clamp({ min: minVec, max: maxVec });
    expect(result).toEqual(vectorB);
  });

  it("should be able to compute a string representation of the vector with the same result as the static method", () => {
    const vectorA = new Vec2(1.33, 2.14);
    const vectorB = Vec2.toString(vectorA, { decimals: 1, delimiter: " " });

    const result = vectorA.toString({ decimals: 1, delimiter: " " });
    expect(result).toEqual(vectorB);
  });

  it("should be able compute the lerp halfway between two vectors with the same result as the static method", () => {
    const vectorA = new Vec2(5, 6);
    const vectorB = new Vec2(4, 2);
    const ratio: number = 0.4;
    const resultA = Vec2.lerp(vectorA, vectorB, ratio);

    const resultB = vectorA.lerp(vectorB, ratio);
    expect(resultA).toEqual(resultB);
  });
});
