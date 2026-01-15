import { blockSize } from './constants.js';

export class Block extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    
    // Store scene reference explicitly
    this.blockScene = scene;
    
    // Add to scene
    scene.add.existing(this);
    
    // Set display properties
    this.setDisplaySize(blockSize, blockSize);
    
    // Block life system - subclasses should override maxLife
    this.maxLife = 100; // Default, override in subclasses
    this.life = this.maxLife;
    this.updateOpacity();
    
    // Mining sound - subclasses should override
    this.miningSound = null;
    
    // Hover outline graphics
    this.hoverOutline = null;
    
    // Make block interactive for mouse events
    this.setInteractive({ useHandCursor: true });
    
    // Set up hover effects
    this.setupHoverEffects();
  }
  
  updateOpacity() {
    // Base implementation - no opacity change by default
    // Subclasses can override to add custom visual updates
  }
  
  takeDamage(damage) {
    // Play mining sound if this block has a custom sound
    if (this.miningSound) {
      this.miningSound.play();
    }
    
    // Reduce life
    this.life = Math.max(0, this.life - damage);
    
    // Update visual opacity
    this.updateOpacity();
    
    // Return true if block is destroyed
    return this.life <= 0;
  }
  
  // Called after adding to physics group to refresh body
  setupPhysics() {
    if (this.body) {
      this.body.updateFromGameObject();
    }
  }
  
  setupHoverEffects() {
    // Show white outline on mouseover
    this.on('pointerover', () => {
      if (!this.hoverOutline) {
        // Create white outline rectangle
        this.hoverOutline = this.blockScene.add.graphics();
        this.hoverOutline.lineStyle(2, 0xFFFFFF, 1); // 2px white line
        // Draw rectangle at block's position
        this.hoverOutline.strokeRect(-blockSize / 2, -blockSize / 2, blockSize, blockSize);
        // Position outline at block's position
        this.hoverOutline.x = this.x;
        this.hoverOutline.y = this.y;
        this.hoverOutline.setDepth(this.depth + 1); // Above the block
        this.hoverOutline.setScrollFactor(1, 1); // Move with camera like block
      }
    });
    
    // Remove outline on mouseout
    this.on('pointerout', () => {
      if (this.hoverOutline) {
        this.hoverOutline.destroy();
        this.hoverOutline = null;
      }
    });
  }
  
  resetLife() {
    // Reset life to max (useful if needed)
    this.life = this.maxLife;
    this.updateOpacity();
  }
  
  mine() {
    // Clean up hover outline if it exists
    if (this.hoverOutline) {
      this.hoverOutline.destroy();
      this.hoverOutline = null;
    }
    
    // Trigger mine event before destroying (if scene exists)
    if (this.blockScene && this.blockScene.events) {
      this.blockScene.events.emit('blockMined', this);
    }
    
    // Destroy the block
    this.destroy();
  }
}
