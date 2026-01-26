import Phaser from "phaser";
import { LifeBasedBlock } from "./LifeBasedBlock";

const GRASS_MAX_LIFE = 100;

export class GrassBlock extends LifeBasedBlock {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, GRASS_MAX_LIFE, "grass_block", {
      spritesheet: "grass_dirt_sheet",
      frames: {
        full: [0, 1, 2],
        high: "grass_high_life",
        med: "grass_med_life",
        low: "grass_low_life",
        borderLeft: 4,
        borderRight: 5,
        borderLeftAndRight: 6,
      },
    });
  }
}
