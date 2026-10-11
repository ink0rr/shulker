import { Direction, Vector2, Vector3 } from "@minecraft/server";
import { MutVec2 } from "./mut_vec2.js";
import { clamp } from "./utils.js";
import { Vec3 } from "./vec3.js";

export class MutVec3 implements Vector3 {
  constructor(
    public x: number,
    public y: number,
    public z: number,
  ) {}

  /**
   * Shorthand for `new MutVec3(0, 0, -1)`
   */
  static get Back() {
    return new MutVec3(0, 0, -1);
  }
  /**
   * Shorthand for `new MutVec3(0, -1, 0)`
   */
  static get Down() {
    return new MutVec3(0, -1, 0);
  }
  /**
   * Shorthand for `new MutVec3(0, 0, 1)`
   */
  static get Forward() {
    return new MutVec3(0, 0, 1);
  }
  /**
   * Shorthand for `new MutVec3(-1, 0, 0)`
   */
  static get Left() {
    return new MutVec3(-1, 0, 0);
  }
  /**
   * Shorthand for `new MutVec3(1, 0, 0)`
   */
  static get Right() {
    return new MutVec3(1, 0, 0);
  }
  /**
   * Shorthand for `new MutVec3(0, 1, 0)`
   */
  static get Up() {
    return new MutVec3(0, 1, 0);
  }
  /**
   * Shorthand for `new MutVec3(1, 1, 1)`
   */
  static get One() {
    return new MutVec3(1, 1, 1);
  }
  /**
   * Shorthand for `new MutVec3(0, 0, 0)`
   */
  static get Zero() {
    return new MutVec3(0, 0, 0);
  }

  /**
   * Sets the X value of the vector
   */
  setX(value: number): MutVec3 {
    this.x = value;
    return this;
  }

  /**
   * Sets the Y value of the vector
   */
  setY(value: number): MutVec3 {
    this.y = value;
    return this;
  }

  /**
   * Sets the Z value of the vector
   */
  setZ(value: number): MutVec3 {
    this.z = value;
    return this;
  }

  /**
   * Check the equality of two vectors
   */
  equals(other?: Partial<Vector3>): boolean {
    return Vec3.equals(this, other);
  }

  /**
   * Applies a rotation-relative offset to this vector
   */
  applyOffset(rotation: Vector2, offset: Partial<Vector3>): MutVec3 {
    const yaw = rotation.y * (Math.PI / 180);
    const pitch = rotation.x * (Math.PI / 180);

    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);

    const offsetX = offset.x ?? 0;
    const offsetY = offset.y ?? 0;
    const offsetZ = offset.z ?? 0;

    this.x += cosYaw * offsetX - sinYaw * sinPitch * offsetY - sinYaw * cosPitch * offsetZ;
    this.y += cosPitch * offsetY - sinPitch * offsetZ;
    this.z += sinYaw * offsetX + cosYaw * sinPitch * offsetY + cosYaw * cosPitch * offsetZ;
    return this;
  }

  /**
   * Adds another vector to this vector
   */
  add(other: Partial<Vector3>): MutVec3 {
    if (other.x !== undefined) this.x += other.x;
    if (other.y !== undefined) this.y += other.y;
    if (other.z !== undefined) this.z += other.z;
    return this;
  }

  /**
   * Subtracts another vector from this vector
   */
  subtract(other: Partial<Vector3>): MutVec3 {
    if (other.x !== undefined) this.x -= other.x;
    if (other.y !== undefined) this.y -= other.y;
    if (other.z !== undefined) this.z -= other.z;
    return this;
  }

  /**
   * Multiplies all components by a scalar value
   */
  scale(scalar: number): MutVec3 {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  /**
   * Calculate the dot product of two vectors
   */
  dot(other: Vector3): number {
    return Vec3.dot(this, other);
  }

  /**
   * Sets this vector to the cross product of this and another vector
   */
  cross(other: Vector3): MutVec3 {
    const { x, y, z } = this;
    const { x: ox, y: oy, z: oz } = other;
    this.x = y * oz - z * oy;
    this.y = z * ox - x * oz;
    this.z = x * oy - y * ox;
    return this;
  }

  /**
   * Element-wise multiplication with another vector.
   * Not to be confused with {@link MutVec3.dot} product or {@link MutVec3.cross} product
   */
  multiply(other: Vector3): MutVec3 {
    this.x *= other.x;
    this.y *= other.y;
    this.z *= other.z;
    return this;
  }

  /**
   * The magnitude of the vector
   */
  magnitude(): number {
    return Vec3.magnitude(this);
  }

  /**
   * The squared magnitude of the vector.
   * Cheaper than {@link MutVec3.magnitude} for comparisons.
   */
  magnitudeSquared(): number {
    return Vec3.magnitudeSquared(this);
  }

  /**
   * Calculate the distance between two vectors
   */
  distance(other: Vector3): number {
    return Vec3.distance(this, other);
  }

  /**
   * Calculate the squared distance between two vectors.
   * Cheaper than {@link MutVec3.distance} for comparisons.
   */
  distanceSquared(other: Vector3): number {
    return Vec3.distanceSquared(this, other);
  }

  /**
   * Normalizes this vector to a unit vector
   */
  normalize(): MutVec3 {
    return this.scale(1 / this.magnitude());
  }

  /**
   * Returns the angle in degrees between this vector and another.
   */
  angle(to: Vector3): number {
    return Vec3.angle(this, to);
  }

  /**
   * Returns the signed angle in degrees between this vector and another.
   * @param to The vector to which the angular difference is measured.
   * @param axis A vector around which the other vectors are rotated.
   */
  signedAngle(to: Vector3, axis: Vector3): number {
    return Vec3.signedAngle(this, to, axis);
  }

  /**
   * Floors the components of this vector
   */
  floor(): MutVec3 {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    return this;
  }

  /**
   * Ceils the components of this vector
   */
  ceil(): MutVec3 {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    return this;
  }

  /**
   * Rounds the components of this vector
   */
  round(): MutVec3 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    return this;
  }

  /**
   * Centers the components of this vector
   */
  center(): MutVec3 {
    this.x = Math.floor(this.x) + 0.5;
    this.y = Math.floor(this.y) + 0.5;
    this.z = Math.floor(this.z) + 0.5;
    return this;
  }

  /**
   * Centers the X and Z axis of this vector
   */
  bottomCenter(): MutVec3 {
    this.x = Math.floor(this.x) + 0.5;
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z) + 0.5;
    return this;
  }

  /**
   * Clamps the components of this vector to limits
   */
  clamp(limits?: { min?: Partial<Vector3>; max?: Partial<Vector3> }): MutVec3 {
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
    this.z = clamp(
      this.z,
      limits?.min?.z ?? Number.MIN_SAFE_INTEGER,
      limits?.max?.z ?? Number.MAX_SAFE_INTEGER,
    );
    return this;
  }

  /**
   * Linearly interpolates this vector towards another
   */
  lerp(other: Vector3, t: number): MutVec3 {
    this.x += (other.x - this.x) * t;
    this.y += (other.y - this.y) * t;
    this.z += (other.z - this.z) * t;
    return this;
  }

  /**
   * Spherically interpolates this vector towards another
   */
  slerp(other: Vector3, t: number): MutVec3 {
    const theta = Math.acos(this.dot(other));
    const sinTheta = Math.sin(theta);
    const ta = Math.sin((1.0 - t) * theta) / sinTheta;
    const tb = Math.sin(t * theta) / sinTheta;
    this.x = this.x * ta + other.x * tb;
    this.y = this.y * ta + other.y * tb;
    this.z = this.z * ta + other.z * tb;
    return this;
  }

  /**
   * Rotates the vector around the x axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  rotateX(a: number): MutVec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const { y, z } = this;
    this.y = y * cos - z * sin;
    this.z = z * cos + y * sin;
    return this;
  }

  /**
   * Rotates the vector around the y axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  rotateY(a: number): MutVec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const { x, z } = this;
    this.x = x * cos + z * sin;
    this.z = z * cos - x * sin;
    return this;
  }

  /**
   * Rotates the vector around the z axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  rotateZ(a: number): MutVec3 {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    const { x, y } = this;
    this.x = x * cos - y * sin;
    this.y = y * cos + x * sin;
    return this;
  }

  /**
   * Converts vector into yaw and pitch rotation value.
   */
  toRotation(): MutVec2 {
    const hLen = Math.sqrt(this.x ** 2 + this.z ** 2);
    const pitch = Math.atan2(-this.y, hLen) * (180 / Math.PI);
    const yaw = -Math.atan2(this.x, this.z) * (180 / Math.PI);
    return new MutVec2(pitch, yaw);
  }

  /**
   * Converts the vector into an `[x, y, z]` array
   */
  toArray(): number[] {
    return Vec3.toArray(this);
  }

  /**
   * Create a string representation of a vector
   */
  toString(options?: { decimals?: number; delimiter?: string }): string {
    return Vec3.toString(this, options);
  }

  /**
   * Creates a new MutVec3 with the same components as this vector
   */
  clone(): MutVec3 {
    return new MutVec3(this.x, this.y, this.z);
  }

  /**
   * Creates an immutable Vec3 copy of this vector
   */
  toImmutable(): Vec3 {
    return new Vec3(this.x, this.y, this.z);
  }

  /**
   * Creates a MutVec3 instance from the given vector value
   */
  static from(vector: Vector3): MutVec3;
  /**
   * Creates a MutVec3 instance from the given direction value
   */
  static from(direction: Direction): MutVec3;
  /**
   * Creates a MutVec3 instance from the given array
   */
  static from(array: number[]): MutVec3;
  static from(v: Vector3 | Direction | number[]): MutVec3 {
    switch (v) {
      case Direction.Down:
        return MutVec3.Down;
      case Direction.East:
        return MutVec3.Right;
      case Direction.North:
        return MutVec3.Back;
      case Direction.South:
        return MutVec3.Forward;
      case Direction.Up:
        return MutVec3.Up;
      case Direction.West:
        return MutVec3.Left;
      default:
        if (Array.isArray(v)) {
          return new MutVec3(v[0], v[1], v[2]);
        }
        return new MutVec3(v.x, v.y, v.z);
    }
  }

  /**
   * Creates a new MutVec3 from the given rotation value
   */
  static fromRotation(rotation: Vector2): MutVec3;
  /**
   * Creates a new MutVec3 from the given yaw and pitch value
   */
  static fromRotation(yaw: number, pitch?: number): MutVec3;
  static fromRotation(val: Vector2 | number, pitch?: number): MutVec3 {
    let yaw: number;
    if (typeof val === "number") {
      yaw = val;
    } else {
      yaw = val.y;
      pitch = val.x;
    }
    const psi = (yaw * Math.PI) / 180;
    if (pitch === undefined) {
      return new MutVec3(-Math.sin(psi), 0, Math.cos(psi));
    }
    const theta = (pitch * Math.PI) / 180;
    return new MutVec3(
      -Math.cos(theta) * Math.sin(psi),
      -Math.sin(theta),
      Math.cos(theta) * Math.cos(psi),
    );
  }
}
