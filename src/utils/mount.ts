import { Entity, EntityRideableComponent, system, world } from "@minecraft/server";

export type MountEvent = {
  rider: Entity;
  ride: Entity;
};

type MountEventHandler = (event: MountEvent) => void;

const rideMap: Map<Entity, EntityRideableComponent> = new Map();
const mountEvents = {
  onMount: new Set<MountEventHandler>(),
  onDismount: new Set<MountEventHandler>(),
};

const dimensions = ["overworld", "nether", "the_end"].map((dimension) =>
  world.getDimension(dimension),
);

function createListener() {
  return system.runInterval(() => {
    const rideComponents = dimensions
      .flatMap((dimension) => dimension.getEntities({ families: ["mob"] }))
      .map((e) => e.getComponent("minecraft:rideable") as EntityRideableComponent)
      .filter((component) => component?.isValid());

    for (const rideComponent of rideComponents) {
      for (const rider of rideComponent.getRiders()) {
        if (rideMap.has(rider)) continue;
        mountEvents.onMount.forEach((f) => f({ rider, ride: rideComponent.entity }));
        rideMap.set(rider, rideComponent);
      }
    }

    rideMap.forEach((rideComp, rider) => {
      if (!rideComp.isValid() || !rideComp.getRiders().some((r) => r.id === rider.id)) {
        mountEvents.onDismount.forEach((f) => f({ rider, ride: rideComp.entity }));
        rideMap.delete(rider);
        return;
      }
    });
  }, 2);
}

function subscribe(set: Set<MountEventHandler>, handler: MountEventHandler) {
  if (set.size === 0) world.setDynamicProperty("shulker:mount_event", createListener());
  set.add(handler);
}

function unsubscribe(set: Set<MountEventHandler>, handler: MountEventHandler) {
  if (set.size === 1) {
    const id = world.getDynamicProperty("shulker:mount_event");
    if (typeof id === "number") system.clearRun(id);
  }
  set.delete(handler);
}

world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => rideMap.delete(removedEntity));

/**
 * Listens to events related to mounting and dismounting rideable entities.
 */
export const mountEvent = {
  /**
   * Events related to mounting rideable entities.
   */
  onMount: {
    /**
     * Subscribes to the event when a rider mounts a rideable entity.
     * @param handler - Code to run when a rider mounts a rideable entity.
     * @returns
     */
    subscribe: (handler: MountEventHandler) => subscribe(mountEvents.onMount, handler),
    unsubscribe: (handler: MountEventHandler) => unsubscribe(mountEvents.onMount, handler),
  },
  /**
   * Events related to dismounting rideable entities.
   */
  onDismount: {
    /**
     * Subscribes to the event when a rider dismounts a rideable entity.
     * @param handler - Code to run when a rider dismounts a rideable entity.
     * @returns
     */
    subscribe: (handler: MountEventHandler) => subscribe(mountEvents.onDismount, handler),
    unsubscribe: (handler: MountEventHandler) => unsubscribe(mountEvents.onDismount, handler),
  },
};