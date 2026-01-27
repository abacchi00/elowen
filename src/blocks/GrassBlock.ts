import Phaser from "phaser";
import { BlockConfig } from "@/types";
import { Block } from "./Block";

const GRASS_CONFIG: BlockConfig = {
  type: "grass_block",
  spritesheet: "grass_dirt_sheet",
  fullFrames: [0, 1, 2],
  borderLeftFrame: 4,
  borderRightFrame: 5,
  borderBothFrame: 6,
  highLifeTexture: "grass_block_high_life",
  medLifeTexture: "grass_block_med_life",
  lowLifeTexture: "grass_block_low_life",
  maxLife: 100,
};

export class GrassBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    slope: "left" | "right" | "both" | "none",
  ) {
    super(scene, position, matrixPosition, GRASS_CONFIG, slope);
  }
}
