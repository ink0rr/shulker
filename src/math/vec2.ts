import { Vector2 } from "@minecraft/server";
import { clampNumber } from "./utils.js";

export class Vec2 {
  constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  /**
   * Shorthand for `new Vec2(0, -1)`
   */
  static get Down() {
    return new Vec2(0, -1);
  }
  /**
   * Shorthand for `new Vec2(0, 1)`
   */
  static get Up() {
    return new Vec2(0, 1);
  }
  /**
   * Shorthand for `new Vec2(-1, 0)`
   */
  static get Left() {
    return new Vec2(-1, 0);
  }
  /**
   * Shorthand for `new Vec2(1, 0)`
   */
  static get Right() {
    return new Vec2(1, 0);
  }
  /**
   * Shorthand for `new Vec2(1, 1)`
   */
  static get One() {
    return new Vec2(1, 1);
  }
  /**
   * Shorthand for `new Vec2(0, 0)`
   */
  static get Zero() {
    return new Vec2(0, 0);
  }

  /**
   * Creates a Vec2 instance from the given vector value
   */
  static from(vector: Vector2): Vec2 {
    return new Vec2(vector.x, vector.y);
  }

  /**
   * Check the equality of two vectors
   */
  static equals(a: Vector2, b: Vector2): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Check the equality of two vectors
   */
  equals(other: Vector2): boolean {
    return Vec2.equals(this, other);
  }

  /**
   * Add two vectors to produce a new vector
   */
  static add(a: Vector2, b: Partial<Vector2>): Vec2 {
    return new Vec2(a.x + (b.x ?? 0), a.y + (b.y ?? 0));
  }

  /**
   * Add two vectors to produce a new vector
   */
  add(other: Partial<Vector2>): Vec2 {
    return Vec2.add(this, other);
  }

  /**
   * Subtract two vectors to produce a new vector
   */
  static subtract(a: Vector2, b: Partial<Vector2>): Vec2 {
    return new Vec2(a.x - (b.x ?? 0), a.y - (b.y ?? 0));
  }

  /**
   * Subtract two vectors to produce a new vector
   */
  subtract(other: Partial<Vector2>): Vec2 {
    return Vec2.subtract(this, other);
  }

  /**
   * Multiply all entries in a vector by a single scalar value producing a new vector
   */
  static scale(v: Vector2, scalar: number): Vec2 {
    return new Vec2(v.x * scalar, v.y * scalar);
  }

  /**
   * Multiply all entries in a vector by a single scalar value producing a new vector
   */
  scale(scalar: number): Vec2 {
    return Vec2.scale(this, scalar);
  }

  /**
   * Calculate the dot product of two vectors
   */
  static dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Calculate the dot product of two vectors
   */
  dot(other: Vector2): number {
    return Vec2.dot(this, other);
  }

  /**
   * Calculate the cross product of two vectors. Returns a new vector.
   */
  static cross(a: Vector2, b: Vector2): number {
    return a.x * b.y - a.y * b.x;
  }

  /**
   * Calculate the cross product of two vectors. Returns a new vector.
   */
  cross(other: Vector2): number {
    return Vec2.cross(this, other);
  }

  /**
   * Element-wise multiplication of two vectors together.
   * Not to be confused with {@link Vec2.dot} product or {@link Vec2.cross} product
   */
  static multiply(a: Vector2, b: Vector2): Vec2 {
    return new Vec2(a.x * b.x, a.y * b.y);
  }

  /**
   * Element-wise multiplication of two vectors together.
   * Not to be confused with {@link Vec2.dot} product or {@link Vec2.cross} product
   */
  multiply(other: Vector2): Vec2 {
    return Vec2.multiply(this, other);
  }

  /**
   * The magnitude of a vector
   */
  static magnitude(v: Vector2): number {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
  }

  /**
   * The magnitude of a vector
   */
  magnitude(): number {
    return Vec2.magnitude(this);
  }

  /**
   * Calculate the distance between two vectors
   */
  static distance(a: Vector2, b: Vector2): number {
    return Vec2.subtract(a, b).magnitude();
  }

  /**
   * Calculate the distance between two vectors
   */
  distanceTo(other: Vector2): number {
    return Vec2.distance(this, other);
  }

  /**
   * Normalize a vector to a unit vector
   */
  static normalize(v: Vector2): Vec2 {
    return Vec2.scale(v, 1 / Vec2.magnitude(v));
  }

  /**
   * Normalize a vector to a unit vector
   */
  normalize(): Vec2 {
    return Vec2.normalize(this);
  }

  /**
   * Floor the components of a vector to produce a new vector
   */
  static floor(v: Vector2): Vec2 {
    return new Vec2(Math.floor(v.x), Math.floor(v.y));
  }

  /**
   * Floor the components of a vector to produce a new vector
   */
  floor(): Vec2 {
    return Vec2.floor(this);
  }

  /**
   * Ceil the components of a vector to produce a new vector
   */
  static ceil(v: Vector2): Vec2 {
    return new Vec2(Math.ceil(v.x), Math.ceil(v.y));
  }

  /**
   * Ceil the components of a vector to produce a new vector
   */
  ceil(): Vec2 {
    return Vec2.ceil(this);
  }

  /**
   * Round the components of a vector to produce a new vector
   */
  static round(v: Vector2): Vec2 {
    return new Vec2(Math.round(v.x), Math.round(v.y));
  }

  /**
   * Round the components of a vector to produce a new vector
   */
  round(): Vec2 {
    return Vec2.round(this);
  }

  /**
   * Center the components of a vector to produce a new vector
   */
  static center(v: Vector2): Vec2 {
    return new Vec2(Math.floor(v.x) + 0.5, Math.floor(v.y) + 0.5);
  }

  /**
   * Center the components of a vector to produce a new vector
   */
  center(): Vec2 {
    return Vec2.center(this);
  }

  /**
   * Clamps the components of a vector to limits to produce a new vector
   */
  static clamp(v: Vector2, limits?: { min?: Partial<Vector2>; max?: Partial<Vector2> }): Vec2 {
    return new Vec2(
      clampNumber(
        v.x,
        limits?.min?.x ?? Number.MIN_SAFE_INTEGER,
        limits?.max?.x ?? Number.MAX_SAFE_INTEGER,
      ),
      clampNumber(
        v.y,
        limits?.min?.y ?? Number.MIN_SAFE_INTEGER,
        limits?.max?.y ?? Number.MAX_SAFE_INTEGER,
      ),
    );
  }

  /**
   * Clamps the components of a vector to limits to produce a new vector
   */
  clamp(limits?: { min?: Partial<Vector2>; max?: Partial<Vector2> }): Vec2 {
    return Vec2.clamp(this, limits);
  }

  /**
   * Constructs a new vector using linear interpolation on each component from two vectors.
   */
  static lerp(a: Vector2, b: Vector2, t: number): Vec2 {
    return new Vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  /**
   * Constructs a new vector using linear interpolation on each component from two vectors.
   */
  lerp(other: Vector2, t: number): Vec2 {
    return Vec2.lerp(this, other, t);
  }

  /**
   * Create a string representation of a vector
   */
  static toString(v: Vector2, options?: { decimals?: number; delimiter?: string }): string {
    const decimals = options?.decimals ?? 2;
    const delimiter = options?.delimiter ?? " ";
    return [v.x, v.y].map((n) => n.toFixed(decimals)).join(delimiter);
  }

  /**
   * Create a string representation of a vector
   */
  toString(options?: { decimals?: number; delimiter?: string }): string {
    return Vec2.toString(this, options);
  }
}
