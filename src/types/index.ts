import Phaser from "phaser";

// ============================================================================
// Game Types
// ============================================================================

export type BlockType = "grass_block" | "dirt_block" | "stone_block";

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
  takeDamage(damage: number): "destroyed" | "not_destroyed";
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

export type ItemType = BlockType | "wood"; // Blocks + other items like wood from trees

export interface InventoryItem {
  type: ItemType;
  quantity: number;
  maxStack: number;
}

export interface InventorySlot {
  item: InventoryItem | null;
}

// ============================================================================
// Item Configuration
// ============================================================================

export interface ItemConfig {
  maxStack: number;
  texture: string;
  frame?: number; // Optional frame index for spritesheet textures
}

export const ITEM_CONFIGS: Record<ItemType, ItemConfig> = {
  grass_block: { maxStack: 64, texture: "grass_block_spritesheet", frame: 0 },
  dirt_block: { maxStack: 64, texture: "dirt_block_spritesheet", frame: 0 },
  stone_block: { maxStack: 64, texture: "stone_block_spritesheet", frame: 0 },
  wood: { maxStack: 64, texture: "tree_variant_1" },
};

// Re-export GameContext
export type { GameContext } from "./GameContext";

export type BlockConfig = {
  type: BlockType;
  spritesheet: string;
  maxLife: number;
};
