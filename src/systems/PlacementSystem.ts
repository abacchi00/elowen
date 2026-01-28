import Phaser from "phaser";
import { BLOCK_SIZE } from "../config/constants";
import { GameContext, BlockType } from "../types";
import { ignoreOnUICameras } from "../utils";

/**
 * Handles block placement from inventory.
 * Right-click to place blocks.
 */
export class PlacementSystem {
  private ctx: GameContext;
  private previewGraphics: Phaser.GameObjects.Graphics;

  constructor(ctx: GameContext) {
    this.ctx = ctx;
    this.previewGraphics = ctx.scene.add.graphics();
    this.previewGraphics.setDepth(100);
    ignoreOnUICameras(ctx.scene, this.previewGraphics);

    this.setupInput();
  }

  private setupInput(): void {
    // Right-click to place
    this.ctx.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.tryPlaceBlock(pointer);
      }
    });

    // Disable context menu
    this.ctx.scene.game.canvas.addEventListener("contextmenu", e => {
      e.preventDefault();
    });
  }

  update(): void {
    this.updatePreview();
  }

  private updatePreview(): void {
    this.previewGraphics.clear();

    const selectedType = this.ctx.inventory.getSelectedItemType();
    if (!selectedType || !this.isBlockType(selectedType)) return;

    const mousePointer = this.ctx.scene.input.mousePointer;
    const worldPos = this.ctx.camera.screenToWorld(
      mousePointer.x,
      mousePointer.y,
    );
    const gridPos = this.ctx.world.worldToMatrix(worldPos.x, worldPos.y);

    if (!this.ctx.world.canPlaceAt(gridPos.matrixX, gridPos.matrixY)) return;

    const worldGridPos = this.ctx.world.matrixToWorld(
      gridPos.matrixX,
      gridPos.matrixY,
    );

    // Draw semi-transparent preview
    this.previewGraphics.fillStyle(0xffffff, 0.3);
    this.previewGraphics.fillRect(
      worldGridPos.x - BLOCK_SIZE / 2,
      worldGridPos.y - BLOCK_SIZE / 2,
      BLOCK_SIZE,
      BLOCK_SIZE,
    );
    this.previewGraphics.lineStyle(2, 0xffffff, 0.5);
    this.previewGraphics.strokeRect(
      worldGridPos.x - BLOCK_SIZE / 2,
      worldGridPos.y - BLOCK_SIZE / 2,
      BLOCK_SIZE,
      BLOCK_SIZE,
    );
  }

  private tryPlaceBlock(pointer: Phaser.Input.Pointer): void {
    const selectedType = this.ctx.inventory.getSelectedItemType();
    if (!selectedType || !this.isBlockType(selectedType)) return;

    const worldPos = this.ctx.camera.screenToWorld(pointer.x, pointer.y);
    const gridPos = this.ctx.world.worldToMatrix(worldPos.x, worldPos.y);

    if (!this.ctx.world.canPlaceAt(gridPos.matrixX, gridPos.matrixY)) return;

    // Use item from inventory
    const usedType = this.ctx.inventory.useSelectedItem();
    if (!usedType) return;

    // TODO create a sound for placement
    this.ctx.sounds?.pickaxeHit.play();

    // Place the block (WorldManager handles the event)
    this.ctx.world.placeBlock(
      gridPos.matrixX,
      gridPos.matrixY,
      usedType as BlockType,
    );
  }

  private isBlockType(type: string): type is BlockType {
    return ["grass_block", "dirt_block", "stone_block"].includes(type);
  }

  destroy(): void {
    this.previewGraphics.destroy();
  }
}
