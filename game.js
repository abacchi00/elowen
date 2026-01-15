import { 
  screenHeight, 
  blockSize, 
  blocksCount, 
  groundY, 
  gravity,
  MINING_DAMAGE
} from './constants.js';
import { Player } from './Player.js';
import { Pickaxe } from './Pickaxe.js';
import { TerrainGenerator } from './TerrainGenerator.js';
import { createBlockByTexture } from './BlockConfig.js';

class GameScene extends Phaser.Scene {
  preload() {
    this.load.image('grass_block', './assets/grass_block.png');
    this.load.image('dirt_block', './assets/dirt_block.png');
    this.load.image('stone_block', './assets/stone_block.png');
    this.load.image('pickaxe', './assets/pickaxe.png');
    this.load.image('player_sprite_right', './assets/player_sprite_right.png');
    this.load.image('player_sprite_left', './assets/player_sprite_left.png');
    
    // Load audio files
    this.load.audio('running', './assets/running.mp3');
    this.load.audio('jump', './assets/jump.mp3');
    this.load.audio('pickaxe_hit', './assets/pickaxe_hit.mp3');
    this.load.audio('pickaxe_hit_stone', './assets/pickaxe_hit_stone.mp3');
  }

  create() {
    this.createSkyBackground();
    this.createPlayer();
    this.setupSounds(); // Setup sounds before creating blocks so stone blocks can use the sound
    this.generateTerrain();
    this.createBlocks();
    this.setupCollisions();
    this.createCamera();
  }
  
  createSkyBackground() {
    // Create a simple sky blue background
    const skyHeight = screenHeight * 20; // Very tall to cover everything
    const skyWidth = blocksCount * blockSize * 4; // Very wide to cover everything
    
    // Create sky using graphics
    const graphics = this.add.graphics();
    graphics.fillStyle(0x87CEEB); // Sky blue color
    graphics.fillRect(-skyWidth / 2, -skyHeight / 2, skyWidth, skyHeight);
    
    // Position at world origin
    graphics.x = 0;
    graphics.y = 0;
    graphics.setDepth(-1000); // Behind everything
    graphics.setScrollFactor(1, 1); // No parallax - moves with camera normally
    
    this.sky = graphics;
  }
  
  setupSounds() {
    // Create sound objects
    this.sounds = {
      running: this.sound.add('running', { loop: true, volume: 2 }),
      jump: this.sound.add('jump', { volume: 0.6 }),
      pickaxeHit: this.sound.add('pickaxe_hit', { volume: 0.4 }),
      pickaxeHitStone: this.sound.add('pickaxe_hit_stone', { volume: 0.5 }),
    };
    
    // Pass sounds to player
    if (this.player) {
      this.player.sounds = this.sounds;
    }
  }
  
  
  generateTerrain() {
    // Generate terrain matrix
    const terrainGen = new TerrainGenerator();
    this.mapMatrix = terrainGen.generate();
    this.terrainGenerator = terrainGen; // Store for block updates
  }

  createPlayer() {
    // Create player at world position
    this.player = new Player(this, 0, -screenHeight / 2 + 100);
    
    // Create pickaxe for player
    this.pickaxe = new Pickaxe(this, this.player);
    this.player.pickaxe = this.pickaxe;
    
    // Pass sounds to player if they exist
    if (this.sounds) {
      this.player.sounds = this.sounds;
    }
  }

  createBlocks() {
    // Create a group for blocks with physics
    this.blocks = this.physics.add.staticGroup();
    
    // Create blocks from matrix
    for (let matrixX = 0; matrixX < this.mapMatrix.length; matrixX++) {
      for (let matrixY = 0; matrixY < this.mapMatrix[matrixX].length; matrixY++) {
        const blockType = this.mapMatrix[matrixX][matrixY];
        
        // Skip if no block at this position
        if (!blockType) continue;
        
        // Convert matrix coordinates to world coordinates
        const worldX = (matrixX - Math.floor(blocksCount / 2)) * blockSize + (blockSize / 2);
        // For mountains: matrixY=0 represents the highest point (top of tallest mountain)
        // Calculate max height to offset properly
        const maxHeight = Math.max(...this.terrainGenerator.heightMap || [0]);
        // Offset worldY so mountains go upward (smaller matrixY = higher worldY = higher up)
        // Invert: matrixY 0 (top of mountain) → negative worldY (higher up)
        const worldY = groundY - (maxHeight - matrixY) * blockSize + (blockSize / 2);
        
        // Create block instance using factory function (uses inheritance)
        const block = createBlockByTexture(this, worldX, worldY, blockType);
        
        // Store matrix coordinates in block for later reference
        block.matrixX = matrixX;
        block.matrixY = matrixY;
        
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
    
    // Update matrix to remove block
    if (this.terrainGenerator && block.matrixX !== undefined && block.matrixY !== undefined) {
      this.mapMatrix[block.matrixX][block.matrixY] = null;
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
    // Update player movement first
    if (this.player && this.player.update) {
      this.player.update();
    }
    
    // Update pickaxe IMMEDIATELY after player - this ensures we get the latest player position
    // Do this before any other updates to minimize delay
    if (this.pickaxe && this.pickaxe.update) {
      this.pickaxe.update();
    }
    
    // Handle continuous mining
    this.handleMining(delta);
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
          // Play default pickaxe hit sound (block will play its own sound if it has one)
          if (this.sounds && this.sounds.pickaxeHit && !blockUnderMouse.miningSound) {
            this.sounds.pickaxeHit.play();
          }
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
  render: { 
    pixelArt: true,
    backgroundColor: 0x4b90ac // Sky blue background color (fallback) - use hex number
  }
};

const game = new Phaser.Game(config);
