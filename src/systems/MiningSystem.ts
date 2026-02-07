import { MINING_DAMAGE, MINING_INTERVAL } from "../config/constants";
import { Block } from "../blocks/Block";
import { Tree } from "../entities/Tree";
import { Pickaxe } from "../entities/Pickaxe";
import { GameContext } from "../types";

type MineableTarget = Block | Tree;

/**
 * Handles mining logic for blocks and trees.
 * Uses events to notify other systems of changes.
 */
export class MiningSystem {
  private ctx: GameContext;
  private pickaxe: Pickaxe;

  private currentTarget: MineableTarget | null = null;
  private miningTimer: number = 0;

  constructor(ctx: GameContext, pickaxe: Pickaxe) {
    this.ctx = ctx;
    this.pickaxe = pickaxe;
  }

  update(delta: number): void {
    const mousePointer = this.ctx.scene.input.mousePointer;

    if (mousePointer.isDown) {
      this.handleMining(delta, mousePointer);
    } else {
      this.stopMining();
    }
  }

  private handleMining(
    delta: number,
    mousePointer: Phaser.Input.Pointer,
  ): void {
    if (!this.pickaxe.active) return;
    this.pickaxe.startMining(null);

    const worldPos = this.ctx.camera.screenToWorld(
      mousePointer.x,
      mousePointer.y,
    );
    const target = this.findTargetAt(worldPos.x, worldPos.y);

    if (target) {
      this.processMiningTarget(target, delta);
    } else {
      this.resetMining();
    }
  }

  private findTargetAt(worldX: number, worldY: number): MineableTarget | null {
    // Check trees first (they're on top)
    const tree = this.ctx.world.findTreeAtWorld(worldX, worldY);
    if (tree) return tree;

    // Then check blocks
    return this.ctx.world.findBlockAtWorld(worldX, worldY);
  }

  private processMiningTarget(target: MineableTarget, delta: number): void {
    // Reset timer if target changed
    if (this.currentTarget !== target) {
      this.currentTarget = target;
      this.miningTimer = 0;
    }

    // Get the Phaser game object for pickaxe targeting
    const gameObject = target;
    this.pickaxe.startMining(gameObject);
    this.miningTimer += delta;

    if (this.miningTimer >= MINING_INTERVAL) {
      this.damageTarget(target);
      this.miningTimer = 0;
    }
  }

  private damageTarget(target: MineableTarget): void {
    if (!target.active) {
      this.resetMining();
      return;
    }

    this.ctx.sounds[target.miningSound].play();

    const { destroyed } = target.takeDamage(MINING_DAMAGE);

    if (destroyed) this.destroyTarget(target);
  }

  private destroyTarget(target: MineableTarget): void {
    this.ctx.world.dropItem(
      target.drop.position.x,
      target.drop.position.y,
      target.drop.type,
      target.drop.quantity,
    );

    this.ctx.world.remove(target);

    this.resetMining();

    this.pickaxe.stopMining();
  }

  private resetMining(): void {
    this.currentTarget = null;
    this.miningTimer = 0;
  }

  private stopMining(): void {
    this.resetMining();
    this.pickaxe.stopMining();
  }
}
