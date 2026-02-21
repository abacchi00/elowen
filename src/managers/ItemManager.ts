import Phaser from "phaser";
import { ItemType, Position } from "@/types";
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
   * Drops multiple items at the specified world positions.
   */
  dropItems(
    items: Array<{ position: Position; type: ItemType; quantity: number }>,
  ): void {
    items.forEach(item => {
      this.dropItem(item.position, item.type, item.quantity);
    });
  }

  /**
   * Drops an item at the specified world position.
   */
  dropItem(position: Position, itemType: ItemType, quantity: number = 1): void {
    const item = new ItemDrop(
      this.scene,
      position.x,
      position.y,
      itemType,
      quantity,
    );

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
