import Phaser from 'phaser';
import { GRAVITY, SCREEN_WIDTH, SCREEN_HEIGHT } from './constants';

export const createGameConfig = (scenes: typeof Phaser.Scene[]): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  scene: scenes,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: GRAVITY },
      debug: false,
    },
  },
  render: {
    pixelArt: true,
    antialias: false,
  },
  backgroundColor: 0x4b90ac,
});
