import { BlockConfig, SpecializedBlockConstructorProps } from "@/types";
import { Block } from "./Block";

const GRASS_CONFIG: BlockConfig = {
  type: "grass_block",
  spritesheet: "grass_block_spritesheet",
  maxLife: 100,
};

export class GrassBlock extends Block {
  constructor(props: SpecializedBlockConstructorProps) {
    super({ ...props, config: GRASS_CONFIG });
  }
}
