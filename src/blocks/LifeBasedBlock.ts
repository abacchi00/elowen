import Phaser from "phaser";
import { Block } from "./Block";

/**
 * Block that changes texture based on remaining life.
 * Uses naming convention: {baseTexture}, {baseTexture}_high_life,
 * {baseTexture}_med_life, {baseTexture}_low_life
 */
export abstract class LifeBasedBlock extends Block {
  protected baseTexture: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    baseTexture: string,
    maxLife: number,
  ) {
    super(scene, x, y, baseTexture, maxLife);
    this.baseTexture = baseTexture;
    this.updateVisuals();
  }

  updateVisuals(): void {
    const lifePercentage = this.life / this.maxLife;

    if (lifePercentage > 0.75) {
      this.setTexture(this.baseTexture);
    } else if (lifePercentage > 0.5) {
      this.setTexture(`${this.baseTexture}_high_life`);
    } else if (lifePercentage > 0.25) {
      this.setTexture(`${this.baseTexture}_med_life`);
    } else {
      this.setTexture(`${this.baseTexture}_low_life`);
    }
  }
}
