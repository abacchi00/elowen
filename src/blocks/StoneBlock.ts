import Phaser from "phaser";
import { LifeBasedBlock } from "./LifeBasedBlock";
import { GameSounds } from "../types";

const STONE_MAX_LIFE = 200;

export class StoneBlock extends LifeBasedBlock {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sounds?: GameSounds | null,
  ) {
    super(scene, x, y, STONE_MAX_LIFE, "stone_block", {
      spritesheet: null,
      frames: {
        full: "stone_full_life",
        high: "stone_high_life",
        med: "stone_med_life",
        low: "stone_low_life",
      },
    });

    // Use stone-specific mining sound
    if (sounds?.pickaxeHitStone) {
      this.miningSound = sounds.pickaxeHitStone;
    }
  }
}
