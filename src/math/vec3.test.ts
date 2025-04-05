import { Vector3 } from "@minecraft/server";
import { describe, expect, it } from "vitest";
import { Vec3 } from "./vec3.js";

describe("Vec3 static", () => {
  const v1: Vector3 = { x: 1, y: 2, z: 3 };
  const v2: Vector3 = { x: 4, y: 5, z: 6 };

  it("successfully compares vectors", () => {
    const v3: Vector3 = { x: 1, y: 2, z: 3 };
    expect(Vec3.equals(v1, v3)).toBe(true);
    expect(Vec3.equals(v1, v2)).toBe(false);
  });

  it("successfully adds vectors and returns a new vector", () => {
    const result: Vector3 = Vec3.add(v1, v2);
    expect(result).toEqual({ x: 5, y: 7, z: 9 });
    expect(result).not.toBe(v1);
  });

  it("successfully subtracts vectors and returns a new vector", () => {
    const result: Vector3 = Vec3.subtract(v1, v2);
    expect(result).toEqual({ x: -3, y: -3, z: -3 });
    expect(result).not.toBe(v1);
  });

  it("successfully scales a vector and returns a new vector", () => {
    const result: Vector3 = Vec3.scale(v1, 2);
    expect(result).toEqual({ x: 2, y: 4, z: 6 });
    expect(result).not.toBe(v1);
  });

  it("successfully computes the dot product of a vector", () => {
    const result: number = Vec3.dot(v1, v2);
    expect(result).toBe(32);
  });

  it("successfully computes the dot product of a vector with a 0 vector", () => {
    const result: number = Vec3.dot(v1, { x: 0, y: 0, z: 0 });
    expect(result).toBe(0);
  });

  it("successfully computes the cross product of a vector and returns a new vector", () => {
    const result: Vector3 = Vec3.cross(v1, v2);
    expect(result).toEqual({ x: -3, y: 6, z: -3 });
    expect(result).not.toBe(v1);
    expect(result).not.toBe(v2);
  });

  it("returns a zero vector for a cross product of parallel vectors", () => {
    const result: Vector3 = Vec3.cross({ x: 3, y: 0, z: 0 }, { x: 7, y: 0, z: 0 });
    expect(result).toEqual({ x: 0, y: 0, z: 0 });
  });

  it("returns a zero vector for a cross product of with a zero vector", () => {
    const result: Vector3 = Vec3.cross(v1, { x: 0, y: 0, z: 0 });
    expect(result).toEqual({ x: 0, y: 0, z: 0 });
    expect(result).not.toBe(v1);
  });

  it("returns the unit z vector for a cross product of unit x and unit y vectors", () => {
    const result: Vector3 = Vec3.cross({ x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 });
    expect(result).toEqual({ x: 0, y: 0, z: 1 });
  });

  it("calculates the magnitude", () => {
    const result: number = Vec3.magnitude(v1);
    expect(result).toBeCloseTo(3.74, 2);
  });

  it("calculates the distance between two vectors", () => {
    const result: number = Vec3.distance(v1, v2);
    expect(result).toBeCloseTo(5.2, 2);
  });

  it("computes the floor of the vector", () => {
    const input: Vector3 = { x: 1.33, y: 2.14, z: 3.55 };
    const expected: Vector3 = { x: 1, y: 2, z: 3 };
    expect(Vec3.floor(input)).toEqual(expected);
  });

  it("computes the floor of negative vectors", () => {
    const input: Vector3 = { x: -1.33, y: -2.14, z: -3.55 };
    const expected: Vector3 = { x: -2, y: -3, z: -4 };
    expect(Vec3.floor(input)).toEqual(expected);
  });

  it("normalizes the vector", () => {
    const result: Vector3 = Vec3.normalize(v1);
    expect(result.x).toBeCloseTo(0.27, 2);
    expect(result.y).toBeCloseTo(0.53, 2);
    expect(result.z).toBeCloseTo(0.8, 2);
  });

  it("converts a vector to a string with default options", () => {
    const vector: Vector3 = { x: 1, y: 2, z: 3 };
    const expectedString = "1.00 2.00 3.00";
    expect(Vec3.toString(vector)).toBe(expectedString);
    expect(Vec3.toString(vector, undefined)).toBe(expectedString);
    expect(Vec3.toString(vector, { decimals: undefined, delimiter: undefined })).toBe(
      expectedString,
    );
  });

  it("converts a vector to a string with overridden options", () => {
    const vector: Vector3 = { x: 1.23456789, y: 2.99, z: 3 };
    const expectedString1 = "1.2346|2.9900|3.0000"; // toFixed performs rounding
    expect(Vec3.toString(vector, { decimals: 4, delimiter: "|" })).toBe(expectedString1);
    const expectedString2 = "1|3|3";
    expect(Vec3.toString(vector, { decimals: 0, delimiter: "|" })).toBe(expectedString2);
    const expectedString3 = "1 3 3";
    expect(Vec3.toString(vector, { decimals: 0 })).toBe(expectedString3);
    const expectedString4 = "1.23|2.99|3.00";
    expect(Vec3.toString(vector, { delimiter: "|" })).toBe(expectedString4);
  });

  describe("clamp", () => {
    const v: Vector3 = { x: 1, y: 1, z: 3 };
    const minVec: Partial<Vector3> = { x: 0, y: 1.5 };
    const maxVec: Partial<Vector3> = { x: 2, z: 2.5 };

    it("clamps with defaults (no min or max)", () => {
      const result: Vector3 = Vec3.clamp(v);
      expect(result).toEqual({ x: 1, y: 1, z: 3 });
    });

    it("clamps properly with both min and max", () => {
      const result: Vector3 = Vec3.clamp(v, { min: minVec, max: maxVec });
      expect(result).toEqual({ x: 1, y: 1.5, z: 2.5 });
    });

    it("clamps with min only", () => {
      const result: Vector3 = Vec3.clamp(v, { min: minVec });
      expect(result).toEqual({ x: 1, y: 1.5, z: 3 });
    });

    it("clamps with max only", () => {
      const result: Vector3 = Vec3.clamp(v, { max: maxVec });
      expect(result).toEqual({ x: 1, y: 1, z: 2.5 });
    });

    it("clamp with zero vector and positive mins and negative max", () => {
      const vZero: Vector3 = { x: 0, y: 0, z: 0 };
      const min: Partial<Vector3> = { y: 1.5 };
      const max: Partial<Vector3> = { z: -2.5 };
      const result: Vector3 = Vec3.clamp(vZero, { min, max });
      expect(result).toEqual({ x: 0, y: 1.5, z: -2.5 });
    });

    // Test clamp function with large vector
    const vLarge: Vector3 = { x: 1e6, y: 1e6, z: 1e6 };
    it("clamp with large vector", () => {
      const result: Vector3 = Vec3.clamp(vLarge, { min: minVec, max: maxVec });
      expect(result).toEqual({ x: 2, y: 1e6, z: 2.5 });
    });
  });

  it("calculates the lerp halfway between two vectors", () => {
    const result: Vector3 = Vec3.lerp(v1, v2, 0.5);
    expect(result).toEqual({ x: 2.5, y: 3.5, z: 4.5 });
  });

  it("calculates the slerp halfway between two vectors", () => {
    const vecA: Vector3 = { x: 1, y: 0, z: 0 };
    const vecB: Vector3 = { x: 0, y: -1, z: 0 };
    const result: Vector3 = Vec3.slerp(vecA, vecB, 0.5);
    expect(result.x).toBeCloseTo(0.7071, 3);
    expect(result.y).toBeCloseTo(-0.7071, 3);
    expect(result.z).toBeCloseTo(0);
  });

  it("calculates two vectors multiplied together", () => {
    const result: Vector3 = Vec3.multiply(v1, v2);
    expect(result).toEqual({ x: 4, y: 10, z: 18 });
  });

  describe("Vector3 rotation functions", () => {
    it(`calculates a vector rotated along the x axis`, () => {
      const result = Vec3.rotateX(Vec3.Up, Math.PI / 2);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(1);
    });

    it(`calculates a vector rotated along the y axis`, () => {
      const result = Vec3.rotateY(Vec3.Left, Math.PI / 2);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(1);
    });

    it(`calculates a vector rotated along the z axis`, () => {
      const result = Vec3.rotateZ(Vec3.Up, Math.PI / 2);
      expect(result.x).toBeCloseTo(-1);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });
  });

  describe("Vector3 add partial", () => {
    it(`add a single axis`, () => {
      const result = Vec3.add(Vec3.Up, { z: 4 });
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
      expect(result.z).toBeCloseTo(4);
    });

    it(`add two axis`, () => {
      const result = Vec3.add(Vec3.Up, { z: 7, x: 2 });
      expect(result.x).toBeCloseTo(2);
      expect(result.y).toBeCloseTo(1);
      expect(result.z).toBeCloseTo(7);
    });

    it(`add all three axis`, () => {
      const result = Vec3.add(Vec3.Up, { x: 8, y: 2, z: 3 });
      expect(result.x).toBeCloseTo(8);
      expect(result.y).toBeCloseTo(3);
      expect(result.z).toBeCloseTo(3);
    });
  });

  describe("Vector3 subtract partial", () => {
    it(`subtract a single axis`, () => {
      const result = Vec3.subtract(Vec3.Up, { z: 4 });
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
      expect(result.z).toBeCloseTo(-4);
    });

    it(`subtract two axis`, () => {
      const result = Vec3.subtract(Vec3.Up, { z: 7, x: 2 });
      expect(result.x).toBeCloseTo(-2);
      expect(result.y).toBeCloseTo(1);
      expect(result.z).toBeCloseTo(-7);
    });

    it(`subtract all three axis`, () => {
      const result = Vec3.subtract(Vec3.Up, { x: 8, y: 2, z: 3 });
      expect(result.x).toBeCloseTo(-8);
      expect(result.y).toBeCloseTo(-1);
      expect(result.z).toBeCloseTo(-3);
    });
  });
});

/**
 * Underlying functionality is validated by static tests, primary concern here is consistency of results
 * between the two implementations
 */
describe("Vec3 instance", () => {
  it("should be able to be constructed from a Vector3 or three nunmbers", () => {
    const vectorA = new Vec3({ x: 1, y: 2, z: 3 });
    const vectorB = new Vec3(1, 2, 3);
    expect(vectorA.x).toBe(1);
    expect(vectorA.y).toBe(2);
    expect(vectorA.z).toBe(3);
    expect(vectorA).toEqual(vectorB);
  });

  it("should be able to assign a Vector3", () => {
    const vector = new Vec3(1, 2, 3);
    const updated = vector.assign({ x: 4, y: 5, z: 6 });
    expect(updated.x).toBe(4);
    expect(updated.y).toBe(5);
    expect(updated.z).toBe(6);
    expect(updated).toBe(vector); // Referential equality must be preserved
  });

  it("should be able to check equality with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB = new Vec3(1, 2, 3);
    const vectorC = new Vec3(4, 5, 6);

    expect(vectorA.equals(vectorB)).toBe(Vec3.equals(vectorA, vectorB));
    expect(vectorA.equals(vectorC)).toBe(Vec3.equals(vectorA, vectorC));
  });

  it("should be able to add a vector3 with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB = new Vec3(4, 5, 6);
    const vectorC = Vec3.add(vectorA, vectorB);

    const result = vectorA.add(vectorB);
    expect(result).toEqual(vectorC);

    // Subsequent chained adds should work as expected
    const toAdd: Vector3 = { x: 1, y: 1, z: 1 };
    const resultTwo = result.add(toAdd).add(toAdd).add(toAdd);
    expect(resultTwo).toEqual({ x: 8, y: 10, z: 12 });
  });

  it("should be able to add a partial vector3 with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB: Partial<Vector3> = { x: 4, z: 6 };
    const vectorC = Vec3.add(vectorA, vectorB);

    const result = vectorA.add(vectorB);
    expect(result).toEqual(vectorC);
  });

  it("should be able to subtract a vector3 with the same result as the static method", () => {
    const vectorA = new Vec3(5, 7, 9);
    const vectorB = new Vec3(4, 5, 6);
    const vectorC = Vec3.subtract(vectorA, vectorB);

    const result = vectorA.subtract(vectorB);
    expect(result).toEqual(vectorC);

    // Subsequent chained subtracts should work as expected
    const toSubtract: Vector3 = { x: 1, y: 1, z: 1 };
    const resultTwo = result.subtract(toSubtract).subtract(toSubtract).subtract(toSubtract);
    expect(resultTwo).toEqual({ x: -2, y: -1, z: 0 });
  });

  it("should be able to subtract a partial vector3 with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB: Partial<Vector3> = { x: 4, z: 6 };
    const vectorC = Vec3.subtract(vectorA, vectorB);

    const result = vectorA.subtract(vectorB);
    expect(result).toEqual(vectorC);
  });

  it("should be able to scale a vector3 with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB = Vec3.scale(vectorA, 3);

    const result = vectorA.scale(3);
    expect(result).toEqual(vectorB);

    // Subsequent chained subtracts should work as expected
    const resultTwo = result.scale(3).scale(3);
    expect(resultTwo).toEqual({ x: 27, y: 54, z: 81 });
  });

  it("should be able to compute the dot product with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB = new Vec3(4, 5, 6);
    const dotProduct = Vec3.dot(vectorA, vectorB);

    const result = vectorA.dot(vectorB);
    expect(result).toEqual(dotProduct);
  });

  it("should be able to compute the cross product with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB = new Vec3(4, 5, 6);
    const vectorC = Vec3.cross(vectorA, vectorB);

    const result = vectorA.cross(vectorB);
    expect(result).toEqual(vectorC);

    // Subsequent chained subtracts should work as expected
    const toCross: Vector3 = { x: 1, y: 1, z: 1 };
    const resultTwo = result.cross(toCross).cross(toCross);
    expect(resultTwo).toEqual({ x: 9, y: -18, z: 9 });
  });

  it("should be able to compute the magnitude with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const mag = Vec3.magnitude(vectorA);

    expect(vectorA.magnitude()).toEqual(mag);
  });

  it("should be able to compute the distance between two vectors with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB = new Vec3(4, 5, 6);
    const mag = Vec3.distance(vectorA, vectorB);

    expect(vectorA.distanceTo(vectorB)).toEqual(mag);
  });

  it("should be able to normalize the vector with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const vectorB = Vec3.normalize(vectorA);

    const result = vectorA.normalize();
    expect(result).toEqual(vectorB);
  });

  it("should be able to compute the floor of the vector with the same result as the static method", () => {
    const vectorA = new Vec3(1.33, 2.14, 3.55);
    const vectorB = Vec3.floor(vectorA);

    const result = vectorA.floor();
    expect(result).toEqual(vectorB);
  });

  it("should be able to clamp the vector with the same result as the static method", () => {
    const vectorA = new Vec3(1, 2, 3);
    const minVec: Partial<Vector3> = { x: 0, y: 1.5 };
    const maxVec: Partial<Vector3> = { x: 2, z: 2.5 };
    const vectorB = Vec3.clamp(vectorA, { min: minVec, max: maxVec });

    const result = vectorA.clamp({ min: minVec, max: maxVec });
    expect(result).toEqual(vectorB);
  });

  it("should be able to compute a string representation of the vector with the same result as the static method", () => {
    const vectorA = new Vec3(1.33, 2.14, 3.55);
    const vectorB = Vec3.toString(vectorA, { decimals: 1, delimiter: " " });

    const result = vectorA.toString({ decimals: 1, delimiter: " " });
    expect(result).toEqual(vectorB);
  });

  it("should be able compute the lerp halfway between two vectors with the same result as the static method", () => {
    const vectorA = new Vec3(5, 6, 3);
    const vectorB = new Vec3(4, 2, 6);
    const ratio: number = 0.4;
    const resultA = Vec3.lerp(vectorA, vectorB, ratio);

    const resultB = vectorA.lerp(vectorB, ratio);
    expect(resultA).toEqual(resultB);
  });

  it("should be able compute the slerp halfway between two vectors with the same result as the static method", () => {
    const vectorA = new Vec3(5, 6, 3);
    const vectorB = new Vec3(4, 2, 6);
    const ratio: number = 0.4;
    const resultA = Vec3.slerp(vectorA, vectorB, ratio);

    const resultB = vectorA.slerp(vectorB, ratio);
    expect(resultA).toEqual(resultB);
  });

  it("should be able to multiply with the same result as the static method", () => {
    const vectorA = new Vec3(5, 6, 3);
    const vectorB = new Vec3(4, 2, 6);

    const resultA = Vec3.multiply(vectorA, vectorB);

    const resultB = vectorA.multiply(vectorB);
    expect(resultA).toEqual(resultB);
  });

  it("should be able to rotate over x with the same result as the static method", () => {
    const vectorA = new Vec3(5, 6, 3);
    const angle = Math.PI / 2;

    const resultA = Vec3.rotateX(vectorA, angle);

    const resultB = vectorA.rotateX(angle);
    expect(resultA).toEqual(resultB);
  });

  it("should be able to rotate over y with the same result as the static method", () => {
    const vectorA = new Vec3(5, 6, 3);
    const angle = Math.PI / 2;

    const resultA = Vec3.rotateY(vectorA, angle);

    const resultB = vectorA.rotateY(angle);
    expect(resultA).toEqual(resultB);
  });

  it("should be able to rotate over z with the same result as the static method", () => {
    const vectorA = new Vec3(5, 6, 3);
    const angle = Math.PI / 2;

    const resultA = Vec3.rotateZ(vectorA, angle);

    const resultB = vectorA.rotateZ(angle);
    expect(resultA).toEqual(resultB);
  });
});
