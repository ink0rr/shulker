import * as server from "@minecraft/server";
import * as vanilla from "@minecraft/vanilla-data";
import * as bedrockts from "bedrock-ts";

declare namespace ShulkerInternal {
  type UnionString<T extends string> = T | (string & {});

  type BiomeTypes = `${vanilla.MinecraftBiomeTypes}`;
  type DimensionTypes = `${vanilla.MinecraftDimensionTypes}`;
  type EffectTypes = `${vanilla.MinecraftEffectTypes}`;
  type EnchantmentTypes = `${vanilla.MinecraftEnchantmentTypes}`;
  type FeatureTypes = `${vanilla.MinecraftFeatureTypes}`;
  type PotionEffectTypes = `${vanilla.MinecraftPotionEffectTypes}`;
  type PotionLiquidTypes = `${vanilla.MinecraftPotionLiquidTypes}`;
  type PotionModifierTypes = `${vanilla.MinecraftPotionModifierTypes}`;

  type BlockComponents = `${server.BlockComponentTypes}`;
  type EntityComponents = `${server.EntityComponentTypes}`;
  type ItemComponents = `${server.ItemComponentTypes}`;

  type BlockTypes = UnionString<`${vanilla.MinecraftBlockTypes}`>;
  type CameraPresetsTypes = UnionString<`${vanilla.MinecraftCameraPresetsTypes}`>;
  type CooldownCategoryTypes = UnionString<`${vanilla.MinecraftCooldownCategoryTypes}`>;
  type EntityTypes = UnionString<`${vanilla.MinecraftEntityTypes}`>;
  type ItemTypes = UnionString<`${vanilla.MinecraftItemTypes}`>;

  // Blocks
  interface BlockEventOptions extends server.BlockEventOptions {
    blockTypes?: BlockTypes[];
  }
  interface BlockFilter extends server.BlockFilter {
    excludeTags?: bedrockts.BlockTag[];
    excludeTypes?: BlockTypes[];
    includeTags?: bedrockts.BlockTag[];
    includeTypes?: BlockTypes[];
  }
  interface BlockFillOptions extends server.BlockFillOptions {
    blockFilter?: BlockFilter;
  }

  // Entities
  type FeedItemEffectNames = EffectTypes extends `${infer _}:${infer U}` ? U : never;
  interface FeedItemEffect extends server.FeedItemEffect {
    readonly name: FeedItemEffectNames;
  }
  interface FeedItem extends server.FeedItem {
    readonly item: ItemTypes;
    getEffects(): FeedItemEffect[];
  }
  interface EntityDefinitionFeedItem extends server.EntityDefinitionFeedItem {
    readonly item: ItemTypes;
  }
  interface EntityDataDrivenTriggerEventOptions extends server.EntityDataDrivenTriggerEventOptions {
    entityTypes?: EntityTypes[];
  }
  interface EntityEventOptions extends server.EntityEventOptions {
    entityTypes?: EntityTypes[];
  }
}

declare module "@minecraft/server" {
  interface Block {
    getComponent<K extends ShulkerInternal.BlockComponents>(component: K): BlockComponentTypeMap[K];
    getTags(): bedrockts.BlockTag[];
    hasTag(tag: bedrockts.BlockTag): boolean;
    matches<T extends keyof vanilla.BlockStateMapping>(
      blockName: T,
      states?: vanilla.BlockStateMapping[T],
    ): boolean;
  }
  interface BlockPermutation {
    matches<T extends keyof vanilla.BlockStateMapping>(
      blockName: T,
      states?: vanilla.BlockStateMapping[T],
    ): boolean;
    getState<T extends keyof vanilla.BlockStateSuperset | string>(
      stateName: T,
    ): T extends keyof vanilla.BlockStateSuperset ? vanilla.BlockStateSuperset[T]
      : boolean | number | string | undefined;
    withState<T extends keyof vanilla.BlockStateSuperset | string>(
      name: T,
      value: T extends keyof vanilla.BlockStateSuperset ? vanilla.BlockStateSuperset[T]
        : boolean | number | string,
    ): BlockPermutation;
  }
  interface BlockRecordPlayerComponent {
    setRecord(recordItemType?: ShulkerInternal.ItemTypes, startPlaying?: boolean): void;
  }

  interface BlockRaycastOptions {
    excludeTags?: bedrockts.BlockTag[];
    excludeTypes?: ShulkerInternal.BlockTypes[];
    includeTags?: bedrockts.BlockTag[];
    includeTypes?: ShulkerInternal.BlockTypes[];
  }

  interface PlayerBreakBlockAfterEventSignal {
    subscribe(
      callback: (arg: PlayerBreakBlockAfterEvent) => void,
      options?: ShulkerInternal.BlockEventOptions,
    ): (arg: PlayerBreakBlockAfterEvent) => void;
  }
  interface PlayerBreakBlockBeforeEventSignal {
    subscribe(
      callback: (arg: PlayerBreakBlockBeforeEvent) => void,
      options?: ShulkerInternal.BlockEventOptions,
    ): (arg: PlayerBreakBlockBeforeEvent) => void;
  }
  interface PlayerPlaceBlockAfterEventSignal {
    subscribe(
      callback: (arg: PlayerPlaceBlockAfterEvent) => void,
      options?: ShulkerInternal.BlockEventOptions,
    ): (arg: PlayerPlaceBlockAfterEvent) => void;
  }

  interface Camera {
    setCamera(
      cameraPreset: ShulkerInternal.CameraPresetsTypes,
      setOptions?:
        | CameraFixedBoomOptions
        | CameraSetFacingOptions
        | CameraSetLocationOptions
        | CameraSetPosOptions
        | CameraSetRotOptions
        | CameraTargetOptions,
    ): void;
  }

  interface Dimension {
    containsBlock(
      volume: BlockVolumeBase,
      filter: ShulkerInternal.BlockFilter,
      allowUnloadedChunks?: boolean,
    ): boolean;
    fillBlocks(
      volume: BlockVolumeBase,
      block: BlockPermutation | BlockType | ShulkerInternal.BlockTypes,
      options?: BlockFillOptions,
    ): ListBlockVolume;
    getBlocks(
      volume: BlockVolumeBase,
      filter: ShulkerInternal.BlockFilter,
      allowUnloadedChunks?: boolean,
    ): ListBlockVolume;
    getEntities(options?: EntityQueryOptions): Entity[];
    setBlockType(location: Vector3, blockType: BlockType | ShulkerInternal.BlockTypes): void;
    spawnEntity(identifier: ShulkerInternal.EntityTypes, location: Vector3): Entity;
    spawnParticle(
      effectName: bedrockts.ParticleIdentifier,
      location: Vector3,
      molangVariables?: MolangVariableMap,
    ): void;
    playSound(
      soundId: bedrockts.SoundDefinitionIdentifier,
      location: Vector3,
      soundOptions?: WorldSoundOptions,
    ): void;
  }

  interface Entity {
    playAnimation(
      animationName: bedrockts.AnimationIdentifier,
      options?: PlayAnimationOptions,
    ): void;
    getComponent<K extends ShulkerInternal.EntityComponents>(
      component: K,
    ): EntityComponentTypeMap[K];
    hasComponent<K extends ShulkerInternal.EntityComponents>(component: K): boolean;
    addEffect(
      effectType: ShulkerInternal.EffectTypes,
      duration: number,
      options?: EntityEffectOptions,
    ): Effect | undefined;
    removeEffect(effectType: ShulkerInternal.EffectTypes): void;
  }

  interface EntityAgeableComponent {
    getFeedItems(): ShulkerInternal.EntityDefinitionFeedItem[];
  }

  interface EntityHealableComponent {
    getFeedItems(): ShulkerInternal.FeedItem[];
  }

  interface EntityQueryOptions extends EntityFilter {
    type?: ShulkerInternal.EntityTypes;
    families?: bedrockts.TypeFamily[];
    excluedeFamilies?: bedrockts.TypeFamily[];
    excludeTypes?: ShulkerInternal.EntityTypes[];
  }
  interface DataDrivenEntityTriggerAfterEventSignal {
    subscribe(
      callback: (arg: DataDrivenEntityTriggerAfterEvent) => void,
      options?: ShulkerInternal.EntityDataDrivenTriggerEventOptions,
    ): (arg: DataDrivenEntityTriggerAfterEvent) => void;
  }
  interface EffectAddAfterEventSignal {
    subscribe(
      callback: (arg: EffectAddAfterEvent) => void,
      options?: ShulkerInternal.EntityEventOptions,
    ): (arg: EffectAddAfterEvent) => void;
  }
  interface EntityDieAfterEventSignal {
    subscribe(
      callback: (arg: EntityDieAfterEvent) => void,
      options?: ShulkerInternal.EntityEventOptions,
    ): (arg: EntityDieAfterEvent) => void;
  }
  interface EntityHealthChangedAfterEventSignal {
    subscribe(
      callback: (arg: EntityHealthChangedAfterEvent) => void,
      options?: ShulkerInternal.EntityEventOptions,
    ): (arg: EntityHealthChangedAfterEvent) => void;
  }
  interface EntityHitBlockAfterEventSignal {
    subscribe(
      callback: (arg: EntityHitBlockAfterEvent) => void,
      options?: ShulkerInternal.EntityEventOptions,
    ): (arg: EntityHitBlockAfterEvent) => void;
  }
  interface EntityHitEntityAfterEventSignal {
    subscribe(
      callback: (arg: EntityHitEntityAfterEvent) => void,
      options?: ShulkerInternal.EntityEventOptions,
    ): (arg: EntityHitEntityAfterEvent) => void;
  }
  interface EntityHurtAfterEventSignal {
    subscribe(
      callback: (arg: EntityHurtAfterEvent) => void,
      options?: ShulkerInternal.EntityEventOptions,
    ): (arg: EntityHurtAfterEvent) => void;
  }
  interface EntityRemoveAfterEventSignal {
    subscribe(
      callback: (arg: EntityRemoveAfterEvent) => void,
      options?: ShulkerInternal.EntityEventOptions,
    ): (arg: EntityRemoveAfterEvent) => void;
  }

  interface ItemStack {
    getComponent<K extends ShulkerInternal.ItemComponents>(component: K): ItemComponentTypeMap[K];
    hasComponent<K extends ShulkerInternal.ItemComponents>(component: K): boolean;
    getTags(): bedrockts.ItemTag[];
    hasTag(tag: bedrockts.ItemTag): boolean;
    matches<T extends keyof vanilla.BlockStateMapping>(
      blockName: T,
      states?: vanilla.BlockStateMapping[T],
    ): boolean;
    setCanDestroy(blockIdentifiers?: ShulkerInternal.BlockTypes[]): void;
    setCanPlaceOn(blockIdentifiers?: ShulkerInternal.BlockTypes[]): void;
  }

  interface ItemCooldownComponent {
    isCooldownCategory(category: ShulkerInternal.CooldownCategoryTypes): boolean;
  }

  interface Player {
    getItemCooldown(cooldownCategory: ShulkerInternal.CooldownCategoryTypes): number;
    startItemCooldown(
      cooldownCategory: ShulkerInternal.CooldownCategoryTypes,
      duration: number,
    ): void;
    playMusic(trackId: bedrockts.SoundDefinitionIdentifier, musicOptions?: MusicOptions): void;
    playSound(
      soundId: bedrockts.SoundDefinitionIdentifier,
      soundOptions?: PlayerSoundOptions,
    ): void;
    queueMusic(trackId: bedrockts.SoundDefinitionIdentifier, musicOptions?: MusicOptions): void;
  }

  interface World {
    getDimension(dimensionId: ShulkerInternal.DimensionTypes): Dimension;
    getPlayers(options?: EntityQueryOptions): Player[];
    playMusic(trackId: bedrockts.SoundDefinitionIdentifier, musicOptions?: MusicOptions): void;
    playSound(
      soundId: bedrockts.SoundDefinitionIdentifier,
      location: Vector3,
      soundOptions?: WorldSoundOptions,
    ): void;
  }
}
