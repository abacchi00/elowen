import {
  BLOCK_SIZE,
  MINEABLE_OUTLINE_COLOR,
  MINEABLE_OUTLINE_WIDTH,
} from "@/config/constants";
import { ignoreOnUICameras } from "@/utils";
import {
  BlockConfig,
  IHoverable,
  IMineable,
  MatrixPosition,
  Position,
} from "@/types";

export type BlockConstructorProps = {
  scene: Phaser.Scene;
  position: Position;
  matrixPosition: MatrixPosition;
  config: BlockConfig;
  neighbours?: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  };
};

export abstract class Block
  extends Phaser.GameObjects.Image
  implements IMineable, IHoverable
{
  public position: Position;
  public maxLife: number = 100;
  public life: number = 100;
  public miningSound: IMineable["miningSound"] = "pickaxeHit";
  public config: BlockConfig;
  public hoverOutline: Phaser.GameObjects.Graphics | null = null;
  public outline: Phaser.GameObjects.Graphics | null = null;
  public matrixPosition: MatrixPosition;
  public drop: IMineable["drop"];
  public neighbours: {
    left: boolean;
    right: boolean;
    top: boolean;
    bottom: boolean;
  } = {
    left: false,
    right: false,
    top: false,
    bottom: false,
  };

  constructor({
    config,
    position,
    scene,
    matrixPosition,
    neighbours,
  }: BlockConstructorProps) {
    super(scene, position.x, position.y, config.spritesheet, 0);

    if (neighbours) this.neighbours = neighbours;
    this.matrixPosition = matrixPosition;
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
    this.showOutline();
  }

  mine(): void {
    this.hideOutline();
    this.hideHoverOutline();

    if (this.scene?.tweens) this.scene.tweens.killTweensOf(this);

    this.destroy();
  }

  takeDamage(damage: number): { destroyed: boolean } {
    this.life = Math.max(0, this.life - damage);

    this.playMiningAnimation();

    return { destroyed: this.life <= 0 };
  }

  setupHoverEffects(): void {
    this.on("pointerover", this.showHoverOutline, this);
    this.on("pointerout", this.hideHoverOutline, this);
  }

  updateNeighbours(newNeighbours: {
    left?: boolean;
    right?: boolean;
    top?: boolean;
    bottom?: boolean;
  }): void {
    if (newNeighbours.left !== undefined)
      this.neighbours.left = newNeighbours.left;
    if (newNeighbours.right !== undefined)
      this.neighbours.right = newNeighbours.right;
    if (newNeighbours.top !== undefined)
      this.neighbours.top = newNeighbours.top;
    if (newNeighbours.bottom !== undefined)
      this.neighbours.bottom = newNeighbours.bottom;

    this.hideOutline();
    this.showOutline();
  }

  showOutline(): void {
    this.outline = this.scene.add.graphics();
    this.outline.lineStyle(2, 0x111111, 1);
    console.log(this.neighbours);

    if (!this.neighbours.top)
      this.outline.lineBetween(
        -BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
        BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
      );
    if (!this.neighbours.bottom)
      this.outline.lineBetween(
        -BLOCK_SIZE / 2,
        BLOCK_SIZE / 2,
        BLOCK_SIZE / 2,
        BLOCK_SIZE / 2,
      );
    if (!this.neighbours.left)
      this.outline.lineBetween(
        -BLOCK_SIZE / 2,
        BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
      );
    if (!this.neighbours.right)
      this.outline.lineBetween(
        BLOCK_SIZE / 2,
        BLOCK_SIZE / 2,
        BLOCK_SIZE / 2,
        -BLOCK_SIZE / 2,
      );
    this.outline.setPosition(this.x, this.y);
    this.outline.setDepth(this.depth + 1);
    this.outline.setScrollFactor(1, 1);
  }

  private hideOutline(): void {
    if (this.outline) {
      this.outline.destroy();
      this.outline = null;
    }
  }

  private showHoverOutline(): void {
    if (this.hoverOutline || !this.scene) return;

    this.hoverOutline = this.scene.add.graphics();
    this.hoverOutline.lineStyle(
      MINEABLE_OUTLINE_WIDTH,
      MINEABLE_OUTLINE_COLOR,
      1,
    );
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

  private hideHoverOutline(): void {
    if (this.hoverOutline) {
      this.hoverOutline.destroy();
      this.hoverOutline = null;
    }
  }

  // TODO: Refactor - make code more readable
  private playMiningAnimation(): void {
    // Stop any existing mining animation
    this.scene.tweens.killTweensOf(this);

    const originalDepth = this.depth;
    const originalScale = this.scale;

    this.setDepth(1000);

    this.scene.tweens.add({
      targets: this,
      scaleX: originalScale * 1.5,
      scaleY: originalScale * 1.5,
      duration: 50,
      ease: "Power2",
      yoyo: true,
      repeat: 0,
      onComplete: () => {
        this.setScale(originalScale);
        this.setDepth(originalDepth);
      },
    });

    if (this.hoverOutline) {
      const originalHoverOutlineDepth = this.hoverOutline?.depth ?? 0;
      const originalHoverOutlineScale = this.hoverOutline?.scale ?? 1;

      this.hoverOutline?.setDepth(1001);

      this.scene.tweens.add({
        targets: this.hoverOutline,
        scaleX: originalHoverOutlineScale * 1.33,
        scaleY: originalHoverOutlineScale * 1.33,
        duration: 50,
        ease: "Power2",
        yoyo: true,
        repeat: 0,
        onComplete: () => {
          this.hoverOutline?.setScale(originalHoverOutlineScale);
          this.hoverOutline?.setDepth(originalHoverOutlineDepth);
        },
      });
    }
  }

  // TODO: Refactor so only surface (accessible blocks) are used for physics to improve performance
  private setupPhysics(): void {
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    }
  }
}
