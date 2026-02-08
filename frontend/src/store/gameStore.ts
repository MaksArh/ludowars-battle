import { create } from 'zustand';

interface PlayerScore {
  id: string;
  username: string;
  kills: number;
  deaths: number;
  score: number;
  spawnIndex?: number;
}

interface GameState {
  hp: number;
  maxHp: number;
  ammo: number;
  maxAmmo: number;
  weapon: string;
  reloading: boolean;
  score: number;
  kills: number;
  deaths: number;
  timeLeft: number;
  players: PlayerScore[];
  paused: boolean;
  gameOver: boolean;
}

interface GameStore extends GameState {
  setHp: (hp: number) => void;
  setAmmo: (ammo: number, max: number, reloading?: boolean) => void;
  setWeapon: (w: string) => void;
  setReloading: (r: boolean) => void;
  addKill: () => void;
  addDeath: () => void;
  setTime: (t: number) => void;
  addPlayer: (id: string, username: string, spawnIndex?: number) => void;
  removePlayer: (id: string) => void;
  setPlayers: (players: PlayerScore[]) => void;
  updatePlayerScore: (killerId: string, victimId: string) => void;
  setPaused: (p: boolean) => void;
  setGameOver: (g: boolean) => void;
  reset: () => void;
}

const init: GameState = {
  hp: 100,
  maxHp: 100,
  ammo: 12,
  maxAmmo: 12,
  weapon: 'pistol',
  reloading: false,
  score: 0,
  kills: 0,
  deaths: 0,
  timeLeft: 300,
  players: [],
  paused: false,
  gameOver: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...init,
  setHp: (hp) => set({ hp }),
  setAmmo: (ammo, maxAmmo, reloading) => set({ ammo, maxAmmo, reloading: reloading ?? false }),
  setWeapon: (weapon) => set({ weapon }),
  setReloading: (reloading) => set({ reloading }),
  addKill: () => set((s) => ({ kills: s.kills + 1, score: s.score + 10 })),
  addDeath: () => set((s) => ({ deaths: s.deaths + 1, score: Math.max(0, s.score - 2) })),
  setTime: (timeLeft) => set({ timeLeft }),
  addPlayer: (id, username, spawnIndex) =>
    set((s) => {
      if (s.players.find((p) => p.id === id)) return s;
      return { players: [...s.players, { id, username, kills: 0, deaths: 0, score: 0, spawnIndex }] };
    }),
  removePlayer: (id) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
  setPlayers: (players) =>
    set((s) => {
      const spawnMap = new Map(s.players.map((p) => [p.id, p.spawnIndex]));
      const merged = players.map((p) => ({
        ...p,
        spawnIndex: spawnMap.get(p.id),
      }));
      return { players: merged };
    }),
  updatePlayerScore: (killerId, victimId) =>
    set((s) => ({
      players: s.players.map((p) => {
        if (p.id === killerId) return { ...p, kills: p.kills + 1 };
        if (p.id === victimId) return { ...p, deaths: p.deaths + 1 };
        return p;
      }),
    })),
  setPaused: (paused) => set({ paused }),
  setGameOver: (gameOver) => set({ gameOver }),
  reset: () => set(init),
}));


