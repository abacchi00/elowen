import Phaser from "phaser";
import {
  IMAGE_ASSETS,
  SPRITESHEET_ASSETS,
  AUDIO_ASSETS,
} from "@/config/constants";

/**
 * Manages loading of game assets.
 * Uses static methods for simplicity since asset loading
 * happens once during preload.
 */
export class AssetsManager {
  static loadAll(loader: Phaser.Loader.LoaderPlugin): void {
    this.loadImages(loader);
    this.loadSpritesheets(loader);
    this.loadAudio(loader);
  }

  private static loadImages(loader: Phaser.Loader.LoaderPlugin): void {
    IMAGE_ASSETS.forEach(({ key, path }) => {
      loader.image(key, path);
    });
  }

  private static loadSpritesheets(loader: Phaser.Loader.LoaderPlugin): void {
    SPRITESHEET_ASSETS.forEach(({ key, path, frameWidth, frameHeight }) => {
      loader.spritesheet(key, path, { frameWidth, frameHeight });
    });
  }

  private static loadAudio(loader: Phaser.Loader.LoaderPlugin): void {
    AUDIO_ASSETS.forEach(({ key, path }) => {
      loader.audio(key, path);
    });
  }
}
