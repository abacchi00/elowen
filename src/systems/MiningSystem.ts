import Phaser from 'phaser';
import { MINING_DAMAGE, MINING_INTERVAL } from '../config/constants';
import { Block } from '../blocks/Block';
import { Tree } from '../entities/Tree';
import { Pickaxe } from '../entities/Pickaxe';
import { CameraSystem } from './CameraSystem';
import { InventorySystem } from './InventorySystem';
import { GameSounds, BlockMatrix, IMineable, BlockType } from '../types';

type MineableTarget = Block | Tree;

/**
 * Handles mining logic for blocks and trees.
 * Adds gathered items to inventory.
 */
export class MiningSystem {
  private scene: Phaser.Scene;
  private blocks: Phaser.Physics.Arcade.StaticGroup;
  private trees: Phaser.GameObjects.Group;
  private pickaxe: Pickaxe;
  private cameraSystem: CameraSystem;
  private sounds: GameSounds | null;
  private mapMatrix: BlockMatrix;
  private inventory: InventorySystem;

  private currentTarget: MineableTarget | null = null;
  private miningTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    blocks: Phaser.Physics.Arcade.StaticGroup,
    trees: Phaser.GameObjects.Group,
    pickaxe: Pickaxe,
    cameraSystem: CameraSystem,
    sounds: GameSounds | null,
    mapMatrix: BlockMatrix,
    inventory: InventorySystem
  ) {
    this.scene = scene;
    this.blocks = blocks;
    this.trees = trees;
    this.pickaxe = pickaxe;
    this.cameraSystem = cameraSystem;
    this.sounds = sounds;
    this.mapMatrix = mapMatrix;
    this.inventory = inventory;
  }

  update(delta: number): void {
    const mousePointer = this.scene.input.mousePointer;
    const isMouseDown = mousePointer.isDown;

    if (isMouseDown) {
      this.handleMining(delta, mousePointer);
    } else {
      this.stopMining();
    }
  }

  private handleMining(delta: number, mousePointer: Phaser.Input.Pointer): void {
    // Keep pickaxe animating
    if (!this.pickaxe.active) return;
    this.pickaxe.startMining(null);

    const mouseWorld = this.cameraSystem.screenToWorld(mousePointer.x, mousePointer.y);
    const target = this.findTargetAt(mouseWorld.x, mouseWorld.y);

    if (target) {
      this.processMiningTarget(target, delta);
    } else {
      this.currentTarget = null;
      this.miningTimer = 0;
    }
  }

  private findTargetAt(worldX: number, worldY: number): MineableTarget | null {
    // Check trees first (they're on top)
    const tree = this.findTreeAt(worldX, worldY);
    if (tree) return tree;

    // Then check blocks
    return this.findBlockAt(worldX, worldY);
  }

  private findTreeAt(worldX: number, worldY: number): Tree | null {
    let foundTree: Tree | null = null;

    this.trees.children.each((child) => {
      const tree = child as Tree;
      if (tree.active) {
        const bounds = tree.getBounds();
        if (bounds.contains(worldX, worldY)) {
          foundTree = tree;
        }
      }
      return true;
    });

    return foundTree;
  }

  private findBlockAt(worldX: number, worldY: number): Block | null {
    let foundBlock: Block | null = null;

    this.blocks.children.each((child) => {
      const block = child as Block;
      if (block.active) {
        const bounds = block.getBounds();
        if (bounds.contains(worldX, worldY)) {
          foundBlock = block;
        }
      }
      return true;
    });

    return foundBlock;
  }

  private processMiningTarget(target: MineableTarget, delta: number): void {
    // Reset timer if target changed
    if (this.currentTarget !== target) {
      this.currentTarget = target;
      this.miningTimer = 0;
    }

    // Update pickaxe to point at target
    this.pickaxe.startMining(target);

    // Update mining timer
    this.miningTimer += delta;

    // Damage target after interval
    if (this.miningTimer >= MINING_INTERVAL) {
      this.damageTarget(target);
      this.miningTimer = 0;
    }
  }

  private damageTarget(target: MineableTarget): void {
    if (!target.active) {
      this.currentTarget = null;
      this.miningTimer = 0;
      return;
    }

    // Play sound (target plays its own if it has one, otherwise use default)
    this.playMiningSound(target);

    // Apply damage
    const isDestroyed = target.takeDamage(MINING_DAMAGE);

    if (isDestroyed) {
      this.destroyTarget(target);
    }
  }

  private playMiningSound(target: IMineable): void {
    if (target.miningSound) {
      // Target has its own sound - it will play in takeDamage()
      return;
    }
    
    // Use default pickaxe hit sound
    if (this.sounds?.pickaxeHit) {
      this.sounds.pickaxeHit.play();
    }
  }

  private destroyTarget(target: MineableTarget): void {
    if (target instanceof Block) {
      this.destroyBlock(target);
    } else if (target instanceof Tree) {
      this.destroyTree(target);
    }

    this.currentTarget = null;
    this.miningTimer = 0;
    this.pickaxe.stopMining();
  }

  private destroyBlock(block: Block): void {
    // Get block type before destruction for inventory
    const blockType = this.getBlockType(block);

    // Update matrix
    if (block.matrixX !== undefined && block.matrixY !== undefined) {
      this.mapMatrix[block.matrixX][block.matrixY] = null;
    }

    // Remove from physics group
    this.blocks.remove(block, true, true);

    // Mine the block
    block.mine();

    // Add to inventory
    if (blockType) {
      this.inventory.addItem(blockType, 1);
    }
  }

  private destroyTree(tree: Tree): void {
    // Remove from group
    this.trees.remove(tree, true, true);

    // Mine the tree
    tree.mine();

    // Add wood to inventory
    this.inventory.addItem('wood', 1);
  }

  private getBlockType(block: Block): BlockType | null {
    // Determine block type from texture key
    const textureKey = block.texture.key;
    if (textureKey.startsWith('grass_block')) return 'grass_block';
    if (textureKey.startsWith('dirt_block')) return 'dirt_block';
    if (textureKey.startsWith('stone_block')) return 'stone_block';
    return null;
  }

  private stopMining(): void {
    if (this.currentTarget) {
      this.currentTarget = null;
      this.miningTimer = 0;
    }
    this.pickaxe.stopMining();
  }
}
