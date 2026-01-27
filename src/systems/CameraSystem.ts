import Phaser from "phaser";
import {
  CAMERA_MIN_ZOOM,
  CAMERA_MAX_ZOOM,
  CAMERA_ZOOM_SPEED,
} from "../config/constants";

/**
 * Manages camera behavior including following, zoom, and bounds.
 */
export class CameraSystem {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private wheelHandler: (event: WheelEvent) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;

    // Bind the handler so we can remove it later
    this.wheelHandler = this.handleWheel.bind(this);

    this.setupZoomControls();
  }

  /**
   * Makes the camera follow a target game object.
   */
  followTarget(target: Phaser.GameObjects.GameObject): void {
    this.camera.startFollow(target);
    this.camera.setDeadzone(0, 0);
  }

  /**
   * Stops following the current target.
   */
  stopFollowing(): void {
    this.camera.stopFollow();
  }

  private setupZoomControls(): void {
    // Use native DOM event to reliably detect shift key
    // { passive: false } is required to call preventDefault()
    this.scene.game.canvas.addEventListener("wheel", this.wheelHandler, {
      passive: false,
    });
  }

  private handleWheel(event: WheelEvent): void {
    // Only zoom when shift is held
    if (!event.shiftKey) return;

    // Prevent page scroll
    event.preventDefault();

    // On macOS, shift+scroll converts deltaY to deltaX, so use whichever has a value
    const delta = event.deltaY !== 0 ? event.deltaY : event.deltaX;
    this.handleZoom(delta);
  }

  private handleZoom(delta: number): void {
    const currentZoom = this.camera.zoom;
    let newZoom = currentZoom;

    if (delta > 0) {
      // Zoom out
      newZoom = Math.max(CAMERA_MIN_ZOOM, currentZoom - CAMERA_ZOOM_SPEED);
    } else if (delta < 0) {
      // Zoom in
      newZoom = Math.min(CAMERA_MAX_ZOOM, currentZoom + CAMERA_ZOOM_SPEED);
    }

    if (newZoom !== currentZoom) {
      this.camera.setZoom(newZoom);
    }
  }

  /**
   * Converts screen coordinates to world coordinates accounting for zoom.
   */
  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const zoom = this.camera.zoom;
    const centerX = this.camera.centerX;
    const centerY = this.camera.centerY;

    return {
      x: this.camera.scrollX + (screenX - centerX) / zoom + centerX,
      y: this.camera.scrollY + (screenY - centerY) / zoom + centerY,
    };
  }

  getZoom(): number {
    return this.camera.zoom;
  }

  setZoom(zoom: number): void {
    const clampedZoom = Math.max(
      CAMERA_MIN_ZOOM,
      Math.min(CAMERA_MAX_ZOOM, zoom),
    );
    this.camera.setZoom(clampedZoom);
  }

  destroy(): void {
    this.scene.game.canvas.removeEventListener("wheel", this.wheelHandler);
  }
}
