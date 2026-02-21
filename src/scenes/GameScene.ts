import Phaser from "phaser";
import { SCREEN_HEIGHT } from "@/config/constants";
import { GameContext } from "@/types";
import { Player } from "@/entities";
import {
  AssetsManager,
  SoundManager,
  BackgroundManager,
  PerformanceManager,
  MobManager,
  ItemManager,
} from "@/managers";
import {
  CameraSystem,
  MiningSystem,
  InventorySystem,
  PlacementSystem,
  PickupSystem,
  HeldItemSystem,
  CombatSystem,
} from "@/systems";
import { WorldManager } from "@/world";
import { Hotbar } from "@/ui";

/**
 * Main game scene — orchestrates managers, systems, and entities.
 */
export class GameScene extends Phaser.Scene {
  private ctx!: GameContext;

  // Entities
  private player!: Player;

  // Managers
  private soundManager!: SoundManager;
  private backgroundManager!: BackgroundManager;
  private performanceManager!: PerformanceManager;
  private worldManager!: WorldManager;
  private mobManager!: MobManager;
  private itemManager!: ItemManager;

  // Systems
  private placementSystem!: PlacementSystem;
  private pickupSystem!: PickupSystem;
  private heldItemSystem!: HeldItemSystem;
  private combatSystem!: CombatSystem;

  // UI
  private hotbar!: Hotbar;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    AssetsManager.loadAll(this.load);
  }

  create(): void {
    this.initManagers();
    this.createEntities();
    this.setupCollisions();
    this.initSystems();
    this.initUI();

    this.ctx.sounds.backgroundMusic.play();
    this.scale.on("resize", () => this.hotbar.onResize());
  }

  update(_time: number, delta: number): void {
    this.player.update();
    this.mobManager.update();
    this.placementSystem.update();
    this.pickupSystem.update();
    this.heldItemSystem.update(delta, this.player.getBodyCenter());
    this.combatSystem.update();
    this.backgroundManager.update(undefined, delta);
    this.worldManager.updateHoverHighlight();
    this.performanceManager.update(this);
  }

  private initManagers(): void {
    this.backgroundManager = new BackgroundManager(this);
    this.soundManager = new SoundManager(this.sound);
    const sounds = this.soundManager.getSounds();

    const inventory = new InventorySystem(9);
    const camera = new CameraSystem(this);

    this.worldManager = new WorldManager(this, sounds);
    this.worldManager.generate();

    this.itemManager = new ItemManager(this);
    this.mobManager = new MobManager(this);

    this.ctx = {
      scene: this,
      world: this.worldManager,
      items: this.itemManager,
      inventory,
      camera,
      sounds,
    };
  }

  private createEntities(): void {
    this.player = new Player(
      this,
      0,
      -SCREEN_HEIGHT / 2 + 100,
      this.ctx.sounds,
    );
    this.ctx.camera.followTarget(this.player);
  }

  private setupCollisions(): void {
    const blocks = this.worldManager.getBlocks();

    this.physics.add.collider(this.player, blocks);
    this.physics.add.collider(this.itemManager.getDroppedItems(), blocks);
    this.mobManager.setupCollisions(blocks);
  }

  private initSystems(): void {
    // MiningSystem is event-driven — it only needs to be instantiated
    new MiningSystem(this.ctx);
    this.heldItemSystem = new HeldItemSystem(this.ctx);
    this.placementSystem = new PlacementSystem(this.ctx);
    this.pickupSystem = new PickupSystem(this.ctx, this.player);
    this.combatSystem = new CombatSystem(
      this,
      this.mobManager.getMobs(),
      this.player,
      this.heldItemSystem,
      this.itemManager,
    );
  }

  private initUI(): void {
    this.hotbar = new Hotbar(this, this.ctx.inventory);
    this.performanceManager = new PerformanceManager(this);
  }
}
