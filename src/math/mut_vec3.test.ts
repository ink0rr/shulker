import { Direction, Vector3 } from "@minecraft/server";
import { describe, expect, it } from "bun:test";
import { MutVec2 } from "./mut_vec2.js";
import { MutVec3 } from "./mut_vec3.js";
import { Vec3 } from "./vec3.js";

function expectClose(actual: Vector3, expected: Vector3) {
  expect(actual.x).toBeCloseTo(expected.x);
  expect(actual.y).toBeCloseTo(expected.y);
  expect(actual.z).toBeCloseTo(expected.z);
}

/**
 * Math is validated by the Vec3 static tests; the concern here is in-place mutation,
 * chaining, aliasing and parity with the immutable implementation.
 */
describe("MutVec3", () => {
  it("static getters return fresh instances", () => {
    const zero = MutVec3.Zero;
    zero.add({ x: 5 });
    expect(MutVec3.Zero.toArray()).toEqual([0, 0, 0]);
    expect(MutVec3.Up.toArray()).toEqual([0, 1, 0]);
    expect(MutVec3.Down.toArray()).toEqual([0, -1, 0]);
    expect(MutVec3.Left.toArray()).toEqual([-1, 0, 0]);
    expect(MutVec3.Right.toArray()).toEqual([1, 0, 0]);
    expect(MutVec3.Forward.toArray()).toEqual([0, 0, 1]);
    expect(MutVec3.Back.toArray()).toEqual([0, 0, -1]);
    expect(MutVec3.One.toArray()).toEqual([1, 1, 1]);
  });

  describe("from", () => {
    it("creates an instance from a vector or array", () => {
      const fromVec = MutVec3.from({ x: 1, y: 2, z: 3 });
      const fromArr = MutVec3.from([1, 2, 3]);
      expect(fromVec).toBeInstanceOf(MutVec3);
      expect(fromArr).toBeInstanceOf(MutVec3);
      expect(fromVec.toArray()).toEqual([1, 2, 3]);
      expect(fromArr.toArray()).toEqual([1, 2, 3]);
    });

    it("does not alias the source vector", () => {
      const source = { x: 1, y: 2, z: 3 };
      MutVec3.from(source).add({ x: 10 });
      expect(source).toEqual({ x: 1, y: 2, z: 3 });
    });

    it("matches Vec3.from for every direction", () => {
      for (const dir of Object.values(Direction)) {
        const result = MutVec3.from(dir);
        expect(result).toBeInstanceOf(MutVec3);
        expect(result.toArray()).toEqual(Vec3.from(dir).toArray());
      }
    });

    it("returns a fresh instance for directions", () => {
      MutVec3.from(Direction.Up).add({ y: 10 });
      expect(MutVec3.from(Direction.Up).toArray()).toEqual([0, 1, 0]);
    });
  });

  describe("fromRotation", () => {
    it("matches Vec3.fromRotation for yaw only, yaw + pitch and a Vector2", () => {
      expect(MutVec3.fromRotation(30).toArray()).toEqual(Vec3.fromRotation(30).toArray());
      expect(MutVec3.fromRotation(30, -45).toArray()).toEqual(Vec3.fromRotation(30, -45).toArray());
      const rot = { x: -45, y: 30 };
      expect(MutVec3.fromRotation(rot).toArray()).toEqual(Vec3.fromRotation(rot).toArray());
      expect(MutVec3.fromRotation(rot)).toBeInstanceOf(MutVec3);
    });

    it("round-trips with toRotation", () => {
      const v = new MutVec3(1, -2, 3);
      const rot = v.toRotation();
      expect(rot).toBeInstanceOf(MutVec2);
      expectClose(MutVec3.fromRotation(rot), Vec3.normalize(v));
    });
  });

  it("toRotation matches the static method and does not mutate", () => {
    const v = new MutVec3(1, -2, 3);
    expect(v.toRotation().toArray()).toEqual(Vec3.toRotation(v).toArray());
    expect(v.toArray()).toEqual([1, -2, 3]);
  });

  it("setX/setY/setZ mutate in place and chain", () => {
    const v = new MutVec3(1, 2, 3);
    expect(v.setX(4).setY(5).setZ(6)).toBe(v);
    expect(v.toArray()).toEqual([4, 5, 6]);
  });

  it("equals matches the static method", () => {
    const v = new MutVec3(1, 2, 3);
    expect(v.equals({ x: 1, y: 2, z: 3 })).toBe(true);
    expect(v.equals({ x: 1, y: 2, z: 4 })).toBe(false);
    expect(v.equals(undefined)).toBe(Vec3.equals(v, undefined));
  });

  it("applyOffset mutates in place and matches the static method", () => {
    const rotation = { x: 20, y: 135 };
    const offset = { x: 1, z: 2 };
    const v = new MutVec3(1, 2, 3);
    const expected = Vec3.applyOffset(v, rotation, offset);
    expect(v.applyOffset(rotation, offset)).toBe(v);
    expectClose(v, expected);
  });

  it("add mutates in place, chains and ignores missing axes", () => {
    const v = new MutVec3(1, 2, 3);
    expect(v.add({ x: 4, y: 5, z: 6 })).toBe(v);
    expect(v.toArray()).toEqual([5, 7, 9]);
    v.add({ y: 1 }).add({ z: 1 });
    expect(v.toArray()).toEqual([5, 8, 10]);
  });

  it("subtract mutates in place, chains and ignores missing axes", () => {
    const v = new MutVec3(5, 7, 9);
    expect(v.subtract({ x: 4, y: 5, z: 6 })).toBe(v);
    expect(v.toArray()).toEqual([1, 2, 3]);
    v.subtract({ y: 1 }).subtract({ z: 1 });
    expect(v.toArray()).toEqual([1, 1, 2]);
  });

  it("scale mutates in place and chains", () => {
    const v = new MutVec3(1, 2, 3);
    expect(v.scale(2).scale(3)).toBe(v);
    expect(v.toArray()).toEqual([6, 12, 18]);
  });

  it("multiply mutates in place", () => {
    const v = new MutVec3(1, 2, 3);
    expect(v.multiply({ x: 4, y: 5, z: 6 })).toBe(v);
    expect(v.toArray()).toEqual([4, 10, 18]);
  });

  describe("cross", () => {
    it("mutates in place and matches the static method", () => {
      const a = new MutVec3(1, 2, 3);
      const b = { x: 4, y: 5, z: 6 };
      const expected = Vec3.cross(a, b).toArray();
      expect(a.cross(b)).toBe(a);
      expect(a.toArray()).toEqual(expected);
    });

    it("handles crossing with itself", () => {
      const v = new MutVec3(1, 2, 3);
      expect(v.cross(v).toArray()).toEqual([0, 0, 0]);
    });

    it("follows the right-hand basis", () => {
      expect(MutVec3.Right.cross(MutVec3.Up).toArray()).toEqual([0, 0, 1]);
    });
  });

  it("scalar queries match the static methods and do not mutate", () => {
    const a = new MutVec3(1, 2, 3);
    const b = { x: 4, y: -5, z: 6 };
    expect(a.dot(b)).toBe(Vec3.dot(a, b));
    expect(a.magnitude()).toBe(Vec3.magnitude(a));
    expect(a.magnitudeSquared()).toBe(Vec3.magnitudeSquared(a));
    expect(a.distance(b)).toBe(Vec3.distance(a, b));
    expect(a.distanceSquared(b)).toBe(Vec3.distanceSquared(a, b));
    expect(a.angle(b)).toBe(Vec3.angle(a, b));
    expect(a.signedAngle(b, MutVec3.Up)).toBe(Vec3.signedAngle(a, b, MutVec3.Up));
    expect(a.toArray()).toEqual([1, 2, 3]);
  });

  it("normalize mutates in place to a unit vector", () => {
    const v = new MutVec3(1, 2, 2);
    expect(v.normalize()).toBe(v);
    expect(v.toArray()).toEqual(Vec3.normalize({ x: 1, y: 2, z: 2 }).toArray());
    expect(v.magnitude()).toBeCloseTo(1);
  });

  it("floor/ceil/round/center/bottomCenter mutate in place, including negatives", () => {
    const floor = new MutVec3(-1.5, 2.7, 0.1);
    expect(floor.floor()).toBe(floor);
    expect(floor.toArray()).toEqual([-2, 2, 0]);

    const ceil = new MutVec3(-1.5, 2.2, 0.1);
    expect(ceil.ceil()).toBe(ceil);
    expect(ceil.toArray()).toEqual([-1, 3, 1]);

    const round = new MutVec3(-1.6, 2.5, 0.4);
    expect(round.round()).toBe(round);
    expect(round.toArray()).toEqual([-2, 3, 0]);

    const center = new MutVec3(-1.33, 2.14, 3.9);
    expect(center.center()).toBe(center);
    expect(center.toArray()).toEqual([-1.5, 2.5, 3.5]);

    const bottom = new MutVec3(-1.33, 2.14, 3.9);
    expect(bottom.bottomCenter()).toBe(bottom);
    expect(bottom.toArray()).toEqual([-1.5, 2, 3.5]);
  });

  describe("clamp", () => {
    it("is a no-op without limits", () => {
      const v = new MutVec3(1e6, -1e6, 0);
      expect(v.clamp()).toBe(v);
      expect(v.toArray()).toEqual([1e6, -1e6, 0]);
    });

    it("matches the static method with partial limits", () => {
      const limits = { min: { x: 0, y: 1.5 }, max: { x: 2, z: -1 } };
      const v = new MutVec3(1e6, 1, 5);
      const expected = Vec3.clamp(v, limits).toArray();
      expect(v.clamp(limits)).toBe(v);
      expect(v.toArray()).toEqual(expected);
      expect(v.toArray()).toEqual([2, 1.5, -1]);
    });
  });

  it("lerp mutates in place and matches the static method", () => {
    const a = new MutVec3(5, 6, 7);
    const b = { x: 4, y: 2, z: -3 };
    const expected = Vec3.lerp(a, b, 0.4).toArray();
    expect(a.lerp(b, 0.4)).toBe(a);
    expect(a.toArray()).toEqual(expected);
  });

  it("slerp mutates in place and matches the static method", () => {
    const a = MutVec3.Right;
    const b = MutVec3.Forward;
    const expected = Vec3.slerp(a, b, 0.5);
    expect(a.slerp(b, 0.5)).toBe(a);
    expectClose(a, expected);
    expectClose(a, { x: Math.SQRT1_2, y: 0, z: Math.SQRT1_2 });
  });

  describe("rotate", () => {
    const angle = Math.PI / 3;

    it("rotateX mutates in place and matches the static method", () => {
      const v = new MutVec3(1, 2, 3);
      const expected = Vec3.rotateX(v, angle).toArray();
      expect(v.rotateX(angle)).toBe(v);
      expect(v.toArray()).toEqual(expected);
    });

    it("rotateY mutates in place and matches the static method", () => {
      const v = new MutVec3(1, 2, 3);
      const expected = Vec3.rotateY(v, angle).toArray();
      expect(v.rotateY(angle)).toBe(v);
      expect(v.toArray()).toEqual(expected);
    });

    it("rotateZ mutates in place and matches the static method", () => {
      const v = new MutVec3(1, 2, 3);
      const expected = Vec3.rotateZ(v, angle).toArray();
      expect(v.rotateZ(angle)).toBe(v);
      expect(v.toArray()).toEqual(expected);
    });
  });

  it("toString matches the static method", () => {
    const v = new MutVec3(1.33, 2.14, 3.99);
    expect(v.toString()).toBe(Vec3.toString(v));
    expect(v.toString({ decimals: 1, delimiter: "|" })).toBe("1.3|2.1|4.0");
  });

  it("clone returns an independent MutVec3", () => {
    const v = new MutVec3(1, 2, 3);
    const c = v.clone();
    expect(c).toBeInstanceOf(MutVec3);
    expect(c).not.toBe(v);
    c.add({ x: 10 });
    expect(v.toArray()).toEqual([1, 2, 3]);
  });

  it("toImmutable returns an independent Vec3", () => {
    const v = new MutVec3(1, 2, 3);
    const i = v.toImmutable();
    expect(i).toBeInstanceOf(Vec3);
    expect(i.toArray()).toEqual([1, 2, 3]);
    v.add({ x: 10 });
    expect(i.toArray()).toEqual([1, 2, 3]);
  });
});
