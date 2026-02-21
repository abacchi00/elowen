import Phaser from "phaser";
import {
  SCREEN_HEIGHT,
  WORLD_WIDTH_BLOCKS,
  BLOCK_SIZE,
} from "../config/constants";
import { SKY_COLOR_LIGHT, SKY_COLOR_DARK, SKY_DEPTH } from "@/config/constants";
import { ignoreOnUICameras, getRandomFloatFrom } from "@/utils";
import { IUpdatable } from "@/types";

/**
 * Manages the game background rendering.
 */
export class BackgroundManager implements IUpdatable {
  private graphics: Phaser.GameObjects.Graphics;
  private clouds: Phaser.GameObjects.Image[];
  cloudContainer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.graphics = this.createSkyBackground(scene);
    this.clouds = this.createClouds(scene);
    this.cloudContainer = this.createCloudContainer(scene);
  }

  update(_time?: number, delta?: number): void {
    const worldHalfWidth = (WORLD_WIDTH_BLOCKS / 2) * BLOCK_SIZE;
    const dt = (delta ?? 16) / 1000; // seconds elapsed since last frame

    this.clouds.forEach(cloud => {
      const cloudImage = cloud;

      cloudImage.x += BLOCK_SIZE * 0.3 * dt;

      // Wrap cloud back to the left edge when it passes the right edge
      if (cloudImage.x > worldHalfWidth) {
        cloudImage.x = -worldHalfWidth;
      }

      return null;
    });
  }

  private createCloud(scene: Phaser.Scene): Phaser.GameObjects.Image {
    const worldHalfWidth = (WORLD_WIDTH_BLOCKS / 2) * BLOCK_SIZE;

    const textureKey = "cloud_1";
    const cloud = scene.add.image(0, 0, textureKey);

    cloud.setPosition(
      getRandomFloatFrom(-worldHalfWidth).to(worldHalfWidth),
      getRandomFloatFrom(-BLOCK_SIZE * 19).to(-BLOCK_SIZE * 16),
    );

    const randomScale = getRandomFloatFrom(2).to(6);

    cloud.setScrollFactor(randomScale / 8, randomScale / 8);
    cloud.setOrigin(0, 0);
    cloud.setScale(randomScale);

    if (randomScale < 3.5) {
      cloud.setAlpha(0.6);
    } else if (randomScale < 5) {
      cloud.setAlpha(0.8);
    }

    return cloud;
  }

  private createClouds(scene: Phaser.Scene): Phaser.GameObjects.Image[] {
    const cloudQuantity = 20;

    const clouds = Array.from({ length: cloudQuantity }, () =>
      this.createCloud(scene),
    );

    return clouds;
  }

  private createCloudContainer(
    scene: Phaser.Scene,
  ): Phaser.GameObjects.Container {
    const cloudContainer = scene.add.container();

    cloudContainer.add(this.clouds);
    cloudContainer.setDepth(SKY_DEPTH + 1);

    ignoreOnUICameras(scene, cloudContainer);

    return cloudContainer;
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
