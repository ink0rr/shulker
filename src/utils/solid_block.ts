import { Block } from "@minecraft/server";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";

/**
 * Returns true if this block is solid and impassible - (e.g., a cobblestone block and a diamond block are solid, while a ladder block and a fence block are not).
 */
export function isSolid(block: Block) {
  return !nonSolidBlocks.has(block.typeId);
}

const nonSolidBlocks = new Set<string>([
  MinecraftBlockTypes.AcaciaButton,
  MinecraftBlockTypes.AcaciaHangingSign,
  MinecraftBlockTypes.AcaciaPressurePlate,
  MinecraftBlockTypes.AcaciaSapling,
  MinecraftBlockTypes.AcaciaStandingSign,
  MinecraftBlockTypes.AcaciaWallSign,
  MinecraftBlockTypes.ActivatorRail,
  MinecraftBlockTypes.Air,
  MinecraftBlockTypes.Allium,
  MinecraftBlockTypes.AzureBluet,
  MinecraftBlockTypes.Bamboo,
  MinecraftBlockTypes.BambooButton,
  MinecraftBlockTypes.BambooHangingSign,
  MinecraftBlockTypes.BambooPressurePlate,
  MinecraftBlockTypes.BambooSapling,
  MinecraftBlockTypes.BambooWallSign,
  MinecraftBlockTypes.Beetroot,
  MinecraftBlockTypes.BigDripleaf,
  MinecraftBlockTypes.BirchButton,
  MinecraftBlockTypes.BirchHangingSign,
  MinecraftBlockTypes.BirchPressurePlate,
  MinecraftBlockTypes.BirchSapling,
  MinecraftBlockTypes.BirchStandingSign,
  MinecraftBlockTypes.BirchWallSign,
  MinecraftBlockTypes.BlackCarpet,
  MinecraftBlockTypes.BlueCarpet,
  MinecraftBlockTypes.BrainCoral,
  MinecraftBlockTypes.BrainCoralFan,
  MinecraftBlockTypes.BrainCoralWallFan,
  MinecraftBlockTypes.BrownCarpet,
  MinecraftBlockTypes.BrownMushroom,
  MinecraftBlockTypes.BubbleColumn,
  MinecraftBlockTypes.BubbleCoral,
  MinecraftBlockTypes.BubbleCoralFan,
  MinecraftBlockTypes.BubbleCoralWallFan,
  MinecraftBlockTypes.Carrots,
  MinecraftBlockTypes.CaveVines,
  MinecraftBlockTypes.CaveVinesBodyWithBerries,
  MinecraftBlockTypes.CaveVinesHeadWithBerries,
  MinecraftBlockTypes.Chain,
  MinecraftBlockTypes.CherryButton,
  MinecraftBlockTypes.CherryHangingSign,
  MinecraftBlockTypes.CherryPressurePlate,
  MinecraftBlockTypes.CherrySapling,
  MinecraftBlockTypes.CherryStandingSign,
  MinecraftBlockTypes.CherryWallSign,
  MinecraftBlockTypes.ChorusFlower,
  MinecraftBlockTypes.ChorusPlant,
  MinecraftBlockTypes.Cocoa,
  MinecraftBlockTypes.ColoredTorchBlue,
  MinecraftBlockTypes.ColoredTorchGreen,
  MinecraftBlockTypes.ColoredTorchPurple,
  MinecraftBlockTypes.ColoredTorchRed,
  MinecraftBlockTypes.Cornflower,
  MinecraftBlockTypes.CrimsonButton,
  MinecraftBlockTypes.CrimsonFungus,
  MinecraftBlockTypes.CrimsonHangingSign,
  MinecraftBlockTypes.CrimsonPressurePlate,
  MinecraftBlockTypes.CrimsonRoots,
  MinecraftBlockTypes.CrimsonStandingSign,
  MinecraftBlockTypes.CrimsonWallSign,
  MinecraftBlockTypes.CyanCarpet,
  MinecraftBlockTypes.Dandelion,
  MinecraftBlockTypes.DarkOakButton,
  MinecraftBlockTypes.DarkOakHangingSign,
  MinecraftBlockTypes.DarkOakPressurePlate,
  MinecraftBlockTypes.DarkOakSapling,
  MinecraftBlockTypes.DarkoakStandingSign,
  MinecraftBlockTypes.DarkoakWallSign,
  MinecraftBlockTypes.DeadBrainCoral,
  MinecraftBlockTypes.DeadBrainCoralFan,
  MinecraftBlockTypes.DeadBrainCoralWallFan,
  MinecraftBlockTypes.DeadBubbleCoral,
  MinecraftBlockTypes.DeadBubbleCoralFan,
  MinecraftBlockTypes.DeadBubbleCoralWallFan,
  MinecraftBlockTypes.Deadbush,
  MinecraftBlockTypes.DetectorRail,
  MinecraftBlockTypes.Fern,
  MinecraftBlockTypes.FireCoral,
  MinecraftBlockTypes.FireCoralFan,
  MinecraftBlockTypes.FireCoralWallFan,
  MinecraftBlockTypes.FlowingLava,
  MinecraftBlockTypes.FlowingWater,
  MinecraftBlockTypes.FrogSpawn,
  MinecraftBlockTypes.GoldenRail,
  MinecraftBlockTypes.GrayCarpet,
  MinecraftBlockTypes.GreenCarpet,
  MinecraftBlockTypes.HangingRoots,
  MinecraftBlockTypes.HeavyWeightedPressurePlate,
  MinecraftBlockTypes.HornCoral,
  MinecraftBlockTypes.HornCoralFan,
  MinecraftBlockTypes.HornCoralWallFan,
  MinecraftBlockTypes.JungleButton,
  MinecraftBlockTypes.JungleHangingSign,
  MinecraftBlockTypes.JunglePressurePlate,
  MinecraftBlockTypes.JungleSapling,
  MinecraftBlockTypes.JungleStandingSign,
  MinecraftBlockTypes.JungleWallSign,
  MinecraftBlockTypes.Kelp,
  MinecraftBlockTypes.Ladder,
  MinecraftBlockTypes.LargeFern,
  MinecraftBlockTypes.Lava,
  MinecraftBlockTypes.Lever,
  MinecraftBlockTypes.LightBlock0,
  MinecraftBlockTypes.LightBlock1,
  MinecraftBlockTypes.LightBlock2,
  MinecraftBlockTypes.LightBlock3,
  MinecraftBlockTypes.LightBlock4,
  MinecraftBlockTypes.LightBlock5,
  MinecraftBlockTypes.LightBlock6,
  MinecraftBlockTypes.LightBlock7,
  MinecraftBlockTypes.LightBlock8,
  MinecraftBlockTypes.LightBlock9,
  MinecraftBlockTypes.LightBlock10,
  MinecraftBlockTypes.LightBlock11,
  MinecraftBlockTypes.LightBlock12,
  MinecraftBlockTypes.LightBlock13,
  MinecraftBlockTypes.LightBlock14,
  MinecraftBlockTypes.LightBlock15,
  MinecraftBlockTypes.LightBlueCarpet,
  MinecraftBlockTypes.LightGrayCarpet,
  MinecraftBlockTypes.LightWeightedPressurePlate,
  MinecraftBlockTypes.Lilac,
  MinecraftBlockTypes.LilyOfTheValley,
  MinecraftBlockTypes.LimeCarpet,
  MinecraftBlockTypes.MagentaCarpet,
  MinecraftBlockTypes.MangroveButton,
  MinecraftBlockTypes.MangroveHangingSign,
  MinecraftBlockTypes.MangrovePressurePlate,
  MinecraftBlockTypes.MangrovePropagule,
  MinecraftBlockTypes.MangroveStandingSign,
  MinecraftBlockTypes.MangroveWallSign,
  MinecraftBlockTypes.MelonStem,
  MinecraftBlockTypes.MossCarpet,
  MinecraftBlockTypes.MushroomStem,
  MinecraftBlockTypes.NetherSprouts,
  MinecraftBlockTypes.NetherWart,
  MinecraftBlockTypes.OakHangingSign,
  MinecraftBlockTypes.OakSapling,
  MinecraftBlockTypes.OrangeCarpet,
  MinecraftBlockTypes.OrangeTulip,
  MinecraftBlockTypes.OxeyeDaisy,
  MinecraftBlockTypes.Peony,
  MinecraftBlockTypes.PinkCarpet,
  MinecraftBlockTypes.PinkPetals,
  MinecraftBlockTypes.PinkTulip,
  MinecraftBlockTypes.PitcherCrop,
  MinecraftBlockTypes.PitcherPlant,
  MinecraftBlockTypes.PolishedBlackstonePressurePlate,
  MinecraftBlockTypes.Poppy,
  MinecraftBlockTypes.Potatoes,
  MinecraftBlockTypes.PoweredComparator,
  MinecraftBlockTypes.PoweredRepeater,
  MinecraftBlockTypes.PumpkinStem,
  MinecraftBlockTypes.PurpleCarpet,
  MinecraftBlockTypes.Rail,
  MinecraftBlockTypes.RedMushroom,
  MinecraftBlockTypes.RedTulip,
  MinecraftBlockTypes.RedstoneTorch,
  MinecraftBlockTypes.RedstoneWire,
  MinecraftBlockTypes.RedCarpet,
  MinecraftBlockTypes.Reeds,
  MinecraftBlockTypes.RoseBush,
  MinecraftBlockTypes.SculkVein,
  MinecraftBlockTypes.SeaPickle,
  MinecraftBlockTypes.Seagrass,
  MinecraftBlockTypes.ShortGrass,
  MinecraftBlockTypes.SoulFire,
  MinecraftBlockTypes.SoulTorch,
  MinecraftBlockTypes.SporeBlossom,
  MinecraftBlockTypes.Snow,
  MinecraftBlockTypes.SmallDripleafBlock,
  MinecraftBlockTypes.StructureVoid,
  MinecraftBlockTypes.SpruceButton,
  MinecraftBlockTypes.SpruceHangingSign,
  MinecraftBlockTypes.SprucePressurePlate,
  MinecraftBlockTypes.SpruceSapling,
  MinecraftBlockTypes.SpruceStandingSign,
  MinecraftBlockTypes.SpruceWallSign,
  MinecraftBlockTypes.SnowLayer,
  MinecraftBlockTypes.StandingBanner,
  MinecraftBlockTypes.StandingSign,
  MinecraftBlockTypes.StoneButton,
  MinecraftBlockTypes.StonePressurePlate,
  MinecraftBlockTypes.Sunflower,
  MinecraftBlockTypes.SweetBerryBush,
  MinecraftBlockTypes.TallGrass,
  MinecraftBlockTypes.Torch,
  MinecraftBlockTypes.Torchflower,
  MinecraftBlockTypes.TorchflowerCrop,
  MinecraftBlockTypes.TripWire,
  MinecraftBlockTypes.TripwireHook,
  MinecraftBlockTypes.TubeCoral,
  MinecraftBlockTypes.TubeCoralFan,
  MinecraftBlockTypes.TubeCoralWallFan,
  MinecraftBlockTypes.TwistingVines,
  MinecraftBlockTypes.UnderwaterTorch,
  MinecraftBlockTypes.UnlitRedstoneTorch,
  MinecraftBlockTypes.UnpoweredComparator,
  MinecraftBlockTypes.UnpoweredRepeater,
  MinecraftBlockTypes.Vine,
  MinecraftBlockTypes.WallBanner,
  MinecraftBlockTypes.WallSign,
  MinecraftBlockTypes.Water,
  MinecraftBlockTypes.Web,
  MinecraftBlockTypes.WhiteCarpet,
  MinecraftBlockTypes.YellowCarpet,
]);
