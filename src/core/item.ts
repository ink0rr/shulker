import {
  Block,
  Direction,
  Entity,
  EquipmentSlot,
  ItemStack,
  Player,
  Vector3,
  system,
  world,
} from "@minecraft/server";
import { getEquipment } from "../utils/equipment.js";
import { getAllPlayers } from "../utils/players.js";

export type ScriptItem = {
  readonly identifier: string;
  onTick?(player: Player): void;
  onBreakBlock?(event: ScriptItemBreakBlockEvent): void;
  onEquip?(event: ScriptItemEquipEvent): void;
  onUnequip?(event: ScriptItemEquipEvent): void;
  onHit?(event: ScriptItemHitEvent): void;
  onUseOn?(event: ScriptItemUseOnEvent): void;
  onStartUse?(event: ScriptItemUseEvent): void;
  onStopUse?(event: ScriptItemUseEvent): void;
  onReleaseUse?(event: ScriptItemUseEvent): void;
  onCompleteUse?(event: ScriptItemUseEvent): void;
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

type TickEvent = (player: Player) => void;
const playerEquipments = new Map<string, Array<ItemStack | undefined>>();
const equipmentSlots = Object.values(EquipmentSlot);

export const ScriptItem = {
  register(itemList: ScriptItem[]) {
    const items = new Map<string, ScriptItem>();
    const tickEvents: TickEvent[] = [];

    for (const item of itemList) {
      items.set(item.identifier, item);
      if (item.onTick) {
        tickEvents.push(item.onTick);
      }
    }

    tickEvents.unshift((player) => {
      const prevEquipments = playerEquipments.get(player.id) ?? [];
      const currentEquipments = [];
      for (const slot of equipmentSlots) {
        currentEquipments.push(getEquipment(player, slot));
      }
      for (let i = 0; i < equipmentSlots.length; i++) {
        const slot = equipmentSlots[i];
        const prev = prevEquipments[i];
        const current = currentEquipments[i];
        if (prev?.typeId === current?.typeId) {
          continue;
        }
        if (prev) {
          items.get(prev.typeId)?.onUnequip?.({
            player,
            itemStack: prev,
            slot,
          });
        }
        if (current) {
          items.get(current.typeId)?.onEquip?.({
            player,
            itemStack: current,
            slot,
          });
        }
      }
      playerEquipments.set(player.id, currentEquipments);
    });

    system.runInterval(() => {
      for (const event of tickEvents) {
        for (const player of getAllPlayers()) {
          event(player);
        }
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

    world.afterEvents.entityHitEntity.subscribe(({ damagingEntity, hitEntity }) => {
      if (!(damagingEntity instanceof Player)) {
        return;
      }
      const equipment = getEquipment(damagingEntity, EquipmentSlot.Mainhand);
      if (!equipment) {
        return;
      }
      items.get(equipment.typeId)?.onHit?.({
        player: damagingEntity,
        itemStack: equipment,
        victim: hitEntity,
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