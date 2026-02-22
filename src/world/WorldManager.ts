import Phaser from "phaser";
import {
  BLOCK_SIZE,
  WORLD_WIDTH_BLOCKS,
  GROUND_Y,
  TREE_SPAWN_CHANCE,
  WORLD_HEIGHT_BLOCKS,
  MINEABLE_OUTLINE_COLOR,
  MINEABLE_OUTLINE_WIDTH,
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
import { BerryBush } from "@/entities/BerryBush";

/**
 * Manages the game world: terrain, blocks, trees, and coordinate conversions.
 */
export class WorldManager {
  private scene: Phaser.Scene;

  // Block data
  private mapMatrix: BlockMatrix = [];
  private blocks: Phaser.Physics.Arcade.StaticGroup;
  private blockMap: Map<string, Block> = new Map();
  private trees: Phaser.GameObjects.Group;
  private berryBushes: Phaser.GameObjects.Group;
  private blockFactory: BlockFactory;

  // Single shared Graphics for all block outlines
  private blockOutlines!: Phaser.GameObjects.Graphics;

  // Single shared Graphics for block hover highlight
  private hoverHighlight!: Phaser.GameObjects.Graphics;
  private lastHoveredBlock: Block | null = null;

  // Terrain info
  private maxHeight: number = 0;

  // TODO: Use sounds for stone blocks
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(scene: Phaser.Scene, _sounds: GameSounds | null) {
    this.scene = scene;
    this.blocks = scene.physics.add.staticGroup();
    this.trees = scene.add.group();
    this.berryBushes = scene.add.group();

    this.blockFactory = new BlockFactory(scene);
    this.blockOutlines = scene.add.graphics();
    this.blockOutlines.setDepth(1);

    this.hoverHighlight = scene.add.graphics();
    this.hoverHighlight.setDepth(2);
    this.hoverHighlight.setVisible(false);
  }

  // ============================================================================
  // Generation
  // ============================================================================

  generate(): void {
    const generator = new TerrainGenerator();
    this.mapMatrix = generator.generate();
    this.maxHeight = Math.max(...generator.heightMap);

    this.createBlocksFromMatrix();
    this.drawBlockOutlines();
  }

  private isEntityNearby(
    matrixX: number,
    positions: { matrixX: number; matrixY: number }[],
    minDistance: number,
  ): boolean {
    return positions.some(
      pos => Math.abs(pos.matrixX - matrixX) <= minDistance,
    );
  }

  private createBlocksFromMatrix(): void {
    const bushPositions: { matrixX: number; matrixY: number }[] = [];
    const treePositions: { matrixX: number; matrixY: number }[] = [];
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

        if (
          blockType === "grass_block" &&
          !this.isEntityNearby(matrixX, treePositions, 2) &&
          Math.random() < TREE_SPAWN_CHANCE
        ) {
          this.createTree(worldPos.x, worldPos.y, block.depth);
          treePositions.push({ matrixX, matrixY });
        }

        // TODO: Move to constants
        const BERRY_BUSH_SPAWN_CHANCE = 0.1;

        if (
          blockType === "grass_block" &&
          !this.mapMatrix[matrixX - 1]?.[matrixY - 1] &&
          !this.mapMatrix[matrixX + 1]?.[matrixY - 1] &&
          !!this.mapMatrix[matrixX - 1]?.[matrixY] &&
          !!this.mapMatrix[matrixX + 1]?.[matrixY] &&
          !this.isEntityNearby(matrixX, bushPositions, 2) &&
          Math.random() < BERRY_BUSH_SPAWN_CHANCE
        ) {
          this.createBerryBush(worldPos.x, worldPos.y, block.depth);
          bushPositions.push({ matrixX, matrixY });
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
    const randomZOffset = (Math.random() - 0.5) * 1;
    tree.setDepth(blockDepth - 1 + randomZOffset);
    this.trees.add(tree);
  }

  private createBerryBush(
    worldX: number,
    worldY: number,
    blockDepth: number,
  ): void {
    const berryBush = new BerryBush(this.scene, worldX, worldY);
    berryBush.setDepth(blockDepth);
    this.berryBushes.add(berryBush);
  }

  // ============================================================================
  // Block Outlines
  // ============================================================================

  drawBlockOutlines(): void {
    this.blockOutlines.clear();
    this.blockOutlines.lineStyle(2, 0x111111, 1);

    const halfSize = BLOCK_SIZE / 2;

    for (const block of this.blockMap.values()) {
      if (!block.active) continue;

      const { x, y } = block;
      const { left, right, top, bottom } = block.neighbours;

      if (!top) {
        this.blockOutlines.lineBetween(
          x - halfSize,
          y - halfSize,
          x + halfSize,
          y - halfSize,
        );
      }
      if (!bottom) {
        this.blockOutlines.lineBetween(
          x - halfSize,
          y + halfSize,
          x + halfSize,
          y + halfSize,
        );
      }
      if (!left) {
        this.blockOutlines.lineBetween(
          x - halfSize,
          y + halfSize,
          x - halfSize,
          y - halfSize,
        );
      }
      if (!right) {
        this.blockOutlines.lineBetween(
          x + halfSize,
          y + halfSize,
          x + halfSize,
          y - halfSize,
        );
      }
    }
  }

  // ============================================================================
  // Coordinate Conversions
  // ============================================================================

  matrixToWorld({ matrixX, matrixY }: MatrixPosition): Position {
    const worldX =
      (matrixX - Math.floor(WORLD_WIDTH_BLOCKS / 2)) * BLOCK_SIZE +
      BLOCK_SIZE / 2;
    const worldY =
      GROUND_Y - (this.maxHeight - matrixY) * BLOCK_SIZE + BLOCK_SIZE / 2;
    return { x: worldX, y: worldY };
  }

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

  hasBlockAt(matrixX: number, matrixY: number): boolean {
    if (matrixX < 0 || matrixX >= this.mapMatrix.length) return false;
    if (matrixY < 0 || matrixY >= this.mapMatrix[matrixX].length) return false;
    return this.mapMatrix[matrixX][matrixY] !== null;
  }

  findBlockAtWorld(worldX: number, worldY: number): Block | null {
    const { matrixX, matrixY } = this.worldToMatrix(worldX, worldY);
    const block = this.getBlockAt({ matrixX, matrixY });
    return block?.active ? block : null;
  }

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

  findBerryBushAtWorld(worldX: number, worldY: number): BerryBush | null {
    let foundBush: BerryBush | null = null;

    this.berryBushes.children.each(child => {
      const bush = child as BerryBush;
      if (bush.active) {
        const bounds = bush.getBounds();
        if (bounds.contains(worldX, worldY)) {
          foundBush = bush;
        }
      }
      return true;
    });

    return foundBush;
  }

  // ============================================================================
  // Block Modifications
  // ============================================================================

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

    this.drawBlockOutlines();

    return block;
  }

  remove(target: Block | Tree | BerryBush): void {
    if (target instanceof Block) {
      this.removeBlock(target);
    } else if (target instanceof Tree) {
      this.removeTree(target);
    } else if (target instanceof BerryBush) {
      this.removeBerryBush(target);
    }
  }

  private removeBlock(block: Block): void {
    const minedMatrixX = block.matrixPosition.matrixX;
    const minedMatrixY = block.matrixPosition.matrixY;

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

    this.mapMatrix[minedMatrixX][minedMatrixY] = null;

    this.blocks.remove(block, true, true);
    this.blockMap.delete(
      `${block.matrixPosition.matrixX},${block.matrixPosition.matrixY}`,
    );

    block.mine();

    this.drawBlockOutlines();
  }

  private removeTree(tree: Tree): void {
    this.trees.remove(tree, true, true);
    tree.mine();
  }

  private removeBerryBush(bush: BerryBush): void {
    this.berryBushes.remove(bush, true, true);
    bush.mine();
  }

  canPlaceAt({ matrixX, matrixY }: MatrixPosition): boolean {
    if (matrixX < 0 || matrixX >= this.mapMatrix.length) return false; // Check if the block is out of bounds
    if (matrixY < 0 || matrixY >= this.mapMatrix[matrixX].length) return false; // Check if the block is out of bounds
    if (this.mapMatrix[matrixX][matrixY] !== null) return false; // Check if the block is already occupied

    const { x, y } = this.matrixToWorld({ matrixX, matrixY });

    const SAFETY_MARGIN = 1;

    const bodies = this.scene.physics.overlapRect(
      x - BLOCK_SIZE / 2 + SAFETY_MARGIN,
      y - BLOCK_SIZE / 2 + SAFETY_MARGIN,
      BLOCK_SIZE - SAFETY_MARGIN * 2,
      BLOCK_SIZE - SAFETY_MARGIN * 2,
    );

    if (bodies.length > 0) return false; // Check if the block is blocked by bodies

    return this.blockAt({ matrixX, matrixY }).hasNeighbours();
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

  /**
   * Returns the world-Y of the highest terrain surface across a horizontal span
   * centered at worldX. Checks all columns the body could overlap so mobs
   * never spawn inside a mountain slope.
   */
  getSurfaceWorldY(worldX: number, bodyWidth: number = BLOCK_SIZE * 3): number {
    const halfWidth = Math.ceil(bodyWidth / 2);
    let highestSurfaceY = Infinity;

    for (let dx = -halfWidth; dx <= halfWidth; dx += BLOCK_SIZE) {
      const matrixX =
        Math.floor((worldX + dx) / BLOCK_SIZE) +
        Math.floor(WORLD_WIDTH_BLOCKS / 2);

      if (matrixX < 0 || matrixX >= this.mapMatrix.length) continue;

      for (
        let matrixY = 0;
        matrixY < this.mapMatrix[matrixX].length;
        matrixY++
      ) {
        if (this.mapMatrix[matrixX][matrixY] !== null) {
          const topEdgeY =
            this.matrixToWorld({ matrixX, matrixY }).y - BLOCK_SIZE / 2;
          highestSurfaceY = Math.min(highestSurfaceY, topEdgeY);
          break;
        }
      }
    }

    return highestSurfaceY === Infinity ? 0 : highestSurfaceY;
  }

  getMatrix(): BlockMatrix {
    return this.mapMatrix;
  }

  // ============================================================================
  // Hover Highlight
  // ============================================================================

  updateHoverHighlight(): void {
    const pointer = this.scene.input.activePointer;
    const cam = this.scene.cameras.main;
    const worldX = pointer.x / cam.zoom + cam.scrollX;
    const worldY = pointer.y / cam.zoom + cam.scrollY;

    const block = this.findBlockAtWorld(worldX, worldY);

    if (!block) {
      this.hoverHighlight.setVisible(false);
      this.lastHoveredBlock = null;
      return;
    }

    if (block !== this.lastHoveredBlock) {
      this.lastHoveredBlock = block;
      this.hoverHighlight.clear();
      this.hoverHighlight.lineStyle(
        MINEABLE_OUTLINE_WIDTH,
        MINEABLE_OUTLINE_COLOR,
        1,
      );
      this.hoverHighlight.strokeRect(
        -BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
        BLOCK_SIZE,
        BLOCK_SIZE,
      );
    }

    this.hoverHighlight.setPosition(block.x, block.y);
    const scaleRatio = block.displayWidth / BLOCK_SIZE;
    this.hoverHighlight.setScale(scaleRatio);
    this.hoverHighlight.setDepth(block.depth + 1);
    this.hoverHighlight.setVisible(true);
  }
}
