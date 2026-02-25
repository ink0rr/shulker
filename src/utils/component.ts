import {
  Entity,
  EntityComponent,
  EntityComponentReturnType,
  EntityComponentTypes,
  system,
  world,
} from "@minecraft/server";

let cache: WeakMap<Entity, Map<string, EntityComponent | undefined>>;

function registerEvents() {
  world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
    cache.delete(removedEntity);
  });

  world.afterEvents.dataDrivenEntityTrigger.subscribe((event) => {
    const entityComponents = cache.get(event.entity);
    if (!entityComponents) return;

    for (const mod of event.getModifiers()) {
      if (mod.removedComponentGroups.length > 0) {
        // We have no way of knowing which components
        // are removed, so just clear the entire cache.
        entityComponents.clear();
        return;
      }

      if (mod.addedComponentGroups.length > 0) {
        // Remove the undefined components cache
        // because they might get added by this event.
        for (const [id, component] of entityComponents) {
          if (component === undefined) {
            entityComponents.delete(id);
          }
        }
        return;
      }
    }
  });
}

/**
 * Get a component of an entity and save it into cache. The cache is
 * automatically invalidated whenever the entity receives an event that
 * adds/removes component groups.
 *
 * If the entity is unloaded, the cache for that entity will be deleted.
 *
 * @param entity
 * The entity to get the component from.
 * @param componentId
 * The identifier of the component (e.g., 'minecraft:health').
 * If no namespace prefix is specified, 'minecraft:' is assumed.
 * Available component IDs can be found as part of the {@link EntityComponentTypes} enum.
 * @returns
 * Returns the component if it exists on the entity, otherwise undefined.
 */
export function getComponent<T extends string>(
  entity: Entity,
  componentId: T,
): EntityComponentReturnType<T> | undefined {
  if (!cache) {
    cache = new Map();
    system.run(registerEvents);
  }
  let entityComponents = cache.get(entity);
  if (!entityComponents) {
    entityComponents = new Map();
    cache.set(entity, entityComponents);
  }
  if (entityComponents.has(componentId)) {
    return entityComponents.get(componentId) as EntityComponentReturnType<T>;
  }
  const component = entity.getComponent(componentId);
  entityComponents.set(componentId, component);
  return component;
}
