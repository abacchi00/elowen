import Phaser from "phaser";
import { WorldManager } from "../world";
import { InventorySystem, CameraSystem } from "../systems";
import { GameSounds } from "./index";

/**
 * Context object passed to all game systems.
 * Provides access to shared resources without tight coupling.
 */
export interface GameContext {
  scene: Phaser.Scene;
  world: WorldManager;
  inventory: InventorySystem;
  camera: CameraSystem;
  sounds: GameSounds;
}
