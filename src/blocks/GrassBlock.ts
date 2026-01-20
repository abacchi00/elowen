import Phaser from "phaser";
import { LifeBasedBlock } from "./LifeBasedBlock";

const GRASS_MAX_LIFE = 100;

/**
 * Grass block - surface layer block.
 */
export class GrassBlock extends LifeBasedBlock {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "grass_block", GRASS_MAX_LIFE);
  }
}
