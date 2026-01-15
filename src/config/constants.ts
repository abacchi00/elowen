// ============================================================================
// Display Constants
// ============================================================================

export const TILE_SIZE = 6;
export const BLOCK_SIZE = TILE_SIZE * 4;

export const SCREEN_WIDTH = window.innerWidth;
export const SCREEN_HEIGHT = window.innerHeight;

// ============================================================================
// World Constants
// ============================================================================

export const BLOCKS_COUNT = 300; // Number of blocks horizontally
export const LAYERS = 50; // Number of vertical layers
export const GROUND_Y = 0;

// ============================================================================
// Player Constants
// ============================================================================

export const PLAYER_SPEED = TILE_SIZE * 100;
export const JUMP_SPEED = TILE_SIZE * 300;
export const GRAVITY = TILE_SIZE * 800;

// ============================================================================
// Mining Constants
// ============================================================================

export const BLOCK_MAX_LIFE = 100;
export const MINING_DAMAGE = 25;
export const MINING_INTERVAL = 200; // ms between mining attempts

// ============================================================================
// Camera Constants
// ============================================================================

export const CAMERA_MIN_ZOOM = 0.5;
export const CAMERA_MAX_ZOOM = 2.0;
export const CAMERA_ZOOM_SPEED = 0.1;

// ============================================================================
// Terrain Constants
// ============================================================================

export const BASE_HEIGHT = 3;
export const MAX_MOUNTAIN_HEIGHT = 80;
export const BASE_DEPTH = 43;

// ============================================================================
// Tree Constants
// ============================================================================

export const TREE_MAX_LIFE = 80;
export const TREE_SPAWN_CHANCE = 0.10; // 10%
export const TREE_DARK_TINT_CHANCE = 0.30; // 30%
