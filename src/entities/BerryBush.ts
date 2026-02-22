import Phaser from "phaser";
import {
  BLOCK_SIZE,
  MINEABLE_OUTLINE_WIDTH,
  MINEABLE_OUTLINE_COLOR,
} from "../config/constants";
import { IMineable, IHoverable } from "../types";
import { ignoreOnUICameras } from "../utils";

/**
 * Berry bush entity - passable but minable.
 */
export class BerryBush
  extends Phaser.GameObjects.Image
  implements IMineable, IHoverable
{
  public life: number;
  public maxLife: number;
  public miningSound: IMineable["miningSound"] = "pickaxeHit";
  public hoverOutline: Phaser.GameObjects.Graphics | null = null;
  public drops: IMineable["drops"];

  // TODO: fix berrybush outline and Origin
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "berry_bush");

    this.maxLife = 50;
    this.life = this.maxLife;

    this.drops = [
      {
        type: "wood_block", // TODO: Replace with berry item
        // quantity: getRandomIntegerFrom(3).to(6),
        quantity: 1,
        position: { x, y: y - BLOCK_SIZE * 2 },
      },
    ];

    // Add to scene
    scene.add.existing(this);

    // Set display properties
    this.setDisplaySize(3 * BLOCK_SIZE, 2 * BLOCK_SIZE);
    this.setOrigin(0.5, 1.25);

    // Make interactive
    this.setInteractive({ useHandCursor: true });
    this.setupHoverEffects();
  }

  mine(): void {
    this.hideOutline();
    this.destroy();
  }

  takeDamage(damage: number): { destroyed: boolean } {
    this.life = Math.max(0, this.life - damage);

    return { destroyed: this.life <= 0 };
  }

  setupHoverEffects(): void {
    this.on("pointerover", this.showOutline, this);
    this.on("pointerout", this.hideOutline, this);
  }

  private showOutline(): void {
    if (this.hoverOutline || !this.scene) return;

    this.hoverOutline = this.scene.add.graphics();
    this.hoverOutline.lineStyle(
      MINEABLE_OUTLINE_WIDTH,
      MINEABLE_OUTLINE_COLOR,
      1,
    );
    this.hoverOutline.strokeRect(
      -BLOCK_SIZE * 0.5,
      -BLOCK_SIZE * 1.5,
      BLOCK_SIZE,
      BLOCK_SIZE,
    );
    this.hoverOutline.setPosition(this.x, this.y);
    this.hoverOutline.setDepth(this.depth + 1);
    this.hoverOutline.setScrollFactor(1, 1);
    ignoreOnUICameras(this.scene, this.hoverOutline);
  }

  private hideOutline(): void {
    if (this.hoverOutline) {
      this.hoverOutline.destroy();
      this.hoverOutline = null;
    }
  }
}
