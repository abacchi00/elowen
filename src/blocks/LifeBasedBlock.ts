import Phaser from "phaser";
import { Block } from "./Block";

// Frame indices in the grass_dirt_sheet spritesheet
const GRASS_VARIANT_FRAMES = [0, 1, 2]; // 3 grass variants
const DIRT_FRAME = 3;

/**
 * Block that changes texture based on remaining life.
 * Uses spritesheet frames for full health and damage textures for damaged states.
 */
export abstract class LifeBasedBlock extends Block {
  protected baseTexture: string;
  protected variantFrame: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    baseTexture: string,
    maxLife: number,
  ) {
    // Determine the initial frame for spritesheet-based blocks
    let initialTexture = baseTexture;
    let initialFrame: number | undefined;

    if (baseTexture === "grass_block") {
      initialTexture = "grass_dirt_sheet";
      initialFrame =
        GRASS_VARIANT_FRAMES[
          Math.floor(Math.random() * GRASS_VARIANT_FRAMES.length)
        ];
    } else if (baseTexture === "dirt_block") {
      initialTexture = "grass_dirt_sheet";
      initialFrame = DIRT_FRAME;
    }

    super(scene, x, y, initialTexture, maxLife);
    this.baseTexture = baseTexture;
    this.variantFrame = initialFrame ?? 0;

    // Set the frame if using spritesheet
    if (initialFrame !== undefined) {
      this.setFrame(initialFrame);
    }

    this.updateVisuals();
  }

  updateVisuals(): void {
    const lifePercentage = this.life / this.maxLife;

    if (lifePercentage > 0.75) {
      // Full health - use spritesheet frames
      if (this.baseTexture === "grass_block") {
        this.setTexture("grass_dirt_sheet", this.variantFrame);
      } else if (this.baseTexture === "dirt_block") {
        this.setTexture("grass_dirt_sheet", DIRT_FRAME);
      } else {
        this.setTexture(this.baseTexture);
      }
    } else if (lifePercentage > 0.5) {
      this.setTexture(`${this.baseTexture}_high_life`);
    } else if (lifePercentage > 0.25) {
      this.setTexture(`${this.baseTexture}_med_life`);
    } else {
      this.setTexture(`${this.baseTexture}_low_life`);
    }
  }
}
