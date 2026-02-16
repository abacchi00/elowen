import { BLOCK_SIZE } from "@/config";
import { IHoldable } from "@/types";

export class PickaxeHoldable implements IHoldable {
  events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
  displaySize: { width: number; height: number } = {
    width: BLOCK_SIZE * 1.5,
    height: BLOCK_SIZE * 1.5,
  };
  texture: string = "pickaxe";
  frame: number = 0;

  handlePrimaryAction(delta: number, mousePointer: Phaser.Input.Pointer): void {
    this.events.emit("handleMining", delta, mousePointer);
  }

  stopPrimaryAction(): void {
    this.events.emit("stopMining");
  }
}
