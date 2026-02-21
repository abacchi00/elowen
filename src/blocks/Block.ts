import { BLOCK_SIZE } from "@/config/constants";
import { BlockConfig, IMineable, MatrixPosition, Position } from "@/types";

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
  implements IMineable
{
  public position: Position;
  public maxLife: number = 100;
  public life: number = 100;
  public miningSound: IMineable["miningSound"] = "pickaxeHit";
  public config: BlockConfig;
  public matrixPosition: MatrixPosition;
  public drops: IMineable["drops"];
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
    this.drops = [
      {
        type: config.type,
        quantity: 1,
        position: position,
      },
    ];

    scene.add.existing(this);

    this.setupPhysics();
    this.setCollisions();
    this.setDisplaySize(BLOCK_SIZE, BLOCK_SIZE);
  }

  mine(): void {
    if (this.scene?.tweens) this.scene.tweens.killTweensOf(this);

    this.destroy();
  }

  takeDamage(damage: number): { destroyed: boolean } {
    this.life = Math.max(0, this.life - damage);

    this.playMiningAnimation();

    return { destroyed: this.life <= 0 };
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

    this.setCollisions();
  }

  setCollisions(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.StaticBody;

    body.checkCollision.left = !this.neighbours.left;
    body.checkCollision.right = !this.neighbours.right;
    body.checkCollision.up = !this.neighbours.top;
    body.checkCollision.down = !this.neighbours.bottom;
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
  }

  private setupPhysics(): void {
    this.scene.physics.add.existing(this, true); // true = static body
    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).updateFromGameObject();
    }
  }
}
