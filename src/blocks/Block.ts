import {
  BLOCK_SIZE,
  BlockLifeLevel,
  BlockVariant,
  BlockVariantFramesType,
} from "@/config/constants";
import { ignoreOnUICameras } from "@/utils";
import { BlockConfig, IHoverable, IMineable } from "@/types";

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
  public variantFrames: BlockVariantFramesType[BlockVariant];

  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    config: BlockConfig,
    variantFrames: BlockVariantFramesType[BlockVariant],
  ) {
    const initialFrame = variantFrames[BlockLifeLevel.Full];

    super(scene, position.x, position.y, config.spritesheet, initialFrame);

    this.variantFrames = variantFrames;
    this.config = config;
    this.position = position;
    this.matrixPosition = matrixPosition;

    scene.add.existing(this);

    this.setupPhysics();

    // Set display properties
    this.setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);

    // Make interactive
    this.setInteractive({ useHandCursor: true });
    this.setupHoverEffects();
  }

  mine(): void {
    this.hideOutline();
    this.destroy();
  }

  takeDamage(damage: number): "destroyed" | "not_destroyed" {
    this.life = Math.max(0, this.life - damage);

    this.playMiningAnimation();

    if (this.life <= 0) return "destroyed";

    this.updateFrame();

    return "not_destroyed";
  }

  // TODO: Refactor - make code more readable and refactor block base scale
  private playMiningAnimation(): void {
    // Stop any existing mining animation
    this.scene.tweens.killTweensOf(this);

    const originalDepth = this.depth;

    this.setDepth(1000);

    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      duration: 50,
      ease: "Power2",
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.setScale(1.5);
        this.setDepth(originalDepth);
      },
    });
    if (this.hoverOutline) {
      const originalHoverOutlineDepth = this.hoverOutline?.depth ?? 0;

      this.hoverOutline?.setDepth(1001);

      this.scene.tweens.add({
        targets: this.hoverOutline,
        scaleX: 1.33,
        scaleY: 1.33,
        duration: 50,
        ease: "Power2",
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          this.hoverOutline?.setScale(1);
          this.hoverOutline?.setDepth(originalHoverOutlineDepth);
        },
      });
    }
  }

  // TODO: Refactor so only surface (accessible blocks) are used for physics to improve performance
  setupPhysics(): void {
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    }
  }

  setupHoverEffects(): void {
    this.on("pointerover", this.showOutline, this);
    this.on("pointerout", this.hideOutline, this);
  }

  updateSlope(variantFrames: BlockVariantFramesType[BlockVariant]): void {
    this.variantFrames = variantFrames;

    this.updateFrame();
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

  private updateFrame(): void {
    if (this.life > 0.75 * this.maxLife) {
      this.setFrame(this.variantFrames[BlockLifeLevel.Full]);
    } else if (this.life > 0.5 * this.maxLife) {
      this.setFrame(this.variantFrames[BlockLifeLevel.High]);
    } else if (this.life > 0.25 * this.maxLife) {
      this.setFrame(this.variantFrames[BlockLifeLevel.Medium]);
    } else {
      this.setFrame(this.variantFrames[BlockLifeLevel.Low]);
    }
  }
}
