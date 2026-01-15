import { ItemType, InventorySlot, ITEM_CONFIGS } from '../types';

const DEFAULT_HOTBAR_SIZE = 9;

/**
 * Manages player inventory with hotbar slots.
 * Handles adding, removing, and selecting items.
 */
export class InventorySystem {
  private slots: InventorySlot[];
  private selectedSlotIndex: number = 0;
  private onChangeCallbacks: (() => void)[] = [];

  constructor(size: number = DEFAULT_HOTBAR_SIZE) {
    this.slots = Array(size).fill(null).map(() => ({ item: null }));
  }

  /**
   * Adds an item to the inventory.
   * First tries to stack with existing items, then uses empty slots.
   * Returns the quantity that couldn't be added (0 if all added).
   */
  addItem(type: ItemType, quantity: number = 1): number {
    let remaining = quantity;
    const config = ITEM_CONFIGS[type];

    // First, try to stack with existing items of same type
    for (const slot of this.slots) {
      if (remaining <= 0) break;
      
      if (slot.item && slot.item.type === type) {
        const spaceInStack = slot.item.maxStack - slot.item.quantity;
        const toAdd = Math.min(remaining, spaceInStack);
        slot.item.quantity += toAdd;
        remaining -= toAdd;
      }
    }

    // Then, use empty slots
    for (const slot of this.slots) {
      if (remaining <= 0) break;
      
      if (!slot.item) {
        const toAdd = Math.min(remaining, config.maxStack);
        slot.item = {
          type,
          quantity: toAdd,
          maxStack: config.maxStack,
        };
        remaining -= toAdd;
      }
    }

    this.notifyChange();
    return remaining;
  }

  /**
   * Removes an item from a specific slot.
   * Returns true if item was removed successfully.
   */
  removeItem(slotIndex: number, quantity: number = 1): boolean {
    const slot = this.slots[slotIndex];
    if (!slot?.item) return false;

    slot.item.quantity -= quantity;
    
    if (slot.item.quantity <= 0) {
      slot.item = null;
    }

    this.notifyChange();
    return true;
  }

  /**
   * Gets the currently selected slot.
   */
  getSelectedSlot(): InventorySlot {
    return this.slots[this.selectedSlotIndex];
  }

  /**
   * Gets the currently selected item type, or null if empty.
   */
  getSelectedItemType(): ItemType | null {
    return this.slots[this.selectedSlotIndex].item?.type ?? null;
  }

  /**
   * Sets the selected slot index.
   */
  selectSlot(index: number): void {
    if (index >= 0 && index < this.slots.length) {
      this.selectedSlotIndex = index;
      this.notifyChange();
    }
  }

  /**
   * Gets the current selected slot index.
   */
  getSelectedSlotIndex(): number {
    return this.selectedSlotIndex;
  }

  /**
   * Uses one item from the selected slot.
   * Returns the item type if successful, null otherwise.
   */
  useSelectedItem(): ItemType | null {
    const slot = this.slots[this.selectedSlotIndex];
    if (!slot?.item) return null;

    const type = slot.item.type;
    this.removeItem(this.selectedSlotIndex, 1);
    return type;
  }

  /**
   * Gets all slots for rendering.
   */
  getSlots(): InventorySlot[] {
    return this.slots;
  }

  /**
   * Gets the total count of a specific item type across all slots.
   */
  getItemCount(type: ItemType): number {
    return this.slots.reduce((total, slot) => {
      if (slot.item?.type === type) {
        return total + slot.item.quantity;
      }
      return total;
    }, 0);
  }

  /**
   * Checks if inventory has at least one of the specified item.
   */
  hasItem(type: ItemType): boolean {
    return this.getItemCount(type) > 0;
  }

  /**
   * Registers a callback to be called when inventory changes.
   */
  onChange(callback: () => void): void {
    this.onChangeCallbacks.push(callback);
  }

  private notifyChange(): void {
    this.onChangeCallbacks.forEach(cb => cb());
  }
}
