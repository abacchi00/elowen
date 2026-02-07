import Phaser from "phaser";

import { Block } from "./Block";
import { GrassBlock } from "./GrassBlock";
import { DirtBlock } from "./DirtBlock";
import { StoneBlock } from "./StoneBlock";
import { WoodBlock } from "./WoodBlock";

import { BlockType, SpecializedBlockConstructorProps } from "../types";

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
  create({
    type,
    ...props
  }: Omit<SpecializedBlockConstructorProps, "scene"> & {
    type: BlockType;
  }): Block {
    const fullProps = { ...props, scene: this.scene };

    switch (type) {
      case "grass_block":
        return new GrassBlock(fullProps);
      case "dirt_block":
        return new DirtBlock(fullProps);
      case "stone_block":
        return new StoneBlock(fullProps);
      case "wood_block":
        return new WoodBlock(fullProps);
      default:
        const _exhaustiveCheck: never = type;
        throw new Error(`Unknown block type: ${_exhaustiveCheck}`);
    }
  }

  /**
   * Static factory method for simple use cases.
   */
  static createBlock(
    props: SpecializedBlockConstructorProps & { type: BlockType },
  ): Block {
    const factory = new BlockFactory(props.scene);

    return factory.create(props);
  }
}
