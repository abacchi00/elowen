import Phaser from 'phaser';
import { GameSounds } from '../types';

interface SoundConfig {
  loop?: boolean;
  volume?: number;
}

const SOUND_CONFIGS: Record<keyof GameSounds, SoundConfig> = {
  running: { loop: true, volume: 2 },
  jump: { volume: 0.6 },
  pickaxeHit: { volume: 0.4 },
  pickaxeHitStone: { volume: 0.5 },
};

/**
 * Manages game sound effects.
 * Creates and configures all sound instances.
 */
export class SoundManager {
  private sounds: GameSounds;
  private soundManager: Phaser.Sound.BaseSoundManager;

  constructor(soundManager: Phaser.Sound.BaseSoundManager) {
    this.soundManager = soundManager;
    this.sounds = this.createSounds();
  }

  private createSounds(): GameSounds {
    return {
      running: this.soundManager.add('running', SOUND_CONFIGS.running),
      jump: this.soundManager.add('jump', SOUND_CONFIGS.jump),
      pickaxeHit: this.soundManager.add('pickaxe_hit', SOUND_CONFIGS.pickaxeHit),
      pickaxeHitStone: this.soundManager.add('pickaxe_hit_stone', SOUND_CONFIGS.pickaxeHitStone),
    };
  }

  getSounds(): GameSounds {
    return this.sounds;
  }

  playSound(key: keyof GameSounds): void {
    const sound = this.sounds[key];
    if (sound && !sound.isPlaying) {
      sound.play();
    }
  }

  stopSound(key: keyof GameSounds): void {
    const sound = this.sounds[key];
    if (sound && sound.isPlaying) {
      sound.stop();
    }
  }
}
