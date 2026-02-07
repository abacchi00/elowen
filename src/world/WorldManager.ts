import Phaser from "phaser";
import {
  BLOCK_SIZE,
  WORLD_WIDTH_BLOCKS,
  GROUND_Y,
  TREE_SPAWN_CHANCE,
  WORLD_HEIGHT_BLOCKS,
} from "../config/constants";
import {
  BlockType,
  BlockMatrix,
  GameSounds,
  Position,
  MatrixPosition,
} from "../types";
import { BlockFactory } from "../blocks";
import { Tree, ItemDrop } from "../entities";
import { TerrainGenerator } from "../terrain";
import { Block } from "@/blocks/Block";
import { ItemType } from "../types";

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
  private droppedItems: Phaser.GameObjects.Group;
  private blockFactory: BlockFactory;

  // Terrain info
  private maxHeight: number = 0;

  // TODO: Use sounds for stone blocks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(scene: Phaser.Scene, _sounds: GameSounds | null) {
    this.scene = scene;
    this.blocks = scene.physics.add.staticGroup();
    this.trees = scene.add.group();
    this.droppedItems = scene.add.group();

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
        const matrixPosition = { matrixX, matrixY };
        const blockType = this.mapMatrix[matrixX][matrixY];
        if (!blockType) continue;

        const worldPos = this.matrixToWorld(matrixPosition);
        const block = this.blockFactory.create({
          position: this.matrixToWorld(matrixPosition),
          matrixPosition: { matrixX, matrixY },
          type: blockType,
          neighbours: this.blockAt({ matrixX, matrixY }).getNeighbours(),
        });

        this.addBlock(block);

        if (blockType === "grass_block" && Math.random() < TREE_SPAWN_CHANCE) {
          this.createTree(worldPos.x, worldPos.y, block.depth);
        }
      }
    }
  }

  private addBlock(block: Block): void {
    this.blocks.add(block);
    this.blockMap.set(
      `${block.matrixPosition.matrixX},${block.matrixPosition.matrixY}`,
      block,
    );
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
  matrixToWorld({ matrixX, matrixY }: MatrixPosition): Position {
    const worldX =
      (matrixX - Math.floor(WORLD_WIDTH_BLOCKS / 2)) * BLOCK_SIZE +
      BLOCK_SIZE / 2;
    const worldY =
      GROUND_Y - (this.maxHeight - matrixY) * BLOCK_SIZE + BLOCK_SIZE / 2;
    return { x: worldX, y: worldY };
  }

  /**
   * Converts world coordinates to matrix coordinates.
   */
  worldToMatrix(worldX: number, worldY: number): MatrixPosition {
    const matrixX =
      Math.floor(worldX / BLOCK_SIZE) + Math.floor(WORLD_WIDTH_BLOCKS / 2);
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
  getBlockAt({ matrixX, matrixY }: MatrixPosition): Block | null {
    return this.blockMap.get(`${matrixX},${matrixY}`) ?? null;
  }

  blockAt({ matrixX, matrixY }: MatrixPosition): {
    hasNeighbours: () => boolean;
    hasLeftNeighbour: () => boolean;
    hasRightNeighbour: () => boolean;
    hasTopNeighbour: () => boolean;
    hasBottomNeighbour: () => boolean;
    getNeighbours: () => {
      left: boolean;
      right: boolean;
      top: boolean;
      bottom: boolean;
    };
    getNeighboursCoordinates: () => {
      left: MatrixPosition | null;
      right: MatrixPosition | null;
      top: MatrixPosition | null;
      bottom: MatrixPosition | null;
    };
  } {
    const hasLeftNeighbour = () =>
      matrixX !== 0 && !!this.mapMatrix[matrixX - 1][matrixY];
    const hasRightNeighbour = () =>
      matrixX !== WORLD_WIDTH_BLOCKS - 1 &&
      !!this.mapMatrix[matrixX + 1][matrixY];
    const hasTopNeighbour = () =>
      matrixY !== 0 && !!this.mapMatrix[matrixX][matrixY - 1];
    const hasBottomNeighbour = () =>
      matrixY !== WORLD_HEIGHT_BLOCKS - 1 &&
      !!this.mapMatrix[matrixX][matrixY + 1];
    const hasNeighbours = () =>
      hasLeftNeighbour() ||
      hasRightNeighbour() ||
      hasTopNeighbour() ||
      hasBottomNeighbour();
    const getNeighbours = () => {
      return {
        left: hasLeftNeighbour(),
        right: hasRightNeighbour(),
        top: hasTopNeighbour(),
        bottom: hasBottomNeighbour(),
      };
    };
    const getNeighboursCoordinates = () => {
      return {
        left: hasLeftNeighbour() ? { matrixX: matrixX - 1, matrixY } : null,
        right: hasRightNeighbour() ? { matrixX: matrixX + 1, matrixY } : null,
        top: hasTopNeighbour() ? { matrixX, matrixY: matrixY - 1 } : null,
        bottom: hasBottomNeighbour() ? { matrixX, matrixY: matrixY + 1 } : null,
      };
    };

    return {
      hasNeighbours,
      hasLeftNeighbour,
      hasRightNeighbour,
      hasTopNeighbour,
      hasBottomNeighbour,
      getNeighbours,
      getNeighboursCoordinates,
    };
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
  placeBlock(matrixPosition: MatrixPosition, type: BlockType): Block | null {
    if (!this.canPlaceAt(matrixPosition)) return null;

    const position = this.matrixToWorld(matrixPosition);

    const block = this.blockFactory.create({
      position,
      matrixPosition,
      type,
      neighbours: this.blockAt(matrixPosition).getNeighbours(),
    });

    this.addBlock(block);

    this.mapMatrix[matrixPosition.matrixX][matrixPosition.matrixY] = type;

    const { left, right, top, bottom } =
      this.blockAt(matrixPosition).getNeighboursCoordinates();

    const leftBlock = left ? this.getBlockAt(left) : null;
    const rightBlock = right ? this.getBlockAt(right) : null;
    const topBlock = top ? this.getBlockAt(top) : null;
    const bottomBlock = bottom ? this.getBlockAt(bottom) : null;

    leftBlock?.updateNeighbours({ right: true });
    rightBlock?.updateNeighbours({ left: true });
    topBlock?.updateNeighbours({ bottom: true });
    bottomBlock?.updateNeighbours({ top: true });

    return block;
  }

  remove(target: Block | Tree): void {
    if (target instanceof Block) {
      this.removeBlock(target);
    } else if (target instanceof Tree) {
      this.removeTree(target);
    }
  }

  /**
   * Removes a block from the world.
   */
  private removeBlock(block: Block): void {
    const minedMatrixX = block.matrixPosition.matrixX;
    const minedMatrixY = block.matrixPosition.matrixY;

    // Update neighbours
    const { left, right, top, bottom } = this.blockAt(
      block.matrixPosition,
    ).getNeighboursCoordinates();

    const leftBlock = left ? this.getBlockAt(left) : null;
    const rightBlock = right ? this.getBlockAt(right) : null;
    const topBlock = top ? this.getBlockAt(top) : null;
    const bottomBlock = bottom ? this.getBlockAt(bottom) : null;

    leftBlock?.updateNeighbours({ right: false });
    rightBlock?.updateNeighbours({ left: false });
    topBlock?.updateNeighbours({ bottom: false });
    bottomBlock?.updateNeighbours({ top: false });

    // Update matrix
    this.mapMatrix[minedMatrixX][minedMatrixY] = null;

    // Remove from physics group and block map
    this.blocks.remove(block, true, true);
    this.blockMap.delete(
      `${block.matrixPosition.matrixX},${block.matrixPosition.matrixY}`,
    );

    // Destroy the block
    block.mine();
  }

  /**
   * Removes a tree from the world.
   */
  private removeTree(tree: Tree): void {
    this.trees.remove(tree, true, true);
    tree.mine();
  }

  /**
   * Checks if a block can be placed at the given position.
   */
  canPlaceAt({ matrixX, matrixY }: MatrixPosition): boolean {
    // Check bounds
    if (matrixX < 0 || matrixX >= this.mapMatrix.length) return false;
    if (matrixY < 0 || matrixY >= this.mapMatrix[matrixX].length) return false;

    // Check if slot is empty
    if (this.mapMatrix[matrixX][matrixY] !== null) return false;

    // Check if there's an adjacent block
    return this.blockAt({ matrixX, matrixY }).hasNeighbours();
  }

  // ============================================================================
  // Item Management
  // ============================================================================

  /**
   * Drops an item at the specified world position.
   * Items will be attracted to each other and merge when close enough.
   */
  dropItem(
    worldX: number,
    worldY: number,
    itemType: ItemType,
    quantity: number = 1,
  ): void {
    // Always create a new item - items will attract to each other and merge
    const item = new ItemDrop(this.scene, worldX, worldY, itemType, quantity);
    this.droppedItems.add(item);
  }

  /**
   * Merges two items together, transferring quantity from source to target.
   * Returns true if merge was successful.
   */
  mergeItems(sourceItem: ItemDrop, targetItem: ItemDrop): boolean {
    if (!sourceItem.active || !targetItem.active) return false;
    if (sourceItem.itemType !== targetItem.itemType) return false;

    // Transfer quantity
    targetItem.quantity += sourceItem.quantity;

    // Remove and destroy source item
    this.removeDroppedItem(sourceItem);
    sourceItem.destroy();

    return true;
  }

  /**
   * Removes a dropped item from the world.
   */
  removeDroppedItem(item: ItemDrop): void {
    this.droppedItems.remove(item, true, true);
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

  getDroppedItems(): Phaser.GameObjects.Group {
    return this.droppedItems;
  }
}
