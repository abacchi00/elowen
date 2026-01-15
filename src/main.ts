import Phaser from 'phaser';
import { createGameConfig } from './config/GameConfig';
import { GameScene } from './scenes';

/**
 * Main entry point for the Elowen game.
 * Initializes Phaser with the game configuration and scenes.
 */
const config = createGameConfig([GameScene]);

// Create and start the game
const game = new Phaser.Game(config);

// Handle window resize
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

export default game;
