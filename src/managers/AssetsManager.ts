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
    path: "/assets/dirt_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "grass_block_spritesheet",
    path: "/assets/grass_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "stone_block_spritesheet",
    path: "/assets/stone_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "player_spritesheet",
    path: "/assets/player_spritesheet.png",
    frameWidth: 16,
    frameHeight: 24,
  },
];

const IMAGE_ASSETS: AssetConfig[] = [
  // Grass block damage textures
  { key: "grass_block_high_life", path: "./assets/grass_block_high_life.png" },
  { key: "grass_block_med_life", path: "./assets/grass_block_med_life.png" },
  { key: "grass_block_low_life", path: "./assets/grass_block_low_life.png" },
  // Dirt block damage textures
  { key: "dirt_block_high_life", path: "./assets/dirt_block_high_life.png" },
  { key: "dirt_block_med_life", path: "./assets/dirt_block_med_life.png" },
  { key: "dirt_block_low_life", path: "./assets/dirt_block_low_life.png" },
  // Stone block textures
  { key: "stone_block", path: "./assets/stone_block.png" },
  { key: "stone_block_high_life", path: "./assets/stone_block_high_life.png" },
  { key: "stone_block_med_life", path: "./assets/stone_block_med_life.png" },
  { key: "stone_block_low_life", path: "./assets/stone_block_low_life.png" },
  // Other textures
  { key: "pickaxe", path: "./assets/pickaxe.png" },
  { key: "tree_variant_1", path: "./assets/tree_variant_1.png" },
  { key: "tree_variant_2", path: "./assets/tree_variant_2.png" },
];

const AUDIO_ASSETS: AssetConfig[] = [
  { key: "running", path: "./assets/running.mp3" },
  { key: "jump", path: "./assets/jump.mp3" },
  { key: "pickaxe_hit", path: "./assets/pickaxe_hit.mp3" },
  { key: "pickaxe_hit_stone", path: "./assets/pickaxe_hit_stone.mp3" },
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
