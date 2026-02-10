import Phaser from "phaser";
import { ItemType, ITEM_CONFIGS } from "../types";
import { BLOCK_SIZE } from "../config/constants";

/**
 * Represents a dropped item in the world that can be picked up by the player.
 */
export class ItemDrop extends Phaser.Physics.Arcade.Sprite {
  public itemType: ItemType;
  public quantity: number;
  private pickupRadius: number = BLOCK_SIZE * 4; // Distance at which item can be picked up
  private magnetSpeed: number = 200; // Speed at which item moves toward player when in range
  private itemAttractionSpeed: number = 100; // Speed at which item moves toward other items
  private itemAttractionRadius: number = BLOCK_SIZE * 2; // Distance to attract to other items
  private mergeRadius: number = BLOCK_SIZE * 0.5; // Distance to merge with other items
  private creationTime: number; // Timestamp when item was created
  private readonly PICKUP_COOLDOWN = 100; // Milliseconds before item can be picked up
  private readonly STACK_COOLDOWN = 200; // Milliseconds before item can stack with others
  private outline: Phaser.GameObjects.Graphics | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    itemType: ItemType,
    quantity: number = 1,
  ) {
    const config = ITEM_CONFIGS[itemType];
    super(scene, x, y, config.texture, config.frame);

    this.itemType = itemType;
    this.quantity = quantity;
    this.creationTime = scene.time.now; // Record creation time

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set display properties
    this.setDisplaySize(BLOCK_SIZE * 0.75, BLOCK_SIZE * 0.75);
    this.setDepth(100); // Render above blocks but below UI

    this.setOutline();

    // Physics properties
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;

      body.setCollideWorldBounds(false);
      body.setGravityY(200);
      body.setBounce(0.5);
      body.setDragX(100);
    }
  }

  /**
   * Checks if the player is within pickup range.
   */
  isPlayerInRange(player: Phaser.GameObjects.GameObject): boolean {
    // Don't allow pickup if item was just created (cooldown)
    if (this.scene.time.now - this.creationTime < this.PICKUP_COOLDOWN) {
      return false;
    }

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      (player as Phaser.Physics.Arcade.Sprite).x,
      (player as Phaser.Physics.Arcade.Sprite).y,
    );
    return distance <= this.pickupRadius;
  }

  /**
   * Moves the item toward the player when in range (magnet effect).
   */
  moveTowardPlayer(player: Phaser.GameObjects.GameObject): void {
    if (!this.body) return;

    const playerSprite = player as Phaser.Physics.Arcade.Sprite;
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      playerSprite.x,
      playerSprite.y,
    );

    const velocityX = Math.cos(angle) * this.magnetSpeed;
    const velocityY = Math.sin(angle) * this.magnetSpeed;

    (this.body as Phaser.Physics.Arcade.Body).setVelocity(velocityX, velocityY);
  }

  /**
   * Moves the item toward another item of the same type (stacking attraction).
   * Only applies if not being attracted to player (player takes priority).
   */
  moveTowardItem(otherItem: ItemDrop): void {
    if (!this.body) return;

    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      otherItem.x,
      otherItem.y,
    );

    const velocityX = Math.cos(angle) * this.itemAttractionSpeed;
    const velocityY = Math.sin(angle) * this.itemAttractionSpeed;

    // Set velocity directly (player attraction will override this if active)
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(velocityX, velocityY);
  }

  /**
   * Checks if this item can merge with another item (close enough and same type).
   */
  canMergeWith(otherItem: ItemDrop): boolean {
    // Don't merge if item was just created (cooldown)
    if (this.scene.time.now - this.creationTime < this.STACK_COOLDOWN) {
      return false;
    }

    if (this.itemType !== otherItem.itemType) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      otherItem.x,
      otherItem.y,
    );

    return distance <= this.mergeRadius;
  }

  private setOutline(): void {
    this.outline = this.scene.add.graphics();
    this.outline.lineStyle(2, 0x222222, 1);
    this.outline.strokeRect(
      -BLOCK_SIZE / 2,
      -BLOCK_SIZE / 2,
      BLOCK_SIZE,
      BLOCK_SIZE,
    );
    this.outline.setPosition(this.x, this.y);
    this.outline.setDepth(this.depth + 1);
    this.outline.setScrollFactor(1, 1);
    this.outline.setScale(0.75);
  }

  private clearOutline(): void {
    if (this.outline) {
      this.outline.destroy();
      this.outline = null;
    }
  }

  /**
   * Updates the outline position to follow the item.
   */
  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.outline && this.active) {
      this.outline.setPosition(this.x, this.y);
    }
  }

  /**
   * Cleans up the outline when the item is destroyed.
   */
  destroy(fromScene?: boolean): void {
    this.clearOutline();
    super.destroy(fromScene);
  }

  /**
   * Gets the attraction radius for item-to-item stacking.
   */
  getItemAttractionRadius(): number {
    return this.itemAttractionRadius;
  }

  /**
   * Gets the pickup radius for collision detection.
   */
  getPickupRadius(): number {
    return this.pickupRadius;
  }
}
