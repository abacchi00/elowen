import Phaser from "phaser";
import { Block } from "./Block";
import { GrassBlock } from "./GrassBlock";
import { DirtBlock } from "./DirtBlock";
import { StoneBlock } from "./StoneBlock";
import { BlockType, BlockVariant } from "../types";

/**
 * Factory for creating block instances based on block type.
 * Implements the Factory Pattern for block creation.
 */
export class BlockFactory {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Creates a block instance based on the block type.
   */
  create(
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    type: BlockType,
    variant: BlockVariant | null,
  ): Block {
    switch (type) {
      case "grass_block":
        return new GrassBlock(this.scene, position, matrixPosition, variant);
      case "dirt_block":
        return new DirtBlock(this.scene, position, matrixPosition, variant);
      case "stone_block":
        return new StoneBlock(this.scene, position, matrixPosition, variant);
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
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    type: BlockType,
    variant: BlockVariant | null,
  ): Block {
    const factory = new BlockFactory(scene);
    return factory.create(position, matrixPosition, type, variant);
  }
}
