import { DimensionTypes, Entity, system, world } from "@minecraft/server";

/**
 * Tracks entities of a specific type across all dimensions.
 *
 * @example
 * ```ts
 * export const boatQuery = new EntityQuery("minecraft:boat");
 *
 * system.runInterval(() => {
 *   for (const boat of boatQuery.getEntities()) {
 *     // ...
 *   }
 * }, 1);
 * ```
 */
export class EntityQuery {
  private entities = new Set<Entity>();

  /**
   * @param identifier The entity identifier to track.
   */
  constructor(identifier: string) {
    system.run(() => this.init(identifier));
  }

  private init(identifier: string) {
    for (const d of DimensionTypes.getAll()) {
      for (const entity of world.getDimension(d.typeId).getEntities({ type: identifier })) {
        this.entities.add(entity);
      }
    }

    world.afterEvents.entitySpawn.subscribe(({ entity }) => {
      if (entity.typeId === identifier && entity.isValid) {
        this.entities.add(entity);
      }
    });

    world.afterEvents.entityLoad.subscribe(({ entity }) => {
      if (entity.typeId === identifier && entity.isValid) {
        this.entities.add(entity);
      }
    });

    world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
      this.entities.delete(removedEntity);
    });
  }

  getEntities(): ReadonlySet<Entity> {
    return this.entities;
  }
}
