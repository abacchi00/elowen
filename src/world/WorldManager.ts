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

        this.blocks.add(block);
        block.setupPhysics();

        // Spawn trees on grass blocks
        if (blockType === "grass_block" && Math.random() < TREE_SPAWN_CHANCE) {
          this.createTree(worldPos.x, worldPos.y, block.depth);
        }
      }
    }
  }

  private createBlock(x: number, y: number, type: BlockType): Block {
    return this.blockFactory.create(x, y, type);
  }

  private createTree(worldX: number, worldY: number, blockDepth: number): void {
    const tree = new Tree(this.scene, worldX, worldY - BLOCK_SIZE / 2);
    tree.setDepth(blockDepth - 1);
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

    // Update matrix
    this.mapMatrix[block.matrixX][block.matrixY] = null;

    // Remove from physics group
    this.blocks.remove(block, true, true);

    // Destroy the block
    block.mine();

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
