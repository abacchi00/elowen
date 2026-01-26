import Phaser from "phaser";
import { SCREEN_HEIGHT, BLOCKS_COUNT, BLOCK_SIZE } from "../config/constants";

const SKY_COLOR_LIGHT = 0x86f9ff; // Light sky blue (bottom/middle)
const SKY_COLOR_DARK = 0x2196f3; // Dark blue (top)
const SKY_DEPTH = -1000;

/**
 * Manages the game background rendering.
 */
export class BackgroundManager {
  private graphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene) {
    this.graphics = this.createSkyBackground(scene);
  }

  private createSkyBackground(
    scene: Phaser.Scene,
  ): Phaser.GameObjects.Graphics {
    const skyHeight = SCREEN_HEIGHT * 20;
    const skyWidth = BLOCKS_COUNT * BLOCK_SIZE * 4;

    const graphics = scene.add.graphics();

    // Create gradient from dark blue (top) to light sky blue (middle/bottom)
    graphics.fillGradientStyle(
      SKY_COLOR_DARK,
      SKY_COLOR_DARK,
      SKY_COLOR_LIGHT,
      SKY_COLOR_LIGHT,
      1,
    );
    graphics.fillRect(-skyWidth / 2, -skyHeight / 2, skyWidth, skyHeight);

    graphics.setPosition(0, 0);
    graphics.setDepth(SKY_DEPTH);
    graphics.setScrollFactor(1, 1);

    return graphics;
  }

  getGraphics(): Phaser.GameObjects.Graphics {
    return this.graphics;
  }

  destroy(): void {
    this.graphics.destroy();
  }
}
