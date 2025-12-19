import { create } from 'zustand';
import type { PlayerMatchResult } from '@/types/network';

type Status = 'idle' | 'searching' | 'found' | 'loading' | 'playing' | 'ended';

interface MatchPlayer {
  id: string;
  username: string;
  ready: boolean;
}

interface MatchResult {
  stats: Record<string, PlayerMatchResult>;
  reason: string;
}

interface MatchState {
  status: Status;
  matchId: string | null;
  players: MatchPlayer[];
  localId: string | null;
  duration: number;
  killsToWin: number;
  winner: string | null;
  matchResult: MatchResult | null;
}

interface MatchStore extends MatchState {
  setStatus: (s: Status) => void;
  setMatch: (id: string) => void;
  setPlayers: (p: MatchPlayer[]) => void;
  addPlayer: (p: MatchPlayer) => void;
  removePlayer: (id: string) => void;
  setLocalId: (id: string) => void;
  setConfig: (duration: number, kills: number) => void;
  setWinner: (id: string) => void;
  setMatchResult: (r: MatchResult) => void;
  reset: () => void;
}

const init: MatchState = {
  status: 'idle',
  matchId: null,
  players: [],
  localId: null,
  duration: 300,
  killsToWin: 7,
  winner: null,
  matchResult: null,
};

export const useMatchStore = create<MatchStore>((set) => ({
  ...init,
  setStatus: (status) => set({ status }),
  setMatch: (matchId) => set({ matchId }),
  setPlayers: (players) => set({ players }),
  addPlayer: (p) => set((s) => ({ players: [...s.players, p] })),
  removePlayer: (id) => set((s) => ({ players: s.players.filter((p) => p.id !== id) })),
  setLocalId: (localId) => set({ localId }),
  setConfig: (duration, killsToWin) => set({ duration, killsToWin }),
  setWinner: (winner) => set({ winner }),
  setMatchResult: (matchResult) => set({ matchResult }),
  reset: () => set(init),
}));


