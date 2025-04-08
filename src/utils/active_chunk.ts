import { MinecraftDimensionTypes, type Vector3, world } from "@minecraft/server";

type DimensionId =
  | (typeof MinecraftDimensionTypes)[keyof typeof MinecraftDimensionTypes]
  | (string & {});

/**
 * Check if the location is in an active chunk.
 * @param location - The location to check.
 * @returns True if the location is in an active chunk.
 */
export function isActiveChunk(dimension: DimensionId, location: Vector3): boolean {
  try {
    return !!world.getDimension(dimension as string).getBlock(location);
  } catch {
    return false;
  }
}
