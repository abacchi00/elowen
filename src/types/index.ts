import Phaser from 'phaser';

// ============================================================================
// Game Types
// ============================================================================

export type BlockType = 'grass_block' | 'dirt_block' | 'stone_block';

export type BlockMatrix = (BlockType | null)[][];

export interface Position {
  x: number;
  y: number;
}

export interface MatrixPosition {
  matrixX: number;
  matrixY: number;
}

// ============================================================================
// Sound Types
// ============================================================================

export interface GameSounds {
  running: Phaser.Sound.BaseSound;
  jump: Phaser.Sound.BaseSound;
  pickaxeHit: Phaser.Sound.BaseSound;
  pickaxeHitStone: Phaser.Sound.BaseSound;
}

// ============================================================================
// Entity Interfaces
// ============================================================================

export interface IMineable {
  life: number;
  maxLife: number;
  miningSound: Phaser.Sound.BaseSound | null;
  takeDamage(damage: number): boolean;
  mine(): void;
}

export interface IHoverable {
  hoverOutline: Phaser.GameObjects.Graphics | null;
  setupHoverEffects(): void;
}

export interface IUpdatable {
  update(time?: number, delta?: number): void;
}

// ============================================================================
// Inventory Types
// ============================================================================

export type ItemType = BlockType | 'wood'; // Blocks + other items like wood from trees

export interface InventoryItem {
  type: ItemType;
  quantity: number;
  maxStack: number;
}

export interface InventorySlot {
  item: InventoryItem | null;
}

// ============================================================================
// Block Configuration
// ============================================================================

export interface BlockConfig {
  texture: string;
  maxLife: number;
  hasLifeTextures: boolean;
  miningSound?: string;
}

export const BLOCK_CONFIGS: Record<BlockType, BlockConfig> = {
  grass_block: {
    texture: 'grass_block',
    maxLife: 100,
    hasLifeTextures: true,
  },
  dirt_block: {
    texture: 'dirt_block',
    maxLife: 100,
    hasLifeTextures: true,
  },
  stone_block: {
    texture: 'stone_block',
    maxLife: 200,
    hasLifeTextures: true,
    miningSound: 'pickaxeHitStone',
  },
};

// ============================================================================
// Item Configuration
// ============================================================================

export const ITEM_CONFIGS: Record<ItemType, { maxStack: number; texture: string }> = {
  grass_block: { maxStack: 64, texture: 'grass_block' },
  dirt_block: { maxStack: 64, texture: 'dirt_block' },
  stone_block: { maxStack: 64, texture: 'stone_block' },
  wood: { maxStack: 64, texture: 'tree' },
};
