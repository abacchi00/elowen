import {
  BOAR_SPEED,
  BOAR_JUMP_VELOCITY,
  BOAR_JUMP_ON_COLLISION_PROBABILITY,
  BOAR_DISPLAY_WIDTH,
  BOAR_DISPLAY_HEIGHT,
  BOAR_OUT_OF_BOUNDS_Y,
  BOAR_HIT_KNOCKBACK_X,
  BOAR_HIT_KNOCKBACK_Y,
  BOAR_HIT_TINT,
  BOAR_HIT_TINT_DURATION,
  BOAR_HIT_COOLDOWN,
} from "@/config/constants";
import { GameSounds, IUpdatable } from "@/types";

/**
 * Boar entity - wanders horizontally and jumps when hitting obstacles.
 */
export class Boar extends Phaser.Physics.Arcade.Sprite implements IUpdatable {
  private direction: number = 1;
  private lastHitTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "boar_spritesheet", 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(BOAR_DISPLAY_WIDTH, BOAR_DISPLAY_HEIGHT);
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    // Create walking animation
    this.createAnimations(scene);

    // Random initial direction
    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.setVelocityX(BOAR_SPEED * this.direction);
    this.setFlipX(this.direction < 0);
  }

  public update(): void {
    if (!this.body || !this.active) return;

    // Destroy if fallen out of bounds
    if (this.y > BOAR_OUT_OF_BOUNDS_Y) {
      this.destroy();
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.blocked.left) {
      this.handleCollision("left");
    } else if (body.blocked.right) {
      this.handleCollision("right");
    }

    // Play walk animation when moving on ground, idle otherwise
    if (body.velocity.x !== 0 && !this.isOnCooldown()) {
      this.play("boar_walk", true);
    } else if (body.velocity.x !== 0 && this.isOnCooldown()) {
      this.play("boar_run", true);
    } else {
      this.play("boar_idle", true);
    }

    if (this.isOnCooldown()) {
      this.setVelocityX(BOAR_SPEED * this.direction * 4);
    } else {
      this.setVelocityX(BOAR_SPEED * this.direction);
    }

    this.setFlipX(this.direction < 0);
  }

  private createAnimations(scene: Phaser.Scene): void {
    this.createWalkingAnimation(scene);
    this.createIdleAnimation(scene);
    this.createRunningAnimation(scene);
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

  private createRunningAnimation(scene: Phaser.Scene): void {
    if (!scene.anims.exists("boar_run")) {
      scene.anims.create({
        key: "boar_run",
        frames: scene.anims.generateFrameNumbers("boar_spritesheet", {
          start: 0,
          end: 1,
        }),
        frameRate: 16,
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

  /**
   * Called when the boar is hit by a weapon.
   * Applies red tint flash and knockback away from the attacker.
   */
  public takeHit(fromX: number, sounds?: GameSounds): void {
    if (!this.active || !this.body) return;

    const now = this.scene.time.now;
    if (this.isOnCooldown()) return;
    this.lastHitTime = now;

    // Play hit sound
    sounds?.pickaxeHit.play();

    // Knockback away from attacker
    const knockbackDir = this.x > fromX ? 1 : -1;
    this.setVelocityX(BOAR_HIT_KNOCKBACK_X * knockbackDir);
    this.setVelocityY(-BOAR_HIT_KNOCKBACK_Y);
    this.direction = knockbackDir;

    // Red tint flash
    this.setTint(BOAR_HIT_TINT);
    this.scene.time.delayedCall(BOAR_HIT_TINT_DURATION, () => {
      if (this.active) this.clearTint();
    });
  }

  private isOnCooldown(): boolean {
    const now = this.scene.time.now;
    return now - this.lastHitTime < BOAR_HIT_COOLDOWN;
  }
}
