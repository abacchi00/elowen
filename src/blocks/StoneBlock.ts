import Phaser from "phaser";
import { Block } from "./Block";
import { BlockConfig } from "@/types";

const STONE_CONFIG: BlockConfig = {
  type: "stone_block",
  spritesheet: "stone_block_spritesheet",
  fullFrames: [0],
  borderLeftFrame: 0,
  borderRightFrame: 0,
  borderBothFrame: 0,
  highLifeTexture: "stone_block_high_life",
  medLifeTexture: "stone_block_med_life",
  lowLifeTexture: "stone_block_low_life",
  maxLife: 200,
};

export class StoneBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    slope: "left" | "right" | "both" | "none",
  ) {
    super(scene, position, matrixPosition, STONE_CONFIG, slope);
  }
}
