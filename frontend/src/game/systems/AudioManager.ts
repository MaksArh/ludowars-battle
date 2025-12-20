import Phaser from 'phaser';
import { useSettingsStore } from '@/store/settingsStore';

export interface SFXOptions {
  volume?: number;
  detune?: number;
}

class AudioManagerClass {
  private scene: Phaser.Scene | null = null;
  private music: Phaser.Sound.BaseSound | null = null;
  private musicKey: string | null = null;
  private initialized = false;

  init(scene: Phaser.Scene): void {
    this.scene = scene;
    this.initialized = true;
    this.applyMusicVolume();
  }

  isInitialized(): boolean {
    return this.initialized && this.scene !== null;
  }

  playSFX(key: string, options?: SFXOptions): void {
    if (!this.scene?.sound) return;

    const store = useSettingsStore.getState();
    const baseVolume = store.getEffectiveSFXVolume();
    const volume = baseVolume * (options?.volume ?? 1);

    if (volume <= 0) return;

    this.scene.sound.play(key, {
      volume,
      detune: options?.detune,
    });
  }

  playSFXRandom(keys: string[], options?: SFXOptions): void {
    const key = keys[Math.floor(Math.random() * keys.length)];
    this.playSFX(key, options);
  }

  playMusic(key: string): void {
    if (!this.scene?.sound) return;

    if (this.musicKey === key && this.music?.isPlaying) return;

    this.stopMusic();

    const store = useSettingsStore.getState();
    const volume = store.getEffectiveMusicVolume();

    this.music = this.scene.sound.add(key, { loop: true, volume });
    this.music.play();
    this.musicKey = key;
  }

  stopMusic(): void {
    if (this.music) {
      this.music.stop();
      this.music.destroy();
      this.music = null;
      this.musicKey = null;
    }
  }

  fadeMusic(duration: number, onComplete?: () => void): void {
    if (!this.scene || !this.music) {
      onComplete?.();
      return;
    }

    this.scene.tweens.add({
      targets: this.music,
      volume: 0,
      duration,
      onComplete: () => {
        this.stopMusic();
        onComplete?.();
      },
    });
  }

  applyMusicVolume(): void {
    if (!this.music) return;

    const store = useSettingsStore.getState();
    const volume = store.getEffectiveMusicVolume();

    if ('setVolume' in this.music) {
      (this.music as Phaser.Sound.WebAudioSound).setVolume(volume);
    }
  }

  onSettingsChange(): void {
    this.applyMusicVolume();
  }

  destroy(): void {
    this.stopMusic();
    this.scene = null;
    this.initialized = false;
  }
}

export const audioManager = new AudioManagerClass();
