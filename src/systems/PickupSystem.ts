import { GameContext } from "../types";
import { ItemDrop } from "../entities/ItemDrop";
import { formatItemName } from "../utils/floatingText";
import { ignoreOnUICameras } from "../utils/camera";

/**
 * Handles item pickup logic when player is near dropped items.
 */
export class PickupSystem {
  private ctx: GameContext;
  private player: Phaser.Physics.Arcade.Sprite;
  private activeFloatingTexts: Phaser.GameObjects.Text[] = [];
  private readonly TEXT_SPACING = 30; // Vertical spacing between texts
  private readonly BASE_TEXT_OFFSET = 40; // Base offset above player
  private pickedUpItems: Set<ItemDrop> = new Set(); // Track items being picked up

  constructor(ctx: GameContext, player: Phaser.Physics.Arcade.Sprite) {
    this.ctx = ctx;
    this.player = player;
  }

  update(): void {
    // Clean up destroyed texts
    this.activeFloatingTexts = this.activeFloatingTexts.filter(
      text => text.active,
    );

    // Clean up picked up items that are no longer in the world
    this.pickedUpItems.forEach(item => {
      if (!item.active || !item.scene) {
        this.pickedUpItems.delete(item);
      }
    });

    const droppedItems = this.ctx.items.getDroppedItems();

    // Create a snapshot array to avoid iteration issues when items are destroyed
    const itemsSnapshot = droppedItems.children
      .getArray()
      .filter(child => child.active) as ItemDrop[];

    // First pass: Handle item-to-item attraction and merging
    const itemsToMerge: Array<{ source: ItemDrop; target: ItemDrop }> = [];

    for (const item of itemsSnapshot) {
      if (!item.active || this.pickedUpItems.has(item)) {
        continue;
      }

      // Find nearby items of the same type to attract to
      let nearestItem: ItemDrop | null = null;
      let nearestDistance = item.getItemAttractionRadius();

      for (const otherItem of itemsSnapshot) {
        if (
          !otherItem.active ||
          otherItem === item ||
          otherItem.itemType !== item.itemType ||
          this.pickedUpItems.has(otherItem)
        ) {
          continue;
        }

        const distance = Phaser.Math.Distance.Between(
          item.x,
          item.y,
          otherItem.x,
          otherItem.y,
        );

        // Check if items can merge (very close)
        if (item.canMergeWith(otherItem)) {
          itemsToMerge.push({ source: item, target: otherItem });
          break; // Merge with first valid item
        }

        // Track nearest item for attraction
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestItem = otherItem;
        }
      }

      // Attract to nearest item if not merging and not being picked up by player
      // Only attract if player is not nearby (player pickup takes priority)
      if (nearestItem && !item.isPlayerInRange(this.player)) {
        item.moveTowardItem(nearestItem);
      }
    }

    // Merge items that are close enough
    itemsToMerge.forEach(({ source, target }) => {
      if (source.active && target.active) {
        this.ctx.items.mergeItems(source, target);
      }
    });

    // Second pass: identify items to pickup (don't modify during iteration)
    const itemsToPickup: ItemDrop[] = [];
    const updatedSnapshot = droppedItems.children
      .getArray()
      .filter(child => child.active) as ItemDrop[];

    for (const item of updatedSnapshot) {
      // Skip if already being picked up
      if (this.pickedUpItems.has(item) || !item.active) {
        continue;
      }

      if (item.isPlayerInRange(this.player)) {
        // Move item toward player (magnet effect)
        item.moveTowardPlayer(this.player);

        // Check if player is close enough to pick up
        const distance = Phaser.Math.Distance.Between(
          item.x,
          item.y,
          this.player.x,
          this.player.y,
        );

        // Pick up if very close (within a small threshold)
        if (distance < 20) {
          itemsToPickup.push(item);
        }
      }
    }

    // Second pass: actually pickup items (prevents double processing)
    itemsToPickup.forEach(item => {
      // Double-check item is still active and not already being picked up
      if (item.active && !this.pickedUpItems.has(item)) {
        this.pickupItem(item);
      }
    });
  }

  private pickupItem(item: ItemDrop): void {
    // Mark item as being picked up immediately to prevent double processing
    if (this.pickedUpItems.has(item)) {
      return; // Already being picked up
    }
    this.pickedUpItems.add(item);

    // Store item info before destroying to prevent double pickup
    const itemType = item.itemType;
    const quantityPickedUp = item.quantity;

    // Validate quantity is positive
    if (quantityPickedUp <= 0) {
      this.pickedUpItems.delete(item);
      return;
    }

    // Set item as inactive immediately
    item.setActive(false);

    // Remove from world group immediately
    this.ctx.items.removeDroppedItem(item);

    // Add item to inventory BEFORE destroying to ensure it only happens once
    const remaining = this.ctx.inventory.addItem(itemType, quantityPickedUp);

    // Now destroy the item
    item.destroy();

    // Calculate actual quantity added
    const actualQuantityAdded = quantityPickedUp - remaining;

    // If inventory was full, drop the remaining items back
    if (remaining > 0) {
      // Get player position to drop remaining items
      const playerX = this.player.body
        ? (this.player.body as Phaser.Physics.Arcade.Body).center.x
        : this.player.x;
      const playerY = this.player.body
        ? (this.player.body as Phaser.Physics.Arcade.Body).center.y
        : this.player.y;

      this.ctx.items.dropItem(playerX, playerY, itemType, remaining);
    }

    // Only show text and play sound if items were actually added
    if (actualQuantityAdded > 0) {
      // Play pickup sound
      this.ctx.sounds?.itemPickup.play();

      // Show floating text above player
      // Get player center position (works for both Player and Sprite)
      const playerX = this.player.body
        ? (this.player.body as Phaser.Physics.Arcade.Body).center.x
        : this.player.x;
      const playerY = this.player.body
        ? (this.player.body as Phaser.Physics.Arcade.Body).center.y
        : this.player.y;

      const itemName = formatItemName(itemType);
      const displayText =
        actualQuantityAdded > 1
          ? `+${actualQuantityAdded} ${itemName}`
          : `+${itemName}`;

      this.createStackedFloatingText(playerX, playerY, displayText);
    }
  }

  /**
   * Creates a floating text that stacks above existing texts.
   * Existing texts move up, new text takes the base position.
   */
  private createStackedFloatingText(
    playerX: number,
    playerY: number,
    text: string,
  ): void {
    const baseY = playerY - this.BASE_TEXT_OFFSET;

    // Move all existing texts up
    this.activeFloatingTexts.forEach(existingText => {
      if (existingText.active) {
        const currentTween = this.ctx.scene.tweens.getTweensOf(existingText);
        currentTween.forEach(tween => tween.stop());

        // Get current position
        const currentY = existingText.y;
        const newY = currentY - this.TEXT_SPACING;

        // Continue animation from new position
        this.ctx.scene.tweens.add({
          targets: existingText,
          y: newY - 50, // Continue the upward movement
          alpha: 0,
          duration: 3000,
          ease: "Power2",
          onComplete: () => {
            existingText.destroy();
          },
        });
      }
    });

    // Create new text at base position
    const newText = this.ctx.scene.add.text(playerX, baseY, text, {
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      fontFamily: "Arial",
    });

    newText.setOrigin(0.5, 0.5);
    newText.setDepth(1000);

    // Make sure floating text is ignored by UI cameras (like hotbar camera)
    ignoreOnUICameras(this.ctx.scene, newText);

    // Animate upward and fade out
    this.ctx.scene.tweens.add({
      targets: newText,
      y: baseY - 50,
      alpha: 0,
      duration: 3000,
      ease: "Power2",
      onComplete: () => {
        newText.destroy();
      },
    });

    // Track the new text
    this.activeFloatingTexts.push(newText);
  }
}
