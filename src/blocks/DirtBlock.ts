import Phaser from "phaser";
import { BlockConfig } from "@/types";
import { Block } from "./Block";
import { BlockVariant, BlockVariantFramesType } from "@/config/constants";

const DIRT_CONFIG: BlockConfig = {
  type: "dirt_block",
  spritesheet: "dirt_block_spritesheet",
  maxLife: 100,
};

export class DirtBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    variantFrames: BlockVariantFramesType[BlockVariant],
  ) {
    super(scene, position, matrixPosition, DIRT_CONFIG, variantFrames);
  }
}
