import type { Dimension, Entity, Vector3 } from "@minecraft/server";
import { getSpaceOnTop } from "./get_space_on_top.js";
import { isActiveChunk } from "./active_chunk.js";

const safeSpawnEntityIterator = (
  iterateCounter: number,
  maxIteration: number,
  identifier: string,
  location: Vector3,
  dimension: Dimension,
) => {
  if (iterateCounter == maxIteration) {
    return undefined;
  }
  const result = safeSpawnEntityJob(identifier, location, dimension);
  if (result) {
    return result;
  }
  return safeSpawnEntityIterator(iterateCounter + 1, maxIteration, identifier, location, dimension);
};

const safeSpawnEntityJob = (
  identifier: string,
  location: Vector3,
  dimension: Dimension,
): Entity | undefined => {
  const isActive = isActiveChunk(dimension.id, location);

  if (isActive) {
    return dimension.spawnEntity(identifier, location);
  }
  return undefined;
};

/**
 * Triggers `entity.teleport()` function while checking if the location is in an active chunk.
 * @param identifier The entity identifier.
 * @param location The location to spawn entity.
 * @param dimension The dimension to spawn the entity in.
 * @param spawnOnTop If true, will trigger `getSpaceOnTop()` to find a valid location to spawn the entity.
 * @param iteration The maximum number of iterations to check for empty space (if spawn on top) and to check for active chunk. Default is 1000.
 * @param persistent If true, the job will continue to run until it confirms that it is an active chunk for a number of iteration. Default is false.
 */
export const safeSpawnEntity = (
  identifier: string,
  location: Vector3,
  dimension: Dimension,
  spawnOnTop: boolean,
  iteration: number = 1000,
  persistent: boolean = false,
): Entity | undefined => {
  let spawnLocation = location;

  if (spawnOnTop) {
    const spawnOnTopLocation = getSpaceOnTop(location, dimension, iteration, persistent);
    if (!spawnOnTopLocation.location) return undefined;
    spawnLocation = spawnOnTopLocation.location;
  }

  const result = safeSpawnEntityJob(identifier, spawnLocation, dimension);

  if (result) {
    return result;
  }

  if (persistent) {
    return safeSpawnEntityIterator(0, iteration, identifier, spawnLocation, dimension);
  } else return undefined;
};
