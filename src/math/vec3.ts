import { Vector2, Vector3 } from "@minecraft/server";
import { clampNumber } from "./utils.js";

export class Vec3 {
  x: number;
  y: number;
  z: number;

  constructor(vector3: Vector3);
  constructor(x: number, y: number, z: number);
  constructor(first: number | Vector3, y?: number, z?: number) {
    if (typeof first === "object") {
      this.x = first.x;
      this.y = first.y;
      this.z = first.z;
    } else {
      this.x = first;
      this.y = y ?? 0;
      this.z = z ?? 0;
    }
  }

  /**
   * Shorthand for `new Vec3(0, 0, -1)`
   */
  static get Back() {
    return new Vec3(0, 0, -1);
  }
  /**
   * Shorthand for `new Vec3(0, -1, 0)`
   */
  static get Down() {
    return new Vec3(0, -1, 0);
  }
  /**
   * Shorthand for `new Vec3(0, 0, 1)`
   */
  static get Forward() {
    return new Vec3(0, 0, 1);
  }
  /**
   * Shorthand for `new Vec3(-1, 0, 0)`
   */
  static get Left() {
    return new Vec3(-1, 0, 0);
  }
  /**
   * Shorthand for `new Vec3(1, 0, 0)`
   */
  static get Right() {
    return new Vec3(1, 0, 0);
  }
  /**
   * Shorthand for `new Vec3(0, 1, 0)`
   */
  static get Up() {
    return new Vec3(0, 1, 0);
  }
  /**
   * Shorthand for `new Vec3(1, 1, 1)`
   */
  static get One() {
    return new Vec3(1, 1, 1);
  }
  /**
   * Shorthand for `new Vec3(0, 0, 0)`
   */
  static get Zero() {
    return new Vec3(0, 0, 0);
  }

  /**
   * Creates a vector from the given yaw value
   */
  static fromYaw(val: number | Vector2): Vec3 {
    if (typeof val === "object") {
      val = val.y;
    }
    const rad = (val * Math.PI) / 180;
    return new Vec3(-Math.sin(rad), 0, Math.cos(rad));
  }

  /**
   * Assigns the values of the passed in vector to this vector. Returns itself.
   */
  assign(v: Partial<Vector3>): this {
    if (v.x !== undefined) this.x = v.x;
    if (v.y !== undefined) this.y = v.y;
    if (v.z !== undefined) this.z = v.z;
    return this;
  }

  /**
   * Check the equality of two vectors
   */
  static equals(a: Vector3, b: Vector3): boolean {
    return a.x === b.x && a.y === b.y && a.z === b.z;
  }

  /**
   * Check the equality of two vectors
   */
  equals(other: Vector3): boolean {
    return Vec3.equals(this, other);
  }

  /**
   * Add two vectors to produce a new vector
   */
  static add(a: Vector3, b: Partial<Vector3>): Vec3 {
    return new Vec3(a.x + (b.x ?? 0), a.y + (b.y ?? 0), a.z + (b.z ?? 0));
  }

  /**
   * Add two vectors to produce a new vector
   */
  add(other: Partial<Vector3>): Vec3 {
    return Vec3.add(this, other);
  }

  /**
   * Subtract two vectors to produce a new vector
   */
  static subtract(a: Vector3, b: Partial<Vector3>): Vec3 {
    return new Vec3(a.x - (b.x ?? 0), a.y - (b.y ?? 0), a.z - (b.z ?? 0));
  }

  /**
   * Subtract two vectors to produce a new vector
   */
  subtract(other: Partial<Vector3>): Vec3 {
    return Vec3.subtract(this, other);
  }

  /**
   * Multiply all entries in a vector by a single scalar value producing a new vector
   */
  static scale(v: Vector3, scalar: number): Vec3 {
    return new Vec3(v.x * scalar, v.y * scalar, v.z * scalar);
  }

  /**
   * Multiply all entries in a vector by a single scalar value producing a new vector
   */
  scale(scalar: number): Vec3 {
    return Vec3.scale(this, scalar);
  }

  /**
   * Calculate the dot product of two vectors
   */
  static dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  /**
   * Calculate the dot product of two vectors
   */
  dot(other: Vector3): number {
    return Vec3.dot(this, other);
  }

  /**
   * Calculate the cross product of two vectors. Returns a new vector.
   */
  static cross(a: Vector3, b: Vector3): Vec3 {
    return new Vec3(a.y * b.z - a.z * b.y, a.z * b.x - a.x * b.z, a.x * b.y - a.y * b.x);
  }

  /**
   * Calculate the cross product of two vectors. Returns a new vector.
   */
  cross(other: Vector3): Vec3 {
    return Vec3.cross(this, other);
  }

  /**
   * Element-wise multiplication of two vectors together.
   * Not to be confused with {@link Vec3.dot} product or {@link Vec3.cross} product
   */
  static multiply(a: Vector3, b: Vector3): Vec3 {
    return new Vec3(a.x * b.x, a.y * b.y, a.z * b.z);
  }

  /**
   * Element-wise multiplication of two vectors together.
   * Not to be confused with {@link Vec3.dot} product or {@link Vec3.cross} product
   */
  multiply(other: Vector3): Vec3 {
    return Vec3.multiply(this, other);
  }

  /**
   * The magnitude of a vector
   */
  static magnitude(v: Vector3): number {
    return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  }

  /**
   * The magnitude of a vector
   */
  magnitude(): number {
    return Vec3.magnitude(this);
  }

  /**
   * Calculate the distance between two vectors
   */
  static distance(a: Vector3, b: Vector3): number {
    return Vec3.subtract(a, b).magnitude();
  }

  /**
   * Calculate the distance between two vectors
   */
  distanceTo(other: Vector3): number {
    return Vec3.distance(this, other);
  }

  /**
   * Normalize a vector to a unit vector
   */
  static normalize(v: Vector3): Vec3 {
    return Vec3.scale(v, 1 / Vec3.magnitude(v));
  }

  /**
   * Normalize a vector to a unit vector
   */
  normalize(): Vec3 {
    return Vec3.normalize(this);
  }

  /**
   * Floor the components of a vector to produce a new vector
   */
  static floor(v: Vector3): Vec3 {
    return new Vec3(Math.floor(v.x), Math.floor(v.y), Math.floor(v.z));
  }

  /**
   * Floor the components of a vector to produce a new vector
   */
  floor(): Vec3 {
    return Vec3.floor(this);
  }

  /**
   * Ceil the components of a vector to produce a new vector
   */
  static ceil(v: Vector3): Vec3 {
    return new Vec3(Math.ceil(v.x), Math.ceil(v.y), Math.ceil(v.z));
  }

  /**
   * Ceil the components of a vector to produce a new vector
   */
  ceil(): Vec3 {
    return Vec3.ceil(this);
  }

  /**
   * Round the components of a vector to produce a new vector
   */
  static round(v: Vector3): Vec3 {
    return new Vec3(Math.round(v.x), Math.round(v.y), Math.round(v.z));
  }

  /**
   * Round the components of a vector to produce a new vector
   */
  round(): Vec3 {
    return Vec3.round(this);
  }

  /**
   * Center the components of a vector to produce a new vector
   */
  static center(v: Vector3): Vec3 {
    return new Vec3(Math.floor(v.x) + 0.5, Math.floor(v.y) + 0.5, Math.floor(v.z) + 0.5);
  }

  /**
   * Center the components of a vector to produce a new vector
   */
  center(): Vec3 {
    return Vec3.center(this);
  }

  /**
   * Clamps the components of a vector to limits to produce a new vector
   */
  static clamp(v: Vector3, limits?: { min?: Partial<Vector3>; max?: Partial<Vector3> }): Vec3 {
    return new Vec3(
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
      clampNumber(
        v.z,
        limits?.min?.z ?? Number.MIN_SAFE_INTEGER,
        limits?.max?.z ?? Number.MAX_SAFE_INTEGER,
      ),
    );
  }

  /**
   * Clamps the components of a vector to limits to produce a new vector
   */
  clamp(limits?: { min?: Partial<Vector3>; max?: Partial<Vector3> }): Vec3 {
    return Vec3.clamp(this, limits);
  }

  /**
   * Constructs a new vector using linear interpolation on each component from two vectors.
   */
  static lerp(a: Vector3, b: Vector3, t: number): Vec3 {
    return new Vec3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
  }

  /**
   * Constructs a new vector using linear interpolation on each component from two vectors.
   */
  lerp(other: Vector3, t: number): Vec3 {
    return Vec3.lerp(this, other, t);
  }

  /**
   * Constructs a new vector using spherical linear interpolation on each component from two vectors.
   */
  static slerp(a: Vector3, b: Vector3, t: number): Vec3 {
    const theta = Math.acos(Vec3.dot(a, b));
    const sinTheta = Math.sin(theta);
    const ta = Math.sin((1.0 - t) * theta) / sinTheta;
    const tb = Math.sin(t * theta) / sinTheta;
    return Vec3.add(Vec3.scale(a, ta), Vec3.scale(b, tb));
  }

  /**
   * Constructs a new vector using spherical linear interpolation on each component from two vectors.
   */
  slerp(other: Vector3, t: number): Vec3 {
    return Vec3.slerp(this, other, t);
  }

  /**
   * Rotates the vector around the x axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateX(v: Vector3, a: number): Vec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return new Vec3(v.x, v.y * cos - v.z * sin, v.z * cos + v.y * sin);
  }

  /**
   * Rotates the vector around the x axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  rotateX(a: number): Vec3 {
    return Vec3.rotateX(this, a);
  }

  /**
   * Rotates the vector around the y axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateY(v: Vector3, a: number): Vec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return new Vec3(v.x * cos + v.z * sin, v.y, v.z * cos - v.x * sin);
  }

  /**
   * Rotates the vector around the y axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  rotateY(a: number): Vec3 {
    return Vec3.rotateY(this, a);
  }

  /**
   * Rotates the vector around the z axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateZ(v: Vector3, a: number): Vec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return new Vec3(v.x * cos - v.y * sin, v.y * cos + v.x * sin, v.z);
  }

  /**
   * Rotates the vector around the z axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  rotateZ(a: number): Vec3 {
    return Vec3.rotateZ(this, a);
  }

  /**
   * Create a string representation of a vector
   */
  static toString(v: Vector3, options?: { decimals?: number; delimiter?: string }): string {
    const decimals = options?.decimals ?? 2;
    const delimiter = options?.delimiter ?? " ";
    return [v.x, v.y, v.z].map((n) => n.toFixed(decimals)).join(delimiter);
  }

  /**
   * Create a string representation of a vector
   */
  toString(options?: { decimals?: number; delimiter?: string }): string {
    return Vec3.toString(this, options);
  }
}
