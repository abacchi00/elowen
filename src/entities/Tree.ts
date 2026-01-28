import Phaser from "phaser";
import {
  BLOCK_SIZE,
  TREE_MAX_LIFE,
  TREE_DARK_TINT_CHANCE,
} from "../config/constants";
import { IMineable, IHoverable } from "../types";
import { ignoreOnUICameras } from "../utils";

const TREE_DISPLAY_WIDTH = BLOCK_SIZE * 6;
const TREE_DISPLAY_HEIGHT = BLOCK_SIZE * 10;
const DARK_TINT = 0xbbbbbb;
const OUTLINE_COLOR = 0xffffff;
const OUTLINE_WIDTH = 2;

/**
 * Tree entity - passable but minable.
 */
export class Tree
  extends Phaser.GameObjects.Image
  implements IMineable, IHoverable
{
  public life: number;
  public maxLife: number;
  public miningSound: Phaser.Sound.BaseSound | null = null;
  public hoverOutline: Phaser.GameObjects.Graphics | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "tree");

    this.maxLife = TREE_MAX_LIFE;
    this.life = this.maxLife;

    // Add to scene
    scene.add.existing(this);

    // Set display properties
    this.setDisplaySize(TREE_DISPLAY_WIDTH, TREE_DISPLAY_HEIGHT);
    this.setOrigin(0.5, 0.95);

    // Make interactive
    this.setInteractive({ useHandCursor: true });
    this.setupHoverEffects();

    // Add visual variance
    this.applyRandomVariant();
    this.applyRandomTint();
    this.applyRandomScale();

    // Add wobble animation (wind effect)
    this.startWobbleAnimation();
  }

  private applyRandomVariant(): void {
    // 70% chance for variant 2, 30% for variant 1
    if (Math.random() < 0.7) {
      this.setTexture("tree_variant_2");
    } else {
      this.setTexture("tree_variant_1");
    }
  }

  private applyRandomScale(): void {
    // Random scale between 0.9 and 1.1
    const scale = 2.5 + Math.random() * 1.5;
    this.setScale(scale);
  }

  private applyRandomTint(): void {
    if (Math.random() < TREE_DARK_TINT_CHANCE) {
      this.setTint(DARK_TINT);
    }
  }

  takeDamage(damage: number): "destroyed" | "not_destroyed" {
    if (this.miningSound) {
      this.miningSound.play();
    }

    this.life = Math.max(0, this.life - damage);

    return this.life <= 0 ? "destroyed" : "not_destroyed";
  }

  setupHoverEffects(): void {
    this.on("pointerover", this.showOutline, this);
    this.on("pointerout", this.hideOutline, this);
  }

  private showOutline(): void {
    if (this.hoverOutline || !this.scene) return;

    this.hoverOutline = this.scene.add.graphics();
    this.hoverOutline.lineStyle(OUTLINE_WIDTH, OUTLINE_COLOR, 1);
    this.hoverOutline.strokeRect(
      -BLOCK_SIZE / 2,
      -BLOCK_SIZE,
      BLOCK_SIZE,
      BLOCK_SIZE,
    );
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

  private startWobbleAnimation(): void {
    if (!this.scene) return;

    // Random wobble intensity and speed for variety
    const wobbleAngle = 1 + Math.random() * 1; // 1-2 degrees
    const wobbleDuration = 2000 + Math.random() * 1000; // 2-3 seconds
    const wobbleDelay = Math.random() * 1000; // Random delay to start

    // Create a repeating tween for gentle swaying motion
    this.scene.tweens.add({
      targets: this,
      angle: wobbleAngle,
      duration: wobbleDuration,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1, // Repeat infinitely
      delay: wobbleDelay,
      onUpdate: () => {
        // Reset origin to keep wobble from bottom (tree base)
        this.setOrigin(0.5, 0.95);
      },
    });
  }

  mine(): void {
    this.hideOutline();
    // Stop any active tweens before destroying
    if (this.scene?.tweens) {
      this.scene.tweens.killTweensOf(this);
    }
    this.destroy();
  }
}
