import Phaser from "phaser";
import { LifeBasedBlock, SpritesheetBlockConfig } from "./LifeBasedBlock";

const DIRT_CONFIG: SpritesheetBlockConfig = {
  type: "spritesheet",
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

export class DirtBlock extends LifeBasedBlock {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
  }

  static override getConfig(): SpritesheetBlockConfig {
    return DIRT_CONFIG;
  }
}
