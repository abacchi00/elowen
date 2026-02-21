import { BLOCK_SIZE, SWORD_SWING_SPEED, SWORD_SWING_AMPLITUDE } from "@/config";
import { HoldableType, IHoldable } from "@/types";

export class SwordHoldable implements IHoldable {
  events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
  displaySize: { width: number; height: number } = {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE * 4,
  };
  texture: string = "sword";
  frame: number = 0;
  rotationOffset: number = 0;
  type: HoldableType = "sword";

  private swingProgress: number = 0;
  private isSwinging: boolean = false;

  handlePrimaryAction(delta: number, mousePointer: Phaser.Input.Pointer): void {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingProgress = 0;
    }

    this.swingProgress += delta * SWORD_SWING_SPEED;

    if (this.swingProgress >= 1) {
      // Slash complete — snap back instantly
      this.isSwinging = false;
      this.swingProgress = 0;
      this.rotationOffset = 0;
    } else {
      // Linear ramp: slash down fast, then reset
      this.rotationOffset = this.swingProgress * SWORD_SWING_AMPLITUDE;
    }
    this.events.emit("handleSwingingTool", delta, mousePointer);
  }

  stopPrimaryAction(): void {
    this.isSwinging = false;
    this.swingProgress = 0;
    this.rotationOffset = 0;
    this.events.emit("stopSwingingTool");
  }
}
