import Phaser from "phaser";
import { Block } from "./Block";
import { BlockConfig } from "@/types";
import { BlockVariant, BlockVariantFramesType } from "@/config/constants";

const STONE_CONFIG: BlockConfig = {
  type: "stone_block",
  spritesheet: "stone_block_spritesheet",
  maxLife: 200,
};

export class StoneBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    variantFrames: BlockVariantFramesType[BlockVariant],
  ) {
    super(scene, position, matrixPosition, STONE_CONFIG, variantFrames);
  }
}
