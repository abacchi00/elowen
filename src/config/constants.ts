import {
  BlockHoldable,
  FoodHoldable,
  PickaxeHoldable,
  SwordHoldable,
} from "@/holdables";
import {
  AssetConfig,
  GameSounds,
  ItemConfig,
  ItemType,
  SoundConfig,
  SpritesheetConfig,
} from "@/types";

// ============================================================================
// Display Constants
// ============================================================================

export const BLOCK_SIZE = 16;
export const SCREEN_WIDTH = window.innerWidth;
export const SCREEN_HEIGHT = window.innerHeight;

// ============================================================================
// World Constants
// ============================================================================

export const WORLD_WIDTH_BLOCKS = 300; // Number of blocks horizontally
export const WORLD_HEIGHT_BLOCKS = 100; // Number of vertical layers
export const GROUND_Y = 0;

// ============================================================================
// Background Constants
// ============================================================================

export const SKY_COLOR_LIGHT = 0x86f9ff; // Light sky blue (bottom/middle)
export const SKY_COLOR_DARK = 0x2196f3; // Dark blue (top)
export const SKY_DEPTH = -1000;

// ============================================================================
// Player Constants
// ============================================================================

export const PLAYER_SPEED = BLOCK_SIZE * 25;
export const JUMP_SPEED = BLOCK_SIZE * 65;
export const GRAVITY = BLOCK_SIZE * 200;

// ============================================================================
// Pickaxe Constants
// ============================================================================

export const PICKAXE_SWING_SPEED = 0.0035;
export const PICKAXE_SWING_AMPLITUDE = 1.2;
export const PICKAXE_DAMAGE = 5;
export const PICKAXE_HIT_RANGE = BLOCK_SIZE * 5;

// ============================================================================
// Sword Constants
// ============================================================================

export const SWORD_SWING_SPEED = 0.004; // How fast the swing progresses (lower = slower)
export const SWORD_SWING_AMPLITUDE = 1.0; // Max rotation in radians
export const SWORD_DAMAGE = 10;
export const SWORD_HIT_RANGE = BLOCK_SIZE * 5;

// ============================================================================
// Mining Constants
// ============================================================================

export const MINING_DAMAGE = 25;
export const MINING_INTERVAL = 200; // ms between mining attempts
export const MINEABLE_OUTLINE_COLOR = 0xffffff;
export const MINEABLE_OUTLINE_WIDTH = 1;

// ============================================================================
// Camera Constants
// ============================================================================

export const CAMERA_MIN_ZOOM = 1;
export const CAMERA_MAX_ZOOM = 2.0;
export const CAMERA_ZOOM_SPEED = 0.1;

// ============================================================================
// Terrain Constants
// ============================================================================

export const MAX_MOUNTAIN_HEIGHT = 80;
export const BASE_DEPTH = 43;

// ============================================================================
// Tree Constants
// ============================================================================

export const TREE_MAX_LIFE = 80;
export const TREE_SPAWN_CHANCE = 0.15; // 15%
export const TREE_DARK_TINT_CHANCE = 0.3; // 30%
export const TREE_DISPLAY_WIDTH = BLOCK_SIZE * 6;
export const TREE_DISPLAY_HEIGHT = BLOCK_SIZE * 6;
export const TREE_DARK_TINT = 0xbbbbbb;

// ============================================================================
// Mob Constants
// ============================================================================

export const MOB_OUT_OF_BOUNDS_Y = BLOCK_SIZE * 200; // Destroy mob if it falls this far

// ============================================================================
// Boar Constants
// ============================================================================

export const BOAR_SPEED = BLOCK_SIZE * 2;
export const BOAR_JUMP_VELOCITY = BLOCK_SIZE * 40;
export const BOAR_JUMP_ON_COLLISION_PROBABILITY = 0.8;
export const BOAR_DISPLAY_WIDTH = BLOCK_SIZE * 3;
export const BOAR_DISPLAY_HEIGHT = BLOCK_SIZE * 2;
export const BOAR_HIT_KNOCKBACK_X = BLOCK_SIZE * 60; // Horizontal knockback speed
export const BOAR_HIT_KNOCKBACK_Y = BLOCK_SIZE * 40; // Upward knockback speed
export const BOAR_HIT_COOLDOWN = 1000; // ms before the boar can be hit again
export const BOAR_MAX_LIFE = 100;
export const BOAR_MEAT_DROP_QUANTITY = 2;
export const BOAR_SPAWN_X_POSITIONS = [
  -1500, -1000, -500, -100, 100, 500, 1000, 1500,
];

// ============================================================================
// Slime Constants
// ============================================================================

export const SLIME_SPEED = BLOCK_SIZE * 1.5;
export const SLIME_DISPLAY_WIDTH = BLOCK_SIZE * 1.5;
export const SLIME_DISPLAY_HEIGHT = BLOCK_SIZE * 1.5;
export const SLIME_HIT_KNOCKBACK_X = BLOCK_SIZE * 30;
export const SLIME_HIT_KNOCKBACK_Y = BLOCK_SIZE * 20;
export const SLIME_HIT_COOLDOWN = 800;
export const SLIME_MAX_LIFE = 50;
export const SLIME_SPAWN_X_POSITIONS = [-800, -400, 200, 600, 1200];

// ============================================================================
// Item Drop Constants
// ============================================================================

export const ITEM_DROP_PICKUP_RADIUS = BLOCK_SIZE * 4;
export const ITEM_DROP_MAGNET_SPEED = 200;
export const ITEM_DROP_ATTRACTION_SPEED = 100;
export const ITEM_DROP_ATTRACTION_RADIUS = BLOCK_SIZE * 2;
export const ITEM_DROP_MERGE_RADIUS = BLOCK_SIZE * 0.5;
export const ITEM_DROP_PICKUP_COOLDOWN = 100; // ms before item can be picked up
export const ITEM_DROP_STACK_COOLDOWN = 200; // ms before item can stack
export const ITEM_DROP_GRAVITY = 200;
export const ITEM_DROP_BOUNCE = 0.5;
export const ITEM_DROP_DRAG = 100;
export const ITEM_DROP_BASE_DISPLAY_SCALE = 0.75;
export const ITEM_DROP_PICKUP_DISTANCE = 20;

// ============================================================================
// Sound Constants
// ============================================================================

export const SOUND_CONFIGS: Record<keyof GameSounds, SoundConfig> = {
  running: { key: "running", loop: true, volume: 2 },
  jump: { key: "jump", volume: 0.6 },
  pickaxeHit: { key: "pickaxe_hit", volume: 0.2 },
  itemPickup: { key: "item_pickup", volume: 0.4 },
  backgroundMusic: { key: "background_music", loop: true, volume: 0.15 },
  boarTakingHit: { key: "boar_taking_hit", volume: 0.5 },
  boarDying: { key: "boar_dying", volume: 0.5 },
  slimeTakingHit: { key: "slime_taking_hit", volume: 0.1 },
  slimeDying: { key: "slime_dying", volume: 0.1 },
};

// ============================================================================
// Asset Constants
// ============================================================================

export const SPRITESHEET_ASSETS: SpritesheetConfig[] = [
  {
    key: "dirt_block_spritesheet",
    path: "/assets/spritesheets/dirt_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "grass_block_spritesheet",
    path: "/assets/spritesheets/grass_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "stone_block_spritesheet",
    path: "/assets/spritesheets/stone_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "wood_block_spritesheet",
    path: "/assets/spritesheets/wood_block_spritesheet.png",
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "player_spritesheet",
    path: "/assets/spritesheets/player_spritesheet.png",
    frameWidth: 16,
    frameHeight: 24,
  },
  {
    key: "boar_spritesheet",
    path: "/assets/spritesheets/boar_spritesheet.png",
    frameWidth: 48,
    frameHeight: 32,
  },
  {
    key: "slime_spritesheet",
    path: "/assets/spritesheets/slime_spritesheet.png",
    frameWidth: 24,
    frameHeight: 24,
  },
  {
    key: "mob_health_bar_spritesheet",
    path: "/assets/spritesheets/mob_health_bar_spritesheet.png",
    frameWidth: 32,
    frameHeight: 8,
  },
];

export const IMAGE_ASSETS: AssetConfig[] = [
  { key: "pickaxe", path: "./assets/images/pickaxe.png" },
  { key: "tree_variant_1", path: "./assets/images/tree_variant_1.png" },
  { key: "tree_variant_2", path: "./assets/images/tree_variant_2.png" },
  { key: "cloud_1", path: "./assets/images/cloud_1.png" },
  { key: "sword", path: "./assets/images/sword.png" },
  { key: "boar_meat", path: "./assets/images/boar_meat.png" },
];

export const AUDIO_ASSETS: AssetConfig[] = [
  { key: "running", path: "./assets/audio/running.mp3" },
  { key: "jump", path: "./assets/audio/jump.mp3" },
  { key: "pickaxe_hit", path: "./assets/audio/pickaxe_hit.mp3" },
  { key: "item_pickup", path: "./assets/audio/item_pickup.mp3" },
  {
    key: "background_music",
    path: "./assets/audio/background_music.mp3",
  },
  { key: "boar_taking_hit", path: "./assets/audio/boar_taking_hit.mp3" },
  { key: "boar_dying", path: "./assets/audio/boar_dying.mp3" },
  { key: "slime_taking_hit", path: "./assets/audio/slime_taking_hit.mp3" },
  { key: "slime_dying", path: "./assets/audio/slime_dying.mp3" },
];

// ============================================================================
// Inventory Constants
// ============================================================================

export const INVENTORY_INITIAL_ITEMS: { type: ItemType; quantity: number }[] = [
  { type: "pickaxe", quantity: 1 },
  { type: "sword", quantity: 1 },
  { type: "dirt_block", quantity: 15 },
  { type: "stone_block", quantity: 15 },
  { type: "grass_block", quantity: 15 },
];

// ============================================================================
// Item Constants
// ============================================================================

export const ITEM_CONFIGS: Record<ItemType, ItemConfig> = {
  grass_block: {
    maxStack: 64,
    texture: "grass_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("grass_block"),
    hasOutline: true,
    dropDisplayScale: ITEM_DROP_BASE_DISPLAY_SCALE,
  },
  dirt_block: {
    maxStack: 64,
    texture: "dirt_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("dirt_block"),
    hasOutline: true,
    dropDisplayScale: ITEM_DROP_BASE_DISPLAY_SCALE,
  },
  stone_block: {
    maxStack: 64,
    texture: "stone_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("stone_block"),
    hasOutline: true,
    dropDisplayScale: ITEM_DROP_BASE_DISPLAY_SCALE,
  },
  wood_block: {
    maxStack: 64,
    texture: "wood_block_spritesheet",
    frame: 0,
    holdable: new BlockHoldable("wood_block"),
    hasOutline: true,
    dropDisplayScale: ITEM_DROP_BASE_DISPLAY_SCALE,
  },
  pickaxe: {
    maxStack: 1,
    texture: "pickaxe",
    frame: 0,
    holdable: new PickaxeHoldable(),
    hasOutline: false,
    dropDisplayScale: ITEM_DROP_BASE_DISPLAY_SCALE,
  },
  sword: {
    maxStack: 1,
    texture: "sword",
    frame: 0,
    holdable: new SwordHoldable(),
    hasOutline: false,
    dropDisplayScale: ITEM_DROP_BASE_DISPLAY_SCALE,
  },
  boarMeat: {
    maxStack: 64,
    texture: "boar_meat",
    frame: 0,
    holdable: new FoodHoldable("boar_meat"),
    hasOutline: false,
    dropDisplayScale: 1.25,
  },
};
