import Phaser from "phaser";
import { Block } from "./Block";

/**
 * Configuration for blocks that use a spritesheet with slope variants.
 */
export interface SpritesheetBlockConfig {
  type: "spritesheet";
  spritesheet: string;
  fullFrames: number[];
  borderLeftFrame: number;
  borderRightFrame: number;
  borderBothFrame: number;
  highLifeTexture: string;
  medLifeTexture: string;
  lowLifeTexture: string;
  maxLife: number;
}

/**
 * Configuration for blocks that use individual textures (no slope variants).
 */
export interface SimpleBlockConfig {
  type: "simple";
  baseTexture: string;
  highLifeTexture: string;
  medLifeTexture: string;
  lowLifeTexture: string;
  maxLife: number;
}

export type BlockConfig = SpritesheetBlockConfig | SimpleBlockConfig;

/**
 * Block that changes texture based on remaining life.
 * Supports both spritesheet-based blocks (with slope variants) and simple texture blocks.
 */
export abstract class LifeBasedBlock extends Block {
  protected readonly config: BlockConfig;
  protected currentFrame: number = 0;
  protected isSlopeVariant: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    const config = (new.target as typeof LifeBasedBlock).getConfig();

    // Determine initial texture
    let initialTexture: string;
    let initialFrame: number | undefined;

    if (config.type === "spritesheet") {
      initialTexture = config.spritesheet;
      initialFrame =
        config.fullFrames[Math.floor(Math.random() * config.fullFrames.length)];
    } else {
      initialTexture = config.baseTexture;
    }

    super(scene, x, y, initialTexture, initialFrame, config.maxLife);

    this.config = config;
    this.currentFrame = initialFrame ?? 0;

    if (initialFrame !== undefined) {
      this.setFrame(initialFrame);
    }

    this.updateVisuals();
  }

  /**
   * Each block subclass must provide its configuration.
   */
  static getConfig(): BlockConfig {
    throw new Error("Subclass must implement getConfig()");
  }

  override hasSlopeVariants(): boolean {
    return this.config.type === "spritesheet";
  }

  override isSlope(): boolean {
    return this.isSlopeVariant;
  }

  override updateSlopeVariant(
    hasBlockLeft: boolean,
    hasBlockRight: boolean,
  ): void {
    if (this.config.type !== "spritesheet") return;

    if (!hasBlockLeft && !hasBlockRight) {
      this.currentFrame = this.config.borderBothFrame;
      this.isSlopeVariant = true;
    } else if (!hasBlockLeft) {
      this.currentFrame = this.config.borderLeftFrame;
      this.isSlopeVariant = true;
    } else if (!hasBlockRight) {
      this.currentFrame = this.config.borderRightFrame;
      this.isSlopeVariant = true;
    } else {
      // Reset to a random full frame
      this.currentFrame =
        this.config.fullFrames[
          Math.floor(Math.random() * this.config.fullFrames.length)
        ];
      this.isSlopeVariant = false;
    }

    this.updateVisuals();
  }

  updateVisuals(): void {
    const lifePercentage = this.life / this.maxLife;

    if (lifePercentage > 0.75) {
      // Full health
      if (this.config.type === "spritesheet") {
        this.setTexture(this.config.spritesheet, this.currentFrame);
      } else {
        this.setTexture(this.config.baseTexture);
      }
    } else if (lifePercentage > 0.5) {
      this.setTexture(this.config.highLifeTexture);
    } else if (lifePercentage > 0.25) {
      this.setTexture(this.config.medLifeTexture);
    } else {
      this.setTexture(this.config.lowLifeTexture);
    }
  }
}
