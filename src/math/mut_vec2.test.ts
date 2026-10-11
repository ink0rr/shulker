import { describe, expect, it } from "bun:test";
import { MutVec2 } from "./mut_vec2.js";
import { Vec2 } from "./vec2.js";

/**
 * Math is validated by the Vec2 static tests; the concern here is in-place mutation,
 * chaining, aliasing and parity with the immutable implementation.
 */
describe("MutVec2", () => {
  it("static getters return fresh instances", () => {
    const zero = MutVec2.Zero;
    zero.add({ x: 5 });
    expect(MutVec2.Zero.toArray()).toEqual([0, 0]);
    expect(MutVec2.Up.toArray()).toEqual([0, 1]);
    expect(MutVec2.Down.toArray()).toEqual([0, -1]);
    expect(MutVec2.Left.toArray()).toEqual([-1, 0]);
    expect(MutVec2.Right.toArray()).toEqual([1, 0]);
    expect(MutVec2.One.toArray()).toEqual([1, 1]);
  });

  it("from creates an instance from a vector or array", () => {
    const fromVec = MutVec2.from({ x: 1, y: 2 });
    const fromArr = MutVec2.from([1, 2]);
    expect(fromVec).toBeInstanceOf(MutVec2);
    expect(fromArr).toBeInstanceOf(MutVec2);
    expect(fromVec.toArray()).toEqual([1, 2]);
    expect(fromArr.toArray()).toEqual([1, 2]);
  });

  it("from does not alias the source vector", () => {
    const source = { x: 1, y: 2 };
    MutVec2.from(source).add({ x: 10 });
    expect(source).toEqual({ x: 1, y: 2 });
  });

  it("setX/setY mutate in place and chain", () => {
    const v = new MutVec2(1, 2);
    expect(v.setX(3).setY(4)).toBe(v);
    expect(v.toArray()).toEqual([3, 4]);
  });

  it("equals matches the static method", () => {
    const v = new MutVec2(1, 2);
    expect(v.equals({ x: 1, y: 2 })).toBe(true);
    expect(v.equals({ x: 1, y: 3 })).toBe(false);
    expect(v.equals(undefined)).toBe(Vec2.equals(v, undefined));
  });

  it("add mutates in place, chains and ignores missing axes", () => {
    const v = new MutVec2(1, 2);
    expect(v.add({ x: 4, y: 5 })).toBe(v);
    expect(v.toArray()).toEqual([5, 7]);
    v.add({ y: 1 }).add({ x: 1 });
    expect(v.toArray()).toEqual([6, 8]);
  });

  it("subtract mutates in place, chains and ignores missing axes", () => {
    const v = new MutVec2(5, 7);
    expect(v.subtract({ x: 4, y: 5 })).toBe(v);
    expect(v.toArray()).toEqual([1, 2]);
    v.subtract({ y: 1 }).subtract({ x: 1 });
    expect(v.toArray()).toEqual([0, 1]);
  });

  it("scale mutates in place and chains", () => {
    const v = new MutVec2(1, 2);
    expect(v.scale(3).scale(3)).toBe(v);
    expect(v.toArray()).toEqual([9, 18]);
  });

  it("multiply mutates in place", () => {
    const v = new MutVec2(1, 2);
    expect(v.multiply({ x: 4, y: 5 })).toBe(v);
    expect(v.toArray()).toEqual([4, 10]);
  });

  it("scalar queries match the static methods and do not mutate", () => {
    const a = new MutVec2(1, 2);
    const b = { x: 4, y: 5 };
    expect(a.dot(b)).toBe(Vec2.dot(a, b));
    expect(a.cross(b)).toBe(Vec2.cross(a, b));
    expect(a.magnitude()).toBe(Vec2.magnitude(a));
    expect(a.magnitudeSquared()).toBe(Vec2.magnitudeSquared(a));
    expect(a.distance(b)).toBe(Vec2.distance(a, b));
    expect(a.distanceSquared(b)).toBe(Vec2.distanceSquared(a, b));
    expect(a.toArray()).toEqual([1, 2]);
  });

  it("normalize mutates in place to a unit vector", () => {
    const v = new MutVec2(3, 4);
    expect(v.normalize()).toBe(v);
    expect(v.toArray()).toEqual(Vec2.normalize({ x: 3, y: 4 }).toArray());
    expect(v.magnitude()).toBeCloseTo(1);
  });

  it("floor/ceil/round/center mutate in place, including negatives", () => {
    const floor = new MutVec2(-1.5, 2.7);
    expect(floor.floor()).toBe(floor);
    expect(floor.toArray()).toEqual([-2, 2]);

    const ceil = new MutVec2(-1.5, 2.2);
    expect(ceil.ceil()).toBe(ceil);
    expect(ceil.toArray()).toEqual([-1, 3]);

    const round = new MutVec2(-1.6, 2.5);
    expect(round.round()).toBe(round);
    expect(round.toArray()).toEqual([-2, 3]);

    const center = new MutVec2(-1.33, 2.14);
    expect(center.center()).toBe(center);
    expect(center.toArray()).toEqual([-1.5, 2.5]);
  });

  describe("clamp", () => {
    it("is a no-op without limits", () => {
      const v = new MutVec2(1e6, -1e6);
      expect(v.clamp()).toBe(v);
      expect(v.toArray()).toEqual([1e6, -1e6]);
    });

    it("matches the static method with partial limits", () => {
      const limits = { min: { x: 0, y: 1.5 }, max: { x: 2 } };
      const v = new MutVec2(1e6, 1);
      const expected = Vec2.clamp(v, limits).toArray();
      expect(v.clamp(limits)).toBe(v);
      expect(v.toArray()).toEqual(expected);
      expect(v.toArray()).toEqual([2, 1.5]);
    });
  });

  it("lerp mutates in place and matches the static method", () => {
    const a = new MutVec2(5, 6);
    const b = { x: 4, y: 2 };
    const expected = Vec2.lerp(a, b, 0.4).toArray();
    expect(a.lerp(b, 0.4)).toBe(a);
    expect(a.toArray()).toEqual(expected);
  });

  it("lerp endpoints", () => {
    expect(new MutVec2(1, 2).lerp({ x: 4, y: 5 }, 0).toArray()).toEqual([1, 2]);
    expect(new MutVec2(1, 2).lerp({ x: 4, y: 5 }, 1).toArray()).toEqual([4, 5]);
  });

  it("toString matches the static method", () => {
    const v = new MutVec2(1.33, 2.14);
    expect(v.toString()).toBe(Vec2.toString(v));
    expect(v.toString({ decimals: 1, delimiter: "|" })).toBe("1.3|2.1");
  });

  it("clone returns an independent MutVec2", () => {
    const v = new MutVec2(1, 2);
    const c = v.clone();
    expect(c).toBeInstanceOf(MutVec2);
    expect(c).not.toBe(v);
    c.add({ x: 10 });
    expect(v.toArray()).toEqual([1, 2]);
  });

  it("toImmutable returns an independent Vec2", () => {
    const v = new MutVec2(1, 2);
    const i = v.toImmutable();
    expect(i).toBeInstanceOf(Vec2);
    expect(i.toArray()).toEqual([1, 2]);
    v.add({ x: 10 });
    expect(i.toArray()).toEqual([1, 2]);
  });
});
