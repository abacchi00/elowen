import { blockSize, HOVER_TINT } from './constants.js';

export class Block extends Phaser.GameObjects.Image {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    
    // Add to scene
    scene.add.existing(this);
    
    // Set display properties
    this.setDisplaySize(blockSize, blockSize);
    
    // Make block interactive for mouse events
    this.setInteractive({ useHandCursor: true });
    
    // Set up hover effects
    this.setupHoverEffects();
  }
  
  // Called after adding to physics group to refresh body
  setupPhysics() {
    if (this.body) {
      this.body.updateFromGameObject();
    }
  }
  
  setupHoverEffects() {
    // Darken on mouseover
    this.on('pointerover', () => {
      this.setTint(HOVER_TINT);
    });
    
    // Restore original appearance on mouseout
    this.on('pointerout', () => {
      this.clearTint();
    });
  }
  
  mine() {
    // Trigger mine event before destroying
    this.scene.events.emit('blockMined', this);
    
    // Destroy the block
    this.destroy();
  }
}
