import Phaser from 'phaser';
import { BLOCK_SIZE, BLOCKS_COUNT, GROUND_Y } from '../config/constants';
import { BlockFactory } from '../blocks';
import { InventorySystem } from './InventorySystem';
import { CameraSystem } from './CameraSystem';
import { BlockType, BlockMatrix, GameSounds } from '../types';

/**
 * Handles block placement from inventory.
 * Right-click to place blocks.
 */
export class PlacementSystem {
  private scene: Phaser.Scene;
  private blocks: Phaser.Physics.Arcade.StaticGroup;
  private inventory: InventorySystem;
  private cameraSystem: CameraSystem;
  private mapMatrix: BlockMatrix;
  private blockFactory: BlockFactory;
  private maxHeight: number;
  private previewGraphics: Phaser.GameObjects.Graphics | null = null;

  constructor(
    scene: Phaser.Scene,
    blocks: Phaser.Physics.Arcade.StaticGroup,
    inventory: InventorySystem,
    cameraSystem: CameraSystem,
    mapMatrix: BlockMatrix,
    sounds: GameSounds | null,
    maxHeight: number
  ) {
    this.scene = scene;
    this.blocks = blocks;
    this.inventory = inventory;
    this.cameraSystem = cameraSystem;
    this.mapMatrix = mapMatrix;
    this.blockFactory = new BlockFactory(scene, sounds);
    this.maxHeight = maxHeight;

    this.setupInput();
    this.createPreviewGraphics();
  }

  private setupInput(): void {
    // Right-click to place
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.tryPlaceBlock(pointer);
      }
    });

    // Disable context menu
    this.scene.game.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  private createPreviewGraphics(): void {
    this.previewGraphics = this.scene.add.graphics();
    this.previewGraphics.setDepth(100);
  }

  update(): void {
    this.updatePreview();
  }

  private updatePreview(): void {
    if (!this.previewGraphics) return;
    this.previewGraphics.clear();

    const selectedType = this.inventory.getSelectedItemType();
    if (!selectedType || !this.isBlockType(selectedType)) return;

    const mousePointer = this.scene.input.mousePointer;
    const worldPos = this.cameraSystem.screenToWorld(mousePointer.x, mousePointer.y);
    const gridPos = this.worldToGrid(worldPos.x, worldPos.y);
    
    if (!this.canPlaceAt(gridPos.matrixX, gridPos.matrixY)) return;

    const worldGridPos = this.gridToWorld(gridPos.matrixX, gridPos.matrixY);
    
    // Draw semi-transparent preview
    this.previewGraphics.fillStyle(0xffffff, 0.3);
    this.previewGraphics.fillRect(
      worldGridPos.x - BLOCK_SIZE / 2,
      worldGridPos.y - BLOCK_SIZE / 2,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
    this.previewGraphics.lineStyle(2, 0xffffff, 0.5);
    this.previewGraphics.strokeRect(
      worldGridPos.x - BLOCK_SIZE / 2,
      worldGridPos.y - BLOCK_SIZE / 2,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
  }

  private tryPlaceBlock(pointer: Phaser.Input.Pointer): void {
    const selectedType = this.inventory.getSelectedItemType();
    if (!selectedType || !this.isBlockType(selectedType)) return;

    const worldPos = this.cameraSystem.screenToWorld(pointer.x, pointer.y);
    const gridPos = this.worldToGrid(worldPos.x, worldPos.y);

    if (!this.canPlaceAt(gridPos.matrixX, gridPos.matrixY)) return;

    // Use item from inventory
    const usedType = this.inventory.useSelectedItem();
    if (!usedType) return;

    // Place the block
    this.placeBlock(gridPos.matrixX, gridPos.matrixY, usedType as BlockType);
  }

  private placeBlock(matrixX: number, matrixY: number, type: BlockType): void {
    const worldPos = this.gridToWorld(matrixX, matrixY);
    
    // Create block
    const block = this.blockFactory.create(worldPos.x, worldPos.y, type);
    block.matrixX = matrixX;
    block.matrixY = matrixY;

    // Add to physics group
    this.blocks.add(block);
    block.setupPhysics();

    // Update matrix
    this.mapMatrix[matrixX][matrixY] = type;
  }

  private canPlaceAt(matrixX: number, matrixY: number): boolean {
    // Check bounds
    if (matrixX < 0 || matrixX >= this.mapMatrix.length) return false;
    if (matrixY < 0 || matrixY >= this.mapMatrix[matrixX].length) return false;

    // Check if slot is empty
    if (this.mapMatrix[matrixX][matrixY] !== null) return false;

    // Check if there's an adjacent block (can't place floating blocks)
    const hasAdjacentBlock = 
      this.hasBlockAt(matrixX - 1, matrixY) ||
      this.hasBlockAt(matrixX + 1, matrixY) ||
      this.hasBlockAt(matrixX, matrixY - 1) ||
      this.hasBlockAt(matrixX, matrixY + 1);

    return hasAdjacentBlock;
  }

  private hasBlockAt(matrixX: number, matrixY: number): boolean {
    if (matrixX < 0 || matrixX >= this.mapMatrix.length) return false;
    if (matrixY < 0 || matrixY >= this.mapMatrix[matrixX].length) return false;
    return this.mapMatrix[matrixX][matrixY] !== null;
  }

  private worldToGrid(worldX: number, worldY: number): { matrixX: number; matrixY: number } {
    // Convert world coordinates to matrix coordinates
    // Block left edges are at (matrixX - offset) * BLOCK_SIZE
    // So matrixX = floor(worldX / BLOCK_SIZE) + offset
    const matrixX = Math.floor(worldX / BLOCK_SIZE) + Math.floor(BLOCKS_COUNT / 2);
    
    // For Y: block top edges are at GROUND_Y - (maxHeight - matrixY + 1) * BLOCK_SIZE + BLOCK_SIZE
    // Simplified: matrixY = maxHeight + floor((worldY - GROUND_Y) / BLOCK_SIZE)
    const matrixY = this.maxHeight + Math.floor((worldY - GROUND_Y) / BLOCK_SIZE);
    
    return { matrixX, matrixY };
  }

  private gridToWorld(matrixX: number, matrixY: number): { x: number; y: number } {
    const worldX = (matrixX - Math.floor(BLOCKS_COUNT / 2)) * BLOCK_SIZE + (BLOCK_SIZE / 2);
    const worldY = GROUND_Y - (this.maxHeight - matrixY) * BLOCK_SIZE + (BLOCK_SIZE / 2);
    return { x: worldX, y: worldY };
  }

  private isBlockType(type: string): type is BlockType {
    return ['grass_block', 'dirt_block', 'stone_block'].includes(type);
  }

  destroy(): void {
    this.previewGraphics?.destroy();
  }
}
