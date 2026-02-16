import { GameContext, IHoldable, Position } from "@/types";
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
    this.setOrigin(-0.2, 0.9);
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

    this.setOrigin(isMouseOnLeft ? 1.4 : -0.4, 0.5);
    this.setFlipX(isMouseOnLeft);

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
  }

  private setHeldItem(item: IHoldable | null): void {
    // Clean up event forwarding from the old held item
    if (this.heldItem) {
      for (const { event, fn } of this.eventForwarders) {
        this.heldItem.events.off(event, fn);
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
    holdable.events.on(event, fn);
    this.eventForwarders.push({ event, fn });
  }
}
