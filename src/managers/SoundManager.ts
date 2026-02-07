import Phaser from "phaser";
import { GameSounds } from "@/types";
import { SOUND_CONFIGS } from "@/config";

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
    return Object.fromEntries(
      Object.entries(SOUND_CONFIGS).map(([key, config]) => [
        key,
        this.soundManager.add(config.key, config),
      ]),
    ) as unknown as GameSounds;
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
