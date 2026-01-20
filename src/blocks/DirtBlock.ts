import Phaser from "phaser";
import { LifeBasedBlock } from "./LifeBasedBlock";

const DIRT_MAX_LIFE = 100;

/**
 * Dirt block - subsurface layer block.
 */
export class DirtBlock extends LifeBasedBlock {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "dirt_block", DIRT_MAX_LIFE);
  }
}
