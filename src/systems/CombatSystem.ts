import Phaser from "phaser";
import {
  PICKAXE_DAMAGE,
  PICKAXE_HIT_RANGE,
  SWORD_DAMAGE,
  SWORD_HIT_RANGE,
  BOAR_MEAT_DROP_QUANTITY,
} from "@/config";
import { GameSounds, HoldableType } from "@/types";
import { Boar } from "@/entities";
import { ItemManager } from "@/managers";
import { getMouseWorldPosition } from "@/utils";
import { HeldItemSystem } from "./HeldItemSystem";

interface WeaponConfig {
  damage: number;
  range: number;
}

const WEAPON_CONFIGS: Record<string, WeaponConfig> = {
  sword: { damage: SWORD_DAMAGE, range: SWORD_HIT_RANGE },
  pickaxe: { damage: PICKAXE_DAMAGE, range: PICKAXE_HIT_RANGE },
};

/**
 * Handles weapon swing hit detection against mobs.
 * When a mob dies, drops its loot — same pattern as MiningSystem.
 */
export class CombatSystem {
  private scene: Phaser.Scene;
  private boars: Phaser.GameObjects.Group;
  private player: Phaser.Physics.Arcade.Sprite;
  private heldItemSystem: HeldItemSystem;
  private itemManager: ItemManager;
  private sounds?: GameSounds;

  constructor(
    scene: Phaser.Scene,
    boars: Phaser.GameObjects.Group,
    player: Phaser.Physics.Arcade.Sprite,
    heldItemSystem: HeldItemSystem,
    itemManager: ItemManager,
    sounds?: GameSounds,
  ) {
    this.scene = scene;
    this.boars = boars;
    this.player = player;
    this.heldItemSystem = heldItemSystem;
    this.itemManager = itemManager;
    this.sounds = sounds;
  }

  update(): void {
    const swingingType = this.heldItemSystem.isSwinging();
    if (!swingingType) return;

    const { damage, range } = this.getWeaponConfig(swingingType);
    const playerPos = this.player.body
      ? { x: this.player.body.center.x, y: this.player.body.center.y }
      : { x: this.player.x, y: this.player.y };
    const mouseWorld = getMouseWorldPosition(this.scene);
    const swingToRight = mouseWorld.x >= playerPos.x;

    this.boars.children.each(child => {
      const boar = child as Boar;
      if (!boar.active) return true;

      const boarIsRight = boar.x >= playerPos.x;
      if (boarIsRight !== swingToRight) return true;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        boar.x,
        boar.y,
      );

      if (distance <= range) {
        const deathPos = { x: boar.x, y: boar.y };
        const { died } = boar.takeHit(playerPos.x, damage, this.sounds);

        if (died) {
          this.itemManager.dropItem(
            deathPos.x,
            deathPos.y,
            "boarMeat",
            BOAR_MEAT_DROP_QUANTITY,
          );
        }
      }

      return true;
    });
  }

  private getWeaponConfig(type: HoldableType): WeaponConfig {
    return WEAPON_CONFIGS[type] ?? WEAPON_CONFIGS.pickaxe;
  }
}
