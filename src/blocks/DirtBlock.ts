import Phaser from "phaser";
import { LifeBasedBlock } from "./LifeBasedBlock";

const DIRT_MAX_LIFE = 100;

export class DirtBlock extends LifeBasedBlock {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, DIRT_MAX_LIFE, "dirt_block", {
      spritesheet: "grass_dirt_sheet",
      frames: {
        full: [3],
        high: "dirt_high_life",
        med: "dirt_med_life",
        low: "dirt_low_life",
        borderLeft: 7,
        borderRight: 8,
        borderLeftAndRight: 9,
      },
    });
  }
}
