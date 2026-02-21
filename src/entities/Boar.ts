import {
  BOAR_SPEED,
  BOAR_JUMP_VELOCITY,
  BOAR_JUMP_ON_COLLISION_PROBABILITY,
  BOAR_DISPLAY_WIDTH,
  BOAR_DISPLAY_HEIGHT,
  BOAR_HIT_KNOCKBACK_X,
  BOAR_HIT_KNOCKBACK_Y,
  BOAR_HIT_COOLDOWN,
  BOAR_MAX_LIFE,
  BOAR_MEAT_DROP_QUANTITY,
  SOUND_CONFIGS,
} from "@/config/constants";
import { Mob } from "./Mob";

/**
 * Boar — wanders the world, flees when hit, drops meat on death.
 * Only overrides wall-hit behavior (chance to jump instead of turning).
 */
export class Boar extends Mob {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super({
      scene,
      x,
      y,
      spritesheet: "boar_spritesheet",
      displaySize: { width: BOAR_DISPLAY_WIDTH, height: BOAR_DISPLAY_HEIGHT },
      speed: BOAR_SPEED,
      maxLife: BOAR_MAX_LIFE,
      hitCooldown: BOAR_HIT_COOLDOWN,
      knockback: { x: BOAR_HIT_KNOCKBACK_X, y: BOAR_HIT_KNOCKBACK_Y },
      dropConfig: { type: "boarMeat", quantity: BOAR_MEAT_DROP_QUANTITY },
      hitSound: {
        key: "boar_taking_hit",
        volume: SOUND_CONFIGS.boarTakingHit.volume,
      },
      dieSound: { key: "boar_dying", volume: SOUND_CONFIGS.boarDying.volume },
      animations: [
        { key: "boar_walk", frames: { start: 0, end: 1 }, frameRate: 4 },
        { key: "boar_run", frames: { start: 0, end: 1 }, frameRate: 16 },
        { key: "boar_idle", frames: 0, frameRate: 1, repeat: 0 },
      ],
      animationMap: { idle: "boar_idle", walk: "boar_walk", run: "boar_run" },
    });
  }

  protected override onWallHit(side: "left" | "right"): void {
    if (Math.random() < BOAR_JUMP_ON_COLLISION_PROBABILITY) {
      this.setVelocityY(-BOAR_JUMP_VELOCITY);
      return;
    }
    this.direction = side === "left" ? 1 : -1;
  }
}
