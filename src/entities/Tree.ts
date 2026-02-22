import Phaser from "phaser";
import {
  BLOCK_SIZE,
  TREE_MAX_LIFE,
  TREE_DARK_TINT_CHANCE,
  MINEABLE_OUTLINE_WIDTH,
  MINEABLE_OUTLINE_COLOR,
  TREE_DISPLAY_WIDTH,
  TREE_DISPLAY_HEIGHT,
  TREE_DARK_TINT,
} from "../config/constants";
import { IMineable, IHoverable } from "../types";
import { ignoreOnUICameras } from "../utils";
import { getRandomIntegerFrom } from "@/utils/math";

/**
 * Tree entity - passable but minable.
 */
export class Tree
  extends Phaser.GameObjects.Image
  implements IMineable, IHoverable
{
  public life: number;
  public maxLife: number;
  public miningSound: IMineable["miningSound"] = "pickaxeHit";
  public hoverOutline: Phaser.GameObjects.Graphics | null = null;
  public drops: IMineable["drops"];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "tree");

    this.maxLife = TREE_MAX_LIFE;
    this.life = this.maxLife;

    this.drops = [
      {
        type: "wood_block",
        quantity: getRandomIntegerFrom(3).to(6),
        position: { x: x - 2, y: y - TREE_DISPLAY_HEIGHT / 2 },
      },
      {
        type: "treeSeed",
        quantity: getRandomIntegerFrom(1).to(2),
        position: { x: x + 2, y: y - TREE_DISPLAY_HEIGHT / 4 },
      },
    ];

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

    // Add wobble animation (wind effect)
    this.startWobbleAnimation();
  }

  mine(): void {
    this.hideOutline();

    if (this.scene?.tweens) this.scene.tweens.killTweensOf(this);

    this.destroy();
  }

  takeDamage(damage: number): { destroyed: boolean } {
    this.life = Math.max(0, this.life - damage);

    return { destroyed: this.life <= 0 };
  }

  setupHoverEffects(): void {
    this.on("pointerover", this.showOutline, this);
    this.on("pointerout", this.hideOutline, this);
  }

  private showOutline(): void {
    if (this.hoverOutline || !this.scene) return;

    this.hoverOutline = this.scene.add.graphics();
    this.hoverOutline.lineStyle(
      MINEABLE_OUTLINE_WIDTH,
      MINEABLE_OUTLINE_COLOR,
      1,
    );
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

  private applyRandomVariant(): void {
    if (Math.random() < 0.6) {
      this.setTexture("tree_variant_2");
    } else {
      this.setTexture("tree_variant_1");
    }
  }

  private applyRandomTint(): void {
    if (Math.random() < TREE_DARK_TINT_CHANCE) {
      this.setTint(TREE_DARK_TINT);
    }
  }
}
