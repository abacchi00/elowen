import Phaser from "phaser";
import { Block } from "./Block";

// Frame indices in the grass_dirt_sheet spritesheet
const GRASS_VARIANT_FRAMES = [0, 1, 2]; // 3 grass variants
const DIRT_FRAME = 3;
const GRASS_SLOPE_LEFT_FRAME = 4;
const GRASS_SLOPE_RIGHT_FRAME = 5;
const GRASS_SLOPE_LEFT_AND_RIGHT_FRAME = 6;
const DIRT_BORDER_LEFT_FRAME = 7;
const DIRT_BORDER_RIGHT_FRAME = 8;
const DIRT_BORDER_LEFT_AND_RIGHT_FRAME = 9;

/**
 * Block that changes texture based on remaining life.
 * Uses spritesheet frames for full health and damage textures for damaged states.
 */
export abstract class LifeBasedBlock extends Block {
  protected baseTexture: string;
  protected variantFrame: number;
  protected isSlopeVariant: boolean = false;

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

  /**
   * Updates the grass block to use a slope variant based on neighboring blocks.
   * @param hasBlockLeft - Whether there's a block to the left
   * @param hasBlockRight - Whether there's a block to the right
   */
  updateSlopeVariant(hasBlockLeft: boolean, hasBlockRight: boolean): void {
    if (this.baseTexture !== "grass_block" && this.baseTexture !== "dirt_block")
      return;

    this.isSlopeVariant = true;

    if (this.baseTexture === "dirt_block") {
      if (!hasBlockLeft && !hasBlockRight) {
        this.variantFrame = DIRT_BORDER_LEFT_AND_RIGHT_FRAME;
      } else if (!hasBlockLeft) {
        this.variantFrame = DIRT_BORDER_LEFT_FRAME;
      } else if (!hasBlockRight) {
        this.variantFrame = DIRT_BORDER_RIGHT_FRAME;
      }
    } else if (!hasBlockLeft && !hasBlockRight) {
      this.variantFrame = GRASS_SLOPE_LEFT_AND_RIGHT_FRAME;
    } else if (!hasBlockLeft) {
      this.variantFrame = GRASS_SLOPE_LEFT_FRAME;
    } else if (!hasBlockRight) {
      this.variantFrame = GRASS_SLOPE_RIGHT_FRAME;
    }
    // Regular grass variant
    else {
      this.isSlopeVariant = false;
    }

    this.updateVisuals();
  }

  /**
   * Returns whether this block is using a slope variant texture.
   */
  override isSlope(): boolean {
    return this.isSlopeVariant;
  }

  updateVisuals(): void {
    const lifePercentage = this.life / this.maxLife;

    if (lifePercentage > 0.75) {
      // Full health - use spritesheet frames
      if (
        this.baseTexture === "grass_block" ||
        this.baseTexture === "dirt_block"
      ) {
        this.setTexture("grass_dirt_sheet", this.variantFrame);
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
