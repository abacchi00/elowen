import { BLOCK_SIZE } from "@/config";
import { HoldableType, IHoldable } from "@/types";

export class MiscHoldable implements IHoldable {
  displaySize: { width: number; height: number } = {
    width: BLOCK_SIZE,
    height: BLOCK_SIZE,
  };
  texture: string;
  frame: number = 0;
  type: HoldableType = "misc";

  constructor(texture: string) {
    this.texture = texture;
  }
}
