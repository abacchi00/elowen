import { HoldableType, IHoldable } from "@/types";

export interface SwingableConfig {
  type: HoldableType;
  texture: string;
  displaySize: { width: number; height: number };
  swingSpeed: number;
  swingAmplitude: number;
  primaryEvent: string;
  stopEvent: string;
}

/**
 * Base class for holdable items that swing (pickaxe, sword, etc.).
 * Handles the shared swing animation logic — subclasses only provide config.
 */
export class SwingableHoldable implements IHoldable {
  events: Phaser.Events.EventEmitter = new Phaser.Events.EventEmitter();
  displaySize: { width: number; height: number };
  texture: string;
  frame: number = 0;
  rotationOffset: number = 0;
  type: HoldableType;

  private swingProgress: number = 0;
  private isSwinging: boolean = false;
  private swingSpeed: number;
  private swingAmplitude: number;
  private primaryEvent: string;
  private stopEvent: string;

  constructor(config: SwingableConfig) {
    this.type = config.type;
    this.texture = config.texture;
    this.displaySize = config.displaySize;
    this.swingSpeed = config.swingSpeed;
    this.swingAmplitude = config.swingAmplitude;
    this.primaryEvent = config.primaryEvent;
    this.stopEvent = config.stopEvent;
  }

  handlePrimaryAction(delta: number, mousePointer: Phaser.Input.Pointer): void {
    if (!this.isSwinging) {
      this.isSwinging = true;
      this.swingProgress = 0;
    }

    this.swingProgress += delta * this.swingSpeed;

    if (this.swingProgress >= 1) {
      this.isSwinging = false;
      this.swingProgress = 0;
      this.rotationOffset = 0;
    } else {
      this.rotationOffset = this.swingProgress * this.swingAmplitude;
    }

    this.events.emit(this.primaryEvent, delta, mousePointer);
  }

  stopPrimaryAction(): void {
    this.isSwinging = false;
    this.swingProgress = 0;
    this.rotationOffset = 0;
    this.events.emit(this.stopEvent);
  }
}
