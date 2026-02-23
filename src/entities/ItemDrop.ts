import Phaser from "phaser";
import { ItemType } from "@/types";
import {
  BLOCK_SIZE,
  ITEM_CONFIGS,
  ITEM_DROP_PICKUP_RADIUS,
  ITEM_DROP_MAGNET_SPEED,
  ITEM_DROP_ATTRACTION_SPEED,
  ITEM_DROP_ATTRACTION_RADIUS,
  ITEM_DROP_MERGE_RADIUS,
  ITEM_DROP_PICKUP_COOLDOWN,
  ITEM_DROP_STACK_COOLDOWN,
  ITEM_DROP_GRAVITY,
  ITEM_DROP_BOUNCE,
  ITEM_DROP_DRAG,
} from "@/config/constants";
import { ignoreOnUICameras } from "@/utils";

/**
 * Represents a dropped item in the world that can be picked up by the player.
 */
export class ItemDrop extends Phaser.Physics.Arcade.Sprite {
  public itemType: ItemType;
  public quantity: number;
  public labelText: string;
  private creationTime: number;

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
    this.labelText = config.labelText;
    this.creationTime = scene.time.now;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(
      BLOCK_SIZE * config.dropDisplayScale,
      BLOCK_SIZE * config.dropDisplayScale,
    );
    this.setDepth(100);
    ignoreOnUICameras(this.scene, this);

    this.setupPhysics();
  }

  // ============================================================================
  // Player Interaction
  // ============================================================================

  isPlayerInRange(player: Phaser.GameObjects.GameObject): boolean {
    if (this.scene.time.now - this.creationTime < ITEM_DROP_PICKUP_COOLDOWN) {
      return false;
    }

    const playerSprite = player as Phaser.Physics.Arcade.Sprite;
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      playerSprite.x,
      playerSprite.y,
    );
    return distance <= ITEM_DROP_PICKUP_RADIUS;
  }

  moveTowardPlayer(player: Phaser.GameObjects.GameObject): void {
    this.moveToward(
      player as Phaser.Physics.Arcade.Sprite,
      ITEM_DROP_MAGNET_SPEED,
    );
  }

  // ============================================================================
  // Item-to-Item Interaction
  // ============================================================================

  moveTowardItem(otherItem: ItemDrop): void {
    this.moveToward(otherItem, ITEM_DROP_ATTRACTION_SPEED);
  }

  canMergeWith(otherItem: ItemDrop): boolean {
    if (this.scene.time.now - this.creationTime < ITEM_DROP_STACK_COOLDOWN) {
      return false;
    }
    if (this.itemType !== otherItem.itemType) return false;

    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      otherItem.x,
      otherItem.y,
    );
    return distance <= ITEM_DROP_MERGE_RADIUS;
  }

  getItemAttractionRadius(): number {
    return ITEM_DROP_ATTRACTION_RADIUS;
  }

  // ============================================================================
  // Lifecycle
  // ============================================================================

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
  }

  destroy(fromScene?: boolean): void {
    super.destroy(fromScene);
  }

  // ============================================================================
  // Private
  // ============================================================================

  private moveToward(
    target: Phaser.Physics.Arcade.Sprite,
    speed: number,
  ): void {
    if (!this.body) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);

    (this.body as Phaser.Physics.Arcade.Body).setVelocity(
      Math.cos(angle) * speed,
      Math.sin(angle) * speed,
    );
  }

  private setupPhysics(): void {
    if (!this.body) return;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(false);
    body.setGravityY(ITEM_DROP_GRAVITY);
    body.setBounce(ITEM_DROP_BOUNCE);
    body.setDragX(ITEM_DROP_DRAG);
  }
}
