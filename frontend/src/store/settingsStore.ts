import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'ludowars-settings';

interface SettingsState {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  muted: boolean;

  setMasterVolume: (v: number) => void;
  setSFXVolume: (v: number) => void;
  setMusicVolume: (v: number) => void;
  toggleMute: () => void;
  resetToDefaults: () => void;

  // Computed helpers
  getEffectiveSFXVolume: () => number;
  getEffectiveMusicVolume: () => number;
}

const DEFAULT_SETTINGS = {
  masterVolume: 0.8,
  sfxVolume: 0.7,
  musicVolume: 0.5,
  muted: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,

      setMasterVolume: (v) => set({ masterVolume: Math.max(0, Math.min(1, v)) }),
      setSFXVolume: (v) => set({ sfxVolume: Math.max(0, Math.min(1, v)) }),
      setMusicVolume: (v) => set({ musicVolume: Math.max(0, Math.min(1, v)) }),
      toggleMute: () => set((state) => ({ muted: !state.muted })),
      resetToDefaults: () => set(DEFAULT_SETTINGS),

      getEffectiveSFXVolume: () => {
        const state = get();
        return state.muted ? 0 : state.masterVolume * state.sfxVolume;
      },

      getEffectiveMusicVolume: () => {
        const state = get();
        return state.muted ? 0 : state.masterVolume * state.musicVolume;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        masterVolume: state.masterVolume,
        sfxVolume: state.sfxVolume,
        musicVolume: state.musicVolume,
        muted: state.muted,
      }),
    }
  )
);
