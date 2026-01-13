import { blockSize } from './constants.js';

export class Pickaxe extends Phaser.GameObjects.Container {
  constructor(scene, player) {
    super(scene, 0, 0);
    
    this.player = player;
    this.scene = scene;
    
    // Create pickaxe sprite
    this.pickaxeSprite = scene.add.image(0, 0, 'pickaxe');
    this.add(this.pickaxeSprite);
    this.pickaxeSprite.setDisplaySize(blockSize, blockSize);
    
    // Set pivot point at the handle (where player holds it)
    this.pickaxeSprite.setOrigin(0.2, 0.9); // Origin near the handle
    
    // Add to scene
    scene.add.existing(this);
    
    // Animation state
    this.isMining = false;
    this.mineAnimationProgress = 0;
    this.baseRotation = 0;
    this.targetRotation = 0;
  }
  
  update() {
    // Get mouse position in world coordinates
    const mouseWorldX = this.scene.cameras.main.scrollX + this.scene.input.mousePointer.x;
    const mouseWorldY = this.scene.cameras.main.scrollY + this.scene.input.mousePointer.y;
    
    // Determine which side of the player the mouse is on
    const mouseRelativeToPlayer = mouseWorldX - this.player.x;
    const isMouseOnLeft = mouseRelativeToPlayer < 0;
    
    // Position pickaxe in the appropriate hand
    const handOffsetX = isMouseOnLeft ? -blockSize * 0.3 : blockSize * 0.3; // Left or right hand
    const handOffsetY = blockSize * 0.4;
    
    // Set position relative to player
    this.x = this.player.x + handOffsetX;
    this.y = this.player.y + handOffsetY;
    this.setDepth(this.player.depth + 1); // In front of player
    
    // Invert pickaxe sprite when on left side (flip both X and Y)
    // Calculate angle to mouse (default target)
    const dx = mouseWorldX - this.x;
    const dy = mouseWorldY - this.y;
    let targetRotation = Math.atan2(dy, dx);
    
    // Update target rotation if we have a mining block
    if (this.currentTargetBlock && this.currentTargetBlock.active) {
      const blockDx = this.currentTargetBlock.x - this.x;
      const blockDy = this.currentTargetBlock.y - this.y;
      targetRotation = Math.atan2(blockDy, blockDx);
    }
    
    // Update target rotation
    this.targetRotation = targetRotation;
    
    // Check if mouse is down to continue mining animation
    const isMouseDown = this.scene.input.mousePointer.isDown;
    
    // Apply mining animation if mining or mouse is down
    if (this.isMining || isMouseDown) {
      // Start mining if mouse is down but not yet mining
      if (isMouseDown && !this.isMining) {
        this.isMining = true;
        this.mineAnimationProgress = 0;
      }
      this.updateMiningAnimation();
    } else {
      // Smoothly rotate to mouse direction when not mining
      this.baseRotation = this.targetRotation;
      this.rotation = this.baseRotation;
      // Reset animation progress when not mining
      if (this.isMining) {
        this.mineAnimationProgress = 0;
      }
    }
    
    // Make sure pickaxe is visible
    this.setVisible(true);
  }
  
  startMining(targetBlock) {
    // Keep mining animation going
    this.isMining = true;
    
    // Store target block for rotation
    this.currentTargetBlock = targetBlock;
    
    // Calculate direction to block or mouse
    if (targetBlock && targetBlock.active) {
      const dx = targetBlock.x - this.x;
      const dy = targetBlock.y - this.y;
      this.targetRotation = Math.atan2(dy, dx);
    }
    // If no target block, rotation is already set to mouse in update()
  }
  
  updateMiningAnimation() {
    // Continuous mining animation - keep swinging at constant velocity
    this.mineAnimationProgress += 0.03; // Animation speed (constant)
    
    // Loop the animation instead of stopping
    if (this.mineAnimationProgress >= 1) {
      this.mineAnimationProgress = 0;
    }
    
    // Swing animation: rotate back and forth continuously
    const swingAngle = Math.sin(this.mineAnimationProgress * Math.PI * 2) * 0.6;
    this.rotation = this.targetRotation + swingAngle;
  }
  
  stopMining() {
    this.isMining = false;
    this.mineAnimationProgress = 0;
    this.currentTargetBlock = null;
  }
}
