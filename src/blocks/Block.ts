import { BLOCK_SIZE } from "@/config/constants";
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

  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    config: BlockConfig,
    slope: "left" | "right" | "both" | "none",
  ) {
    super(
      scene,
      position.x,
      position.y,
      config.spritesheet,
      Block.getInitialFrame(config, slope),
    );

    this.config = config;
    this.position = position;
    this.matrixPosition = matrixPosition;

    scene.add.existing(this);

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

  takeDamage(damage: number): boolean {
    this.life = Math.max(0, this.life - damage);

    if (this.life <= 0) return true;

    return false; // Block is not destroyed
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

  static getInitialFrame(
    config: BlockConfig,
    slope: "left" | "right" | "both" | "none",
  ): number {
    if (slope === "left") return config.borderLeftFrame;

    if (slope === "right") return config.borderRightFrame;

    if (slope === "both") return config.borderBothFrame;

    return config.fullFrames[
      Math.floor(Math.random() * config.fullFrames.length)
    ];
  }
}
