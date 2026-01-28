import Phaser from "phaser";

/**
 * Makes all non-main cameras ignore a game object.
 * Useful for game graphics that shouldn't appear on UI cameras.
 */
export function ignoreOnUICameras(
  scene: Phaser.Scene,
  gameObject: Phaser.GameObjects.GameObject,
): void {
  scene.cameras.cameras.forEach(camera => {
    if (camera !== scene.cameras.main) {
      camera.ignore(gameObject);
    }
  });
}

/**
 * Converts screen/mouse coordinates to world coordinates.
 * Accounts for camera scroll and zoom.
 */
export function screenToWorld(
  scene: Phaser.Scene,
  screenX: number,
  screenY: number,
): { x: number; y: number } {
  const camera = scene.cameras.main;
  const zoom = camera.zoom;
  const centerX = camera.centerX;
  const centerY = camera.centerY;

  return {
    x: camera.scrollX + (screenX - centerX) / zoom + centerX,
    y: camera.scrollY + (screenY - centerY) / zoom + centerY,
  };
}

/**
 * Gets the current mouse position in world coordinates.
 */
export function getMouseWorldPosition(scene: Phaser.Scene): {
  x: number;
  y: number;
} {
  const pointer = scene.input.mousePointer;
  return screenToWorld(scene, pointer.x, pointer.y);
}
