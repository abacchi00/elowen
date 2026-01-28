import Phaser from "phaser";
import { BlockConfig, BlockSlope } from "@/types";
import { Block } from "./Block";

const GRASS_CONFIG: BlockConfig = {
  type: "grass_block",
  spritesheet: "grass_block_spritesheet",
  maxLife: 100,
};

export class GrassBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    slope: BlockSlope,
  ) {
    super(scene, position, matrixPosition, GRASS_CONFIG, slope);
  }
}
