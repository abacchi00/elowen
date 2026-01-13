import { blockSize, speed, jumpSpeed, screenHeight } from './constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    // Create a simple character texture
    const characterTexture = Player.createCharacterTexture(scene);
    
    super(scene, x, y, characterTexture);
    
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
  }
  
  static createCharacterTexture(scene) {
    const width = blockSize;
    const height = blockSize * 2;
    const textureKey = 'player_character';
    
    // Check if texture already exists
    if (scene.textures.exists(textureKey)) {
      return textureKey;
    }
    
    // Create graphics for drawing the character
    const graphics = scene.add.graphics();
    
    // Head (circle at top)
    const headSize = blockSize * 0.6;
    const headY = blockSize * 0.2;
    graphics.fillStyle(0xFFD4A3); // Skin tone
    graphics.fillCircle(width / 2, headY, headSize / 2);
    
    // Body (rectangle)
    const bodyWidth = blockSize * 0.7;
    const bodyHeight = blockSize * 0.9;
    const bodyY = blockSize * 0.6;
    graphics.fillStyle(0x4A90E2); // Blue shirt
    graphics.fillRect((width - bodyWidth) / 2, bodyY, bodyWidth, bodyHeight);
    
    // Arms (horizontal rectangles)
    const armWidth = blockSize * 0.3;
    const armHeight = blockSize * 0.25;
    const armY = blockSize * 0.7;
    graphics.fillStyle(0xFFD4A3); // Skin tone for arms
    // Left arm
    graphics.fillRect(-armWidth * 0.8, armY, armWidth, armHeight);
    // Right arm
    graphics.fillRect(width - armWidth * 0.2, armY, armWidth, armHeight);
    
    // Legs (two rectangles at bottom)
    const legWidth = blockSize * 0.25;
    const legHeight = blockSize * 0.5;
    const legY = blockSize * 1.5;
    graphics.fillStyle(0x2D5016); // Dark green pants
    // Left leg
    graphics.fillRect(width / 2 - legWidth * 0.8, legY, legWidth, legHeight);
    // Right leg
    graphics.fillRect(width / 2 + legWidth * 0.3, legY, legWidth, legHeight);
    
    // Eyes (two small circles)
    const eyeSize = blockSize * 0.08;
    const eyeY = headY - blockSize * 0.05;
    graphics.fillStyle(0x000000); // Black eyes
    // Left eye
    graphics.fillCircle(width / 2 - blockSize * 0.15, eyeY, eyeSize);
    // Right eye
    graphics.fillCircle(width / 2 + blockSize * 0.15, eyeY, eyeSize);
    
    // Generate texture from graphics
    graphics.generateTexture(textureKey, width, height);
    graphics.destroy();
    
    return textureKey;
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
