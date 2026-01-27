import Phaser from "phaser";
import { LifeBasedBlock, SimpleBlockConfig } from "./LifeBasedBlock";
import { GameSounds } from "../types";

const STONE_CONFIG: SimpleBlockConfig = {
  type: "simple",
  baseTexture: "stone_block",
  highLifeTexture: "stone_block_high_life",
  medLifeTexture: "stone_block_med_life",
  lowLifeTexture: "stone_block_low_life",
  maxLife: 200,
};

export class StoneBlock extends LifeBasedBlock {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sounds?: GameSounds | null,
  ) {
    super(scene, x, y);

    // Use stone-specific mining sound
    if (sounds?.pickaxeHitStone) {
      this.miningSound = sounds.pickaxeHitStone;
    }
  }

  static override getConfig(): SimpleBlockConfig {
    return STONE_CONFIG;
  }
}
