import { Entity, type TeleportOptions, type Vector3 } from "@minecraft/server";
import { isActiveChunk } from "./active_chunk.js";

const safeTeleportIterator = (
  iterateCounter: number,
  maxIteration: number,
  entity: Entity,
  location: Vector3,
  teleportOptions?: TeleportOptions,
) => {
  if (iterateCounter == maxIteration) {
    return;
  }
  const result = safeTeleportJob(entity, location, teleportOptions);
  if (result) {
    return;
  }
  return safeTeleportIterator(iterateCounter + 1, maxIteration, entity, location, teleportOptions);
};

const safeTeleportJob = (
  entity: Entity,
  location: Vector3,
  teleportOptions?: TeleportOptions,
): boolean => {
  if (!entity.isValid()) return false;
  const dimension = teleportOptions?.dimension ?? entity.dimension;
  const isActive = isActiveChunk(dimension.id, location);
  if (isActive) {
    entity.teleport(location, teleportOptions);
    return true;
  }
  return false;
};

/**
 * Triggers `entity.teleport()` function while checking if the location is in an active chunk.
 * @param entity The entity to be teleported.
 * @param location The location to check for empty space.
 * @param teleportOptions Options for teleporting the entity.
 * @param iteration The maximum number of iterations to check for active chunk. Default is 1000.
 * @param persistent If true, the job will continue to run until it confirms that it is an active chunk for a number of iteration. Default is false.
 */
export const safeTeleport = (
  entity: Entity,
  location: Vector3,
  teleportOptions?: TeleportOptions,
  iteration: number = 1000,
  persistent: boolean = false,
) => {
  const result = safeTeleportJob(entity, location, teleportOptions);
  if (result) {
    return;
  }
  if (persistent) {
    return safeTeleportIterator(0, iteration, entity, location, teleportOptions);
  }
};
