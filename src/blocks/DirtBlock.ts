import Phaser from "phaser";
import { BlockConfig, BlockSlope } from "@/types";
import { Block } from "./Block";

const DIRT_CONFIG: BlockConfig = {
  type: "dirt_block",
  spritesheet: "dirt_block_spritesheet",
  maxLife: 100,
};

export class DirtBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    slope: BlockSlope,
  ) {
    super(scene, position, matrixPosition, DIRT_CONFIG, slope);
  }
}
