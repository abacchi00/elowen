import Phaser from "phaser";
import {
  BLOCK_SIZE,
  BOAR_DISPLAY_WIDTH,
  BOAR_SPAWN_X_POSITIONS,
  SLIME_DISPLAY_WIDTH,
  SLIME_SPAWN_X_POSITIONS,
} from "@/config/constants";
import { Boar, Slime } from "@/entities";
import { Mob } from "@/entities/Mob";
import { IUpdatable } from "@/types";
import { WorldManager } from "@/world";

/**
 * Manages mob (enemy) entities — spawning, collision setup, and updates.
 */
export class MobManager implements IUpdatable {
  private scene: Phaser.Scene;
  private worldManager: WorldManager;
  private mobs: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene, worldManager: WorldManager) {
    this.scene = scene;
    this.worldManager = worldManager;
    this.mobs = scene.add.group();
    this.spawnMobs();
  }

  private spawnMobs(): void {
    // Spawn mobs above the highest terrain surface across their body width.
    // The clearance ensures no overlap even on steep slopes.
    const clearance = BLOCK_SIZE * 2;

    for (const x of BOAR_SPAWN_X_POSITIONS) {
      const surfaceY = this.worldManager.getSurfaceWorldY(
        x,
        BOAR_DISPLAY_WIDTH,
      );
      this.mobs.add(new Boar(this.scene, x, surfaceY - clearance));
    }

    for (const x of SLIME_SPAWN_X_POSITIONS) {
      const surfaceY = this.worldManager.getSurfaceWorldY(
        x,
        SLIME_DISPLAY_WIDTH,
      );
      this.mobs.add(new Slime(this.scene, x, surfaceY - clearance));
    }
  }

  setupCollisions(blocks: Phaser.Physics.Arcade.StaticGroup): void {
    this.scene.physics.add.collider(this.mobs, blocks);
  }

  getMobs(): Phaser.GameObjects.Group {
    return this.mobs;
  }

  update(): void {
    this.mobs.children.each(child => {
      (child as Mob).update();
      return true;
    });
  }
}
