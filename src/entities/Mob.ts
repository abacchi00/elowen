import { MOB_OUT_OF_BOUNDS_Y } from "@/config/constants";
import { IUpdatable, ItemType } from "@/types";
import { createFloatingText, ignoreOnUICameras } from "@/utils";

type MobState = "wandering" | "idle" | "fleeing" | "attacking";

interface MobSoundConfig {
  key: string;
  volume?: number;
}

interface AnimationDef {
  key: string;
  frames: { start: number; end: number } | number;
  frameRate: number;
  repeat?: number;
}

export interface MobConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  spritesheet: string;
  displaySize: { width: number; height: number };
  speed: number;
  maxLife: number;
  knockback: { x: number; y: number };
  animations: AnimationDef[];
  animationMap: { idle: string; walk: string; run: string };
  hitCooldown?: number;
  healthBarOffsetY?: number;
  fleeSpeedMultiplier?: number;
  hitTint?: number;
  hitTintDuration?: number;
  dropConfig?: { type: ItemType; quantity: number };
  hitSound?: MobSoundConfig;
  dieSound?: MobSoundConfig;
}

export abstract class Mob
  extends Phaser.Physics.Arcade.Sprite
  implements IUpdatable
{
  protected direction: number = 1;
  protected lastHitTime: number = 0;
  protected behavior: MobState = "wandering";

  private maxLife: number;
  private life: number;
  private healthBar: Phaser.GameObjects.Image;
  private speed: number;
  private hitCooldown: number;
  private healthBarOffsetY: number;
  private fleeSpeedMultiplier: number;
  private knockback: { x: number; y: number };
  private hitTint: number;
  private hitTintDuration: number;
  private dropConfig?: { type: ItemType; quantity: number };
  private hitSound?: MobSoundConfig;
  private dieSound?: MobSoundConfig;
  private animationMap: { idle: string; walk: string; run: string };

  protected constructor(config: MobConfig) {
    super(config.scene, config.x, config.y, config.spritesheet, 0);

    this.maxLife = config.maxLife;
    this.life = this.maxLife;
    this.speed = config.speed;
    this.hitCooldown = config.hitCooldown ?? 1000;
    this.healthBarOffsetY =
      config.healthBarOffsetY ?? config.displaySize.height / 2 + 8;
    this.fleeSpeedMultiplier = config.fleeSpeedMultiplier ?? 4;
    this.knockback = config.knockback;
    this.hitTint = config.hitTint ?? 0xff0000;
    this.hitTintDuration = config.hitTintDuration ?? 200;
    this.dropConfig = config.dropConfig;
    this.hitSound = config.hitSound;
    this.dieSound = config.dieSound;
    this.animationMap = config.animationMap;

    this.healthBar = config.scene.add.image(
      config.x,
      config.y,
      "mob_health_bar_spritesheet",
      0,
    );
    this.healthBar.setDisplaySize(32, 8);
    this.healthBar.setDepth(1000);
    this.healthBar.setVisible(false);

    config.scene.add.existing(this.healthBar);
    config.scene.add.existing(this);
    config.scene.physics.add.existing(this);

    this.setDisplaySize(config.displaySize.width, config.displaySize.height);
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    this.registerAnimations(
      config.scene,
      config.spritesheet,
      config.animations,
    );

    this.direction = Math.random() < 0.5 ? -1 : 1;
    this.setVelocityX(config.speed * this.direction);
    this.setFlipX(this.direction < 0);
  }

  // ============================================================================
  // Update
  // ============================================================================

  public update(): void {
    if (!this.body || !this.active) return;

    if (this.y > MOB_OUT_OF_BOUNDS_Y) {
      this.die();
      return;
    }

    this.updateState();
    this.handleWallCollisions();
    this.applyMovement();
    this.updateAnimation();
    this.healthBar.setPosition(this.x, this.y + this.healthBarOffsetY);
  }

  // ============================================================================
  // Combat
  // ============================================================================

  public takeHit(fromX: number, damage: number): { died: boolean } {
    if (!this.active || !this.body || this.isOnCooldown()) {
      return { died: false };
    }

    this.lastHitTime = this.scene.time.now;

    if (this.hitSound) {
      this.scene.sound.play(this.hitSound.key, {
        volume: this.hitSound.volume,
      });
    }

    // Knockback away from attacker
    const knockbackDir = this.x > fromX ? 1 : -1;
    this.setVelocityX(this.knockback.x * knockbackDir);
    this.setVelocityY(-this.knockback.y);
    this.direction = knockbackDir;

    // Tint flash
    this.setTint(this.hitTint);
    this.scene.time.delayedCall(this.hitTintDuration, () => {
      if (this.active) this.clearTint();
    });

    return this.applyDamage(damage);
  }

  public getDropConfig(): { type: ItemType; quantity: number } | undefined {
    return this.dropConfig;
  }

  // ============================================================================
  // State
  // ============================================================================

  private updateState(): void {
    this.behavior = this.isOnCooldown() ? "fleeing" : "wandering";
  }

  protected isOnCooldown(): boolean {
    return this.scene.time.now - this.lastHitTime < this.hitCooldown;
  }

  // ============================================================================
  // Movement
  // ============================================================================

  private handleWallCollisions(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.blocked.left) {
      this.onWallHit("left");
    } else if (body.blocked.right) {
      this.onWallHit("right");
    }
  }

  private applyMovement(): void {
    const speedMultiplier =
      this.behavior === "fleeing" ? this.fleeSpeedMultiplier : 1;
    this.setVelocityX(this.speed * this.direction * speedMultiplier);
    this.setFlipX(this.direction < 0);
  }

  protected onWallHit(side: "left" | "right"): void {
    this.direction = side === "left" ? 1 : -1;
  }

  // ============================================================================
  // Health
  // ============================================================================

  private updateHealthBar(): void {
    this.healthBar.setVisible(true);
    const healthPercentage = this.life / this.maxLife;
    const frame = Math.min(9, Math.floor((1 - healthPercentage) * 10));
    this.healthBar.setFrame(frame);
  }

  protected applyDamage(amount: number): { died: boolean } {
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

  protected die(): void {
    if (this.dieSound) {
      this.scene.sound.play(this.dieSound.key, {
        volume: this.dieSound.volume,
      });
    }
    this.healthBar.destroy();
    this.destroy();
  }

  // ============================================================================
  // Animations
  // ============================================================================

  protected updateAnimation(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (body.velocity.x === 0) {
      this.play(this.animationMap.idle, true);
    } else if (this.behavior === "fleeing") {
      this.play(this.animationMap.run, true);
    } else {
      this.play(this.animationMap.walk, true);
    }
  }

  private registerAnimations(
    scene: Phaser.Scene,
    spritesheet: string,
    animations: AnimationDef[],
  ): void {
    for (const anim of animations) {
      if (scene.anims.exists(anim.key)) continue;

      const frames =
        typeof anim.frames === "number"
          ? [{ key: spritesheet, frame: anim.frames }]
          : scene.anims.generateFrameNumbers(spritesheet, anim.frames);

      scene.anims.create({
        key: anim.key,
        frames,
        frameRate: anim.frameRate,
        repeat: anim.repeat ?? -1,
      });
    }
  }
}
