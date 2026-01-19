import Phaser from 'phaser';
import { BLOCK_SIZE } from '../config/constants';
import { IMineable, IHoverable, MatrixPosition } from '../types';
import { ignoreOnUICameras } from '../utils';

const OUTLINE_COLOR = 0xffffff;
const OUTLINE_WIDTH = 2;

/**
 * Base Block class with common functionality.
 * Implements IMineable and IHoverable interfaces.
 */
export abstract class Block extends Phaser.GameObjects.Image implements IMineable, IHoverable, MatrixPosition {
  public life: number;
  public maxLife: number;
  public miningSound: Phaser.Sound.BaseSound | null = null;
  public hoverOutline: Phaser.GameObjects.Graphics | null = null;
  public matrixX: number = 0;
  public matrixY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, maxLife: number = 100) {
    super(scene, x, y, texture);

    this.maxLife = maxLife;
    this.life = this.maxLife;

    // Add to scene
    scene.add.existing(this);

    // Set display properties
    this.setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);

    // Make interactive
    this.setInteractive({ useHandCursor: true });
    this.setupHoverEffects();
  }

  abstract updateVisuals(): void;

  takeDamage(damage: number): boolean {
    if (this.miningSound) {
      this.miningSound.play();
    }

    this.life = Math.max(0, this.life - damage);
    this.updateVisuals();

    return this.life <= 0;
  }

  setupHoverEffects(): void {
    this.on('pointerover', this.showOutline, this);
    this.on('pointerout', this.hideOutline, this);
  }

  private showOutline(): void {
    if (this.hoverOutline || !this.scene) return;

    this.hoverOutline = this.scene.add.graphics();
    this.hoverOutline.lineStyle(OUTLINE_WIDTH, OUTLINE_COLOR, 1);
    this.hoverOutline.strokeRect(-BLOCK_SIZE / 2, -BLOCK_SIZE / 2, BLOCK_SIZE, BLOCK_SIZE);
    this.hoverOutline.setPosition(this.x, this.y);
    this.hoverOutline.setDepth(this.depth + 1);
    this.hoverOutline.setScrollFactor(1, 1);
    ignoreOnUICameras(this.scene, this.hoverOutline);
  }

  private hideOutline(): void {
    if (this.hoverOutline) {
      this.hoverOutline.destroy();
      this.hoverOutline = null;
    }
  }

  setupPhysics(): void {
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    }
  }

  resetLife(): void {
    this.life = this.maxLife;
    this.updateVisuals();
  }

  mine(): void {
    this.hideOutline();
    // Emit event if scene is still available
    if (this.scene?.events) {
      this.scene.events.emit('blockMined', this);
    }
    this.destroy();
  }
}
