import { Vector2 } from "@minecraft/server";
import { clamp } from "./utils.js";
import { Vec2 } from "./vec2.js";

export class MutVec2 implements Vector2 {
  constructor(
    public x: number,
    public y: number,
  ) {}

  /**
   * Shorthand for `new MutVec2(0, -1)`
   */
  static get Down() {
    return new MutVec2(0, -1);
  }
  /**
   * Shorthand for `new MutVec2(0, 1)`
   */
  static get Up() {
    return new MutVec2(0, 1);
  }
  /**
   * Shorthand for `new MutVec2(-1, 0)`
   */
  static get Left() {
    return new MutVec2(-1, 0);
  }
  /**
   * Shorthand for `new MutVec2(1, 0)`
   */
  static get Right() {
    return new MutVec2(1, 0);
  }
  /**
   * Shorthand for `new MutVec2(1, 1)`
   */
  static get One() {
    return new MutVec2(1, 1);
  }
  /**
   * Shorthand for `new MutVec2(0, 0)`
   */
  static get Zero() {
    return new MutVec2(0, 0);
  }

  /**
   * Sets the X value of the vector
   */
  setX(value: number): MutVec2 {
    this.x = value;
    return this;
  }

  /**
   * Sets the Y value of the vector
   */
  setY(value: number): MutVec2 {
    this.y = value;
    return this;
  }

  /**
   * Check the equality of two vectors
   */
  equals(other?: Partial<Vector2>): boolean {
    return Vec2.equals(this, other);
  }

  /**
   * Adds another vector to this vector
   */
  add(other: Partial<Vector2>): MutVec2 {
    if (other.x !== undefined) this.x += other.x;
    if (other.y !== undefined) this.y += other.y;
    return this;
  }

  /**
   * Subtracts another vector from this vector
   */
  subtract(other: Partial<Vector2>): MutVec2 {
    if (other.x !== undefined) this.x -= other.x;
    if (other.y !== undefined) this.y -= other.y;
    return this;
  }

  /**
   * Multiplies all components by a scalar value
   */
  scale(scalar: number): MutVec2 {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  /**
   * Calculate the dot product of two vectors
   */
  dot(other: Vector2): number {
    return Vec2.dot(this, other);
  }

  /**
   * Calculate the 2D cross product (z component) of two vectors
   */
  cross(other: Vector2): number {
    return Vec2.cross(this, other);
  }

  /**
   * Element-wise multiplication with another vector.
   * Not to be confused with {@link MutVec2.dot} product or {@link MutVec2.cross} product
   */
  multiply(other: Vector2): MutVec2 {
    this.x *= other.x;
    this.y *= other.y;
    return this;
  }

  /**
   * The squared magnitude of the vector.
   * Cheaper than {@link MutVec2.magnitude} for comparisons.
   */
  magnitudeSquared(): number {
    return Vec2.magnitudeSquared(this);
  }

  /**
   * The magnitude of the vector
   */
  magnitude(): number {
    return Vec2.magnitude(this);
  }

  /**
   * Calculate the squared distance between two vectors.
   * Cheaper than {@link MutVec2.distance} for comparisons.
   */
  distanceSquared(other: Vector2): number {
    return Vec2.distanceSquared(this, other);
  }

  /**
   * Calculate the distance between two vectors
   */
  distance(other: Vector2): number {
    return Vec2.distance(this, other);
  }

  /**
   * Normalizes this vector to a unit vector
   */
  normalize(): MutVec2 {
    return this.scale(1 / this.magnitude());
  }

  /**
   * Floors the components of this vector
   */
  floor(): MutVec2 {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  /**
   * Ceils the components of this vector
   */
  ceil(): MutVec2 {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  /**
   * Rounds the components of this vector
   */
  round(): MutVec2 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  /**
   * Centers the components of this vector
   */
  center(): MutVec2 {
    this.x = Math.floor(this.x) + 0.5;
    this.y = Math.floor(this.y) + 0.5;
    return this;
  }

  /**
   * Clamps the components of this vector to limits
   */
  clamp(limits?: { min?: Partial<Vector2>; max?: Partial<Vector2> }): MutVec2 {
    this.x = clamp(
      this.x,
      limits?.min?.x ?? Number.MIN_SAFE_INTEGER,
      limits?.max?.x ?? Number.MAX_SAFE_INTEGER,
    );
    this.y = clamp(
      this.y,
      limits?.min?.y ?? Number.MIN_SAFE_INTEGER,
      limits?.max?.y ?? Number.MAX_SAFE_INTEGER,
    );
    return this;
  }

  /**
   * Linearly interpolates this vector towards another
   */
  lerp(other: Vector2, t: number): MutVec2 {
    this.x += (other.x - this.x) * t;
    this.y += (other.y - this.y) * t;
    return this;
  }

  /**
   * Converts the vector into an `[x, y]` array
   */
  toArray(): number[] {
    return Vec2.toArray(this);
  }

  /**
   * Create a string representation of a vector
   */
  toString(options?: { decimals?: number; delimiter?: string }): string {
    return Vec2.toString(this, options);
  }

  /**
   * Creates a new MutVec2 with the same components as this vector
   */
  clone(): MutVec2 {
    return new MutVec2(this.x, this.y);
  }

  /**
   * Creates an immutable Vec2 copy of this vector
   */
  toImmutable(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  /**
   * Creates a MutVec2 instance from the given vector value
   */
  static from(vector: Vector2): MutVec2;
  /**
   * Creates a MutVec2 instance from the given array
   */
  static from(array: number[]): MutVec2;
  static from(v: Vector2 | number[]): MutVec2 {
    if (Array.isArray(v)) {
      return new MutVec2(v[0], v[1]);
    }
    return new MutVec2(v.x, v.y);
  }
}
