import Phaser from 'phaser';
import { 
  CAMERA_MIN_ZOOM, 
  CAMERA_MAX_ZOOM, 
  CAMERA_ZOOM_SPEED 
} from '../config/constants';

/**
 * Manages camera behavior including following, zoom, and bounds.
 */
export class CameraSystem {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.camera = scene.cameras.main;
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
    this.scene.input.on('wheel', this.handleZoom, this);
  }

  private handleZoom(
    _pointer: Phaser.Input.Pointer,
    _gameObjects: Phaser.GameObjects.GameObject[],
    _deltaX: number,
    deltaY: number
  ): void {
    const currentZoom = this.camera.zoom;
    let newZoom = currentZoom;

    if (deltaY > 0) {
      // Zoom out
      newZoom = Math.max(CAMERA_MIN_ZOOM, currentZoom - CAMERA_ZOOM_SPEED);
    } else if (deltaY < 0) {
      // Zoom in
      newZoom = Math.min(CAMERA_MAX_ZOOM, currentZoom + CAMERA_ZOOM_SPEED);
    }

    this.camera.setZoom(newZoom);
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
    const clampedZoom = Math.max(CAMERA_MIN_ZOOM, Math.min(CAMERA_MAX_ZOOM, zoom));
    this.camera.setZoom(clampedZoom);
  }

  destroy(): void {
    this.scene.input.off('wheel', this.handleZoom, this);
  }
}
