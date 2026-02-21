import Phaser from "phaser";
import { InventorySystem } from "../systems/InventorySystem";
import { ITEM_CONFIGS } from "@/config/constants";
import { ToolType } from "@/types";

const SLOT_SIZE = 50;
const SLOT_PADDING = 4;
const SLOT_BORDER_WIDTH = 2;
const HOTBAR_PADDING = 16;
const FONT_SIZE = 14;

const COLORS = {
  slotBackground: 0x333333,
  slotBorder: 0x666666,
  selectedBorder: 0xffcc00,
  textColor: "#ffffff",
  textStroke: "#000000",
};

/**
 * Visual hotbar UI component.
 * Displays inventory slots at the bottom of the screen.
 */
export class Hotbar {
  private scene: Phaser.Scene;
  private inventory: InventorySystem;
  private container: Phaser.GameObjects.Container;
  private uiCamera: Phaser.Cameras.Scene2D.Camera;
  private slotGraphics: Phaser.GameObjects.Graphics[] = [];
  private itemImages: (Phaser.GameObjects.Image | null)[] = [];
  private quantityTexts: (Phaser.GameObjects.Text | null)[] = [];

  constructor(scene: Phaser.Scene, inventory: InventorySystem) {
    this.scene = scene;
    this.inventory = inventory;
    this.container = scene.add.container(0, 0);

    // Create a separate UI camera that doesn't zoom and has transparent background
    this.uiCamera = scene.cameras.add(
      0,
      0,
      scene.scale.width,
      scene.scale.height,
    );
    this.uiCamera.setScroll(0, 0);
    this.uiCamera.setBackgroundColor("rgba(0,0,0,0)"); // Transparent

    // Main camera ignores the hotbar
    scene.cameras.main.ignore(this.container);

    // Make UI camera ignore all existing game objects (except hotbar)
    scene.children.list.forEach(child => {
      if (child !== this.container) {
        this.uiCamera.ignore(child);
      }
    });

    this.createHotbar();
    this.setupKeyboardInput();
    this.inventory.onChange(() => this.updateDisplay());

    this.container.setDepth(1000);

    // Initial position
    this.updatePosition();
  }

  private createHotbar(): void {
    const slots = this.inventory.getSlots();
    const totalWidth = slots.length * (SLOT_SIZE + SLOT_PADDING) - SLOT_PADDING;
    const startX = -totalWidth / 2;

    for (let i = 0; i < slots.length; i++) {
      const x = startX + i * (SLOT_SIZE + SLOT_PADDING);

      // Slot background
      const graphics = this.scene.add.graphics();
      this.drawSlot(
        graphics,
        x,
        0,
        i === this.inventory.getSelectedSlotIndex(),
      );
      this.container.add(graphics);
      this.slotGraphics.push(graphics);

      // Item image (placeholder, will be updated)
      this.itemImages.push(null);

      // Quantity text
      const text = this.scene.add.text(x + SLOT_SIZE - 5, SLOT_SIZE - 5, "", {
        fontSize: `${FONT_SIZE}px`,
        color: COLORS.textColor,
        stroke: COLORS.textStroke,
        strokeThickness: 4,
      });
      text.setOrigin(1, 1);
      this.container.add(text);
      this.quantityTexts.push(text);
    }

    this.updateDisplay();
  }

  private drawSlot(
    graphics: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    isSelected: boolean,
  ): void {
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
          config.texture,
          config.frame,
        );

        // Scale to fit the slot while preserving aspect ratio
        const maxSize = SLOT_SIZE - 10;
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        image.setScale(scale);

        // Rotate tool items 45° in the hotbar
        const toolTypes: ToolType[] = ["pickaxe", "sword"];
        if (toolTypes.includes(slot.item.type as ToolType)) {
          image.setAngle(45);
        }

        this.container.add(image);
        this.itemImages[i] = image;

        // Update quantity text and bring to front
        const quantityText = this.quantityTexts[i]!;
        quantityText.setText(
          slot.item.quantity > 1 ? slot.item.quantity.toString() : "",
        );
        this.container.bringToTop(quantityText);
      } else {
        this.quantityTexts[i]!.setText("");
      }
    }
  }

  private setupKeyboardInput(): void {
    // Number keys 1-9 to select slots
    const keyNames = [
      "ONE",
      "TWO",
      "THREE",
      "FOUR",
      "FIVE",
      "SIX",
      "SEVEN",
      "EIGHT",
      "NINE",
    ];

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

    this.scene.input.on(
      "wheel",
      (
        pointer: Phaser.Input.Pointer,
        _gameObjects: unknown,
        _deltaX: number,
        deltaY: number,
      ) => {
        // Only change slots when shift is NOT held (shift+scroll is for zoom)
        if (pointer.event.shiftKey) return;

        const slotsLength = this.inventory.getSlots().length;
        const currentSlotIndex = this.inventory.getSelectedSlotIndex();
        const newSlotIndex =
          (currentSlotIndex + slotsLength + (deltaY > 0 ? 1 : -1)) %
          slotsLength;

        this.inventory.selectSlot(newSlotIndex);
      },
    );
  }

  private updatePosition(): void {
    const slots = this.inventory.getSlots();

    const containerPositionY = HOTBAR_PADDING;
    const containerPositionX =
      HOTBAR_PADDING + (SLOT_SIZE + SLOT_PADDING) * 0.5 * slots.length;

    this.container.setPosition(containerPositionX, containerPositionY);
  }

  /**
   * Call this when the screen resizes.
   */
  onResize(): void {
    this.updatePosition();
    // Resize the UI camera too
    this.uiCamera.setSize(this.scene.scale.width, this.scene.scale.height);
  }

  destroy(): void {
    this.scene.cameras.remove(this.uiCamera);
    this.container.destroy();
  }
}
