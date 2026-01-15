import Phaser from 'phaser';
import { Block } from './Block';
import { GrassBlock } from './GrassBlock';
import { DirtBlock } from './DirtBlock';
import { StoneBlock } from './StoneBlock';
import { BlockType, GameSounds } from '../types';

/**
 * Factory for creating block instances based on block type.
 * Implements the Factory Pattern for block creation.
 */
export class BlockFactory {
  private scene: Phaser.Scene;
  private sounds: GameSounds | null;

  constructor(scene: Phaser.Scene, sounds: GameSounds | null = null) {
    this.scene = scene;
    this.sounds = sounds;
  }

  /**
   * Creates a block instance based on the block type.
   */
  create(x: number, y: number, type: BlockType): Block {
    switch (type) {
      case 'grass_block':
        return new GrassBlock(this.scene, x, y);
      case 'dirt_block':
        return new DirtBlock(this.scene, x, y);
      case 'stone_block':
        return new StoneBlock(this.scene, x, y, this.sounds);
      default:
        // TypeScript ensures exhaustive check
        const _exhaustiveCheck: never = type;
        throw new Error(`Unknown block type: ${_exhaustiveCheck}`);
    }
  }

  /**
   * Static factory method for simple use cases.
   */
  static createBlock(
    scene: Phaser.Scene,
    x: number,
    y: number,
    type: BlockType,
    sounds?: GameSounds | null
  ): Block {
    const factory = new BlockFactory(scene, sounds);
    return factory.create(x, y, type);
  }
}
