import { BLOCK_SIZE } from "@/config";
import { BlockType, IHoldable } from "@/types";

export class BlockHoldable implements IHoldable {
  events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
  displaySize: { width: number; height: number } = {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  };
  private blockType: BlockType;
  texture: string;
  frame: number = 0;

  constructor(blockType: BlockType) {
    this.blockType = blockType;
    this.texture = `${this.blockType}_spritesheet`;
  }

  handleSecondaryAction(_: number, mousePointer: Phaser.Input.Pointer): void {
    this.events.emit("handlePlacing", mousePointer, this.blockType);
  }

  stopSecondaryAction(): void {
    this.events.emit("stopPlacing");
  }
}
