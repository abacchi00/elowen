import { BLOCK_SIZE } from "@/config/constants";
import { ignoreOnUICameras } from "@/utils";
import {
  BlockConfig,
  BlockSlope,
  BlockVariant,
  IHoverable,
  IMineable,
} from "@/types";

const OUTLINE_COLOR = 0xffffff;
const OUTLINE_WIDTH = 2;

export abstract class Block
  extends Phaser.GameObjects.Image
  implements IMineable, IHoverable
{
  public position: { x: number; y: number };
  public maxLife: number = 100;
  public life: number = 100;
  public miningSound: Phaser.Sound.BaseSound | null = null;
  public config: BlockConfig;
  public matrixPosition: { x: number; y: number };
  public hoverOutline: Phaser.GameObjects.Graphics | null = null;
  public variant: BlockVariant;

  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    config: BlockConfig,
    slope: BlockSlope,
  ) {
    const initialVariant = Block.generateVariant(slope);
    const initialFrame = initialVariant;

    super(scene, position.x, position.y, config.spritesheet, initialFrame);

    this.variant = initialVariant;
    this.config = config;
    this.position = position;
    this.matrixPosition = matrixPosition;

    scene.add.existing(this);

    this.setupPhysics();

    // Set display properties
    this.setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);

    // Make interactive
    this.setInteractive();
    this.setupHoverEffects();
  }

  mine(): void {
    this.hideOutline();
    this.destroy();
  }

  takeDamage(damage: number): "destroyed" | "not_destroyed" {
    this.life = Math.max(0, this.life - damage);

    if (this.life <= 0) return "destroyed";

    this.updateFrameAfterDamage();

    return "not_destroyed";
  }

  setupPhysics(): void {
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    }
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
      -BLOCK_SIZE / 2,
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

  private updateFrameAfterDamage(): void {
    if (this.life > 0.75 * this.maxLife) {
      this.setFrame(this.variant);
    } else if (this.life > 0.5 * this.maxLife) {
      this.setFrame(this.variant + 6);
    } else if (this.life > 0.25 * this.maxLife) {
      this.setFrame(this.variant + 12);
    } else {
      this.setFrame(this.variant + 18);
    }
  }

  static generateVariant(slope: BlockSlope): BlockVariant {
    if (slope === null) {
      const variantChosenRandomly = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      return variantChosenRandomly;
    }

    return slope;
  }
}
