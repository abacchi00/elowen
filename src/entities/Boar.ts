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
  private maxLife: number = 100;
  private life: number = this.maxLife;
  private healthBar: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "boar_spritesheet", 0);

    this.healthBar = scene.add.image(x, y, "mob_health_bar_spritesheet", 0);
    this.healthBar.setDisplaySize(32, 8);
    this.healthBar.setDepth(1000);
    this.healthBar.setVisible(false);

    scene.add.existing(this.healthBar);
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

    // Die if fallen out of bounds
    if (this.y > BOAR_OUT_OF_BOUNDS_Y) {
      this.handleDeath();
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

    this.healthBar.setPosition(this.x, this.y + 24);
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

  public takeHit(fromX: number, damage: number, sounds?: GameSounds): void {
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

    this.handleLifeLoss(damage);
  }

  private handleLifeLoss(lifeLoss: number): void {
    this.life -= lifeLoss;

    if (this.life === this.maxLife) return;

    if (this.life <= 0) {
      this.handleDeath();
      return;
    }

    this.healthBar.setVisible(true);

    const healthPercentage = this.life / this.maxLife;

    let healthBarFrame = 0;

    if (healthPercentage > 0.9) {
      healthBarFrame = 0;
    } else if (healthPercentage > 0.8) {
      healthBarFrame = 1;
    } else if (healthPercentage > 0.7) {
      healthBarFrame = 2;
    } else if (healthPercentage > 0.6) {
      healthBarFrame = 3;
    } else if (healthPercentage > 0.5) {
      healthBarFrame = 4;
    } else if (healthPercentage > 0.4) {
      healthBarFrame = 5;
    } else if (healthPercentage > 0.3) {
      healthBarFrame = 6;
    } else if (healthPercentage > 0.2) {
      healthBarFrame = 7;
    } else if (healthPercentage > 0.1) {
      healthBarFrame = 8;
    } else {
      healthBarFrame = 9;
    }

    this.healthBar.setFrame(healthBarFrame);
  }

  private handleDeath(): void {
    this.healthBar.destroy();
    this.destroy();
  }

  private isOnCooldown(): boolean {
    const now = this.scene.time.now;
    return now - this.lastHitTime < BOAR_HIT_COOLDOWN;
  }
}
