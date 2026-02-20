import Phaser from "phaser";
import { ItemType } from "../types";

/**
 * Formats an item type into a readable display name.
 */
export function formatItemName(itemType: ItemType): string {
  return itemType
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Creates a floating text above a position that animates upward and fades out.
 */
export function createFloatingText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  color: string = "#ffffff",
): Phaser.GameObjects.Text {
  const floatingText = scene.add.text(x, y, text, {
    fontSize: "20px",
    color: color,
    stroke: "#000000",
    strokeThickness: 4,
    fontFamily: "Arial",
  });

  floatingText.setOrigin(0.5, 0.5);
  floatingText.setDepth(1000); // Above everything

  // Animate upward and fade out
  scene.tweens.add({
    targets: floatingText,
    y: y - 50,
    alpha: 0,
    duration: 3000,
    ease: "Power2",
    onComplete: () => {
      floatingText.destroy();
    },
  });

  return floatingText;
}
