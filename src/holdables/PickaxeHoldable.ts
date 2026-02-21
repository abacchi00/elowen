import {
  BLOCK_SIZE,
  PICKAXE_SWING_SPEED,
  PICKAXE_SWING_AMPLITUDE,
} from "@/config";
import { HoldableType, IHoldable } from "@/types";

export class PickaxeHoldable implements IHoldable {
  events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
  displaySize: { width: number; height: number } = {
    width: BLOCK_SIZE * 2,
    height: BLOCK_SIZE * 3,
  };
  texture: string = "pickaxe";
  frame: number = 0;
  rotationOffset: number = 0;
  type: HoldableType = "pickaxe";

  private swingProgress: number = 0;
  private isSwinging: boolean = false;

  handlePrimaryAction(delta: number, mousePointer: Phaser.Input.Pointer): void {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingProgress = 0;
    }

    this.swingProgress += delta * PICKAXE_SWING_SPEED;

    if (this.swingProgress >= 1) {
      this.isSwinging = false;
      this.swingProgress = 0;
      this.rotationOffset = 0;
    } else {
      this.rotationOffset = this.swingProgress * PICKAXE_SWING_AMPLITUDE;
    }

    this.events.emit("handleMining", delta, mousePointer);
  }

  stopPrimaryAction(): void {
    this.isSwinging = false;
    this.swingProgress = 0;
    this.rotationOffset = 0;
    this.events.emit("stopMining");
  }
}
