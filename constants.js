// Game constants and configuration
export const tileSize = 6;

export const screenWidth = window.innerWidth;
export const screenHeight = window.innerHeight;

export const blockSize = tileSize * 4;
export const blocksCount = 300; // Number of blocks horizontally
export const layers = 50; // how many rows of ground (increased by 20)
export const groundY = 0;

// Player constants
export const speed = tileSize * 100;
export const jumpSpeed = tileSize * 300;
export const gravity = tileSize * 800;

// Block constants
export const BLOCK_MAX_LIFE = 100; // Maximum life points for a block
export const MINING_DAMAGE = 25; // Damage dealt per mining attempt
