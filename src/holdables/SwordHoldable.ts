import { BLOCK_SIZE, SWORD_SWING_SPEED, SWORD_SWING_AMPLITUDE } from "@/config";
import { SwingableHoldable } from "./SwingableHoldable";

export class SwordHoldable extends SwingableHoldable {
  constructor() {
    super({
      type: "sword",
      texture: "sword",
      displaySize: { width: BLOCK_SIZE, height: BLOCK_SIZE * 4 },
      swingSpeed: SWORD_SWING_SPEED,
      swingAmplitude: SWORD_SWING_AMPLITUDE,
      primaryEvent: "handleSwingingTool",
      stopEvent: "stopSwingingTool",
    });
  }
}
