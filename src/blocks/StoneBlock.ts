import Phaser from "phaser";
import { LifeBasedBlock } from "./LifeBasedBlock";
import { GameSounds } from "../types";

const STONE_MAX_LIFE = 200;

/**
 * Stone block - deep layer block with higher durability.
 */
export class StoneBlock extends LifeBasedBlock {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sounds?: GameSounds | null,
  ) {
    super(scene, x, y, "stone_block", STONE_MAX_LIFE);

    // Use stone-specific mining sound
    if (sounds?.pickaxeHitStone) {
      this.miningSound = sounds.pickaxeHitStone;
    }
  }
}
