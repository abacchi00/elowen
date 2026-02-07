// TODO: create file structure for constants

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
// Player Constants
// ============================================================================

export const PLAYER_SPEED = BLOCK_SIZE * 25;
export const JUMP_SPEED = BLOCK_SIZE * 65;
export const GRAVITY = BLOCK_SIZE * 200;

// ============================================================================
// Mining Constants
// ============================================================================

export const MINING_DAMAGE = 25;
export const MINING_INTERVAL = 200; // ms between mining attempts

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
