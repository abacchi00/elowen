import {
  BLOCK_SIZE,
  BlockLifeLevel,
  BlockVariant,
  BlockVariantFramesType,
} from "@/config/constants";
import { ignoreOnUICameras } from "@/utils";
import {
  BlockConfig,
  IHoverable,
  IMineable,
  MatrixPosition,
  Position,
} from "@/types";

const OUTLINE_COLOR = 0xffffff;
const OUTLINE_WIDTH = 2;

export type BlockConstructorProps = {
  scene: Phaser.Scene;
  position: Position;
  matrixPosition: MatrixPosition;
  config: BlockConfig;
  variantFrames: BlockVariantFramesType[BlockVariant];
};

export abstract class Block
  extends Phaser.GameObjects.Image
  implements IMineable, IHoverable
{
  public position: Position;
  public maxLife: number = 100;
  public life: number = 100;
  public miningSound: Phaser.Sound.BaseSound | null = null;
  public config: BlockConfig;
  public hoverOutline: Phaser.GameObjects.Graphics | null = null;
  public variantFrames: BlockVariantFramesType[BlockVariant];
  public matrixPosition: MatrixPosition;
  public drop: IMineable["drop"];

  constructor({
    config,
    position,
    scene,
    variantFrames,
    matrixPosition,
  }: BlockConstructorProps) {
    const initialFrame = variantFrames[BlockLifeLevel.Full];

    super(scene, position.x, position.y, config.spritesheet, initialFrame);

    this.matrixPosition = matrixPosition;
    this.variantFrames = variantFrames;
    this.config = config;
    this.position = position;
    this.drop = {
      type: config.type,
      quantity: 1,
      position: position,
    };

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

    if (this.scene?.tweens) this.scene.tweens.killTweensOf(this);

    this.destroy();
  }

  takeDamage(damage: number): "destroyed" | "not_destroyed" {
    this.life = Math.max(0, this.life - damage);

    this.playMiningAnimation();

    if (this.life <= 0) return "destroyed";

    this.updateLifeBasedFrame();

    return "not_destroyed";
  }

  setupHoverEffects(): void {
    this.on("pointerover", this.showOutline, this);
    this.on("pointerout", this.hideOutline, this);
  }

  updateVariantFrames(
    variantFrames: BlockVariantFramesType[BlockVariant],
  ): void {
    this.variantFrames = variantFrames;

    this.updateLifeBasedFrame();
  }

  // TODO: Refactor so only surface (accessible blocks) are used for physics to improve performance
  private setupPhysics(): void {
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    }
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

  private updateLifeBasedFrame(): void {
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

  // TODO: Refactor - make code more readable and refactor block base scale
  private playMiningAnimation(): void {
    // Stop any existing mining animation
    this.scene.tweens.killTweensOf(this);

    const originalDepth = this.depth;

    this.setDepth(1000);

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 50,
      ease: "Power2",
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.setScale(1);
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
}
