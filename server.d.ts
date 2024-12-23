import "@minecraft/server";
import { BlockStateMapping } from "@minecraft/vanilla-data";
import {
  AnimationIdentifier,
  ItemTag,
  ParticleIdentifier,
  SoundDefinitionIdentifier,
  TypeFamily,
} from "bedrock-ts";

import {
  BlockEventOptions,
  EntityDataDrivenTriggerEventOptions,
  EntityDefinitionFeedItem,
  EntityEventOptions,
  FeedItem,
  FeedItemEffect,
} from "@minecraft/server";
import {
  MinecraftBiomeTypes,
  MinecraftBlockTypes,
  MinecraftCameraPresetsTypes,
  MinecraftCooldownCategoryTypes,
  MinecraftEffectTypes,
  MinecraftEnchantmentTypes,
  MinecraftEntityTypes,
  MinecraftFeatureTypes,
  MinecraftItemTypes,
  MinecraftPotionEffectTypes,
  MinecraftPotionLiquidTypes,
  MinecraftPotionModifierTypes,
  MinecraftDimensionTypes as VanillaDimensionTypes,
} from "@minecraft/vanilla-data";

type UnionString<T extends string> = T | (string & {});

type $BiomeTypes = `${MinecraftBiomeTypes}`;
type $DimensionTypes = `${VanillaDimensionTypes}`;
type $EffectTypes = `${MinecraftEffectTypes}`;
type $EnchantmentTypes = `${MinecraftEnchantmentTypes}`;
type $FeatureTypes = `${MinecraftFeatureTypes}`;
type $PotionEffectTypes = `${MinecraftPotionEffectTypes}`;
type $PotionLiquidTypes = `${MinecraftPotionLiquidTypes}`;
type $PotionModifierTypes = `${MinecraftPotionModifierTypes}`;

type $BlockTags = UnionString<
  | "acacia"
  | "birch"
  | "dark_oak"
  | "diamond_pick_diggable"
  | "dirt"
  | "fertilize_area"
  | "grass"
  | "gravel"
  | "gold_pick_diggable"
  | "iron_pick_diggable"
  | "jungle"
  | "log"
  | "metal"
  | "minecraft:crop"
  | "minecraft:diamond_tier_destructible"
  | "minecraft:iron_tier_destructible"
  | "minecraft:is_axe_item_destructible"
  | "minecraft:is_hoe_item_destructible"
  | "minecraft:is_mace_item_destructible"
  | "minecraft:is_pickaxe_item_destructible"
  | "minecraft:is_shears_item_destructible"
  | "minecraft:is_shovel_item_destructible"
  | "minecraft:is_sword_item_destructible"
  | "minecraft:netherite_tier_destructible"
  | "minecraft:stone_tier_destructible"
  | "mob_spawner"
  | "not_feature_replaceable"
  | "oak"
  | "one_way_collidable"
  | "plant"
  | "pumpkin"
  | "rail"
  | "sand"
  | "snow"
  | "spruce"
  | "stone"
  | "stone_pick_diggable"
  | "text_sign"
  | "trapdoors"
  | "water"
  | "wood"
  | "wood_pick_diggable"
>;
type $BlockTypes = UnionString<`${MinecraftBlockTypes}`>;
type $CameraPresetsTypes = UnionString<`${MinecraftCameraPresetsTypes}`>;
type $CooldownCategoryTypes = UnionString<`${MinecraftCooldownCategoryTypes}`>;
type $EntityTypes = UnionString<`${MinecraftEntityTypes}`>;
type $ItemTypes = UnionString<`${MinecraftItemTypes}`>;

// Blocks
interface $BlockEventOptions extends BlockEventOptions {
  blockTypes?: $BlockTypes[];
}

// Entities
interface $FeedItem extends FeedItem {
  readonly item: $ItemTypes;
  getEffects(): $FeedItemEffect[];
}
interface $EntityDefinitionFeedItem extends EntityDefinitionFeedItem {
  readonly item: $ItemTypes;
}
interface $FeedItemEffect extends FeedItemEffect {
  readonly name: $FeedItemEffectNames;
}
type $FeedItemEffectNames = $EffectTypes extends `${infer _T}:${infer U}` ? U : never;
interface $EntityDataDrivenTriggerEventOptions extends EntityDataDrivenTriggerEventOptions {
  entityTypes?: $EntityTypes[];
}
interface $EntityEventOptions extends EntityEventOptions {
  entityTypes?: $EntityTypes[];
}

declare module "@minecraft/server" {
  // blocks.d.ts
  type BlockComponents = {
    "minecraft:inventory": BlockInventoryComponent;
    "minecraft:piston": BlockPistonComponent;
    "minecraft:record_player": BlockRecordPlayerComponent;
    "minecraft:sign": BlockSignComponent;
  };
  interface Block {
    getTags(): $BlockTags[];
    getComponent<K extends keyof BlockComponents>(component: K): BlockComponents[K];
    hasTag(tag: $BlockTags): boolean;
    matches<T extends keyof BlockStateMapping, U = BlockStateMapping[T]>(
      blockName: T,
      states?: U,
    ): boolean;
    matches<T extends Record<string, string | number | boolean>, K extends keyof T = keyof T>(
      blockName: string,
      states?: K,
    ): T[K];
  }
  interface BlockPermutation {
    getAllStates<T extends keyof BlockStateMapping, U = BlockStateMapping[T]>(): U;
    getAllStates<T extends Record<string, string | number | boolean>>(): T;
    getState<
      T extends keyof BlockStateMapping,
      U = BlockStateMapping[T],
      K extends keyof U = keyof U,
    >(
      stateName: K,
    ): U[K];
    getState<T extends Record<string, string | number | boolean>, K extends keyof T>(
      stateName: K,
    ): T[K];
    matches<T extends keyof BlockStateMapping, U = BlockStateMapping[T]>(
      blockName: T,
      states?: U,
    ): boolean;
    matches<T extends Record<string, string | number | boolean>, K extends keyof T = keyof T>(
      blockName: string,
      states?: K,
    ): T[K];
    withState<T extends keyof BlockStateMapping, U = BlockStateMapping[T], K = keyof U>(
      stateName: K,
      value: boolean,
    ): BlockPermutation;
    withState<T extends Record<string, string | number | boolean>, K extends keyof T = keyof T>(
      stateName: K,
      value: T[K],
    ): BlockPermutation;
  }
  // TODO: static methods
  // namespace BlockPermutation {
  //   function resolve<T extends $BlockTypes, U = BlockStateMapping[T]>(
  //     blockId: T,
  //     states?: U,
  //   ): BlockPermutation;
  // }
  interface BlockRecordPlayerComponent {
    setRecord<T extends $ItemTypes>(recordItemType?: T, startPlaying?: boolean): void;
  }

  interface BlockRaycastOptions {
    excludeTags?: $BlockTags[];
    excludeTypes?: $BlockTypes[];
    includeTags?: $BlockTags[];
    includeTypes?: $BlockTypes[];
  }

  // Block events
  interface PlayerBreakBlockAfterEventSignal {
    subscribe(
      callback: (arg: PlayerBreakBlockAfterEvent) => void,
      options?: $BlockEventOptions,
    ): (arg: PlayerBreakBlockAfterEvent) => void;
  }
  interface PlayerBreakBlockBeforeEventSignal {
    subscribe(
      callback: (arg: PlayerBreakBlockBeforeEvent) => void,
      options?: $BlockEventOptions,
    ): (arg: PlayerBreakBlockBeforeEvent) => void;
  }
  interface PlayerPlaceBlockAfterEventSignal {
    subscribe(
      callback: (arg: PlayerPlaceBlockAfterEvent) => void,
      options?: $BlockEventOptions,
    ): (arg: PlayerPlaceBlockAfterEvent) => void;
  }

  // camera.d.ts
  interface Camera {
    setCamera(
      cameraPreset: $CameraPresetsTypes,
      setOptions?:
        | CameraDefaultOptions
        | CameraSetFacingOptions
        | CameraSetLocationOptions
        | CameraSetPosOptions
        | CameraSetRotOptions,
    ): void;
  }

  // dimension.d.ts
  interface Dimension {
    spawnEntity(identifier: $EntityTypes, location: Vector3): Entity;
    spawnParticle(
      effectName: ParticleIdentifier,
      location: Vector3,
      molangVariables?: MolangVariableMap,
    ): void;
    playSound(
      soundId: SoundDefinitionIdentifier,
      location: Vector3,
      soundOptions?: WorldSoundOptions,
    ): void;
  }

  // entity.d.ts
  type EntityComponents = {
    "minecraft:addrider": EntityAddRiderComponent;
    "minecraft:ageable": EntityAgeableComponent;
    "minecraft:breathable": EntityBreathableComponent;
    "minecraft:can_climb": EntityCanClimbComponent;
    "minecraft:can_fly": EntityCanFlyComponent;
    "minecraft:can_power_jump": EntityCanPowerJumpComponent;
    "minecraft:color": EntityColorComponent;
    "minecraft:color2": EntityColor2Component;
    "minecraft:equippable": EntityEquippableComponent;
    "minecraft:fire_immune": EntityFireImmuneComponent;
    "minecraft:floats_in_liquid": EntityFloatsInLiquidComponent;
    "minecraft:flying_speed": EntityFlyingSpeedComponent;
    "minecraft:friction_modifier": EntityFrictionModifierComponent;
    "minecraft:ground_offset": EntityGroundOffsetComponent;
    "minecraft:healable": EntityHealableComponent;
    "minecraft:health": EntityHealthComponent;
    "minecraft:inventory": EntityInventoryComponent;
    "minecraft:is_baby": EntityIsBabyComponent;
    "minecraft:is_charged": EntityIsChargedComponent;
    "minecraft:is_chested": EntityIsChestedComponent;
    "minecraft:is_dyeable": EntityIsDyeableComponent;
    "minecraft:is_hidden_when_invisible": EntityIsHiddenWhenInvisibleComponent;
    "minecraft:is_ignited": EntityIsIgnitedComponent;
    "minecraft:is_illager_captain": EntityIsIllagerCaptainComponent;
    "minecraft:is_saddled": EntityIsSaddledComponent;
    "minecraft:is_shaking": EntityIsShakingComponent;
    "minecraft:is_sheared": EntityIsShearedComponent;
    "minecraft:is_stackable": EntityIsStackableComponent;
    "minecraft:is_stunned": EntityIsStunnedComponent;
    "minecraft:is_tamed": EntityIsTamedComponent;
    "minecraft:item": EntityItemComponent;
    "minecraft:lava_movement": EntityLavaMovementComponent;
    "minecraft:leashable": EntityLeashableComponent;
    "minecraft:mark_variant": EntityMarkVariantComponent;
    "minecraft:movement": EntityMovementComponent;
    "minecraft:movement.amphibious": EntityMovementAmphibiousComponent;
    "minecraft:movement.basic": EntityMovementBasicComponent;
    "minecraft:movement.fly": EntityMovementFlyComponent;
    "minecraft:movement.generic": EntityMovementGenericComponent;
    "minecraft:movement.glide": EntityMovementGlideComponent;
    "minecraft:movement.hover": EntityMovementHoverComponent;
    "minecraft:movement.jump": EntityMovementJumpComponent;
    "minecraft:movement.skip": EntityMovementSkipComponent;
    "minecraft:movement.sway": EntityMovementSwayComponent;
    "minecraft:navigation.climb": EntityNavigationClimbComponent;
    "minecraft:navigation.float": EntityNavigationFloatComponent;
    "minecraft:navigation.fly": EntityNavigationFlyComponent;
    "minecraft:navigation.generic": EntityNavigationGenericComponent;
    "minecraft:navigation.hover": EntityNavigationHoverComponent;
    "minecraft:navigation.walk": EntityNavigationWalkComponent;
    "minecraft:onfire": EntityOnFireComponent;
    "minecraft:projectile": EntityProjectileComponent;
    "minecraft:push_through": EntityPushThroughComponent;
    "minecraft:rideable": EntityRideableComponent;
    "minecraft:riding": EntityRidingComponent;
    "minecraft:scale": EntityScaleComponent;
    "minecraft:skin_id": EntitySkinIdComponent;
    "minecraft:strength": EntityStrengthComponent;
    "minecraft:tameable": EntityTameableComponent;
    "minecraft:tamemount": EntityTameMountComponent;
    "minecraft:type_family": EntityTypeFamilyComponent;
    "minecraft:underwater_movement": EntityUnderwaterMovementComponent;
    "minecraft:variant": EntityVariantComponent;
    "minecraft:wants_jockey": EntityWantsJockeyComponent;
  };
  interface Entity {
    playAnimation(animationName: AnimationIdentifier, options?: PlayAnimationOptions): void;
    getComponent<K extends keyof EntityComponents>(component: K): EntityComponents[K];
    hasComponent<K extends keyof EntityComponents>(component: K): boolean;
    addEffect(
      effectType: $EffectTypes,
      duration: number,
      options?: EntityEffectOptions,
    ): Effect | undefined;
    removeEffect(effectType: $EffectTypes): void;
  }

  interface EntityAgeableComponent {
    getFeedItems(): $EntityDefinitionFeedItem[];
  }

  interface EntityHealableComponent {
    getFeedItems(): $FeedItem[];
  }

  interface EntityQueryOptions extends EntityFilter {
    type?: $EntityTypes;
    families?: TypeFamily[];
    excluedeFamilies?: TypeFamily[];
    excludeTypes?: $EntityTypes[];
  }
  interface DataDrivenEntityTriggerAfterEventSignal {
    subscribe(
      callback: (arg: DataDrivenEntityTriggerAfterEvent) => void,
      options?: $EntityDataDrivenTriggerEventOptions,
    ): (arg: DataDrivenEntityTriggerAfterEvent) => void;
  }
  interface EffectAddAfterEventSignal {
    subscribe(
      callback: (arg: EffectAddAfterEvent) => void,
      options?: $EntityEventOptions,
    ): (arg: EffectAddAfterEvent) => void;
  }
  interface EntityDieAfterEventSignal {
    subscribe(
      callback: (arg: EntityDieAfterEvent) => void,
      options?: $EntityEventOptions,
    ): (arg: EntityDieAfterEvent) => void;
  }
  interface EntityHealthChangedAfterEventSignal {
    subscribe(
      callback: (arg: EntityHealthChangedAfterEvent) => void,
      options?: $EntityEventOptions,
    ): (arg: EntityHealthChangedAfterEvent) => void;
  }
  interface EntityHitBlockAfterEventSignal {
    subscribe(
      callback: (arg: EntityHitBlockAfterEvent) => void,
      options?: $EntityEventOptions,
    ): (arg: EntityHitBlockAfterEvent) => void;
  }
  interface EntityHitEntityAfterEventSignal {
    subscribe(
      callback: (arg: EntityHitEntityAfterEvent) => void,
      options?: $EntityEventOptions,
    ): (arg: EntityHitEntityAfterEvent) => void;
  }
  interface EntityHurtAfterEventSignal {
    subscribe(
      callback: (arg: EntityHurtAfterEvent) => void,
      options?: $EntityEventOptions,
    ): (arg: EntityHurtAfterEvent) => void;
  }
  interface EntityRemoveAfterEventSignal {
    subscribe(
      callback: (arg: EntityRemoveAfterEvent) => void,
      options?: $EntityEventOptions,
    ): (arg: EntityRemoveAfterEvent) => void;
  }

  // item.d.ts
  type ItemComponents = {
    "minecraft:cooldown": ItemCooldownComponent;
    "minecraft:durability": ItemDurabilityComponent;
    "minecraft:enchantable": ItemEnchantableComponent;
    "minecraft:food": ItemFoodComponent;
  };
  interface ItemStack {
    // TODO: constructor
    // new (item: $ItemTypes, count?: number, asdf?: boolean): ItemStack;
    getComponent<K extends keyof ItemComponents>(component: K): ItemComponents[K];
    getTags(): ItemTag[];
    hasComponent<K extends keyof ItemComponents>(component: K): boolean;
    hasTag(tag: ItemTag): boolean;
    matches<T extends keyof BlockStateMapping, K = keyof BlockStateMapping[T], U extends K = K>(
      blockName: T,
      states?: U,
    ): boolean;
    setCanDestroy(blockIdentifiers?: $BlockTypes[]): void;
    setCanPlaceOn(blockIdentifiers?: $BlockTypes[]): void;
  }

  interface ItemCooldownComponent {
    isCooldownCategory(category: $CooldownCategoryTypes): boolean;
  }

  // player.d.ts
  type PlayerComponents = EntityComponents & {
    "minecraft:cursor_inventory": PlayerCursorInventoryComponent;
  };
  interface Player {
    getComponent<K extends keyof PlayerComponents>(component: K): PlayerComponents[K];
    hasComponent<K extends keyof PlayerComponents>(component: K): boolean;
    getItemCooldown(cooldownCategory: $CooldownCategoryTypes): number;
    startItemCooldown(cooldownCategory: $CooldownCategoryTypes, duration: number): void;
    playMusic(trackId: SoundDefinitionIdentifier, musicOptions?: MusicOptions): void;
    playSound(soundId: SoundDefinitionIdentifier, soundOptions?: PlayerSoundOptions): void;
    queueMusic(trackId: SoundDefinitionIdentifier, musicOptions?: MusicOptions): void;
  }

  // world.d.ts
  interface World {
    getDimension(dimensionId: $DimensionTypes): Dimension;
    playMusic(trackId: SoundDefinitionIdentifier, musicOptions?: MusicOptions): void;
    playSound(
      soundId: SoundDefinitionIdentifier,
      location: Vector3,
      soundOptions?: WorldSoundOptions,
    ): void;
  }
}
