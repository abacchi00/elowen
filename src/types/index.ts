// TODO: create file structure for types

import { BlockConstructorProps } from "@/blocks/Block";
import { BlockHoldable, PickaxeHoldable } from "@/holdables";
import Phaser from "phaser";

// ============================================================================
// Asset Types
// ============================================================================

export interface AssetConfig {
  key: string;
  path: string;
}

export interface SpritesheetConfig {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
}

// ============================================================================
// Game Types
// ============================================================================

export type BlockType =
  | "grass_block"
  | "dirt_block"
  | "stone_block"
  | "wood_block";

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
  itemPickup: Phaser.Sound.BaseSound;
  backgroundMusic: Phaser.Sound.BaseSound;
}

export interface SoundConfig {
  key: string;
  loop?: boolean;
  volume?: number;
}

// ============================================================================
// Entity Interfaces
// ============================================================================

export interface IMineable {
  life: number;
  maxLife: number;
  miningSound: keyof GameSounds;
  drop: {
    type: ItemType;
    quantity: number;
    position: Position;
  };
  takeDamage(damage: number): { destroyed: boolean };
  mine(): void;
}

export interface IHoverable {
  hoverOutline: Phaser.GameObjects.Graphics | null;
  setupHoverEffects(): void;
}

export interface IUpdatable {
  update(time?: number, delta?: number): void;
}

export interface IHoldable {
  handlePrimaryAction?(delta: number, mousePointer: Phaser.Input.Pointer): void;
  stopPrimaryAction?(): void;
  handleSecondaryAction?(
    delta: number,
    mousePointer: Phaser.Input.Pointer,
  ): void;
  stopSecondaryAction?(): void;
  displaySize: { width: number; height: number };
  texture: string;
  frame: number;
  events: Phaser.Events.EventEmitter;
}

// ============================================================================
// Inventory Types
// ============================================================================

export type ItemType = BlockType | "pickaxe"; // Blocks + other items in the future

export interface InventoryItem {
  holdable: IHoldable;
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
  holdable: IHoldable;
}

export const ITEM_CONFIGS: Record<ItemType, ItemConfig> = {
  grass_block: {
    maxStack: 64,
    texture: "grass_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("grass_block"),
  },
  dirt_block: {
    maxStack: 64,
    texture: "dirt_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("dirt_block"),
  },
  stone_block: {
    maxStack: 64,
    texture: "stone_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("stone_block"),
  },
  wood_block: {
    maxStack: 64,
    texture: "wood_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("wood_block"),
  },
  pickaxe: {
    maxStack: 1,
    texture: "pickaxe",
    frame: 0,
    holdable: new PickaxeHoldable(),
  },
};

// Re-export GameContext
export type { GameContext } from "./GameContext";

export type BlockConfig = {
  type: BlockType;
  spritesheet: string;
  maxLife: number;
};

export type SpecializedBlockConstructorProps = Omit<
  BlockConstructorProps,
  "config"
>;
