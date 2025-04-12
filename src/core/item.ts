import {
  Block,
  Direction,
  Entity,
  EntityDamageCause,
  EntityDamageSource,
  EquipmentSlot,
  ItemStack,
  Player,
  PlayerSoundOptions,
  Vector3,
  system,
  world,
} from "@minecraft/server";
import { getEquipment } from "../utils/equipment.js";
import { getAllPlayers } from "../utils/players.js";

export type ScriptItem = {
  /**
   * Identifier of the item.
   */
  readonly identifier: string;
  /**
   * Sets whether the item will have shield behavior or not.
   */
  readonly canBlock?: boolean;
  /**
   * Sets the setting for the shield behavior.
   * 
   * @param {number} [healRatio] - The ratio from damage HP being returned to player's HP (range: 0 to 1, default: 0).
   * @param {boolean} [knockbackPower] - The power of the knockback (default: 0).
   * @param {EntityDamageCause[]} [blockedDamage] - The damage types that can be blocked (default: entityAttack, blockExplosion, entityExplosion, projectile, fireworks, ramAttack).
   * @param {boolean} [blockFrontOnly] - Whether the shield can only block damage from the front (default: true).
   * @param {string} [soundId] - The sound ID to play when the shield blocks damage (default: item.shield.block).
   * @param {PlayerSoundOptions} [soundOptions] - The sound options to play when the shield blocks damage.
   */
  readonly blockOptions?: ScriptItemBlockOptions;
  /**
   * Called every tick
   */
  onTick?(player: Player): void;
  /**
   * Called when player breaks block with this item
   */
  onBreakBlock?(event: ScriptItemBreakBlockEvent): void;
  /**
   * Called when player equips this item
   */
  onEquip?(event: ScriptItemEquipEvent): void;
  /**
   * Called when player holds this item in any EquipmentSlot
   */
  onHold?(event: ScriptItemEquipEvent): void;
  /**
   * Called when player unequips this item
   */
  onUnequip?(event: ScriptItemEquipEvent): void;
  /**
   * Called when player hits an entity with this item
   */
  onHit?(event: ScriptItemHitEvent): void;
  /**
   * Called when player hits an entity while having this item in any EquipmentSlot
   */
  onEquipHit?(event: ScriptItemHitEvent): void;
  /**
   * Called when player kills an entity with this item
   */
  onKill?(event: ScriptItemHitEvent): void;
  /**
   * Called when item is used on block
   */
  onUseOn?(event: ScriptItemUseOnEvent): void;
  /**
   * Called when the item starts charging
   */
  onStartUse?(event: ScriptItemUseEvent): void;
  /**
   * Called when the item stops charging
   */
  onStopUse?(event: ScriptItemUseEvent): void;
  /**
   * Called when the item is released from charging
   */
  onReleaseUse?(event: ScriptItemUseEvent): void;
  /**
   * Called when the item completes charging
   */
  onCompleteUse?(event: ScriptItemUseEvent): void;
  /**
   * Called when the item is equipped in the main hand or offhand, and the item successfully blocks incoming damage as a shield.
   */
  onBlock?(event: ScriptItemBlockEvent): void;
};

export type ScriptItemBlockOptions = {
  healRatio?: number,
  knockbackPower?: number,
  blockedDamage?: EntityDamageCause[],
  blockFrontOnly?: boolean,
  soundId?: string,
  soundOptions?: PlayerSoundOptions
};

type ScriptItemEvent = {
  player: Player;
  itemStack: ItemStack;
};

export type ScriptItemBreakBlockEvent = ScriptItemEvent & {
  block: Block;
  cancel(): void;
};

export type ScriptItemEquipEvent = ScriptItemEvent & {
  slot: EquipmentSlot;
};

export type ScriptItemHitEvent = ScriptItemEvent & {
  victim: Entity;
};

export type ScriptItemUseOnEvent = ScriptItemEvent & {
  block: Block;
  blockFace: Direction;
  faceLocation: Vector3;
};

export type ScriptItemUseEvent = ScriptItemEvent & {
  useDuration: number;
};

export type ScriptItemBlockEvent = ScriptItemEvent & {
  damageSource: EntityDamageSource;
  damage: number;
};

export const ScriptItem = {
  register(itemList: ScriptItem[]) {
    const items = new Map<string, ScriptItem>();
    const playerEquipments = new Map<string, Array<ItemStack | undefined>>();
    const equipmentSlots = Object.values(EquipmentSlot);

    for (const item of itemList) {
      items.set(item.identifier, item);
    }

    system.runInterval(() => {
      for (const player of getAllPlayers()) {
        for (const [, item] of items) {
          item.onTick?.(player);
        }
        const prevEquipments = playerEquipments.get(player.id) ?? [];
        const currentEquipments = [];
        for (const slot of equipmentSlots) {
          currentEquipments.push(getEquipment(player, slot));
        }
        for (let i = 0; i < equipmentSlots.length; i++) {
          const slot = equipmentSlots[i];
          const prev = prevEquipments[i];
          const current = currentEquipments[i];
          const isChanged = prev?.typeId !== current?.typeId;
          if (prev && isChanged) {
            items.get(prev.typeId)?.onUnequip?.({
              player,
              itemStack: prev,
              slot,
            });
          }
          if (current) {
            if (isChanged) {
              items.get(current.typeId)?.onEquip?.({
                player,
                itemStack: current,
                slot,
              });
            }
            items.get(current.typeId)?.onHold?.({
              player,
              itemStack: current,
              slot,
            });
          }
        }
        playerEquipments.set(player.id, currentEquipments);
      }
    });

    world.beforeEvents.playerBreakBlock.subscribe((event) => {
      const { player, itemStack, block } = event;
      if (!itemStack) {
        return;
      }
      items.get(itemStack.typeId)?.onBreakBlock?.({
        player,
        itemStack,
        block,
        cancel() {
          event.cancel = true;
        },
      });
    });

    world.afterEvents.entityHurt.subscribe((event) => {
      const { damageSource, damage, hurtEntity } = event;
      if (
        !hurtEntity.isValid() || 
        !(hurtEntity instanceof Player) ||
        !hurtEntity.isSneaking
      ) {
        return;
      }

      let isInFront = false;
      // Chekcs if damage is coming in front of the player
      if (damageSource.damagingProjectile) {
        const projectile = damageSource.damagingProjectile;
        const victim_body_rotation = hurtEntity.getRotation().y;
        const entity_view_direction =
          Math.atan2(projectile.getViewDirection().x, projectile.getViewDirection().z) * (180 / Math.PI);
        const delta = ((entity_view_direction - victim_body_rotation + 360) % 360) - 180;
        isInFront = delta > -120 && delta < 120;
      }
      else if (damageSource.damagingEntity) {
        const victim_body_rotation = hurtEntity.getRotation().y;
        const entity_body_rotation = damageSource.damagingEntity.getRotation().y;

        // Calculate the angle to the entity
        const delta = ((entity_body_rotation - victim_body_rotation + 360) % 360) - 180;
        isInFront = delta > -120 && delta < 120;
      }

      const currentEquipments = []
      currentEquipments.push(getEquipment(hurtEntity, EquipmentSlot.Mainhand));
      currentEquipments.push(getEquipment(hurtEntity, EquipmentSlot.Offhand));
      let appliedHealRatio = 0;
      let appliedKnockbackPower = 0;
      const defautBlockOptions = {
        healRatio: 0,
        knockbackPower: 0,
        blockedDamage: [
          EntityDamageCause.entityAttack,
          EntityDamageCause.blockExplosion,
          EntityDamageCause.entityExplosion,
          EntityDamageCause.projectile,
          EntityDamageCause.fireworks,
          EntityDamageCause.ramAttack,
        ],
        blockFrontOnly: true,
        soundId: "item.shield.block",
        soundOptions: {
          volume: 1,
          pitch: 1,
        }
      }

      for (let i = 0; i < currentEquipments.length; i++) {
        const current = currentEquipments[i];
        if (current) {
          const item = items.get(current.typeId);
          if (item) {
            const blockOptions = {
              ...defautBlockOptions,
              ...(item.blockOptions ?? {}),
            };
            const isBlocked =
              (!blockOptions.blockFrontOnly || isInFront) &&
              blockOptions.blockedDamage.includes(damageSource.cause);

            if (item.canBlock && isBlocked) {
              appliedHealRatio = Math.max(appliedHealRatio, blockOptions.healRatio ?? 0);
              appliedKnockbackPower = Math.max(appliedKnockbackPower, blockOptions.knockbackPower ?? 0);
              hurtEntity.teleport(hurtEntity.location);
              hurtEntity.playSound(blockOptions.soundId, blockOptions.soundOptions);
              item.onBlock?.({
                player: hurtEntity,
                itemStack: current,
                damageSource: damageSource,
                damage: damage,
              });
            }
          }
        }
      }

      if (appliedHealRatio > 0) {
        const currentValue = hurtEntity.getComponent("minecraft:health").currentValue as number;
        const healAmount = appliedHealRatio * damage;
        hurtEntity.getComponent("minecraft:health").setCurrentValue(currentValue + healAmount);
      }
      if (appliedKnockbackPower > 0) {
        if (damageSource.damagingEntity && damageSource.damagingEntity.isValid()) {
          const damagingEntity = damageSource.damagingEntity;
          damagingEntity.applyKnockback(hurtEntity.getViewDirection().x, hurtEntity.getViewDirection().z, appliedKnockbackPower, 0);
        }
      }
    });

    world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
      if (!(damagingEntity instanceof Player)) {
        return;
      }
      const currentEquipments = [];
      for (const slot of equipmentSlots) {
        currentEquipments.push(getEquipment(damagingEntity, slot));
      }
      for (let i = 0; i < equipmentSlots.length; i++) {
        const current = currentEquipments[i];
        if (current) {
          items.get(current.typeId)?.onEquipHit?.({
            player: damagingEntity,
            itemStack: current,
            victim: hitEntity,
          });
          if (equipmentSlots[i] === EquipmentSlot.Mainhand) {
            items.get(current.typeId)?.onHit?.({
              player: damagingEntity,
              itemStack: current,
              victim: hitEntity,
            });
          }
        }
      }
    });

    world.afterEvents.entityDie.subscribe(({ damageSource, deadEntity }) => {
      const player = damageSource.damagingEntity;
      if (!(player instanceof Player)) {
        return;
      }
      const equipment = getEquipment(player, EquipmentSlot.Mainhand);
      if (!equipment) {
        return;
      }
      items.get(equipment.typeId)?.onKill?.({
        player,
        itemStack: equipment,
        victim: deadEntity,
      });
    });

    world.afterEvents.itemUseOn.subscribe(
      ({ source, itemStack, block, blockFace, faceLocation }) => {
        items.get(itemStack.typeId)?.onUseOn?.({
          player: source,
          itemStack,
          block,
          blockFace,
          faceLocation,
        });
      },
    );

    world.afterEvents.itemStartUse.subscribe(({ source, itemStack, useDuration }) => {
      items.get(itemStack.typeId)?.onStartUse?.({
        player: source,
        itemStack,
        useDuration,
      });
    });

    world.afterEvents.itemStopUse.subscribe(({ source, itemStack, useDuration }) => {
      if (!itemStack) {
        return;
      }
      items.get(itemStack.typeId)?.onStopUse?.({
        player: source,
        itemStack,
        useDuration,
      });
    });

    world.afterEvents.itemReleaseUse.subscribe(({ source, itemStack, useDuration }) => {
      if (!itemStack) {
        return;
      }
      items.get(itemStack.typeId)?.onReleaseUse?.({
        player: source,
        itemStack,
        useDuration,
      });
    });

    world.afterEvents.itemCompleteUse.subscribe(({ source, itemStack, useDuration }) => {
      items.get(itemStack.typeId)?.onCompleteUse?.({
        player: source,
        itemStack,
        useDuration,
      });
    });
  },
};
