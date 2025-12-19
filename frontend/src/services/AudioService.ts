// сервис для звуков в меню использует HTML5 Audio

import { useSettingsStore } from '@/store/settingsStore';

class AudioServiceClass {
  private music: HTMLAudioElement | null = null;
  private currentMusicKey: string | null = null;

  private sounds: Record<string, string> = {
    menu_music: '/sounds/music/menu.mp3',
    battle_1: '/sounds/music/battle1.mp3',
    battle_2: '/sounds/music/battle2.mp3',
    victory: '/sounds/music/victory.mp3',
    defeat: '/sounds/music/defeat.mp3',
    ui_click: '/sounds/sfx/ui_click.mp3',
    ui_error: '/sounds/sfx/ui_error.mp3',
    pickup: '/sounds/sfx/pickup.mp3',
    equip: '/sounds/sfx/pickup.mp3',
    weapon_swap: '/sounds/sfx/change_weapon.mp3',
  };

  playSFX(key: string): void {
    const path = this.sounds[key];
    if (!path) return;

    const store = useSettingsStore.getState();
    const volume = store.getEffectiveSFXVolume();
    if (volume <= 0) return;

    const audio = new Audio(path);
    audio.volume = volume;
    audio.play().catch(() => {});
  }

  playMusic(key: string): void {
    const path = this.sounds[key];
    if (!path) return;

    if (this.currentMusicKey === key && this.music && !this.music.paused) {
      return;
    }

    this.stopMusic();

    const store = useSettingsStore.getState();
    const volume = store.getEffectiveMusicVolume();

    this.music = new Audio(path);
    this.music.loop = true;
    this.music.volume = volume;
    this.music.play().catch(() => {});
    this.currentMusicKey = key;
  }

  stopMusic(): void {
    if (this.music) {
      this.music.pause();
      this.music.src = '';
      this.music = null;
      this.currentMusicKey = null;
    }
  }

  fadeMusic(duration: number): Promise<void> {
    return new Promise((resolve) => {
      if (!this.music) {
        resolve();
        return;
      }

      const startVolume = this.music.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;
      let step = 0;

      const interval = setInterval(() => {
        step++;
        if (this.music) {
          this.music.volume = Math.max(0, startVolume - volumeStep * step);
        }
        if (step >= steps) {
          clearInterval(interval);
          this.stopMusic();
          resolve();
        }
      }, stepDuration);
    });
  }

  updateMusicVolume(): void {
    if (!this.music) return;
    const store = useSettingsStore.getState();
    this.music.volume = store.getEffectiveMusicVolume();
  }

  isPlayingMusic(): boolean {
    return this.music !== null && !this.music.paused;
  }
}

export const audioService = new AudioServiceClass();
