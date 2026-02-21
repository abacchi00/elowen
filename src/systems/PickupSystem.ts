import { ITEM_DROP_PICKUP_DISTANCE } from "@/config/constants";
import { GameContext } from "../types";
import { ItemDrop } from "../entities/ItemDrop";
import { ignoreOnUICameras } from "../utils/camera";

const TEXT_SPACING = 30;
const BASE_TEXT_OFFSET = 40;

/**
 * Handles item pickup, item-to-item attraction/merging, and pickup floating text.
 */
export class PickupSystem {
  private ctx: GameContext;
  private player: Phaser.Physics.Arcade.Sprite;
  private activeFloatingTexts: Phaser.GameObjects.Text[] = [];
  private pickedUpItems: Set<ItemDrop> = new Set();

  constructor(ctx: GameContext, player: Phaser.Physics.Arcade.Sprite) {
    this.ctx = ctx;
    this.player = player;
  }

  update(): void {
    this.cleanUpStaleReferences();
    this.processItemAttractionAndMerging();
    this.processPlayerPickups();
  }

  // ============================================================================
  // Phase 1: Item-to-item attraction & merging
  // ============================================================================

  private processItemAttractionAndMerging(): void {
    const items = this.getActiveItems();
    const pendingMerges: Array<{ source: ItemDrop; target: ItemDrop }> = [];

    for (const item of items) {
      if (!item.active || this.pickedUpItems.has(item)) continue;

      let nearestItem: ItemDrop | null = null;
      let nearestDistance = item.getItemAttractionRadius();

      for (const other of items) {
        if (!this.isValidMergeCandidate(item, other)) continue;

        if (item.canMergeWith(other)) {
          pendingMerges.push({ source: item, target: other });
          break;
        }

        const distance = Phaser.Math.Distance.Between(
          item.x,
          item.y,
          other.x,
          other.y,
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestItem = other;
        }
      }

      // Attract to nearest same-type item (player pickup takes priority)
      if (nearestItem && !item.isPlayerInRange(this.player)) {
        item.moveTowardItem(nearestItem);
      }
    }

    // Execute merges after iteration
    for (const { source, target } of pendingMerges) {
      if (source.active && target.active) {
        this.ctx.items.mergeItems(source, target);
      }
    }
  }

  private isValidMergeCandidate(item: ItemDrop, other: ItemDrop): boolean {
    return (
      other.active &&
      other !== item &&
      other.itemType === item.itemType &&
      !this.pickedUpItems.has(other)
    );
  }

  // ============================================================================
  // Phase 2: Player pickups
  // ============================================================================

  private processPlayerPickups(): void {
    const itemsToPickup: ItemDrop[] = [];

    for (const item of this.getActiveItems()) {
      if (this.pickedUpItems.has(item) || !item.active) continue;
      if (!item.isPlayerInRange(this.player)) continue;

      item.moveTowardPlayer(this.player);

      const distance = Phaser.Math.Distance.Between(
        item.x,
        item.y,
        this.player.x,
        this.player.y,
      );

      if (distance < ITEM_DROP_PICKUP_DISTANCE) {
        itemsToPickup.push(item);
      }
    }

    for (const item of itemsToPickup) {
      if (item.active && !this.pickedUpItems.has(item)) {
        this.pickupItem(item);
      }
    }
  }

  private pickupItem(item: ItemDrop): void {
    if (this.pickedUpItems.has(item)) return;
    this.pickedUpItems.add(item);

    const { itemType, quantity } = item;
    if (quantity <= 0) {
      this.pickedUpItems.delete(item);
      return;
    }

    // Remove from world immediately
    item.setActive(false);
    this.ctx.items.removeDroppedItem(item);

    const remaining = this.ctx.inventory.addItem(itemType, quantity);
    item.destroy();

    // Drop back overflow
    if (remaining > 0) {
      const pos = this.getPlayerCenter();
      this.ctx.items.dropItem(pos, itemType, remaining);
    }

    // Show pickup feedback
    const actualAdded = quantity - remaining;
    if (actualAdded > 0) {
      this.ctx.sounds?.itemPickup.play();
      const label =
        actualAdded > 1
          ? `+${actualAdded} ${item.labelText}`
          : `+${item.labelText}`;
      const pos = this.getPlayerCenter();
      this.showStackedFloatingText(pos.x, pos.y, label);
    }
  }

  // ============================================================================
  // Floating Text
  // ============================================================================

  private showStackedFloatingText(x: number, y: number, text: string): void {
    const baseY = y - BASE_TEXT_OFFSET;

    // Bump existing texts upward
    for (const existing of this.activeFloatingTexts) {
      if (!existing.active) continue;

      this.ctx.scene.tweens.getTweensOf(existing).forEach(t => t.stop());

      this.ctx.scene.tweens.add({
        targets: existing,
        y: existing.y - TEXT_SPACING - 50,
        alpha: 0,
        duration: 3000,
        ease: "Power2",
        onComplete: () => existing.destroy(),
      });
    }

    // Create the new text at the base position
    const newText = this.ctx.scene.add.text(x, baseY, text, {
      fontSize: "24px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
      fontFamily: "Arial",
    });
    newText.setOrigin(0.5, 0.5);
    newText.setDepth(1000);
    ignoreOnUICameras(this.ctx.scene, newText);

    this.ctx.scene.tweens.add({
      targets: newText,
      y: baseY - 50,
      alpha: 0,
      duration: 3000,
      ease: "Power2",
      onComplete: () => newText.destroy(),
    });

    this.activeFloatingTexts.push(newText);
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  private getActiveItems(): ItemDrop[] {
    return this.ctx.items
      .getDroppedItems()
      .children.getArray()
      .filter(c => c.active) as ItemDrop[];
  }

  private getPlayerCenter(): { x: number; y: number } {
    if (this.player.body) {
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      return { x: body.center.x, y: body.center.y };
    }
    return { x: this.player.x, y: this.player.y };
  }

  private cleanUpStaleReferences(): void {
    this.activeFloatingTexts = this.activeFloatingTexts.filter(t => t.active);
    this.pickedUpItems.forEach(item => {
      if (!item.active || !item.scene) {
        this.pickedUpItems.delete(item);
      }
    });
  }
}
