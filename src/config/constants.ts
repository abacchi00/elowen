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
export const LAYERS = 100; // Number of vertical layers
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

export const MAX_MOUNTAIN_HEIGHT = 80;
export const BASE_DEPTH = 43;

// ============================================================================
// Tree Constants
// ============================================================================

export const TREE_MAX_LIFE = 80;
export const TREE_SPAWN_CHANCE = 0.2; // 15%
export const TREE_DARK_TINT_CHANCE = 0.3; // 30%

// ============================================================================
// Block Constants
// ============================================================================

export enum BlockVariant {
  Default = "Default",
  UpwardsSurface1 = "UpwardsSurface1",
  UpwardsSurface2 = "UpwardsSurface2",
  UpwardsSurface3 = "UpwardsSurface3",
  DownwardsSurface1 = "DownwardsSurface1",
  DownwardsSurface2 = "DownwardsSurface2",
  DownwardsSurface3 = "DownwardsSurface3",
  RightwardsSurface1 = "RightwardsSurface1",
  RightwardsSurface2 = "RightwardsSurface2",
  RightwardsSurface3 = "RightwardsSurface3",
  LeftwardsSurface1 = "LeftwardsSurface1",
  LeftwardsSurface2 = "LeftwardsSurface2",
  LeftwardsSurface3 = "LeftwardsSurface3",
  UpLeftSurface = "UpLeftSurface",
  UpRightSurface = "UpRightSurface",
  DownLeftSurface = "DownLeftSurface",
  DownRightSurface = "DownRightSurface",
  UpLeftRightSurface = "UpLeftRightSurface",
  DownLeftRightSurface = "DownLeftRightSurface",
  UpDownRightSurface = "UpDownRightSurface",
  UpDownLeftSurface = "UpDownLeftSurface",
  AllSurfaces = "AllSurfaces",
  LeftRightSurface = "LeftRightSurface",
  UpDownSurface = "UpDownSurface",
}

export const BLOCK_VARIANT_COUNT = Object.values(BlockVariant).length;

export enum BlockLifeLevel {
  Full = "Full",
  High = "High",
  Medium = "Medium",
  Low = "Low",
}

export type BlockVariantFramesType = Record<
  BlockVariant,
  Record<BlockLifeLevel, number>
>;

export const BLOCK_VARIANT_FRAMES: BlockVariantFramesType = Object.values(
  BlockVariant,
).reduce((acc, variant, index) => {
  return {
    ...acc,
    [variant]: {
      [BlockLifeLevel.Full]: index,
      [BlockLifeLevel.High]: index + BLOCK_VARIANT_COUNT,
      [BlockLifeLevel.Medium]: index + 2 * BLOCK_VARIANT_COUNT,
      [BlockLifeLevel.Low]: index + 3 * BLOCK_VARIANT_COUNT,
    },
  };
}, {} as BlockVariantFramesType);
