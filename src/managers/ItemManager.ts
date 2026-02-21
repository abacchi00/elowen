import Phaser from "phaser";
import { ItemType } from "@/types";
import { ItemDrop } from "@/entities";

/**
 * Manages dropped items in the world — spawning, merging, and removal.
 */
export class ItemManager {
  private scene: Phaser.Scene;
  private droppedItems: Phaser.GameObjects.Group;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.droppedItems = scene.add.group();
  }

  /**
   * Drops an item at the specified world position.
   */
  dropItem(
    worldX: number,
    worldY: number,
    itemType: ItemType,
    quantity: number = 1,
  ): void {
    const item = new ItemDrop(this.scene, worldX, worldY, itemType, quantity);
    this.droppedItems.add(item);
  }

  /**
   * Merges two items together, transferring quantity from source to target.
   */
  mergeItems(sourceItem: ItemDrop, targetItem: ItemDrop): boolean {
    if (!sourceItem.active || !targetItem.active) return false;
    if (sourceItem.itemType !== targetItem.itemType) return false;

    targetItem.quantity += sourceItem.quantity;

    this.removeDroppedItem(sourceItem);
    sourceItem.destroy();

    return true;
  }

  /**
   * Removes a dropped item from the group.
   */
  removeDroppedItem(item: ItemDrop): void {
    this.droppedItems.remove(item, true, true);
  }

  getDroppedItems(): Phaser.GameObjects.Group {
    return this.droppedItems;
  }
}
