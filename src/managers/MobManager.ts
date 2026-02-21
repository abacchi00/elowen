import Phaser from "phaser";
import {
  SCREEN_HEIGHT,
  BOAR_SPAWN_X_POSITIONS,
  SLIME_SPAWN_X_POSITIONS,
} from "@/config/constants";
import { Boar, Slime } from "@/entities";
import { Mob } from "@/entities/Mob";
import { IUpdatable } from "@/types";

/**
 * Manages mob (enemy) entities — spawning, collision setup, and updates.
 */
export class MobManager implements IUpdatable {
  private scene: Phaser.Scene;
  private mobs: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.mobs = scene.add.group();
    this.spawnMobs();
  }

  private spawnMobs(): void {
    const spawnY = -SCREEN_HEIGHT / 2 + 100;

    for (const x of BOAR_SPAWN_X_POSITIONS) {
      this.mobs.add(new Boar(this.scene, x, spawnY));
    }

    for (const x of SLIME_SPAWN_X_POSITIONS) {
      this.mobs.add(new Slime(this.scene, x, spawnY));
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
