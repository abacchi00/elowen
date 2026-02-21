import Phaser from "phaser";
import { SCREEN_HEIGHT, BOAR_SPAWN_X_POSITIONS } from "@/config/constants";
import { Boar } from "@/entities";
import { IUpdatable } from "@/types";

/**
 * Manages mob (enemy) entities — spawning, collision setup, and updates.
 */
export class MobManager implements IUpdatable {
  private scene: Phaser.Scene;
  private boars: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.boars = scene.add.group();
    this.spawnBoars();
  }

  private spawnBoars(): void {
    for (const x of BOAR_SPAWN_X_POSITIONS) {
      this.boars.add(new Boar(this.scene, x, -SCREEN_HEIGHT / 2 + 100));
    }
  }

  setupCollisions(blocks: Phaser.Physics.Arcade.StaticGroup): void {
    this.scene.physics.add.collider(this.boars, blocks);
  }

  getBoars(): Phaser.GameObjects.Group {
    return this.boars;
  }

  update(): void {
    this.boars.children.each(child => {
      (child as Boar).update();
      return true;
    });
  }
}
