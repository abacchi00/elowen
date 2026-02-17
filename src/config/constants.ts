import {
  AssetConfig,
  GameSounds,
  SoundConfig,
  SpritesheetConfig,
} from "@/types";

// ============================================================================
// Display Constants
// ============================================================================

export const BLOCK_SIZE = 16;
export const SCREEN_WIDTH = window.innerWidth;
export const SCREEN_HEIGHT = window.innerHeight;

// ============================================================================
// World Constants
// ============================================================================

export const WORLD_WIDTH_BLOCKS = 300; // Number of blocks horizontally
export const WORLD_HEIGHT_BLOCKS = 100; // Number of vertical layers
export const GROUND_Y = 0;

// ============================================================================
// Background Constants
// ============================================================================

export const SKY_COLOR_LIGHT = 0x86f9ff; // Light sky blue (bottom/middle)
export const SKY_COLOR_DARK = 0x2196f3; // Dark blue (top)
export const SKY_DEPTH = -1000;

// ============================================================================
// Player Constants
// ============================================================================

export const PLAYER_SPEED = BLOCK_SIZE * 25;
export const JUMP_SPEED = BLOCK_SIZE * 65;
export const GRAVITY = BLOCK_SIZE * 200;

// ============================================================================
// Pickaxe Constants
// ============================================================================

export const PICKAXE_SWING_SPEED = 0.03;
export const PICKAXE_SWING_AMPLITUDE = 0.6;

// ============================================================================
// Mining Constants
// ============================================================================

export const MINING_DAMAGE = 25;
export const MINING_INTERVAL = 200; // ms between mining attempts
export const MINEABLE_OUTLINE_COLOR = 0xffffff;
export const MINEABLE_OUTLINE_WIDTH = 1;

// ============================================================================
// Camera Constants
// ============================================================================

export const CAMERA_MIN_ZOOM = 1;
export const CAMERA_MAX_ZOOM = 2.0;
export const CAMERA_ZOOM_SPEED = 0.1;

// ============================================================================
// Terrain Constants
// ============================================================================

export const MAX_MOUNTAIN_HEIGHT = 80;
export const BASE_DEPTH = 43;

// ============================================================================
// Tree Constants
// ============================================================================

export const TREE_MAX_LIFE = 80;
export const TREE_SPAWN_CHANCE = 0.15; // 15%
export const TREE_DARK_TINT_CHANCE = 0.3; // 30%
export const TREE_DISPLAY_WIDTH = BLOCK_SIZE * 6;
export const TREE_DISPLAY_HEIGHT = BLOCK_SIZE * 6;
export const TREE_DARK_TINT = 0xbbbbbb;

// ============================================================================
// Boar Constants
// ============================================================================

export const BOAR_SPEED = BLOCK_SIZE * 2;
export const BOAR_JUMP_VELOCITY = BLOCK_SIZE * 40;
export const BOAR_JUMP_ON_COLLISION_PROBABILITY = 0.8;
export const BOAR_DISPLAY_WIDTH = BLOCK_SIZE * 3;
export const BOAR_DISPLAY_HEIGHT = BLOCK_SIZE * 2;
export const BOAR_OUT_OF_BOUNDS_Y = BLOCK_SIZE * 200; // Destroy boar if it falls this far

// ============================================================================
// Sound Constants
// ============================================================================

export const SOUND_CONFIGS: Record<keyof GameSounds, SoundConfig> = {
  running: { key: "running", loop: true, volume: 2 },
  jump: { key: "jump", volume: 0.6 },
  pickaxeHit: { key: "pickaxe_hit", volume: 0.2 },
  itemPickup: { key: "item_pickup", volume: 0.4 },
  backgroundMusic: { key: "background_music", loop: true, volume: 0.15 },
};

// ============================================================================
// Asset Constants
// ============================================================================

export const SPRITESHEET_ASSETS: SpritesheetConfig[] = [
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
    key: "wood_block_spritesheet",
    path: "/assets/spritesheets/wood_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "player_spritesheet",
    path: "/assets/spritesheets/player_spritesheet.png",
    frameWidth: 16,
    frameHeight: 24,
  },
  {
    key: "boar_spritesheet",
    path: "/assets/spritesheets/boar_spritesheet.png",
    frameWidth: 48,
    frameHeight: 32,
  },
];

export const IMAGE_ASSETS: AssetConfig[] = [
  { key: "pickaxe", path: "./assets/images/pickaxe.png" },
  { key: "tree_variant_1", path: "./assets/images/tree_variant_1.png" },
  { key: "tree_variant_2", path: "./assets/images/tree_variant_2.png" },
  { key: "cloud_1", path: "./assets/images/cloud_1.png" },
];

export const AUDIO_ASSETS: AssetConfig[] = [
  { key: "running", path: "./assets/audio/running.mp3" },
  { key: "jump", path: "./assets/audio/jump.mp3" },
  { key: "pickaxe_hit", path: "./assets/audio/pickaxe_hit.mp3" },
  { key: "item_pickup", path: "./assets/audio/item_pickup.mp3" },
  {
    key: "background_music",
    path: "./assets/audio/background_music.mp3",
  },
];
