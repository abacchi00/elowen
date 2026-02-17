import { BLOCK_SIZE } from "@/config/constants";

const BOAR_SPEED = BLOCK_SIZE * 2;
const BOAR_JUMP_ON_COLLISION_PROBABILITY = 0.8;
const BOAR_JUMP_VELOCITY = BLOCK_SIZE * 40;

export class Boar extends Phaser.Physics.Arcade.Sprite {
  private direction: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "boar_spritesheet", 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(BLOCK_SIZE * 3, BLOCK_SIZE * 2);
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    // Create walking animation
    this.createAnimations(scene);

    // Random initial direction
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.setVelocityX(BOAR_SPEED * this.direction);
    this.setFlipX(this.direction > 0);
  }

  public update(): void {
    if (!this.body || !this.active) return;

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.blocked.left) {
      this.handleCollision("left");
    } else if (body.blocked.right) {
      this.handleCollision("right");
    }

    // Play walk animation when moving on ground, idle otherwise
    if (this.body.velocity.x !== 0) {
      this.play("boar_walk", true);
    } else {
      this.play("boar_idle", true);
    }

    this.setVelocityX(BOAR_SPEED * this.direction);
    this.setFlipX(this.direction < 0);
  }

  private createAnimations(scene: Phaser.Scene): void {
    this.createWalkingAnimation(scene);
    this.createIdleAnimation(scene);
  }

  private createWalkingAnimation(scene: Phaser.Scene): void {
    if (!scene.anims.exists("boar_walk")) {
      scene.anims.create({
        key: "boar_walk",
        frames: scene.anims.generateFrameNumbers("boar_spritesheet", {
          start: 0,
          end: 1,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }
  }

  private createIdleAnimation(scene: Phaser.Scene): void {
    if (!scene.anims.exists("boar_idle")) {
      scene.anims.create({
        key: "boar_idle",
        frames: [{ key: "boar_spritesheet", frame: 0 }],
        frameRate: 1,
      });
    }
  }

  private handleCollision(direction: "left" | "right"): void {
    if (Math.random() < BOAR_JUMP_ON_COLLISION_PROBABILITY) {
      this.handleJump();
      return;
    }

    const directionFactor = direction === "left" ? 1 : -1;

    this.direction = directionFactor;
  }

  private handleJump(): void {
    this.setVelocityY(-BOAR_JUMP_VELOCITY);
  }
}
