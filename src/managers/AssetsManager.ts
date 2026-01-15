import Phaser from 'phaser';

interface AssetConfig {
  key: string;
  path: string;
}

const IMAGE_ASSETS: AssetConfig[] = [
  // Grass block textures
  { key: 'grass_block', path: './assets/grass_block.png' },
  { key: 'grass_block_high_life', path: './assets/grass_block_high_life.png' },
  { key: 'grass_block_med_life', path: './assets/grass_block_med_life.png' },
  { key: 'grass_block_low_life', path: './assets/grass_block_low_life.png' },
  // Dirt block textures
  { key: 'dirt_block', path: './assets/dirt_block.png' },
  { key: 'dirt_block_high_life', path: './assets/dirt_block_high_life.png' },
  { key: 'dirt_block_med_life', path: './assets/dirt_block_med_life.png' },
  { key: 'dirt_block_low_life', path: './assets/dirt_block_low_life.png' },
  // Stone block textures
  { key: 'stone_block', path: './assets/stone_block.png' },
  { key: 'stone_block_high_life', path: './assets/stone_block_high_life.png' },
  { key: 'stone_block_med_life', path: './assets/stone_block_med_life.png' },
  { key: 'stone_block_low_life', path: './assets/stone_block_low_life.png' },
  // Other textures
  { key: 'pickaxe', path: './assets/pickaxe.png' },
  { key: 'tree', path: './assets/tree.png' },
  { key: 'player_sprite_right', path: './assets/player_sprite_right.png' },
  { key: 'player_sprite_left', path: './assets/player_sprite_left.png' },
];

const AUDIO_ASSETS: AssetConfig[] = [
  { key: 'running', path: './assets/running.mp3' },
  { key: 'jump', path: './assets/jump.mp3' },
  { key: 'pickaxe_hit', path: './assets/pickaxe_hit.mp3' },
  { key: 'pickaxe_hit_stone', path: './assets/pickaxe_hit_stone.mp3' },
];

/**
 * Manages loading of game assets.
 * Uses static methods for simplicity since asset loading
 * happens once during preload.
 */
export class AssetsManager {
  static loadAll(loader: Phaser.Loader.LoaderPlugin): void {
    this.loadImages(loader);
    this.loadAudio(loader);
  }

  private static loadImages(loader: Phaser.Loader.LoaderPlugin): void {
    IMAGE_ASSETS.forEach(({ key, path }) => {
      loader.image(key, path);
    });
  }

  private static loadAudio(loader: Phaser.Loader.LoaderPlugin): void {
    AUDIO_ASSETS.forEach(({ key, path }) => {
      loader.audio(key, path);
    });
  }
}
