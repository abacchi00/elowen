import Phaser from "phaser";
import { BLOCK_SIZE, PLAYER_SPEED, JUMP_SPEED } from "../config/constants";
import { GameSounds, IUpdatable } from "../types";
import { getMouseWorldPosition } from "../utils";

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
  private sounds: GameSounds | null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    sounds: GameSounds | null = null,
  ) {
    super(scene, x, y, "player_spritesheet");

    this.sounds = sounds;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.registerAnimations(scene);

    this.setDisplaySize(BLOCK_SIZE * 2, BLOCK_SIZE * 3);
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.wasd = scene.input.keyboard!.addKeys("W,S,A,D") as typeof this.wasd;
  }

  // ============================================================================
  // Update
  // ============================================================================

  update(): void {
    this.updateGroundState();
    this.handleHorizontalMovement();
    this.handleMousePosition();
    this.handleJump();
  }

  private updateGroundState(): void {
    this.isOnGround = this.body?.touching.down ?? false;
  }

  private handleHorizontalMovement(): void {
    this.setVelocityX(0);

    const isMovingLeft = this.cursors.left.isDown || this.wasd.A.isDown;
    const isMovingRight = this.cursors.right.isDown || this.wasd.D.isDown;
    const isMoving = (isMovingLeft || isMovingRight) && this.isOnGround;

    if (isMovingLeft) {
      this.setVelocityX(-PLAYER_SPEED);
      this.setFlipX(true);
    } else if (isMovingRight) {
      this.setVelocityX(PLAYER_SPEED);
      this.setFlipX(false);
    }

    if (isMoving) {
      this.play("player_walk", true);
    } else {
      this.play("player_idle", true);
    }

    this.updateWalkingSound(isMoving);
  }

  private handleMousePosition(): void {
    const { x: playerX } = this.getBodyCenter();
    const mouseWorld = getMouseWorldPosition(this.scene);
    this.setFlipX(mouseWorld.x < playerX);
  }

  private handleJump(): void {
    const isJumpPressed =
      this.cursors.up.isDown ||
      this.wasd.W.isDown ||
      this.cursors.space?.isDown;

    if (isJumpPressed && this.isOnGround) {
      this.setVelocityY(-JUMP_SPEED);
      this.isOnGround = false;

      this.sounds?.jump.play();
      this.sounds?.running.stop();
      this.wasMoving = false;
    }
  }

  // ============================================================================
  // Sound
  // ============================================================================

  private updateWalkingSound(isMoving: boolean): void {
    if (isMoving && this.isOnGround) {
      if (!this.wasMoving) {
        this.sounds?.running.play();
      }
      this.wasMoving = true;
    } else {
      if (this.wasMoving) {
        this.sounds?.running.stop();
      }
      this.wasMoving = false;
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  getBodyCenter(): { x: number; y: number } {
    if (this.body) {
      return { x: this.body.center.x, y: this.body.center.y };
    }
    return { x: this.x, y: this.y };
  }

  // ============================================================================
  // Animations
  // ============================================================================

  private registerAnimations(scene: Phaser.Scene): void {
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
}
