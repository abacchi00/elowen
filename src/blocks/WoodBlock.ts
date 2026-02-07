import { Block } from "./Block";
import { BlockConfig, SpecializedBlockConstructorProps } from "@/types";

const WOOD_CONFIG: BlockConfig = {
  type: "wood_block",
  spritesheet: "wood_block_spritesheet",
  maxLife: 150,
};

export class WoodBlock extends Block {
  constructor(props: SpecializedBlockConstructorProps) {
    super({ ...props, config: WOOD_CONFIG });
  }
}
