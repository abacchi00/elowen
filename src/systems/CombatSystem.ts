import Phaser from "phaser";
import {
  PICKAXE_DAMAGE,
  PICKAXE_HIT_RANGE,
  SWORD_DAMAGE,
  SWORD_HIT_RANGE,
} from "@/config";
import { HoldableType } from "@/types";
import { Mob } from "@/entities/Mob";
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
 * When a mob dies, drops its loot (read from the mob's own config).
 */
export class CombatSystem {
  private scene: Phaser.Scene;
  private mobs: Phaser.GameObjects.Group;
  private player: Phaser.Physics.Arcade.Sprite;
  private heldItemSystem: HeldItemSystem;
  private itemManager: ItemManager;

  constructor(
    scene: Phaser.Scene,
    mobs: Phaser.GameObjects.Group,
    player: Phaser.Physics.Arcade.Sprite,
    heldItemSystem: HeldItemSystem,
    itemManager: ItemManager,
  ) {
    this.scene = scene;
    this.mobs = mobs;
    this.player = player;
    this.heldItemSystem = heldItemSystem;
    this.itemManager = itemManager;
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

    this.mobs.children.each(child => {
      const mob = child as Mob;
      if (!mob.active) return true;

      const mobIsRight = mob.x >= playerPos.x;
      if (mobIsRight !== swingToRight) return true;

      const distance = Phaser.Math.Distance.Between(
        playerPos.x,
        playerPos.y,
        mob.x,
        mob.y,
      );

      if (distance <= range) {
        const deathPos = { x: mob.x, y: mob.y };
        const { died } = mob.takeHit(playerPos.x, damage);

        if (died) {
          const dropConfig = mob.getDropConfig();
          if (dropConfig) {
            this.itemManager.dropItem(
              deathPos,
              dropConfig.type,
              dropConfig.quantity,
            );
          }
        }
      }

      return true;
    });
  }

  private getWeaponConfig(type: HoldableType): WeaponConfig {
    return WEAPON_CONFIGS[type] ?? WEAPON_CONFIGS.pickaxe;
  }
}
