import type { Dimension, MolangVariableMap, Vector3 } from "@minecraft/server";
import { isActiveChunk } from "./active_chunk.js";

/**
 * Triggers `dimension.spawnParticle()` function while checking if the location is in an active chunk.
 * @param identifier The particle identifier.
 * @param location The location to spawn the particle at.
 * @param dimension The dimension to spawn the particle in.
 * @param molangVariables The molang variables to use for the particle.
 */
export const safeSpawnParticle = (
  identifier: string,
  location: Vector3,
  dimension: Dimension,
  molangVariables?: MolangVariableMap,
) => {
  const isActive = isActiveChunk(dimension.id, location);
  if (isActive) {
    dimension.spawnParticle(identifier, location, molangVariables);
  }
};
