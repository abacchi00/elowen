import Phaser from "phaser";
import { BLOCK_SIZE, PLAYER_SPEED, JUMP_SPEED } from "../config/constants";
import { GameSounds, IUpdatable } from "../types";

/**
 * Player entity with movement, jumping, and sound integration.
 */
export class Player extends Phaser.Physics.Arcade.Sprite implements IUpdatable {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  private isOnGround: boolean = false;
  private wasMoving: boolean = false;

  public sounds: GameSounds | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player_sprite_right");

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set display properties
    this.setDisplaySize(BLOCK_SIZE * 2, BLOCK_SIZE * 3);
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    // Setup input controls
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys("W,S,A,D") as typeof this.wasd;
  }

  update(): void {
    this.updateGroundState();
    this.handleHorizontalMovement();
    this.handleJump();
  }

  private updateGroundState(): void {
    this.isOnGround = this.body?.touching.down ?? false;
  }

  private handleHorizontalMovement(): void {
    // Reset horizontal velocity
    this.setVelocityX(0);

    const isMovingLeft = this.cursors.left.isDown || this.wasd.A.isDown;
    const isMovingRight = this.cursors.right.isDown || this.wasd.D.isDown;
    const isMoving = (isMovingLeft || isMovingRight) && this.isOnGround;

    if (isMovingLeft) {
      this.setVelocityX(-PLAYER_SPEED);
      this.setTexture("player_sprite_left");
    } else if (isMovingRight) {
      this.setVelocityX(PLAYER_SPEED);
      this.setTexture("player_sprite_right");
    }

    this.handleWalkingSound(isMoving);
  }

  private handleWalkingSound(isMoving: boolean): void {
    if (isMoving && this.isOnGround) {
      if (!this.wasMoving && this.sounds?.running) {
        this.sounds.running.play();
      }
      this.wasMoving = true;
    } else {
      if (this.wasMoving && this.sounds?.running) {
        this.sounds.running.stop();
      }
      this.wasMoving = false;
    }
  }

  private handleJump(): void {
    const isJumpPressed =
      this.cursors.up.isDown ||
      this.wasd.W.isDown ||
      this.cursors.space?.isDown;

    if (isJumpPressed && this.isOnGround) {
      this.setVelocityY(-JUMP_SPEED);
      this.isOnGround = false;

      // Play jump sound
      if (this.sounds?.jump) {
        this.sounds.jump.play();
      }

      // Stop running sound when jumping
      if (this.sounds?.running) {
        this.sounds.running.stop();
      }
      this.wasMoving = false;
    }
  }

  getBodyCenter(): { x: number; y: number } {
    if (this.body) {
      return {
        x: this.body.center.x,
        y: this.body.center.y,
      };
    }
    return { x: this.x, y: this.y };
  }
}
