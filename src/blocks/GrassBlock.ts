import Phaser from "phaser";
import { BlockConfig } from "@/types";
import { Block } from "./Block";
import { BlockVariant, BlockVariantFramesType } from "@/config/constants";

const GRASS_CONFIG: BlockConfig = {
  type: "grass_block",
  spritesheet: "grass_block_spritesheet",
  maxLife: 100,
};

export class GrassBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    variantFrames: BlockVariantFramesType[BlockVariant],
  ) {
    super(scene, position, matrixPosition, GRASS_CONFIG, variantFrames);
  }
}
