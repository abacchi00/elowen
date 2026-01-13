// Game constants and configuration
export const voxelSize = 4;

export const screenWidth = 1000;
export const screenHeight = 600;

export const blockSize = voxelSize * 4;
export const blocksCount = 300; // Number of blocks horizontally
export const layers = 30; // how many rows of ground
export const groundY = 0;

// Player constants
export const speed = voxelSize * 100;
export const jumpSpeed = voxelSize * 300;
export const gravity = voxelSize * 800;

// Block constants
export const HOVER_TINT = 0x666666; // Dark gray for hover effect
