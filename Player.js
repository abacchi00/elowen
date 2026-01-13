import { blockSize, speed, jumpSpeed, screenHeight } from './constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Create a simple character texture
    super(scene, x, y, 'player_character');
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set display properties
    this.setDisplaySize(blockSize, blockSize * 2);
    this.setCollideWorldBounds(false);
    this.setBounce(0);
    
    // Player state
    this.isOnGround = false;
    
    // Input controls
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
    
    // Pickaxe (will be created by game scene)
    this.pickaxe = null;
  }
  
  update() {
    // Check if player is on ground
    this.isOnGround = this.body.touching.down;
    
    // Reset horizontal velocity
    this.setVelocityX(0);
    
    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.setVelocityX(speed);
    }
    
    // Jumping (only when on ground)
    if ((this.cursors.up.isDown || this.wasd.W.isDown || this.cursors.space.isDown) && this.isOnGround) {
      this.setVelocityY(-jumpSpeed);
      this.isOnGround = false;
    }
  }
}
