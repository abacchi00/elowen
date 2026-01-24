import Phaser from "phaser";
import { BLOCK_SIZE } from "../config/constants";
import { Player } from "./Player";
import { IUpdatable } from "../types";

const SWING_SPEED = 0.03;
const SWING_AMPLITUDE = 0.6;

/**
 * Pickaxe entity that follows the player and animates during mining.
 */
export class Pickaxe extends Phaser.GameObjects.Image implements IUpdatable {
  private player: Player;
  private isMining: boolean = false;
  private mineAnimationProgress: number = 0;
  private targetRotation: number = 0;
  private currentTargetBlock: Phaser.GameObjects.GameObject | null = null;

  constructor(scene: Phaser.Scene, player: Player) {
    super(scene, 0, 0, "pickaxe");

    this.player = player;

    // Set display size
    this.setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);

    // Set pivot point at the handle
    this.setOrigin(-0.2, 0.9);

    // Add to scene
    scene.add.existing(this);
  }

  update(): void {
    const { x: playerX, y: playerY } = this.player.getBodyCenter();
    const mouseWorld = this.getMouseWorldPosition();

    const isMouseOnLeft = mouseWorld.x < playerX;

    this.updateFlipAndOrigin(isMouseOnLeft);
    this.updatePosition(playerX, playerY, isMouseOnLeft);
    this.updateRotation(mouseWorld);
    this.updateAnimation();
  }

  private getMouseWorldPosition(): { x: number; y: number } {
    const camera = this.scene.cameras.main;
    const zoom = camera.zoom;
    const centerX = camera.centerX;
    const centerY = camera.centerY;
    const mousePointer = this.scene.input.mousePointer;

    return {
      x: camera.scrollX + (mousePointer.x - centerX) / zoom + centerX,
      y: camera.scrollY + (mousePointer.y - centerY) / zoom + centerY,
    };
  }

  private updateFlipAndOrigin(isMouseOnLeft: boolean): void {
    this.setFlipY(isMouseOnLeft);
    this.setOrigin(-0.2, isMouseOnLeft ? 0.1 : 0.9);
  }

  private updatePosition(
    playerX: number,
    playerY: number,
    isMouseOnLeft: boolean,
  ): void {
    const handOffsetX = isMouseOnLeft ? -BLOCK_SIZE * 0.5 : BLOCK_SIZE * 0.5;
    const handOffsetY = BLOCK_SIZE * 0.6;

    this.x = playerX + handOffsetX;
    this.y = playerY + handOffsetY;
    this.setDepth(this.player.depth + 1);
  }

  private updateRotation(mouseWorld: { x: number; y: number }): void {
    const dx = mouseWorld.x - this.x;
    const dy = mouseWorld.y - this.y;
    let targetRotation = Math.atan2(dy, dx);

    // Point toward target block if mining
    if (
      this.currentTargetBlock &&
      (this.currentTargetBlock as Phaser.GameObjects.Image).active
    ) {
      const target = this.currentTargetBlock as Phaser.GameObjects.Image;
      const blockDx = target.x - this.x;
      const blockDy = target.y - this.y;
      targetRotation = Math.atan2(blockDy, blockDx);
    }

    this.targetRotation = targetRotation;
  }

  private updateAnimation(): void {
    const isMouseDown = this.scene.input.mousePointer.isDown;

    if (this.isMining || isMouseDown) {
      if (isMouseDown && !this.isMining) {
        this.isMining = true;
        this.mineAnimationProgress = 0;
      }
      this.animateMining();
    } else {
      this.rotation = this.targetRotation;
      if (this.isMining) {
        this.mineAnimationProgress = 0;
      }
    }
  }

  private animateMining(): void {
    this.mineAnimationProgress += SWING_SPEED;

    if (this.mineAnimationProgress >= 1) {
      this.mineAnimationProgress = 0;
    }

    const swingAngle =
      Math.sin(this.mineAnimationProgress * Math.PI * 2) * SWING_AMPLITUDE;
    this.rotation = this.targetRotation + swingAngle;
  }

  startMining(targetBlock: Phaser.GameObjects.GameObject | null): void {
    this.isMining = true;
    this.currentTargetBlock = targetBlock;

    if (targetBlock && (targetBlock as Phaser.GameObjects.Image).active) {
      const target = targetBlock as Phaser.GameObjects.Image;
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      this.targetRotation = Math.atan2(dy, dx);
    }
  }

  stopMining(): void {
    this.isMining = false;
    this.mineAnimationProgress = 0;
    this.currentTargetBlock = null;
  }
}
