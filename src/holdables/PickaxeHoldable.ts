import {
  BLOCK_SIZE,
  PICKAXE_SWING_SPEED,
  PICKAXE_SWING_AMPLITUDE,
} from "@/config";
import { SwingableHoldable } from "./SwingableHoldable";

export class PickaxeHoldable extends SwingableHoldable {
  constructor() {
    super({
      type: "pickaxe",
      texture: "pickaxe",
      displaySize: { width: BLOCK_SIZE * 2, height: BLOCK_SIZE * 3 },
      swingSpeed: PICKAXE_SWING_SPEED,
      swingAmplitude: PICKAXE_SWING_AMPLITUDE,
      primaryEvent: "handleMining",
      stopEvent: "stopMining",
    });
  }
}
