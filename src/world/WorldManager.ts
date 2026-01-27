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
import { BlockFactory } from "../blocks";
import { Tree } from "../entities";
import { TerrainGenerator } from "../terrain";
import { Block } from "@/blocks/Block";

/**
 * Manages the game world: terrain, blocks, and coordinate conversions.
 * Centralizes all world-related operations.
 */
export class WorldManager {
  private scene: Phaser.Scene;

  // Block data
  private mapMatrix: BlockMatrix = [];
  private blocks: Phaser.Physics.Arcade.StaticGroup;
  private blockMap: Map<string, Block> = new Map(); // matrixX,matrixY -> Block
  private trees: Phaser.GameObjects.Group;
  private blockFactory: BlockFactory;

  // Terrain info
  private maxHeight: number = 0;

  // TODO: Use sounds for stone blocks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(scene: Phaser.Scene, _sounds: GameSounds | null) {
    this.scene = scene;
    this.blocks = scene.physics.add.staticGroup();
    this.trees = scene.add.group();

    this.blockFactory = new BlockFactory(scene);
  }

  /**
   * Generates and creates the world terrain.
   */
  generate(): void {
    const generator = new TerrainGenerator();
    this.mapMatrix = generator.generate();
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

        const hasBlockLeft = this.hasBlockAt(matrixX - 1, matrixY);
        const hasBlockRight = this.hasBlockAt(matrixX + 1, matrixY);

        const worldPos = this.matrixToWorld(matrixX, matrixY);
        const slope = this.getSlopeType(hasBlockLeft, hasBlockRight);
        const block = this.blockFactory.create(
          worldPos,
          { x: matrixX, y: matrixY },
          blockType,
          slope,
        );

        this.addBlock(block);

        if (blockType === "grass_block" && Math.random() < TREE_SPAWN_CHANCE) {
          this.createTree(worldPos.x, worldPos.y, block.depth);
        }
      }
    }
  }

  private getSlopeType(
    hasBlockLeft: boolean,
    hasBlockRight: boolean,
  ): "left" | "right" | "both" | "none" {
    if (hasBlockLeft && hasBlockRight) return "none";
    if (hasBlockLeft) return "right";
    if (hasBlockRight) return "left";
    return "both";
  }

  private addBlock(block: Block): void {
    this.blocks.add(block);
    this.blockMap.set(
      `${block.matrixPosition.x},${block.matrixPosition.y}`,
      block,
    );
  }

  private removeBlockFromMap(block: Block): void {
    this.blockMap.delete(`${block.matrixPosition.x},${block.matrixPosition.y}`);
  }

  private createBlock(
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    type: BlockType,
    slope: "left" | "right" | "both" | "none",
  ): Block {
    return this.blockFactory.create(position, matrixPosition, type, slope);
  }

  private createTree(worldX: number, worldY: number, blockDepth: number): void {
    const tree = new Tree(this.scene, worldX, worldY - BLOCK_SIZE / 2);
    // Add random Z position variation (-0.5 to 0.5) for depth layering
    const randomZOffset = (Math.random() - 0.5) * 1;
    tree.setDepth(blockDepth - 1 + randomZOffset);
    this.trees.add(tree);
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
    return this.blockMap.get(`${matrixX},${matrixY}`) ?? null;
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
    for (const block of this.blockMap.values()) {
      if (block.active) {
        const bounds = block.getBounds();
        if (bounds.contains(worldX, worldY)) {
          return block;
        }
      }
    }
    return null;
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
    const hasBlockLeft = this.hasBlockAt(matrixX - 1, matrixY);
    const hasBlockRight = this.hasBlockAt(matrixX + 1, matrixY);
    const slope = this.getSlopeType(hasBlockLeft, hasBlockRight);

    const block = this.createBlock(
      { x: worldPos.x, y: worldPos.y },
      { x: matrixX, y: matrixY },
      type,
      slope,
    );

    this.addBlock(block);
    block.setupPhysics();

    this.mapMatrix[matrixX][matrixY] = type;

    return block;
  }

  /**
   * Removes a block from the world.
   */
  removeBlock(block: Block): BlockType | null {
    const blockType = block.config.type;

    const minedMatrixX = block.matrixPosition.x;
    const minedMatrixY = block.matrixPosition.y;

    // Update matrix
    this.mapMatrix[minedMatrixX][minedMatrixY] = null;

    // Remove from physics group and block map
    this.blocks.remove(block, true, true);
    this.removeBlockFromMap(block);

    // Destroy the block
    block.mine();

    return blockType;
  }

  /**
   * Removes a tree from the world.
   */
  removeTree(tree: Tree): void {
    this.trees.remove(tree, true, true);
    tree.mine();
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
