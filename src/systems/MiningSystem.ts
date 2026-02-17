import { MINING_DAMAGE, MINING_INTERVAL } from "../config/constants";
import { Block } from "../blocks/Block";
import { Tree } from "../entities/Tree";
import { GameContext } from "../types";

type MineableTarget = Block | Tree;

/**
 * Handles mining logic for blocks and trees.
 * Uses events to notify other systems of changes.
 */
export class MiningSystem {
  private ctx: GameContext;

  private currentTarget: MineableTarget | null = null;
  private miningTimer: number = 0;

  constructor(ctx: GameContext) {
    this.ctx = ctx;

    this.ctx.scene.events.on("handleMining", this.handleMining, this);
    this.ctx.scene.events.on("stopMining", this.stopMining, this);
  }

  private handleMining(
    delta: number,
    mousePointer: Phaser.Input.Pointer,
  ): void {
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
  }

  private resetMining(): void {
    this.currentTarget = null;
    this.miningTimer = 0;
  }

  private stopMining(): void {
    this.resetMining();
  }
}
