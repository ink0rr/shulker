import {
  EntityComponentTypes,
  EntityEquippableComponent,
  EquipmentSlot,
  ItemStack,
  Player,
  system,
  world,
} from "@minecraft/server";

let components: Map<string, EntityEquippableComponent>;

function registerEvents() {
  world.afterEvents.playerLeave.subscribe(({ playerId }) => {
    components.delete(playerId);
  });
}

function getEquippable(player: Player) {
  if (!components) {
    components = new Map();
    system.run(registerEvents);
  }
  let component = components.get(player.id);
  if (!component) {
    component = player.getComponent(EntityComponentTypes.Equippable)!;
    components.set(player.id, component);
  }
  return component;
}

/**
 * Gets the equipped item for the given EquipmentSlot.
 * @param player The player to get the equipment from
 * @param slot The equipment slot. e.g. "head", "chest", "offhand"
 * @returns Returns the item equipped to the given EquipmentSlot. If empty, returns undefined.
 */
export function getEquipment(player: Player, slot: EquipmentSlot) {
  const component = getEquippable(player);
  return component.getEquipment(slot);
}

/**
 * Replaces the item in the given EquipmentSlot
 * @param player The player to set the equipment on
 * @param slot The equipment slot. e.g. "head", "chest", "offhand"
 * @param itemStack The item to equip. If undefined, clears the slot
 */
export function setEquipment(player: Player, slot: EquipmentSlot, itemStack?: ItemStack) {
  const component = getEquippable(player);
  component.setEquipment(slot, itemStack);
}
