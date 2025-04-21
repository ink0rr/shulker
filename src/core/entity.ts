import {
  DefinitionModifier,
  Entity,
  EntityDamageSource,
  EntityInitializationCause,
  ItemStack,
  Player,
  system,
  world,
} from "@minecraft/server";
import { getActiveDimensions } from "../utils/active_dimensions.js";

export type ScriptEntity = {
  readonly identifier: string;
  /**
   * Called every tick
   */
  onTick?(event: ScriptEntityEvent): void;
  /**
   * Called when the entity dies
   */
  onDie?(event: ScriptEntityDieEvent): void;
  /**
   * Called when the entity's health changed
   */
  onHealthChanged?(event: ScriptEntityHealthChangedEvent): void;
  /**
   * Called when the entity hits another entity
   */
  onHit?(event: ScriptEntityHitEvent): void;
  /**
   * Called when the entity is hurt
   */
  onHurt?(event: ScriptEntityHurtEvent): void;
  /**
   * Called when player interacts with the entity
   */
  onInteract?(event: ScriptEntityInteractEvent): void;
  /**
   * Called when the entity loads
   */
  onLoad?(event: ScriptEntityEvent): void;
  /**
   * Called when the entity is removed
   */
  onRemove?(event: ScriptEntityEvent): void;
  /**
   * Called when the entity spawns
   */
  onSpawn?(event: ScriptEntitySpawnEvent): void;
  /**
   * Map of entity event ids to listen to
   */
  onDataDrivenTrigger?: Record<string, (event: ScriptEntityDataDrivenTriggerEvent) => void>;
};

type ScriptEntityEvent = {
  entity: Entity;
};

export type ScriptEntityDieEvent = ScriptEntityEvent & {
  damageSource: EntityDamageSource;
};

export type ScriptEntityHealthChangedEvent = ScriptEntityEvent & {
  oldValue: number;
  newValue: number;
};

export type ScriptEntityHitEvent = ScriptEntityEvent & {
  target: Entity;
};

export type ScriptEntityHurtEvent = ScriptEntityEvent & {
  damage: number;
  damageSource: EntityDamageSource;
};

export type ScriptEntityInteractEvent = ScriptEntityEvent & {
  player: Player;
  beforeItemStack?: ItemStack;
  itemStack?: ItemStack;
};

export type ScriptEntitySpawnEvent = ScriptEntityEvent & {
  cause: EntityInitializationCause;
};

export type ScriptEntityDataDrivenTriggerEvent = ScriptEntityEvent & {
  getModifiers(): DefinitionModifier[];
};

export const ScriptEntity = {
  register(entityList: ScriptEntity[]) {
    const entities = new Map<string, ScriptEntity>();

    for (const e of entityList) {
      entities.set(e.identifier, e);
      if (!e.onTick) {
        continue;
      }
      system.runInterval(() => {
        for (const dimension of getActiveDimensions()) {
          for (const entity of dimension.getEntities({ type: e.identifier })) {
            e.onTick?.({ entity });
          }
        }
      });
    }

    world.afterEvents.entityDie.subscribe(({ deadEntity, damageSource }) => {
      entities.get(deadEntity.typeId)?.onDie?.({ entity: deadEntity, damageSource });
    });
    world.afterEvents.entityHealthChanged.subscribe((event) => {
      entities.get(event.entity.typeId)?.onHealthChanged?.(event);
    });
    world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
      entities.get(damagingEntity.typeId)?.onHit?.({ entity: damagingEntity, target: hitEntity });
    });
    world.afterEvents.entityHurt.subscribe(({ hurtEntity, damage, damageSource }) => {
      entities.get(hurtEntity.typeId)?.onHurt?.({ entity: hurtEntity, damage, damageSource });
    });
    world.afterEvents.playerInteractWithEntity.subscribe(
      ({ player, target, beforeItemStack, itemStack }) => {
        entities
          .get(target.typeId)
          ?.onInteract?.({ entity: target, player, beforeItemStack, itemStack });
      },
    );
    world.afterEvents.entityLoad.subscribe((event) => {
      entities.get(event.entity.typeId)?.onLoad?.(event);
    });
    world.beforeEvents.entityRemove.subscribe(({ removedEntity }) => {
      entities.get(removedEntity.typeId)?.onRemove?.({ entity: removedEntity });
    });
    world.afterEvents.entitySpawn.subscribe((event) => {
      entities.get(event.entity.typeId)?.onSpawn?.(event);
    });
    world.afterEvents.dataDrivenEntityTrigger.subscribe((event) => {
      entities.get(event.entity.typeId)?.onDataDrivenTrigger?.[event.eventId]?.({
        entity: event.entity,
        getModifiers() {
          return event.getModifiers();
        },
      });
    });
  },
};
