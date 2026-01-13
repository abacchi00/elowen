// Game constants and configuration
export const voxelSize = 8;

export const screenWidth = window.innerWidth;
export const screenHeight = window.innerHeight;

export const blockSize = voxelSize * 4;
export const blocksCount = 300; // Number of blocks horizontally
export const layers = 30; // how many rows of ground
export const groundY = 0;

// Player constants
export const speed = voxelSize * 100;
export const jumpSpeed = voxelSize * 300;
export const gravity = voxelSize * 800;

// Block constants
export const HOVER_TINT = 0x00FF00; // Dark gray for hover effect
export const BLOCK_MAX_LIFE = 100; // Maximum life points for a block
export const MINING_DAMAGE = 34; // Damage dealt per mining attempt