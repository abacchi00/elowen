import {
  SLIME_SPEED,
  SLIME_DISPLAY_WIDTH,
  SLIME_DISPLAY_HEIGHT,
  SLIME_HIT_KNOCKBACK_X,
  SLIME_HIT_KNOCKBACK_Y,
  SLIME_HIT_COOLDOWN,
  SLIME_MAX_LIFE,
  SOUND_CONFIGS,
  SLIME_GOO_DROP_QUANTITY,
} from "@/config/constants";
import { Mob } from "./Mob";

/**
 * Slime — small, slow mob that wanders and reverses on walls.
 * Uses all default Mob behavior (no overrides needed).
 */
export class Slime extends Mob {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super({
      scene,
      x,
      y,
      spritesheet: "slime_spritesheet",
      displaySize: {
        width: SLIME_DISPLAY_WIDTH,
        height: SLIME_DISPLAY_HEIGHT,
      },
      speed: SLIME_SPEED,
      maxLife: SLIME_MAX_LIFE,
      hitCooldown: SLIME_HIT_COOLDOWN,
      knockback: { x: SLIME_HIT_KNOCKBACK_X, y: SLIME_HIT_KNOCKBACK_Y },
      dropConfig: { type: "slimeGoo", quantity: SLIME_GOO_DROP_QUANTITY },
      hitSound: {
        key: "slime_taking_hit",
        volume: SOUND_CONFIGS.slimeTakingHit.volume,
      },
      dieSound: {
        key: "slime_dying",
        volume: SOUND_CONFIGS.slimeDying.volume,
      },
      animations: [
        { key: "slime_walk", frames: { start: 0, end: 1 }, frameRate: 3 },
        { key: "slime_run", frames: { start: 0, end: 1 }, frameRate: 10 },
        { key: "slime_idle", frames: 0, frameRate: 1, repeat: 0 },
      ],
      animationMap: {
        idle: "slime_idle",
        walk: "slime_walk",
        run: "slime_run",
      },
    });
  }
}
