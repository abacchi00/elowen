import Phaser from "phaser";
import { SCREEN_HEIGHT } from "../config/constants";
import { GameContext, GameSounds } from "../types";
import { Player, Pickaxe } from "../entities";
import { AssetsManager, SoundManager, BackgroundManager } from "../managers";
import {
  CameraSystem,
  MiningSystem,
  InventorySystem,
  PlacementSystem,
} from "../systems";
import { WorldManager } from "../world";
import { Hotbar } from "../ui";

/**
 * Main game scene - simplified using WorldManager and GameContext.
 */
export class GameScene extends Phaser.Scene {
  // Core context shared by all systems
  private ctx!: GameContext;

  // Entities (not in context as they're scene-specific)
  private player!: Player;
  private pickaxe!: Pickaxe;

  // Managers
  private soundManager!: SoundManager;
  backgroundManager!: BackgroundManager;

  // Systems
  private miningSystem!: MiningSystem;
  private placementSystem!: PlacementSystem;

  // UI
  private hotbar!: Hotbar;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    AssetsManager.loadAll(this.load);
  }

  create(): void {
    // 1. Initialize managers first
    this.backgroundManager = new BackgroundManager(this);
    this.soundManager = new SoundManager(this.sound);
    const sounds = this.soundManager.getSounds();

    // 2. Create inventory
    const inventory = new InventorySystem(9);
    inventory.addItem("dirt_block", 10);
    inventory.addItem("stone_block", 5);

    // 3. Create world
    const world = new WorldManager(this, sounds);
    world.generate();

    // 4. Create camera system
    const camera = new CameraSystem(this);

    // 5. Build the context
    this.ctx = {
      scene: this,
      world,
      inventory,
      camera,
      sounds,
    };

    // 6. Create player and pickaxe
    this.createPlayer(sounds);

    // 7. Setup collisions
    this.physics.add.collider(this.player, world.getBlocks());

    // 8. Follow player with camera
    camera.followTarget(this.player);

    // 9. Create gameplay systems
    this.miningSystem = new MiningSystem(this.ctx, this.pickaxe);
    this.placementSystem = new PlacementSystem(this.ctx);

    // 10. Create UI
    this.hotbar = new Hotbar(this, inventory);

    // 11. Handle resize
    this.scale.on("resize", () => this.hotbar.onResize());
  }

  update(_time: number, delta: number): void {
    this.player.update();
    this.pickaxe.update();
    this.miningSystem.update(delta);
    this.placementSystem.update();
  }

  private createPlayer(sounds: GameSounds): void {
    this.player = new Player(this, 0, -SCREEN_HEIGHT / 2 + 100);
    this.player.sounds = sounds;
    this.pickaxe = new Pickaxe(this, this.player);
  }
}
