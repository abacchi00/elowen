import Phaser from 'phaser';

/**
 * Makes all non-main cameras ignore a game object.
 * Useful for game graphics that shouldn't appear on UI cameras.
 */
export function ignoreOnUICameras(
  scene: Phaser.Scene,
  gameObject: Phaser.GameObjects.GameObject
): void {
  scene.cameras.cameras.forEach(camera => {
    if (camera !== scene.cameras.main) {
      camera.ignore(gameObject);
    }
  });
}
