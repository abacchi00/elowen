import Phaser from "phaser";
import {
  SCREEN_HEIGHT,
  WORLD_WIDTH_BLOCKS,
  BLOCK_SIZE,
} from "../config/constants";
import { SKY_COLOR_LIGHT, SKY_COLOR_DARK, SKY_DEPTH } from "@/config/constants";
import { ignoreOnUICameras } from "@/utils";
import { IUpdatable } from "@/types";

function getRandomArbitrary(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Manages the game background rendering.
 */
export class BackgroundManager implements IUpdatable {
  private graphics: Phaser.GameObjects.Graphics;
  private clouds: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.graphics = this.createSkyBackground(scene);
    this.clouds = this.createClouds(scene);
  }

  update(): void {
    const worldHalfWidth = (WORLD_WIDTH_BLOCKS / 2) * BLOCK_SIZE;

    this.clouds.children.each(cloud => {
      const cloudImage = cloud as Phaser.GameObjects.Image;

      cloudImage.x += BLOCK_SIZE * 0.005;

      // Wrap cloud back to the left edge when it passes the right edge
      if (cloudImage.x > worldHalfWidth) {
        cloudImage.x = -worldHalfWidth;
      }

      return null;
    });
  }

  /**
   * Generates a reusable cloud texture with bloom and blur baked in.
   */
  private generateCloudTexture(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
  ): void {
    const rt = scene.add.renderTexture(0, 0, width, height);
    const gfx = scene.add.graphics();

    gfx.fillStyle(0xeeeeee, 0.8);
    gfx.fillRect(0, 0, width, height);
    gfx.postFX.addBloom(undefined, undefined, undefined, 3);
    gfx.postFX.addBlur(1);

    rt.draw(gfx);
    rt.saveTexture(key);

    gfx.destroy();
    rt.destroy();
  }

  private createClouds(scene: Phaser.Scene): Phaser.GameObjects.Group {
    const clouds = scene.add.group();
    const worldHalfWidth = (WORLD_WIDTH_BLOCKS / 2) * BLOCK_SIZE;

    // Pre-generate a few cloud texture variants
    const variants = 4;
    for (let v = 0; v < variants; v++) {
      const w = BLOCK_SIZE * getRandomArbitrary(8, 16);
      const h = BLOCK_SIZE * getRandomArbitrary(3, 6);
      this.generateCloudTexture(scene, `cloud_${v}`, w, h);
    }

    for (let i = 0; i < 20; i++) {
      const textureKey = `cloud_${i % variants}`;
      const cloud = scene.add.image(0, 0, textureKey);

      cloud.setPosition(
        getRandomArbitrary(-worldHalfWidth, worldHalfWidth),
        getRandomArbitrary(-BLOCK_SIZE * 40, 0),
      );
      cloud.setDepth(SKY_DEPTH + 1);
      cloud.setScrollFactor(0.5, 0.5);
      cloud.setOrigin(0, 0);

      ignoreOnUICameras(scene, cloud);
      clouds.add(cloud);
    }

    return clouds;
  }

  private createSkyBackground(
    scene: Phaser.Scene,
  ): Phaser.GameObjects.Graphics {
    const skyHeight = SCREEN_HEIGHT * 20;
    const skyWidth = WORLD_WIDTH_BLOCKS * BLOCK_SIZE * 4;

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
