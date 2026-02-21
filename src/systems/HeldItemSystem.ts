import { BLOCK_SIZE } from "@/config";
import { GameContext, HoldableType, IHoldable, Position } from "@/types";
import { getMouseWorldPosition } from "@/utils/camera";

export class HeldItemSystem extends Phaser.GameObjects.Image {
  private ctx: GameContext;
  private heldItem: IHoldable | null = null;
  private primaryActionActive: boolean = false;
  private secondaryActionActive: boolean = false;
  private eventForwarders: {
    event: string;
    fn: (...args: unknown[]) => void;
  }[] = [];
  private events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();

  constructor(ctx: GameContext) {
    super(ctx.scene, 0, 0, "TODO change this", 0);

    this.ctx = ctx;

    this.ctx.inventory.onChange(item =>
      this.setHeldItem(item?.holdable ?? null),
    );

    // Set initial held item
    this.setHeldItem(
      this.ctx.inventory.getSelectedSlot().item?.holdable ?? null,
    );

    // Set pivot point at the handle
    this.setDepth(1000);

    this.scene.add.existing(this);
  }

  update(delta: number, playerPosition: Position): void {
    if (!this.heldItem) return;

    this.x = playerPosition.x;
    this.y = playerPosition.y;

    const mousePointer = this.ctx.scene.input.mousePointer;

    const mouseWorld = getMouseWorldPosition(this.scene);
    const isMouseOnLeft = mouseWorld.x < playerPosition.x;

    this.setOrigin(0.5, 0.9);
    this.setFlipX(isMouseOnLeft);
    this.y = playerPosition.y + BLOCK_SIZE / 2;
    this.x =
      playerPosition.x +
      (isMouseOnLeft ? -BLOCK_SIZE * 0.75 : +BLOCK_SIZE * 0.75);

    const baseRotation = isMouseOnLeft ? -Math.PI / 8 : Math.PI / 8;
    const swingOffset = this.heldItem.rotationOffset ?? 0;
    this.setRotation(
      baseRotation + (isMouseOnLeft ? -swingOffset : swingOffset),
    );

    if (mousePointer.leftButtonDown()) {
      this.heldItem.handlePrimaryAction?.(delta, mousePointer);

      if (!this.primaryActionActive) this.primaryActionActive = true;
    } else if (this.primaryActionActive) {
      this.heldItem.stopPrimaryAction?.();

      this.primaryActionActive = false;
    }

    if (mousePointer.rightButtonDown()) {
      this.heldItem.handleSecondaryAction?.(delta, mousePointer);

      if (!this.secondaryActionActive) this.secondaryActionActive = true;
    } else if (this.secondaryActionActive) {
      this.heldItem.stopSecondaryAction?.();

      this.secondaryActionActive = false;
    }

    if (this.heldItem && (this.heldItem?.rotationOffset ?? 0) !== 0) {
      this.events.emit("swinging", this.heldItem.type);
    }
  }

  /**
   * Returns the held item type if currently swinging, or null otherwise.
   */
  isSwinging(): HoldableType | null {
    if (this.heldItem && (this.heldItem.rotationOffset ?? 0) !== 0) {
      return this.heldItem.type;
    }
    return null;
  }

  private setHeldItem(item: IHoldable | null): void {
    // Clean up event forwarding from the old held item
    if (this.heldItem) {
      for (const { event, fn } of this.eventForwarders) {
        this.heldItem.events?.off(event, fn);
      }
      this.eventForwarders = [];
    }

    this.heldItem = item;

    if (!this.heldItem) {
      this.setVisible(false);
      return;
    }

    // Forward events from the holdable's emitter to the scene's emitter
    this.forwardEvent(this.heldItem, "handleMining");
    this.forwardEvent(this.heldItem, "stopMining");
    this.forwardEvent(this.heldItem, "handlePlacing");
    this.forwardEvent(this.heldItem, "stopPlacing");
    this.forwardEvent(this.heldItem, "handleSwingingTool");
    this.forwardEvent(this.heldItem, "stopSwingingTool");

    this.setVisible(true);

    this.setTexture(this.heldItem.texture, this.heldItem.frame);

    this.setDisplaySize(
      this.heldItem.displaySize.width,
      this.heldItem.displaySize.height,
    );
  }

  private forwardEvent(holdable: IHoldable, event: string): void {
    const fn = (...args: unknown[]) => {
      this.ctx.scene.events.emit(event, ...args);
    };
    holdable.events?.on(event, fn);
    this.eventForwarders.push({ event, fn });
  }
}
