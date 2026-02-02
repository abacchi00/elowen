import Phaser from "phaser";

interface AssetConfig {
  key: string;
  path: string;
}

interface SpritesheetConfig {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
}

const SPRITESHEET_ASSETS: SpritesheetConfig[] = [
  {
    key: "dirt_block_spritesheet",
    path: "/assets/spritesheets/dirt_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "grass_block_spritesheet",
    path: "/assets/spritesheets/grass_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "stone_block_spritesheet",
    path: "/assets/spritesheets/stone_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "player_spritesheet",
    path: "/assets/spritesheets/player_spritesheet.png",
    frameWidth: 16,
    frameHeight: 24,
  },
];

const IMAGE_ASSETS: AssetConfig[] = [
  { key: "pickaxe", path: "./assets/images/pickaxe.png" },
  { key: "tree_variant_1", path: "./assets/images/tree_variant_1.png" },
  { key: "tree_variant_2", path: "./assets/images/tree_variant_2.png" },
];

const AUDIO_ASSETS: AssetConfig[] = [
  { key: "running", path: "./assets/audio/running.mp3" },
  { key: "jump", path: "./assets/audio/jump.mp3" },
  { key: "pickaxe_hit", path: "./assets/audio/pickaxe_hit.mp3" },
  { key: "pickaxe_hit_stone", path: "./assets/audio/pickaxe_hit_stone.mp3" },
  { key: "item_pickup", path: "./assets/audio/pickaxe_hit.mp3" }, // Using pickaxe_hit as placeholder until pickup sound is added
];

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
