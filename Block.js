import { blockSize, HOVER_TINT, BLOCK_MAX_LIFE } from './constants.js';

export class Block extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    
    // Store scene reference explicitly
    this.blockScene = scene;
    
    // Add to scene
    scene.add.existing(this);
    
    // Set display properties
    this.setDisplaySize(blockSize, blockSize);
    
    // Block life system
    this.maxLife = BLOCK_MAX_LIFE;
    this.life = BLOCK_MAX_LIFE;
    this.updateOpacity();
    
    // Make block interactive for mouse events
    this.setInteractive({ useHandCursor: true });
    
    // Set up hover effects
    this.setupHoverEffects();
  }
  
  updateOpacity() {
    // Update opacity based on life percentage (0 to 1)
    const opacity = Math.max(0.01, this.life / this.maxLife); // Minimum opacity of 0.3
    this.setAlpha(opacity);
  }
  
  takeDamage(damage) {
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
    // Darken on mouseover (but preserve opacity)
    this.on('pointerover', () => {
      this.setTint(HOVER_TINT);
    });
    
    // Restore original appearance on mouseout
    this.on('pointerout', () => {
      this.clearTint();
    });
  }
  
  resetLife() {
    // Reset life to max (useful if needed)
    this.life = this.maxLife;
    this.updateOpacity();
  }
  
  mine() {
    // Trigger mine event before destroying (if scene exists)
    if (this.blockScene && this.blockScene.events) {
      this.blockScene.events.emit('blockMined', this);
    }
    
    // Destroy the block
    this.destroy();
  }
}
