import { BlockConstructorProps } from "@/blocks/Block";
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

export const BLOCK_TYPES = [
  "grass_block",
  "dirt_block",
  "stone_block",
  "wood_block",
] as const;

export type BlockType = (typeof BLOCK_TYPES)[number];

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
  boarTakingHit: Phaser.Sound.BaseSound;
  boarDying: Phaser.Sound.BaseSound;
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
  events?: Phaser.Events.EventEmitter;
  rotationOffset?: number;
  type: HoldableType;
}

// ============================================================================
// Inventory Types
// ============================================================================

export type HoldableType = "block" | "pickaxe" | "sword" | "food";

export type ToolType = "pickaxe" | "sword";

export type FoodType = "boarMeat";

export type ItemType = BlockType | ToolType | FoodType;

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
  frame: number;
  holdable: IHoldable;
  hasOutline: boolean;
  dropDisplayScale: number;
}

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
