import { blockSize } from './constants.js';

export class Tree extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'tree');
    
    // Store scene reference
    this.treeScene = scene;
    
    // Add to scene
    scene.add.existing(this);
    
    // Set display properties - trees are taller than blocks
    this.setDisplaySize(blockSize * 12, blockSize * 12); // 2x height
    
    // Tree life system
    this.maxLife = 80;
    this.life = this.maxLife;
    
    // Mining sound - use default pickaxe hit
    this.miningSound = null;
    
    // Hover outline graphics
    this.hoverOutline = null;
    
    // Make tree interactive for mouse events
    this.setInteractive({ useHandCursor: true });
    
    // Set up hover effects
    this.setupHoverEffects();
    
    // Trees are passable - no physics body needed
    // Set origin to bottom center so tree sits on ground
    this.setOrigin(0.5, 0.85);
    
    // Add slight black tint to some trees for variance (30% chance)
    if (Math.random() < 0.3) {
      // Apply a slight dark tint (0xCCCCCC = light gray, darker than white)
      // Lower values = darker tint
      this.setTint(0xCCCCCC); // Slight darkening
    }
  }
  
  takeDamage(damage) {
    // Play mining sound if available
    if (this.miningSound) {
      this.miningSound.play();
    }
    
    // Reduce life
    this.life = Math.max(0, this.life - damage);
    
    // Return true if tree is destroyed
    return this.life <= 0;
  }
  
  setupHoverEffects() {
    // Show white outline on mouseover
    this.on('pointerover', () => {
      if (!this.hoverOutline) {
        // Create white outline rectangle
        this.hoverOutline = this.treeScene.add.graphics();
        this.hoverOutline.lineStyle(2, 0xFFFFFF, 1); // 2px white line
        // Draw rectangle at tree's position (accounting for 2x height)
        this.hoverOutline.strokeRect(-blockSize / 2, -blockSize, blockSize, blockSize);
        // Position outline at tree's position
        this.hoverOutline.x = this.x;
        this.hoverOutline.y = this.y;
        this.hoverOutline.setDepth(this.depth + 1); // Above the tree
        this.hoverOutline.setScrollFactor(1, 1); // Move with camera like tree
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
  
  mine() {
    // Clean up hover outline if it exists
    if (this.hoverOutline) {
      this.hoverOutline.destroy();
      this.hoverOutline = null;
    }
    
    // Trigger mine event before destroying (if scene exists)
    if (this.treeScene && this.treeScene.events) {
      this.treeScene.events.emit('treeMined', this);
    }
    
    // Destroy the tree
    this.destroy();
  }
}
