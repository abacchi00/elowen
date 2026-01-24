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
  private facingRight: boolean = true;

  public sounds: GameSounds | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player_spritesheet");

    // Add to scene and enable physics
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Create walking animation
    this.createAnimations(scene);

    // Set display properties
    this.setDisplaySize(BLOCK_SIZE * 2, BLOCK_SIZE * 3);
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    // Setup input controls
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys("W,S,A,D") as typeof this.wasd;
  }

  private createAnimations(scene: Phaser.Scene): void {
    // Only create animation if it doesn't exist
    if (!scene.anims.exists("player_walk")) {
      scene.anims.create({
        key: "player_walk",
        frames: scene.anims.generateFrameNumbers("player_spritesheet", {
          start: 0,
          end: 1,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    if (!scene.anims.exists("player_idle")) {
      scene.anims.create({
        key: "player_idle",
        frames: [{ key: "player_spritesheet", frame: 0 }],
        frameRate: 1,
      });
    }
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
      this.facingRight = false;
      this.setFlipX(true);
    } else if (isMovingRight) {
      this.setVelocityX(PLAYER_SPEED);
      this.facingRight = true;
      this.setFlipX(false);
    }

    // Play walk animation when moving on ground, idle otherwise
    if (isMoving) {
      this.play("player_walk", true);
    } else {
      this.play("player_idle", true);
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
