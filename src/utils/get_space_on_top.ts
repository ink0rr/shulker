import type { Dimension, Vector3 } from "@minecraft/server";
import { isActiveChunk } from "./active_chunk.js";
import { isSolid } from "./is_solid.js";

export enum SpaceOnTopMessage {
  Success = "Empty space successfully returns a valid location",
  MaxLoop = "Iteration has reached its maxiumum loop",
  OutOfWorld = "The iterated height is out of world.",
  NotPersistent = "Empty space job is not persistent",
}

const getSpaceOnTopJob = (
  iterateCounter: number,
  maxIteration: number,
  location: Vector3,
  dimension: Dimension,
  persistent: boolean = false,
): {
  location: Vector3 | undefined;
  message: SpaceOnTopMessage;
} => {
  const { max, min } = dimension.heightRange;
  if (location.y < min || location.y > max) {
    return {
      location: undefined,
      message: SpaceOnTopMessage.OutOfWorld,
    };
  }
  if (iterateCounter == maxIteration) {
    return {
      location: undefined,
      message: SpaceOnTopMessage.MaxLoop,
    };
  }
  const isActive = isActiveChunk(dimension.id, location);
  if (!isActive) {
    if (persistent)
      return getSpaceOnTopJob(iterateCounter + 1, maxIteration, location, dimension, true);
    else
      return {
        location: undefined,
        message: SpaceOnTopMessage.NotPersistent,
      };
  }

  let block = dimension.getBlock(location);
  if (block) {
    if (isSolid(block) && !block.isLiquid && !block.isAir) {
      location = {
        x: location.x,
        y: location.y + 1,
        z: location.z,
      };
      return getSpaceOnTopJob(iterateCounter, maxIteration, location, dimension);
    } else {
      return {
        location: location,
        message: SpaceOnTopMessage.Success,
      };
    }
  }

  if (persistent)
    return getSpaceOnTopJob(iterateCounter + 1, maxIteration, location, dimension, true);
  else
    return {
      location: undefined,
      message: SpaceOnTopMessage.NotPersistent,
    };
};

/**
 * Gets the first empty space on top of the given location.
 * @param location The location to check for empty space.
 * @param dimension The dimension to check in.
 * @param iteration The maximum number of iterations to check for empty space. Default is 1000.
 * @param persistent If true, the job will continue to run until it finds an empty space for a number of iteration. Default is false.
 */
export const getSpaceOnTop = (
  location: Vector3,
  dimension: Dimension,
  iteration: number = 1000,
  persistent: boolean = false,
): {
  location: Vector3 | undefined;
  message: SpaceOnTopMessage;
} => {
  return getSpaceOnTopJob(0, iteration, location, dimension, persistent);
};
