import { blockSize, speed, jumpSpeed, screenHeight } from './constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Create a simple character texture
    super(scene, x, y, 'player_sprite_right');
    
    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    
    // Set display properties
    this.setDisplaySize(blockSize * 2, blockSize * 3);
    this.setCollideWorldBounds(false);
    this.setBounce(0);
    
    // Player state
    this.isOnGround = false;
    this.wasMoving = false;
    
    // Input controls
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.wasd = scene.input.keyboard.addKeys('W,S,A,D');
    
    // Pickaxe (will be created by game scene)
    this.pickaxe = null;
    
    // Sounds (will be set by game scene)
    this.sounds = null;
  }
  
  update() {
    // Check if player is on ground
    this.isOnGround = this.body.touching.down;
    
    // Reset horizontal velocity
    this.setVelocityX(0);
    
    // Track if player is moving horizontally
    const isMoving = (this.cursors.left.isDown || this.wasd.A.isDown || 
                     this.cursors.right.isDown || this.wasd.D.isDown) && this.isOnGround;
    
    // Horizontal movement
    if (this.cursors.left.isDown || this.wasd.A.isDown) {
      this.setVelocityX(-speed);
      this.setTexture('player_sprite_left');
    } else if (this.cursors.right.isDown || this.wasd.D.isDown) {
      this.setVelocityX(speed);
      this.setTexture('player_sprite_right');
    }
    
    // Handle walking sound
    if (isMoving && this.isOnGround) {
      if (!this.wasMoving && this.sounds && this.sounds.running) {
        this.sounds.running.play();
      }
      this.wasMoving = true;
    } else {
      if (this.wasMoving && this.sounds && this.sounds.running) {
        this.sounds.running.stop();
      }
      this.wasMoving = false;
    }
    
    // Jumping (only when on ground)
    if ((this.cursors.up.isDown || this.wasd.W.isDown || this.cursors.space.isDown) && this.isOnGround) {
      this.setVelocityY(-jumpSpeed);
      this.isOnGround = false;
      // Play jump sound
      if (this.sounds && this.sounds.jump) {
        this.sounds.jump.play();
      }
      // Stop running sound when jumping
      if (this.sounds && this.sounds.running) {
        this.sounds.running.stop();
      }
      this.wasMoving = false;
    }
  }
}
