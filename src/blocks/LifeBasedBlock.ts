import Phaser from "phaser";
import { Block } from "./Block";

export type BlockVariants =
  | {
      spritesheet: string;
      frames: {
        full: number[];
        high: string;
        med: string;
        low: string;
        borderLeft: number;
        borderRight: number;
        borderLeftAndRight: number;
      };
    }
  | {
      spritesheet: null;
      frames: {
        full: string;
        high: string;
        med: string;
        low: string;
      };
    };
export abstract class LifeBasedBlock extends Block {
  protected variants: BlockVariants | null;
  protected baseTexture: string;
  protected isSlopeVariant: boolean = false;
  protected currentFrame: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    maxLife: number,
    baseTexture: string,
    variants: BlockVariants | null,
  ) {
    const initialTexture = variants?.spritesheet ?? baseTexture;

    super(scene, x, y, initialTexture, maxLife);

    if (variants?.spritesheet) {
      this.currentFrame =
        variants.frames.full[
          Math.floor(Math.random() * variants.frames.full.length)
        ];
    }

    this.baseTexture = baseTexture;
    this.variants = variants;

    // Set the frame if using spritesheet
    if (this.currentFrame !== undefined) {
      this.setFrame(this.currentFrame);
    }

    this.updateVisuals();
  }

  updateSlopeVariant(hasBlockLeft: boolean, hasBlockRight: boolean): void {
    if (!this.hasSlopeVariants()) return;

    this.isSlopeVariant = true;
    if (!hasBlockLeft && !hasBlockRight) {
      this.currentFrame = this.variants.frames.borderLeftAndRight;
    } else if (!hasBlockLeft) {
      this.currentFrame = this.variants.frames.borderLeft;
    } else if (!hasBlockRight) {
      this.currentFrame = this.variants.frames.borderRight;
    } else {
      this.isSlopeVariant = false;
    }

    this.updateVisuals();
  }

  override isSlope(): boolean {
    return this.isSlopeVariant;
  }

  override hasSlopeVariants(): this is this & {
    variants: Extract<BlockVariants, { spritesheet: string }>;
  } {
    return this.variants?.spritesheet !== null;
  }

  updateVisuals(): void {
    const lifePercentage = this.life / this.maxLife;

    if (lifePercentage > 0.75) {
      if (this.hasSlopeVariants()) {
        this.setTexture(this.variants.spritesheet, this.currentFrame);
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
