import { Block } from './Block.js';

// Grass Block - inherits from Block
export class GrassBlock extends Block {
  constructor(scene, x, y) {
    super(scene, x, y, 'grass_block');
    this.maxLife = 100;
    this.life = this.maxLife;
    this.updateOpacity();
  }
}

// Dirt Block - inherits from Block
export class DirtBlock extends Block {
  constructor(scene, x, y) {
    super(scene, x, y, 'dirt_block');
    this.maxLife = 50;
    this.life = this.maxLife;
    this.updateOpacity();
  }
}

// Stone Block - inherits from Block
export class StoneBlock extends Block {
  constructor(scene, x, y) {
    super(scene, x, y, 'stone_block');
    this.maxLife = 200;
    this.life = this.maxLife;
    this.updateOpacity();
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
