import Phaser from "phaser";
import {
  BLOCK_SIZE,
  BLOCKS_COUNT,
  GROUND_Y,
  TREE_SPAWN_CHANCE,
} from "../config/constants";
import {
  BlockType,
  BlockMatrix,
  GameSounds,
  Position,
  MatrixPosition,
} from "../types";
import { Block, BlockFactory } from "../blocks";
import { Tree } from "../entities";
import { TerrainGenerator } from "../terrain";

/**
 * Manages the game world: terrain, blocks, and coordinate conversions.
 * Centralizes all world-related operations.
 */
export class WorldManager {
  private scene: Phaser.Scene;

  // Block data
  private mapMatrix: BlockMatrix = [];
  private blocks: Phaser.Physics.Arcade.StaticGroup;
  private trees: Phaser.GameObjects.Group;
  private blockFactory: BlockFactory;

  // Terrain info
  private maxHeight: number = 0;
  private heightMap: number[] = [];

  constructor(scene: Phaser.Scene, sounds: GameSounds | null) {
    this.scene = scene;
    this.blocks = scene.physics.add.staticGroup();
    this.trees = scene.add.group();

    this.blockFactory = new BlockFactory(scene, sounds);
  }

  /**
   * Generates and creates the world terrain.
   */
  generate(): void {
    const generator = new TerrainGenerator();
    this.mapMatrix = generator.generate();
    this.heightMap = generator.heightMap;
    this.maxHeight = Math.max(...generator.heightMap);

    this.createBlocksFromMatrix();
  }

  private createBlocksFromMatrix(): void {
    for (let matrixX = 0; matrixX < this.mapMatrix.length; matrixX++) {
      for (
        let matrixY = 0;
        matrixY < this.mapMatrix[matrixX].length;
        matrixY++
      ) {
        const blockType = this.mapMatrix[matrixX][matrixY];
        if (!blockType) continue;

        const worldPos = this.matrixToWorld(matrixX, matrixY);
        const block = this.createBlock(worldPos.x, worldPos.y, blockType);

        block.matrixX = matrixX;
        block.matrixY = matrixY;

        // Update slope variant for blocks that have slope variants
        this.updateBlockSlopeVariant(block, matrixX, matrixY);

        // Apply darkening based on distance from ground
        this.applyDistanceDarkening(block, matrixX, matrixY);

        this.blocks.add(block);
        block.setupPhysics();

        if (
          blockType === "grass_block" &&
          !block.isSlope() &&
          Math.random() < TREE_SPAWN_CHANCE
        ) {
          this.createTree(worldPos.x, worldPos.y, block.depth);
        }
      }
    }
  }

  /**
   * Updates a block's slope variant based on neighboring blocks.
   */
  private updateBlockSlopeVariant(
    block: Block,
    matrixX: number,
    matrixY: number,
  ): void {
    if (!block.hasSlopeVariants()) return;

    const hasBlockLeft = this.hasBlockAt(matrixX - 1, matrixY);
    const hasBlockRight = this.hasBlockAt(matrixX + 1, matrixY);

    block.updateSlopeVariant(hasBlockLeft, hasBlockRight);
  }

  private createBlock(x: number, y: number, type: BlockType): Block {
    return this.blockFactory.create(x, y, type);
  }

  private createTree(worldX: number, worldY: number, blockDepth: number): void {
    const tree = new Tree(this.scene, worldX, worldY - BLOCK_SIZE / 2);
    // Add random Z position variation (-0.5 to 0.5) for depth layering
    const randomZOffset = (Math.random() - 0.5) * 1;
    tree.setDepth(blockDepth - 1 + randomZOffset);
    this.trees.add(tree);
  }

  /**
   * Updates darkening for blocks in a column after a block change (mine or place).
   */
  private updateDarkeningAfterBlockChange(
    matrixX: number,
    matrixY: number,
  ): void {
    // Update all blocks within the search range since darkening considers neighbors
    // The search range is 10 blocks, so update all blocks within that range
    const searchRange = 10;

    for (let x = matrixX - searchRange; x <= matrixX + searchRange; x++) {
      // Check if position is valid
      if (x < 0 || x >= this.mapMatrix.length || !this.mapMatrix[x]) {
        continue;
      }

      // Update all blocks in this column that are below the changed position
      // Only check blocks that could be affected (around the change point and below)
      const startY = Math.max(0, matrixY - 5);
      const endY = this.mapMatrix[x].length;

      for (let y = startY; y < endY; y++) {
        const blockAtPos = this.getBlockAt(x, y);
        if (blockAtPos) {
          // Recalculate and apply darkening
          this.applyDistanceDarkening(blockAtPos, x, y);
        }
      }
    }
  }

  /**
   * Gets the current surface level (topmost block) for a given x position.
   */
  private getSurfaceLevel(matrixX: number): number {
    // Find the topmost block at this x position
    if (
      matrixX < 0 ||
      matrixX >= this.mapMatrix.length ||
      !this.mapMatrix[matrixX]
    ) {
      return -1;
    }

    for (let y = 0; y < this.mapMatrix[matrixX].length; y++) {
      if (this.mapMatrix[matrixX][y] !== null) {
        return y;
      }
    }

    // No blocks found, use original height map
    const mountainHeight = this.heightMap[matrixX] || 0;
    return this.maxHeight - mountainHeight;
  }

  /**
   * Finds the nearest surface block considering both X and Y distance.
   */
  private getNearestSurfaceDistance(
    matrixX: number,
    matrixY: number,
    searchRange: number = 10,
  ): number {
    // First check: if this block is at or above the surface in its own column, distance is 0
    const ownSurfaceY = this.getSurfaceLevel(matrixX);
    if (ownSurfaceY !== -1 && matrixY <= ownSurfaceY) {
      return 0;
    }

    let minDistance = Infinity;

    // Search nearby columns for the closest surface
    for (let x = matrixX - searchRange; x <= matrixX + searchRange; x++) {
      if (x < 0 || x >= this.mapMatrix.length || !this.mapMatrix[x]) {
        continue;
      }

      const surfaceY = this.getSurfaceLevel(x);
      if (surfaceY === -1) continue;

      // Calculate distance for semi-circular light pattern (light comes from above)
      // Use weighted distance: horizontal distance contributes more, creating semi-circle
      const deltaX = Math.abs(x - matrixX);
      const deltaY = matrixY - surfaceY;

      // Only consider blocks below the surface (light travels downward)
      if (deltaY > 0) {
        // Weighted distance: horizontal distance has more weight to create semi-circular pattern
        // Formula: sqrt(deltaX^2 * 1.5 + deltaY^2) creates a semi-elliptical pattern
        const distance = Math.sqrt(deltaX * deltaX * 1.5 + deltaY * deltaY);
        minDistance = Math.min(minDistance, distance);
      }
    }

    return minDistance === Infinity ? 0 : minDistance;
  }

  /**
   * Applies darkening to blocks based on their distance from the nearest surface.
   */
  private applyDistanceDarkening(
    block: Block,
    matrixX: number,
    matrixY: number,
  ): void {
    // Calculate distance to nearest surface considering both X and Y
    const distanceFromGround = this.getNearestSurfaceDistance(matrixX, matrixY);

    // Clear any existing tint first
    block.clearTint();

    // No darkening for blocks within 3 blocks of the ground
    if (distanceFromGround > 3) {
      // Normalize distance starting from 3 (range: 0 to 1)
      const normalizedDistance = Math.min((distanceFromGround - 3) / 20, 1);

      // Smooth easing curve using smoothstep function for smoother transition
      // smoothstep: 3t^2 - 2t^3
      const smoothFactor =
        3 * normalizedDistance * normalizedDistance -
        2 * normalizedDistance * normalizedDistance * normalizedDistance;

      // Darken from 100% brightness (0xffffff) to 0% brightness (0x000000 - completely black)
      const brightness = 1 - smoothFactor;
      const tint = Math.floor(brightness * 255);

      // Apply tint: 0xRRGGBB where all components are the same for grayscale
      const tintColor = (tint << 16) | (tint << 8) | tint; // Convert to RGB
      block.setTint(tintColor);
    }
  }

  // ============================================================================
  // Coordinate Conversions
  // ============================================================================

  /**
   * Converts matrix coordinates to world coordinates.
   */
  matrixToWorld(matrixX: number, matrixY: number): Position {
    const worldX =
      (matrixX - Math.floor(BLOCKS_COUNT / 2)) * BLOCK_SIZE + BLOCK_SIZE / 2;
    const worldY =
      GROUND_Y - (this.maxHeight - matrixY) * BLOCK_SIZE + BLOCK_SIZE / 2;
    return { x: worldX, y: worldY };
  }

  /**
   * Converts world coordinates to matrix coordinates.
   */
  worldToMatrix(worldX: number, worldY: number): MatrixPosition {
    const matrixX =
      Math.floor(worldX / BLOCK_SIZE) + Math.floor(BLOCKS_COUNT / 2);
    const matrixY =
      this.maxHeight + Math.floor((worldY - GROUND_Y) / BLOCK_SIZE);
    return { matrixX, matrixY };
  }

  // ============================================================================
  // Block Queries
  // ============================================================================

  /**
   * Gets the block at the given matrix position.
   */
  getBlockAt(matrixX: number, matrixY: number): Block | null {
    const children = this.blocks.getChildren() as Block[];
    return (
      children.find(b => b.matrixX === matrixX && b.matrixY === matrixY) || null
    );
  }

  /**
   * Checks if there's a block at the given matrix position.
   */
  hasBlockAt(matrixX: number, matrixY: number): boolean {
    if (matrixX < 0 || matrixX >= this.mapMatrix.length) return false;
    if (matrixY < 0 || matrixY >= this.mapMatrix[matrixX].length) return false;
    return this.mapMatrix[matrixX][matrixY] !== null;
  }

  /**
   * Finds a block at world coordinates.
   */
  findBlockAtWorld(worldX: number, worldY: number): Block | null {
    let foundBlock: Block | null = null;

    this.blocks.children.each(child => {
      const block = child as Block;
      if (block.active) {
        const bounds = block.getBounds();
        if (bounds.contains(worldX, worldY)) {
          foundBlock = block;
        }
      }
      return true;
    });

    return foundBlock;
  }

  /**
   * Finds a tree at world coordinates.
   */
  findTreeAtWorld(worldX: number, worldY: number): Tree | null {
    let foundTree: Tree | null = null;

    this.trees.children.each(child => {
      const tree = child as Tree;
      if (tree.active) {
        const bounds = tree.getBounds();
        if (bounds.contains(worldX, worldY)) {
          foundTree = tree;
        }
      }
      return true;
    });

    return foundTree;
  }

  // ============================================================================
  // Block Modifications
  // ============================================================================

  /**
   * Places a block at the given matrix position.
   */
  placeBlock(matrixX: number, matrixY: number, type: BlockType): Block | null {
    if (!this.canPlaceAt(matrixX, matrixY)) return null;

    const worldPos = this.matrixToWorld(matrixX, matrixY);
    const block = this.createBlock(worldPos.x, worldPos.y, type);

    block.matrixX = matrixX;
    block.matrixY = matrixY;

    this.blocks.add(block);
    block.setupPhysics();

    this.mapMatrix[matrixX][matrixY] = type;

    // Apply darkening to the newly placed block
    this.applyDistanceDarkening(block, matrixX, matrixY);

    // Update darkening for all blocks in the same column
    this.updateDarkeningAfterBlockChange(matrixX, matrixY);

    // Emit event
    this.scene.events.emit("block:placed", block);

    return block;
  }

  /**
   * Removes a block from the world.
   */
  removeBlock(block: Block): BlockType | null {
    const textureKey = block.texture.key;
    let blockType: BlockType | null = null;

    if (textureKey.startsWith("grass_block")) blockType = "grass_block";
    else if (textureKey.startsWith("dirt_block")) blockType = "dirt_block";
    else if (textureKey.startsWith("stone_block")) blockType = "stone_block";

    const minedMatrixX = block.matrixX;
    const minedMatrixY = block.matrixY;

    // Update matrix
    this.mapMatrix[minedMatrixX][minedMatrixY] = null;

    // Remove from physics group
    this.blocks.remove(block, true, true);

    // Destroy the block
    block.mine();

    // Update darkening for nearby blocks after mining
    this.updateDarkeningAfterBlockChange(minedMatrixX, minedMatrixY);

    // Emit event
    this.scene.events.emit("block:mined", block, blockType);

    return blockType;
  }

  /**
   * Removes a tree from the world.
   */
  removeTree(tree: Tree): void {
    this.trees.remove(tree, true, true);
    tree.mine();

    // Emit event
    this.scene.events.emit("tree:mined", tree);
  }

  /**
   * Checks if a block can be placed at the given position.
   */
  canPlaceAt(matrixX: number, matrixY: number): boolean {
    // Check bounds
    if (matrixX < 0 || matrixX >= this.mapMatrix.length) return false;
    if (matrixY < 0 || matrixY >= this.mapMatrix[matrixX].length) return false;

    // Check if slot is empty
    if (this.mapMatrix[matrixX][matrixY] !== null) return false;

    // Check if there's an adjacent block
    return (
      this.hasBlockAt(matrixX - 1, matrixY) ||
      this.hasBlockAt(matrixX + 1, matrixY) ||
      this.hasBlockAt(matrixX, matrixY - 1) ||
      this.hasBlockAt(matrixX, matrixY + 1)
    );
  }

  // ============================================================================
  // Getters
  // ============================================================================

  getBlocks(): Phaser.Physics.Arcade.StaticGroup {
    return this.blocks;
  }

  getTrees(): Phaser.GameObjects.Group {
    return this.trees;
  }

  getMaxHeight(): number {
    return this.maxHeight;
  }

  getMatrix(): BlockMatrix {
    return this.mapMatrix;
  }
}
