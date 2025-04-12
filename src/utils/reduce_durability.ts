import { EquipmentSlot, GameMode, type Player } from "@minecraft/server";

/*
 * This function reduces the durability of the item in player's mainhand.
 */
export function reduceDurability(player: Player) {
  if (player.getGameMode() === GameMode.creative) return;
  const eq = player.getComponent("minecraft:equippable");
  const item = eq?.getEquipment(EquipmentSlot.Mainhand);
  if (!item) return;
  const durability = item.getComponent("minecraft:durability");
  if (!durability) return;
  durability.damage = Math.min(durability.damage + 1, durability.maxDurability);
  if (durability.damage === durability.maxDurability) {
    eq.setEquipment(EquipmentSlot.Mainhand);
    player.playSound("random.break");
    return;
  }
  eq.setEquipment(EquipmentSlot.Mainhand, item);
}
