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
import { createFloatingText } from "@/utils/floatingText";
import { ignoreOnUICameras } from "@/utils/camera";

type BoarState = "wandering" | "fleeing";

/**
 * Boar entity — simple mob that wanders, flees when hit, and dies.
 */
export class Boar extends Phaser.Physics.Arcade.Sprite implements IUpdatable {
  private direction: number = 1;
  private lastHitTime: number = 0;
  private maxLife: number = 100;
  private life: number = this.maxLife;
  private healthBar: Phaser.GameObjects.Image;
  private sounds?: GameSounds;
  private behavior: BoarState = "wandering";

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

    this.registerAnimations(scene);

    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.setVelocityX(BOAR_SPEED * this.direction);
    this.setFlipX(this.direction < 0);
  }

  // ============================================================================
  // Update
  // ============================================================================

  public update(): void {
    if (!this.body || !this.active) return;

    if (this.y > BOAR_OUT_OF_BOUNDS_Y) {
      this.die();
      return;
    }

    this.updateState();
    this.handleWallCollisions();
    this.applyMovement();
    this.updateAnimation();
    this.healthBar.setPosition(this.x, this.y + 24);
  }

  private updateState(): void {
    this.behavior = this.isOnCooldown() ? "fleeing" : "wandering";
  }

  private handleWallCollisions(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.blocked.left) {
      this.onWallHit("left");
    } else if (body.blocked.right) {
      this.onWallHit("right");
    }
  }

  private onWallHit(side: "left" | "right"): void {
    if (Math.random() < BOAR_JUMP_ON_COLLISION_PROBABILITY) {
      this.setVelocityY(-BOAR_JUMP_VELOCITY);
      return;
    }
    this.direction = side === "left" ? 1 : -1;
  }

  private applyMovement(): void {
    const speedMultiplier = this.behavior === "fleeing" ? 4 : 1;
    this.setVelocityX(BOAR_SPEED * this.direction * speedMultiplier);
    this.setFlipX(this.direction < 0);
  }

  private updateAnimation(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.x === 0) {
      this.play("boar_idle", true);
    } else if (this.behavior === "fleeing") {
      this.play("boar_run", true);
    } else {
      this.play("boar_walk", true);
    }
  }

  // ============================================================================
  // Combat
  // ============================================================================

  public takeHit(
    fromX: number,
    damage: number,
    sounds?: GameSounds,
  ): { died: boolean } {
    if (!this.active || !this.body || this.isOnCooldown()) {
      return { died: false };
    }

    this.lastHitTime = this.scene.time.now;
    this.sounds = sounds;

    sounds?.boarTakingHit.play();

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

    return this.applyDamage(damage);
  }

  private applyDamage(amount: number): { died: boolean } {
    this.life -= amount;

    const damageText = createFloatingText(
      this.scene,
      this.x,
      this.y - 20,
      `-${amount}`,
      "#ff4444",
    );
    ignoreOnUICameras(this.scene, damageText);

    if (this.life <= 0) {
      this.die();
      return { died: true };
    }

    this.updateHealthBar();
    return { died: false };
  }

  private updateHealthBar(): void {
    this.healthBar.setVisible(true);
    const healthPercentage = this.life / this.maxLife;
    const frame = Math.min(9, Math.floor((1 - healthPercentage) * 10));
    this.healthBar.setFrame(frame);
  }

  private die(): void {
    this.sounds?.boarDying.play();
    this.healthBar.destroy();
    this.destroy();
  }

  private isOnCooldown(): boolean {
    return this.scene.time.now - this.lastHitTime < BOAR_HIT_COOLDOWN;
  }

  // ============================================================================
  // Animations
  // ============================================================================

  private registerAnimations(scene: Phaser.Scene): void {
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

    if (!scene.anims.exists("boar_idle")) {
      scene.anims.create({
        key: "boar_idle",
        frames: [{ key: "boar_spritesheet", frame: 0 }],
        frameRate: 1,
      });
    }
  }
}
