import Phaser from "phaser";
import { BlockConfig } from "@/types";
import { Block } from "./Block";

const DIRT_CONFIG: BlockConfig = {
  type: "dirt_block",
  spritesheet: "grass_dirt_sheet",
  fullFrames: [3],
  borderLeftFrame: 7,
  borderRightFrame: 8,
  borderBothFrame: 9,
  highLifeTexture: "dirt_block_high_life",
  medLifeTexture: "dirt_block_med_life",
  lowLifeTexture: "dirt_block_low_life",
  maxLife: 100,
};

export class DirtBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    slope: "left" | "right" | "both" | "none",
  ) {
    super(scene, position, matrixPosition, DIRT_CONFIG, slope);
  }
}
