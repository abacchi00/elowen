import { BlockConfig, SpecializedBlockConstructorProps } from "@/types";
import { Block } from "./Block";

const DIRT_CONFIG: BlockConfig = {
  type: "dirt_block",
  spritesheet: "dirt_block_spritesheet",
  maxLife: 100,
};

export class DirtBlock extends Block {
  constructor(props: SpecializedBlockConstructorProps) {
    super({ ...props, config: DIRT_CONFIG });
  }
}
