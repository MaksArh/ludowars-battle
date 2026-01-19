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
  private pendingSfx = new Map<string, number>();
  private sfxQueue: Array<{ key: string; options?: SFXOptions; tries: number }> = [];
  private sfxRetryTimer?: Phaser.Time.TimerEvent;

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
    const soundManager = this.scene.sound as Phaser.Sound.BaseSoundManager & { locked?: boolean };
    if (soundManager.locked) {
      this.enqueueSfx(key, options);
      this.ensureSfxRetry();
      return;
    }

    const store = useSettingsStore.getState();
    const baseVolume = store.getEffectiveSFXVolume();
    const volume = baseVolume * (options?.volume ?? 1);

    if (volume <= 0) return;

    if (!this.tryPlaySfx(key, volume, options)) {
      this.enqueueSfx(key, options);
      this.ensureSfxRetry();
    }
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
    if (!this.music || !this.scene) return;

    const store = useSettingsStore.getState();
    const volume = store.getEffectiveMusicVolume();

    if (!('setVolume' in this.music)) return;

    try {
      (this.music as Phaser.Sound.WebAudioSound).setVolume(volume);
    } catch {
      // WebAudioSound может быть не полностью инициализирован в Edge
      this.scene.time.delayedCall(50, () => this.applyMusicVolume());
    }
  }

  onSettingsChange(): void {
    this.applyMusicVolume();
  }

  destroy(): void {
    this.stopMusic();
    this.scene = null;
    this.initialized = false;
    this.pendingSfx.clear();
    this.sfxQueue = [];
    this.sfxRetryTimer?.destroy();
    this.sfxRetryTimer = undefined;
  }

  private enqueueSfx(key: string, options?: SFXOptions) {
    const now = Date.now();
    const last = this.pendingSfx.get(key) || 0;
    if (now - last < 150) return;
    this.pendingSfx.set(key, now);
    if (this.sfxQueue.length > 20) this.sfxQueue.shift();
    this.sfxQueue.push({ key, options, tries: 0 });
  }

  private ensureSfxRetry() {
    if (!this.scene?.time || this.sfxRetryTimer) return;
    this.sfxRetryTimer = this.scene.time.addEvent({
      delay: 200,
      loop: true,
      callback: () => {
        if (!this.scene?.sound) return;
        const soundManager = this.scene.sound as Phaser.Sound.BaseSoundManager & { locked?: boolean };
        if (soundManager.locked) return;

        const queued = this.sfxQueue.splice(0);
        for (const item of queued) {
          const store = useSettingsStore.getState();
          const baseVolume = store.getEffectiveSFXVolume();
          const volume = baseVolume * (item.options?.volume ?? 1);
          if (volume <= 0) continue;
          const ok = this.tryPlaySfx(item.key, volume, item.options);
          if (!ok) {
            item.tries += 1;
            if (item.tries < 15) {
              this.sfxQueue.push(item);
            }
          }
        }

        if (this.sfxQueue.length === 0) {
          this.sfxRetryTimer?.destroy();
          this.sfxRetryTimer = undefined;
        }
      },
    });
  }

  private tryPlaySfx(key: string, volume: number, options?: SFXOptions): boolean {
    try {
      this.scene?.sound?.play(key, {
        volume,
        detune: options?.detune,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const audioManager = new AudioManagerClass();
