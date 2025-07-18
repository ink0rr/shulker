import { Dimension, system, world } from "@minecraft/server";
import { getAllPlayers } from "./players.js";

let dimensionList: Dimension[];

function registerEvents() {
  world.afterEvents.playerDimensionChange.subscribe(({ fromDimension, toDimension }) => {
    if (fromDimension.getPlayers().length === 0) {
      dimensionList = dimensionList.filter((d) => d !== fromDimension);
    }
    if (!dimensionList.includes(toDimension)) {
      dimensionList.push(toDimension);
    }
  });
  world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
    const dimension = player.dimension;
    if (initialSpawn && !dimensionList.includes(dimension)) {
      dimensionList.push(dimension);
    }
  });
  world.beforeEvents.playerLeave.subscribe(({ player }) => {
    const dimension = player.dimension;
    if (dimension.getPlayers().length === 0) {
      dimensionList = dimensionList.filter((d) => d !== dimension);
    }
  });
}

/**
 * Get all dimensions that currently have players in them
 * @returns All active dimensions
 */
export function getActiveDimensions() {
  if (!dimensionList) {
    dimensionList = Array.from(new Set(getAllPlayers().map((p) => p.dimension)));
    system.run(registerEvents);
  }
  return dimensionList;
}
