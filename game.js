import { 
  screenHeight, 
  blockSize, 
  blocksCount, 
  layers, 
  groundY, 
  gravity,
  MINING_DAMAGE
} from './constants.js';
import { Player } from './Player.js';
import { Block } from './Block.js';
import { Pickaxe } from './Pickaxe.js';

class GameScene extends Phaser.Scene {
  preload() {
    this.load.image('grass_block', './assets/grass_block.png');
    this.load.image('dirt_block', './assets/dirt_block.png');
    this.load.image('pickaxe', './assets/pickaxe.png');
    this.load.image('player_character', './assets/player.png');
  }

  create() {
    this.createPlayer();
    this.createBlocks();
    this.setupCollisions();
    this.createCamera();
  }

  createPlayer() {
    // Create player at world position
    this.player = new Player(this, 0, -screenHeight / 2 + 100);
    
    // Create pickaxe for player
    this.pickaxe = new Pickaxe(this, this.player);
    this.player.pickaxe = this.pickaxe;
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
      }
    }
    
    // Mining state
    this.currentMiningBlock = null;
    this.miningTimer = 0;
    this.miningInterval = 200; // Time between mining attempts (ms)
  }

  mineBlock(block) {
    // Check if block still exists and is active
    if (!block || !block.active) {
      this.currentMiningBlock = null;
      this.miningTimer = 0;
      return;
    }
    
    // Remove block from physics group
    this.blocks.remove(block, true, true);
    
    // Mine the block (triggers destruction)
    block.mine();
    
    // Clear mining state if this was the block we were mining
    if (this.currentMiningBlock === block) {
      this.currentMiningBlock = null;
      this.miningTimer = 0;
      if (this.pickaxe) {
        this.pickaxe.stopMining();
      }
    }
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

  update(time, delta) {
    // Update player movement
    if (this.player && this.player.update) {
      this.player.update();
    }
    
    // Handle continuous mining
    this.handleMining(delta);
    
    // Update pickaxe (rotation to mouse, mining animation)
    if (this.pickaxe && this.pickaxe.update) {
      this.pickaxe.update();
    }
  }
  
  handleMining(delta) {
    const mousePointer = this.input.mousePointer;
    const isMouseDown = mousePointer.isDown;
    
    // Get mouse position in world coordinates
    const mouseWorldX = this.cameras.main.scrollX + mousePointer.x;
    const mouseWorldY = this.cameras.main.scrollY + mousePointer.y;
    
    if (isMouseDown) {
      // Always keep pickaxe animating when mouse is down
      if (this.pickaxe && !this.pickaxe.isMining) {
        this.pickaxe.startMining(null);
      }
      
      // Find block under mouse cursor
      let blockUnderMouse = null;
      
      // Check all blocks to see if mouse is over one
      this.blocks.children.entries.forEach(block => {
        if (block && block.active) {
          const blockBounds = block.getBounds();
          if (blockBounds.contains(mouseWorldX, mouseWorldY)) {
            blockUnderMouse = block;
          }
        }
      });
      
      if (blockUnderMouse) {
        // If we're mining a different block, reset timer
        if (this.currentMiningBlock !== blockUnderMouse) {
          this.currentMiningBlock = blockUnderMouse;
          this.miningTimer = 0;
        }
        
        // Update pickaxe to point at block
        if (this.pickaxe) {
          this.pickaxe.startMining(blockUnderMouse);
        }
        
        // Update mining timer
        this.miningTimer += delta;
        
        // Damage block after interval
        if (this.miningTimer >= this.miningInterval) {
          this.damageBlock(blockUnderMouse);
          this.miningTimer = 0;
        }
      } else {
        // No block under mouse, but keep pickaxe animating
        // Update pickaxe to point at mouse instead
        if (this.pickaxe) {
          this.pickaxe.startMining(null);
        }
        // Clear current mining block
        this.currentMiningBlock = null;
        this.miningTimer = 0;
      }
    } else {
      // Mouse not down, stop mining
      if (this.currentMiningBlock) {
        this.currentMiningBlock = null;
        this.miningTimer = 0;
      }
      if (this.pickaxe) {
        this.pickaxe.stopMining();
      }
    }
  }
  
  damageBlock(block) {
    // Check if block still exists and is active
    if (!block || !block.active) {
      this.currentMiningBlock = null;
      this.miningTimer = 0;
      return;
    }
    
    // Damage the block
    const isDestroyed = block.takeDamage(MINING_DAMAGE);
    
    // If block is destroyed, remove it
    if (isDestroyed) {
      this.mineBlock(block);
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
