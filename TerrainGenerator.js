import { blocksCount, layers, groundY, blockSize } from './constants.js';

export class TerrainGenerator {
  constructor() {
    this.mapMatrix = [];
    this.width = blocksCount;
    this.depth = layers;
  }

  generate() {
    // Initialize map matrix (2D array: [x][y])
    this.mapMatrix = [];
    
    // Generate base terrain height map
    this.heightMap = this.generateHeightMap();
    
    // Convert height map to block matrix
    this.generateBlockMatrix(this.heightMap);
    
    return this.mapMatrix;
  }

  generateHeightMap() {
    // Generate height for each x position (simple noise/random)
    const heightMap = [];
    const baseHeight = 3; // Base ground height (blocks deep)
    const maxMountainHeight = 80; // Maximum mountain height above base (increased from 50)
    
    // Generate height using simple noise algorithm
    for (let x = 0; x < this.width; x++) {
      // Use multiple octaves for smoother terrain
      let heightAboveBase = 0;
      
      // Large scale variation (mountains) - enhanced mountains
      const mountainNoise = Math.sin(x * 0.08) * 0.6 + Math.sin(x * 0.04) * 0.4;
      heightAboveBase += mountainNoise * 18; // Increased from 10 to 18
      
      // Add some peaks (mountains) - bigger and more impressive
      const peakChance = 0.04; // 4% chance of a peak (slightly increased)
      if (Math.random() < peakChance) {
        const peakHeight = 12 + Math.random() * 25; // Increased from 8-23 to 12-37
        heightAboveBase += peakHeight;
      }
      
      // Medium scale variation (hills)
      const hillNoise = Math.sin(x * 0.2) * 0.4 + Math.sin(x * 0.9) * 0.3;
      heightAboveBase += hillNoise * 5; // Increased from 3 to 5
      
      // Small scale variation (roughness)
      const roughness = (Math.random() - 0.5) * 1.2; // Slightly increased variation
      heightAboveBase += roughness;
      
      // Clamp height
      heightAboveBase = Math.max(0, Math.min(maxMountainHeight, Math.floor(heightAboveBase)));
      heightMap[x] = heightAboveBase;
    }
    
    // Smooth the height map
    return this.smoothHeightMap(heightMap);
  }

  smoothHeightMap(heightMap) {
    // Simple smoothing to reduce jaggedness
    const smoothed = [...heightMap];
    const smoothingPasses = 2;
    
    for (let pass = 0; pass < smoothingPasses; pass++) {
      for (let x = 1; x < this.width - 1; x++) {
        const avg = (heightMap[x - 1] + heightMap[x] + heightMap[x + 1]) / 3;
        smoothed[x] = Math.floor(avg);
      }
      // Copy smoothed back
      for (let x = 1; x < this.width - 1; x++) {
        heightMap[x] = smoothed[x];
      }
    }
    
    return heightMap;
  }

  generateBlockMatrix(heightMap) {
    // Initialize matrix with empty/null values
    const baseDepth = 43; // Base ground depth (blocks below surface) - increased by 20 layers
    
    for (let x = 0; x < this.width; x++) {
      this.mapMatrix[x] = [];
      for (let y = 0; y < this.depth; y++) {
        this.mapMatrix[x][y] = null; // null = no block
      }
    }
    
    // Find the maximum height to determine offset
    const maxHeight = Math.max(...heightMap);
    
    // Fill blocks based on height map
    for (let x = 0; x < this.width; x++) {
      const mountainHeight = heightMap[x];
      
      // Calculate where to start filling blocks
      // Taller mountains start at lower matrixY (higher in world)
      const surfaceMatrixY = maxHeight - mountainHeight;
      
      // Fill blocks from surface down (mountain + base depth)
      const totalBlocks = mountainHeight + baseDepth;
      for (let y = 0; y < totalBlocks && (surfaceMatrixY + y) < this.depth; y++) {
        const matrixY = surfaceMatrixY + y;
        if (matrixY >= 0) {
          let blockType;
          
          // Surface layer is grass
          if (y === 0) {
            blockType = 'grass_block';
          }
          // First few layers below surface are dirt
          else if (y <= 3) {
            blockType = 'dirt_block';
          }
          // Deeper layers: mix of dirt and stone, with more stone deeper down
          else {
            const depthRatio = y / totalBlocks;
            // Deeper = more chance of stone
            const stoneChance = Math.min(0.7, depthRatio * 1.5);
            
            // Add some randomness for natural stone deposits
            if (Math.random() < stoneChance) {
              blockType = 'stone_block';
            } else {
              blockType = 'dirt_block';
            }
          }
          
          this.mapMatrix[x][matrixY] = blockType;
        }
      }
    }
  }

  getBlockType(x, y) {
    // Convert world x to matrix x (accounting for negative coordinates)
    const matrixX = Math.floor(x / blockSize) + Math.floor(this.width / 2);
    const matrixY = y;
    
    if (matrixX < 0 || matrixX >= this.width || matrixY < 0 || matrixY >= this.depth) {
      return null;
    }
    
    return this.mapMatrix[matrixX] ? this.mapMatrix[matrixX][matrixY] : null;
  }

  setBlockType(x, y, blockType) {
    // Convert world x to matrix x
    const matrixX = Math.floor(x / blockSize) + Math.floor(this.width / 2);
    const matrixY = y;
    
    if (matrixX >= 0 && matrixX < this.width && matrixY >= 0 && matrixY < this.depth) {
      if (!this.mapMatrix[matrixX]) {
        this.mapMatrix[matrixX] = [];
      }
      this.mapMatrix[matrixX][matrixY] = blockType;
    }
  }
}
