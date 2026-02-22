import { BlockConfig, SpecializedBlockConstructorProps } from "@/types";
import { Block } from "./Block";
import { BLOCK_SIZE } from "@/config";

const GRASS_CONFIG: BlockConfig = {
  type: "grass_block",
  spritesheet: "grass_block_spritesheet",
  maxLife: 100,
};

const TURF_PROBABILITY = 0.4;

export class GrassBlock extends Block {
  private turf: Phaser.GameObjects.Image | null = null;

  constructor(props: SpecializedBlockConstructorProps) {
    super({ ...props, config: GRASS_CONFIG });

    const hasTurf = Math.random() < TURF_PROBABILITY;

    if (hasTurf) {
      this.turf = this.scene.add.image(
        this.position.x,
        this.position.y - BLOCK_SIZE * 0.75,
        "grass_turf",
      );
    }
  }

  override destroySecondaryImages(): void {
    if (this.turf) {
      this.turf.destroy();
      this.turf = null;
    }
  }
}
