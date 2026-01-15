import Phaser from 'phaser';
import { InventorySystem } from '../systems/InventorySystem';
import { ITEM_CONFIGS } from '../types';

const SLOT_SIZE = 50;
const SLOT_PADDING = 4;
const SLOT_BORDER_WIDTH = 2;
const HOTBAR_PADDING = 10;
const FONT_SIZE = 14;

const COLORS = {
  slotBackground: 0x333333,
  slotBorder: 0x666666,
  selectedBorder: 0xffcc00,
  textColor: '#ffffff',
  textStroke: '#000000',
};

/**
 * Visual hotbar UI component.
 * Displays inventory slots at the bottom of the screen.
 */
export class Hotbar {
  private scene: Phaser.Scene;
  private inventory: InventorySystem;
  private container: Phaser.GameObjects.Container;
  private slotGraphics: Phaser.GameObjects.Graphics[] = [];
  private itemImages: (Phaser.GameObjects.Image | null)[] = [];
  private quantityTexts: (Phaser.GameObjects.Text | null)[] = [];

  constructor(scene: Phaser.Scene, inventory: InventorySystem) {
    this.scene = scene;
    this.inventory = inventory;
    this.container = scene.add.container(0, 0);
    
    this.createHotbar();
    this.setupKeyboardInput();
    this.inventory.onChange(() => this.updateDisplay());
    
    // Position at bottom center
    this.updatePosition();
    
    // Keep UI fixed on screen
    this.container.setScrollFactor(0);
    this.container.setDepth(1000);
  }

  private createHotbar(): void {
    const slots = this.inventory.getSlots();
    const totalWidth = slots.length * (SLOT_SIZE + SLOT_PADDING) - SLOT_PADDING;
    const startX = -totalWidth / 2;

    for (let i = 0; i < slots.length; i++) {
      const x = startX + i * (SLOT_SIZE + SLOT_PADDING);
      
      // Slot background
      const graphics = this.scene.add.graphics();
      this.drawSlot(graphics, x, 0, i === this.inventory.getSelectedSlotIndex());
      this.container.add(graphics);
      this.slotGraphics.push(graphics);

      // Item image (placeholder, will be updated)
      this.itemImages.push(null);

      // Quantity text
      const text = this.scene.add.text(
        x + SLOT_SIZE - 5,
        SLOT_SIZE - 5,
        '',
        {
          fontSize: `${FONT_SIZE}px`,
          color: COLORS.textColor,
          stroke: COLORS.textStroke,
          strokeThickness: 2,
        }
      );
      text.setOrigin(1, 1);
      this.container.add(text);
      this.quantityTexts.push(text);
    }

    this.updateDisplay();
  }

  private drawSlot(graphics: Phaser.GameObjects.Graphics, x: number, y: number, isSelected: boolean): void {
    graphics.clear();
    
    // Background
    graphics.fillStyle(COLORS.slotBackground, 0.8);
    graphics.fillRect(x, y, SLOT_SIZE, SLOT_SIZE);
    
    // Border
    const borderColor = isSelected ? COLORS.selectedBorder : COLORS.slotBorder;
    graphics.lineStyle(isSelected ? 3 : SLOT_BORDER_WIDTH, borderColor);
    graphics.strokeRect(x, y, SLOT_SIZE, SLOT_SIZE);
  }

  private updateDisplay(): void {
    const slots = this.inventory.getSlots();
    const totalWidth = slots.length * (SLOT_SIZE + SLOT_PADDING) - SLOT_PADDING;
    const startX = -totalWidth / 2;
    const selectedIndex = this.inventory.getSelectedSlotIndex();

    for (let i = 0; i < slots.length; i++) {
      const x = startX + i * (SLOT_SIZE + SLOT_PADDING);
      const slot = slots[i];

      // Update slot border (selected state)
      this.drawSlot(this.slotGraphics[i], x, 0, i === selectedIndex);

      // Update item image
      if (this.itemImages[i]) {
        this.itemImages[i]!.destroy();
        this.itemImages[i] = null;
      }

      if (slot.item) {
        const config = ITEM_CONFIGS[slot.item.type];
        const image = this.scene.add.image(
          x + SLOT_SIZE / 2,
          SLOT_SIZE / 2,
          config.texture
        );
        image.setDisplaySize(SLOT_SIZE - 10, SLOT_SIZE - 10);
        this.container.add(image);
        this.itemImages[i] = image;

        // Update quantity text
        this.quantityTexts[i]!.setText(slot.item.quantity > 1 ? slot.item.quantity.toString() : '');
      } else {
        this.quantityTexts[i]!.setText('');
      }
    }
  }

  private setupKeyboardInput(): void {
    // Number keys 1-9 to select slots
    const keyNames = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE'];
    
    keyNames.forEach((keyName, index) => {
      this.scene.input.keyboard?.on(`keydown-${keyName}`, () => {
        this.inventory.selectSlot(index);
      });
    });

    // Also support numpad
    for (let i = 1; i <= 9; i++) {
      this.scene.input.keyboard?.on(`keydown-NUMPAD_${i}`, () => {
        this.inventory.selectSlot(i - 1);
      });
    }
  }

  private updatePosition(): void {
    const { width, height } = this.scene.cameras.main;
    this.container.setPosition(width / 2, height - SLOT_SIZE - HOTBAR_PADDING);
  }

  /**
   * Call this when the screen resizes.
   */
  onResize(): void {
    this.updatePosition();
  }

  destroy(): void {
    this.container.destroy();
  }
}
