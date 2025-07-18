import { Vector2, Vector3 } from "@minecraft/server";
import { Vec3 } from "../math/index.js";

/**
 * Get Local position from location, rotation, and distance
 * @param location Location
 * @param rotation Rotation
 * @param distance Distance in each axis
 * @returns Local position
 * @example
 * const location = { x: 4, y: 4, z: 4 };
 * const rotation = { x: 0, y: 90 };
 * const distance = { x: -2, y: 2, z: 4 };
 * // Equivalent to execute positioned 4 4 4 rotated 90 0 positioned ^-2^2^4
 * const coord = getLocalPosition(location, rotation, distance);
 */
export function getLocalPosition(location: Vector3, rotation: Vector2, distance: Vector3) {
  const yaw = rotation.y * (Math.PI / 180);
  const pitch = rotation.x * (Math.PI / 180);

  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);

  const right = new Vec3(cosYaw, 0, sinYaw);
  const up = new Vec3(sinYaw * -sinPitch, cosPitch, cosYaw * sinPitch);
  const forward = new Vec3(-sinYaw * cosPitch, -sinPitch, cosYaw * cosPitch);

  return new Vec3(location)
    .add(right.scale(distance.x))
    .add(up.scale(distance.y))
    .add(forward.scale(distance.z));
}
