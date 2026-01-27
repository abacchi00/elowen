import Phaser from "phaser";
import { LifeBasedBlock, SpritesheetBlockConfig } from "./LifeBasedBlock";

const GRASS_CONFIG: SpritesheetBlockConfig = {
  type: "spritesheet",
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

export class GrassBlock extends LifeBasedBlock {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  static override getConfig(): SpritesheetBlockConfig {
    return GRASS_CONFIG;
  }
}
