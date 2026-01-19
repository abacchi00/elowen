import Phaser from 'phaser';
import { 
  BLOCK_SIZE, 
  BLOCKS_COUNT, 
  GROUND_Y, 
  SCREEN_HEIGHT,
  TREE_SPAWN_CHANCE 
} from '../config/constants';
import { BlockType, BlockMatrix, GameSounds } from '../types';
import { Player, Pickaxe, Tree } from '../entities';
import { Block, BlockFactory } from '../blocks';
import { AssetsManager, SoundManager, BackgroundManager } from '../managers';
import { CameraSystem, MiningSystem, InventorySystem, PlacementSystem } from '../systems';
import { TerrainGenerator } from '../terrain';
import { Hotbar } from '../ui';

/**
 * Main game scene that orchestrates all game systems.
 */
export class GameScene extends Phaser.Scene {
  // Entities
  private player!: Player;
  private pickaxe!: Pickaxe;

  // Groups
  private blocks!: Phaser.Physics.Arcade.StaticGroup;
  private trees!: Phaser.GameObjects.Group;

  // Managers
  private soundManager!: SoundManager;
  backgroundManager!: BackgroundManager;

  // Systems
  private cameraSystem!: CameraSystem;
  private miningSystem!: MiningSystem;
  private inventorySystem!: InventorySystem;
  private placementSystem!: PlacementSystem;

  // UI
  private hotbar!: Hotbar;

  // Terrain
  private terrainGenerator!: TerrainGenerator;
  private mapMatrix!: BlockMatrix;
  private maxHeight!: number;

  // Sounds reference for blocks
  private sounds!: GameSounds;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    AssetsManager.loadAll(this.load);
  }

  create(): void {
    this.initializeManagers();
    this.initializeInventory();
    this.createPlayer();
    this.generateTerrain();
    this.createBlocks();
    this.setupCollisions();
    this.initializeSystems();
    this.createUI();
    this.setupResizeHandler();
  }

  update(_time: number, delta: number): void {
    this.player.update();
    this.pickaxe.update();
    this.miningSystem.update(delta);
    this.placementSystem.update();
  }

  private initializeManagers(): void {
    this.backgroundManager = new BackgroundManager(this);
    this.soundManager = new SoundManager(this.sound);
    this.sounds = this.soundManager.getSounds();
  }

  private initializeInventory(): void {
    this.inventorySystem = new InventorySystem(9);
    
    // Give player some starting items for testing
    this.inventorySystem.addItem('dirt_block', 10);
    this.inventorySystem.addItem('stone_block', 5);
  }

  private createPlayer(): void {
    this.player = new Player(this, 0, -SCREEN_HEIGHT / 2 + 100);
    this.player.sounds = this.sounds;

    this.pickaxe = new Pickaxe(this, this.player);
  }

  private generateTerrain(): void {
    this.terrainGenerator = new TerrainGenerator();
    this.mapMatrix = this.terrainGenerator.generate();
    this.maxHeight = Math.max(...this.terrainGenerator.heightMap);
  }

  private createBlocks(): void {
    this.blocks = this.physics.add.staticGroup();
    this.trees = this.add.group();

    const blockFactory = new BlockFactory(this, this.sounds);

    for (let matrixX = 0; matrixX < this.mapMatrix.length; matrixX++) {
      for (let matrixY = 0; matrixY < this.mapMatrix[matrixX].length; matrixY++) {
        const blockType = this.mapMatrix[matrixX][matrixY];
        if (!blockType) continue;

        const worldPos = this.matrixToWorld(matrixX, matrixY, this.maxHeight);
        const block = this.createBlock(blockFactory, worldPos.x, worldPos.y, blockType);
        
        block.matrixX = matrixX;
        block.matrixY = matrixY;

        this.blocks.add(block);
        block.setupPhysics();

        // Spawn trees on grass blocks
        if (blockType === 'grass_block' && Math.random() < TREE_SPAWN_CHANCE) {
          this.createTree(worldPos.x, worldPos.y, block.depth);
        }
      }
    }
  }

  private matrixToWorld(matrixX: number, matrixY: number, maxHeight: number): { x: number; y: number } {
    const worldX = (matrixX - Math.floor(BLOCKS_COUNT / 2)) * BLOCK_SIZE + (BLOCK_SIZE / 2);
    const worldY = GROUND_Y - (maxHeight - matrixY) * BLOCK_SIZE + (BLOCK_SIZE / 2);
    return { x: worldX, y: worldY };
  }

  private createBlock(factory: BlockFactory, x: number, y: number, type: BlockType): Block {
    return factory.create(x, y, type);
  }

  private createTree(worldX: number, worldY: number, blockDepth: number): void {
    const tree = new Tree(this, worldX, worldY - BLOCK_SIZE / 2);
    tree.setDepth(blockDepth - 1);
    this.trees.add(tree);
  }

  private setupCollisions(): void {
    this.physics.add.collider(this.player, this.blocks);
  }

  private initializeSystems(): void {
    this.cameraSystem = new CameraSystem(this);
    this.cameraSystem.followTarget(this.player);

    this.miningSystem = new MiningSystem(
      this,
      this.blocks,
      this.trees,
      this.pickaxe,
      this.cameraSystem,
      this.sounds,
      this.mapMatrix,
      this.inventorySystem
    );

    this.placementSystem = new PlacementSystem(
      this,
      this.blocks,
      this.inventorySystem,
      this.cameraSystem,
      this.mapMatrix,
      this.sounds,
      this.maxHeight
    );
  }

  private createUI(): void {
    this.hotbar = new Hotbar(this, this.inventorySystem);
  }

  private setupResizeHandler(): void {
    this.scale.on('resize', () => {
      this.hotbar.onResize();
    });
  }
}
