import { Block } from "./Block";
import { BlockConfig, SpecializedBlockConstructorProps } from "@/types";

const STONE_CONFIG: BlockConfig = {
  type: "stone_block",
  spritesheet: "stone_block_spritesheet",
  maxLife: 200,
};

export class StoneBlock extends Block {
  constructor(props: SpecializedBlockConstructorProps) {
    super({ ...props, config: STONE_CONFIG });
  }
}
