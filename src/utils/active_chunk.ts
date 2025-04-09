import { Dimension, Vector3, world } from "@minecraft/server";
import { MinecraftDimensionTypes } from "@minecraft/vanilla-data";

type DimensionType = Dimension | `${MinecraftDimensionTypes}`;

/**
 * Returns true if the location is in an active chunk.
 */
export function isActiveChunk(dimension: DimensionType, location: Vector3): boolean {
  try {
    if (typeof dimension === "string") {
      dimension = world.getDimension(dimension);
    }
    return !!dimension.getBlock(location);
  } catch {
    return false;
  }
}
