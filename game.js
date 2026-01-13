import { 
  screenWidth, 
  screenHeight, 
  blockSize, 
  blocksCount, 
  layers, 
  groundY, 
  gravity 
} from './constants.js';
import { Player } from './Player.js';
import { Block } from './Block.js';
import { Background } from './Background.js';

class GameScene extends Phaser.Scene {
  preload() {
    this.load.image('grass_block', './assets/grass_block.png');
    this.load.image('dirt_block', './assets/dirt_block.png');
  }

  create() {
    this.createBackground();
    this.createPlayer();
    this.createBlocks();
    this.setupCollisions();
    this.createCamera();
  }

  createBackground() {
    this.background = new Background(this);
  }

  createPlayer() {
    // Create player at world position
    this.player = new Player(this, 0, -screenHeight / 2 + 100);
  }

  createBlocks() {
    // Create a group for blocks with physics
    this.blocks = this.physics.add.staticGroup();
    
    // Render blocks below the player in world coordinates
    // Blocks start at y = 0 (ground level) and go downward
    for (let y = 0; y < layers; y++) {
      for (let x = -blocksCount / 2; x < blocksCount / 2; x++) {
        const blockY = groundY + (y * blockSize) + (blockSize / 2);
        const blockX = x * blockSize + (blockSize / 2);
        const texture = y === 0 ? 'grass_block' : 'dirt_block';
        
        // Create block instance
        const block = new Block(this, blockX, blockY, texture);
        
        // Add to physics group (this automatically enables static physics)
        this.blocks.add(block);
        
        // Setup physics body after adding to group
        block.setupPhysics();
        
        // Set up click to mine
        block.on('pointerdown', () => {
          this.mineBlock(block);
        });
      }
    }
  }

  mineBlock(block) {
    // Remove block from physics group
    this.blocks.remove(block, true, true);
    
    // Mine the block (triggers destruction)
    block.mine();
  }

  setupCollisions() {
    // Add collision between player and blocks
    this.physics.add.collider(this.player, this.blocks);
  }

  createCamera() {
    // Make camera follow the player
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(0, 0); // Camera follows immediately (no deadzone)
  }

  update() {
    // Update player movement
    if (this.player && this.player.update) {
      this.player.update();
    }
    
    // Update background
    if (this.background && this.background.update) {
      this.background.update();
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: gravity },
      debug: false // Set to true to see physics bodies for debugging
    }
  },
  render: { pixelArt: true }
};

const game = new Phaser.Game(config);
