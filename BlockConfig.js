import { Block } from './Block.js';

// Base class for blocks with life-based textures
class LifeBasedBlock extends Block {
  constructor(scene, x, y, baseTexture, maxLife) {
    super(scene, x, y, baseTexture);
    this.maxLife = maxLife;
    this.life = this.maxLife;
    this.baseTexture = baseTexture;
    this.updateTexture();
  }
  
  updateTexture() {
    // Change texture based on life percentage (no opacity change)
    const lifePercentage = this.life / this.maxLife;
    
    if (lifePercentage > 0.75) {
      // Full health (>75%) - original texture
      this.setTexture(this.baseTexture);
    } else if (lifePercentage > 0.5) {
      // High life (50-75%)
      this.setTexture(`${this.baseTexture}_high_life`);
    } else if (lifePercentage > 0.25) {
      // Medium life (25-50%)
      this.setTexture(`${this.baseTexture}_med_life`);
    } else {
      // Low life (<25%)
      this.setTexture(`${this.baseTexture}_low_life`);
    }
  }
  
  updateOpacity() {
    // Override to update texture instead of opacity
    this.updateTexture();
  }
}

// Grass Block - inherits from LifeBasedBlock
export class GrassBlock extends LifeBasedBlock {
  constructor(scene, x, y) {
    super(scene, x, y, 'grass_block', 100, 'dirt_block');
    // Note: Grass uses dirt_block textures for damage states
  }
}

// Dirt Block - inherits from LifeBasedBlock
export class DirtBlock extends LifeBasedBlock {
  constructor(scene, x, y) {
    super(scene, x, y, 'dirt_block', 100);
  }
}

// Stone Block - inherits from LifeBasedBlock
export class StoneBlock extends LifeBasedBlock {
  constructor(scene, x, y) {
    super(scene, x, y, 'stone_block', 200);
    // Assign stone mining sound if available
    if (scene.sounds && scene.sounds.pickaxeHitStone) {
      this.miningSound = scene.sounds.pickaxeHitStone;
    }
  }
}

// Helper function to create block by texture name
export function createBlockByTexture(scene, x, y, texture) {
  switch (texture) {
    case 'grass_block':
      return new GrassBlock(scene, x, y);
    case 'dirt_block':
      return new DirtBlock(scene, x, y);
    case 'stone_block':
      return new StoneBlock(scene, x, y);
    default:
      // Fallback to base Block class for unknown textures
      const block = new Block(scene, x, y, texture);
      return block;
  }
}
