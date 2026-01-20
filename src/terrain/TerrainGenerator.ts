import {
  BLOCKS_COUNT,
  LAYERS,
  BLOCK_SIZE,
  MAX_MOUNTAIN_HEIGHT,
  BASE_DEPTH,
} from "../config/constants";
import { BlockType, BlockMatrix } from "../types";

/**
 * Generates procedural terrain using height maps and block matrices.
 */
export class TerrainGenerator {
  private readonly width: number;
  private readonly depth: number;

  public mapMatrix: BlockMatrix = [];
  public heightMap: number[] = [];

  constructor(width: number = BLOCKS_COUNT, depth: number = LAYERS) {
    this.width = width;
    this.depth = depth;
  }

  /**
   * Generates the complete terrain and returns the block matrix.
   */
  generate(): BlockMatrix {
    this.mapMatrix = this.initializeMatrix();
    this.heightMap = this.generateHeightMap();
    this.populateBlockMatrix(this.heightMap);
    return this.mapMatrix;
  }

  private initializeMatrix(): BlockMatrix {
    const matrix: BlockMatrix = [];
    for (let x = 0; x < this.width; x++) {
      matrix[x] = new Array(this.depth).fill(null);
    }
    return matrix;
  }

  private generateHeightMap(): number[] {
    const heightMap: number[] = [];

    for (let x = 0; x < this.width; x++) {
      let heightAboveBase = 0;

      // Large scale variation (mountains)
      const mountainNoise = Math.sin(x * 0.08) * 0.6 + Math.sin(x * 0.04) * 0.4;
      heightAboveBase += mountainNoise * 18;

      // Add occasional peaks
      if (Math.random() < 0.04) {
        const peakHeight = 12 + Math.random() * 25;
        heightAboveBase += peakHeight;
      }

      // Medium scale variation (hills)
      const hillNoise = Math.sin(x * 0.2) * 0.4 + Math.sin(x * 0.9) * 0.3;
      heightAboveBase += hillNoise * 5;

      // Small scale variation (roughness)
      const roughness = (Math.random() - 0.5) * 1.2;
      heightAboveBase += roughness;

      // Clamp height
      heightAboveBase = Math.max(
        0,
        Math.min(MAX_MOUNTAIN_HEIGHT, Math.floor(heightAboveBase)),
      );
      heightMap[x] = heightAboveBase;
    }

    return this.smoothHeightMap(heightMap);
  }

  private smoothHeightMap(heightMap: number[]): number[] {
    const smoothed = [...heightMap];
    const smoothingPasses = 2;

    for (let pass = 0; pass < smoothingPasses; pass++) {
      for (let x = 1; x < this.width - 1; x++) {
        const avg = (heightMap[x - 1] + heightMap[x] + heightMap[x + 1]) / 3;
        smoothed[x] = Math.floor(avg);
      }
      // Copy back for next pass
      for (let x = 1; x < this.width - 1; x++) {
        heightMap[x] = smoothed[x];
      }
    }

    return heightMap;
  }

  private populateBlockMatrix(heightMap: number[]): void {
    const maxHeight = Math.max(...heightMap);

    for (let x = 0; x < this.width; x++) {
      const mountainHeight = heightMap[x];
      const surfaceMatrixY = maxHeight - mountainHeight;
      const totalBlocks = mountainHeight + BASE_DEPTH;

      for (let y = 0; y < totalBlocks && surfaceMatrixY + y < this.depth; y++) {
        const matrixY = surfaceMatrixY + y;
        if (matrixY >= 0) {
          this.mapMatrix[x][matrixY] = this.determineBlockType(y, totalBlocks);
        }
      }
    }
  }

  private determineBlockType(
    depthFromSurface: number,
    totalBlocks: number,
  ): BlockType {
    // Surface layer is grass
    if (depthFromSurface === 0) {
      return "grass_block";
    }

    // First few layers below surface are dirt
    if (depthFromSurface <= 3) {
      return "dirt_block";
    }

    // Deeper layers: mix of dirt and stone, more stone deeper down
    const depthRatio = depthFromSurface / totalBlocks;
    const stoneChance = Math.min(0.7, depthRatio * 1.5);

    if (Math.random() < stoneChance) {
      return "stone_block";
    }

    return "dirt_block";
  }

  /**
   * Gets the block type at world coordinates.
   */
  getBlockType(worldX: number, worldY: number): BlockType | null {
    const matrixX =
      Math.floor(worldX / BLOCK_SIZE) + Math.floor(this.width / 2);
    const matrixY = worldY;

    if (
      matrixX < 0 ||
      matrixX >= this.width ||
      matrixY < 0 ||
      matrixY >= this.depth
    ) {
      return null;
    }

    return this.mapMatrix[matrixX]?.[matrixY] ?? null;
  }

  /**
   * Sets the block type at world coordinates.
   */
  setBlockType(
    worldX: number,
    worldY: number,
    blockType: BlockType | null,
  ): void {
    const matrixX =
      Math.floor(worldX / BLOCK_SIZE) + Math.floor(this.width / 2);
    const matrixY = worldY;

    if (
      matrixX >= 0 &&
      matrixX < this.width &&
      matrixY >= 0 &&
      matrixY < this.depth
    ) {
      if (!this.mapMatrix[matrixX]) {
        this.mapMatrix[matrixX] = [];
      }
      this.mapMatrix[matrixX][matrixY] = blockType;
    }
  }

  getWidth(): number {
    return this.width;
  }

  getDepth(): number {
    return this.depth;
  }
}
