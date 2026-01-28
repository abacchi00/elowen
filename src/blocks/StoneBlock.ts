import Phaser from "phaser";
import { Block } from "./Block";
import { BlockConfig, BlockSlope } from "@/types";

const STONE_CONFIG: BlockConfig = {
  type: "stone_block",
  spritesheet: "stone_block_spritesheet",
  maxLife: 200,
};

export class StoneBlock extends Block {
  constructor(
    scene: Phaser.Scene,
    position: { x: number; y: number },
    matrixPosition: { x: number; y: number },
    slope: BlockSlope,
  ) {
    super(scene, position, matrixPosition, STONE_CONFIG, slope);
  }
}
