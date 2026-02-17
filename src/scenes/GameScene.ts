import Phaser from "phaser";
import { SCREEN_HEIGHT } from "@/config/constants";
import { GameContext } from "@/types";
import { Player, Boar } from "@/entities";
import {
  AssetsManager,
  SoundManager,
  BackgroundManager,
  PerformanceManager,
} from "@/managers";
import {
  CameraSystem,
  MiningSystem,
  InventorySystem,
  PlacementSystem,
  PickupSystem,
  HeldItemSystem,
} from "@/systems";
import { WorldManager } from "@/world";
import { Hotbar } from "@/ui";

/**
 * Main game scene - simplified using WorldManager and GameContext.
 */
export class GameScene extends Phaser.Scene {
  // Core context shared by all systems
  private ctx!: GameContext;

  // Entities (not in context as they're scene-specific)
  private player!: Player;
  private boars!: Phaser.GameObjects.Group;

  // Managers
  private soundManager!: SoundManager;
  backgroundManager!: BackgroundManager;
  performanceManager!: PerformanceManager;
  private worldManager!: WorldManager;

  // Systems
  miningSystem!: MiningSystem;
  private placementSystem!: PlacementSystem;
  private pickupSystem!: PickupSystem;
  private heldItemSystem!: HeldItemSystem;

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
    inventory.addItem("grass_block", 20);
    inventory.addItem("pickaxe", 1);

    // 3. Create world
    this.worldManager = new WorldManager(this, sounds);
    this.worldManager.generate();

    // 4. Create camera system
    const camera = new CameraSystem(this);

    // 5. Build the context
    this.ctx = {
      scene: this,
      world: this.worldManager,
      inventory,
      camera,
      sounds,
    };

    // 6. Create player
    this.player = new Player(this, 0, -SCREEN_HEIGHT / 2 + 100);
    this.player.sounds = sounds;

    // Temporary: Create boars.
    this.boars = this.add.group();
    const boarSpawnXPositions = [
      -1500, -1000, -500, -100, 100, 500, 1000, 1500,
    ];
    for (const x of boarSpawnXPositions) {
      this.boars.add(new Boar(this, x, -SCREEN_HEIGHT / 2 + 100));
    }

    this.physics.add.collider(this.boars, this.worldManager.getBlocks());

    // 7. Setup collisions
    this.physics.add.collider(this.player, this.worldManager.getBlocks());
    this.physics.add.collider(
      this.worldManager.getDroppedItems(),
      this.worldManager.getBlocks(),
    ); // Items collide with blocks

    // 8. Follow player with camera
    camera.followTarget(this.player);

    // 9. Create gameplay systems
    this.miningSystem = new MiningSystem(this.ctx);
    this.heldItemSystem = new HeldItemSystem(this.ctx);
    this.placementSystem = new PlacementSystem(this.ctx);
    this.pickupSystem = new PickupSystem(this.ctx, this.player);

    // 10. Create UI
    this.hotbar = new Hotbar(this, inventory);

    // 11. Create performance monitor (after Hotbar so it renders on the UI camera)
    this.performanceManager = new PerformanceManager(this);

    // 12. Play background music
    this.ctx.sounds.backgroundMusic.play();

    // 13. Handle resize
    this.scale.on("resize", () => this.hotbar.onResize());
  }

  update(_time: number, delta: number): void {
    this.player.update();
    this.boars.children.each(child => {
      (child as Boar).update();
      return true;
    });
    this.placementSystem.update();
    this.pickupSystem.update();
    this.heldItemSystem.update(delta, this.player.getBodyCenter());
    this.backgroundManager.update(undefined, delta);
    this.worldManager.updateHoverHighlight();
    this.performanceManager.update(this);
  }
}
