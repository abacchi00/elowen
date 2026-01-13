import { screenWidth, screenHeight, blockSize, blocksCount } from './constants.js';

export class Background {
  constructor(scene) {
    this.scene = scene;
    this.createSky();
    this.createClouds();
  }

  createSky() {
    // Create sky gradient background
    const skyHeight = screenHeight * 3; // Tall enough sky
    const skyWidth = screenWidth * 10; // Wide enough for horizontal scrolling
    
    // Create sky texture with gradient
    const textureKey = 'sky_background';
    
    if (!this.scene.textures.exists(textureKey)) {
      const graphics = this.scene.add.graphics();
      
      // Create gradient effect (light blue to lighter blue)
      for (let i = 0; i < skyHeight; i++) {
        const ratio = i / skyHeight;
        // Gradient from darker blue at bottom to lighter blue at top
        const r = Math.floor(135 + (40 * ratio)); // 135 to 175
        const g = Math.floor(206 + (30 * ratio)); // 206 to 236
        const b = Math.floor(250 + (5 * ratio));  // 250 to 255
        
        graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
        graphics.fillRect(0, i, skyWidth, 1);
      }
      
      graphics.generateTexture(textureKey, skyWidth, skyHeight);
      graphics.destroy();
    }
    
    // Create sky as a tile sprite that can scroll
    // Position it high up in the world
    this.sky = this.scene.add.tileSprite(0, -skyHeight / 2, skyWidth, skyHeight, textureKey);
    this.sky.setOrigin(0, 0);
    this.sky.setDepth(-1000); // Behind everything
    this.sky.setScrollFactor(0.1, 0); // Slight parallax effect
  }

  createClouds() {
    // Create cloud group
    this.clouds = this.scene.add.group();
    
    const cloudTextureKey = 'cloud';
    
    // Create cloud texture if it doesn't exist
    if (!this.scene.textures.exists(cloudTextureKey)) {
      const graphics = this.scene.add.graphics();
      
      // Draw fluffy cloud
      graphics.fillStyle(0xFFFFFF, 0.8);
      
      // Main cloud body (multiple overlapping circles)
      const cloudWidth = blockSize * 8;
      const cloudHeight = blockSize * 4;
      
      // Large circles for cloud shape
      graphics.fillCircle(cloudWidth * 0.3, cloudHeight * 0.5, cloudHeight * 0.6);
      graphics.fillCircle(cloudWidth * 0.5, cloudHeight * 0.5, cloudHeight * 0.7);
      graphics.fillCircle(cloudWidth * 0.7, cloudHeight * 0.5, cloudHeight * 0.6);
      graphics.fillCircle(cloudWidth * 0.4, cloudHeight * 0.3, cloudHeight * 0.5);
      graphics.fillCircle(cloudWidth * 0.6, cloudHeight * 0.3, cloudHeight * 0.5);
      
      graphics.generateTexture(cloudTextureKey, cloudWidth, cloudHeight);
      graphics.destroy();
    }
    
    // Create multiple clouds across the sky
    const cloudCount = 15;
    const skyTop = -screenHeight * 1.5;
    const skyBottom = -screenHeight * 0.5;
    const cloudSpread = blocksCount * blockSize;
    
    for (let i = 0; i < cloudCount; i++) {
      const cloudX = (Math.random() * cloudSpread) - (cloudSpread / 2);
      const cloudY = skyTop + Math.random() * (skyBottom - skyTop);
      
      const cloud = this.scene.add.image(cloudX, cloudY, cloudTextureKey);
      cloud.setDepth(-999); // Behind ground but above sky
      cloud.setAlpha(0.7 + Math.random() * 0.3); // Random transparency
      cloud.setScrollFactor(0.05, 0); // Parallax effect (clouds move slower)
      
      this.clouds.add(cloud);
    }
  }

  update() {
    // Scroll sky if needed (for parallax)
    if (this.sky) {
      // Sky moves very slowly for parallax effect
      // this.sky.tilePositionX += 0.1;
    }
  }
}
