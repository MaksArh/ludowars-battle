import { create } from 'zustand';
import { User, LoginData, RegisterData } from '@/types';
import { nakama, setSessionExpiredCallback } from '@/services/nakama';

function parseWallet(walletStr?: string): { coins: number } {
  if (!walletStr) return { coins: 0 };
  try {
    const wallet = JSON.parse(walletStr);
    return { coins: wallet.coins ?? 0 };
  } catch {
    return { coins: 0 };
  }
}

function parseError(e: unknown): string {
  if (!e) return 'Unknown error';
  if (typeof e === 'string') return e;
  if (e instanceof Error) {
    // Nakama SDK может возвращать ошибку с message или statusText
    const err = e as Error & { statusText?: string; status?: number };
    if (err.message) return err.message;
    if (err.statusText) return err.statusText;
    return `Error ${err.status || ''}`;
  }
  // Объект с message
  if (typeof e === 'object' && 'message' in e) {
    return String((e as { message: unknown }).message);
  }
  return String(e);
}

interface UserState {
  user: User | null;
  isAuth: boolean;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  restore: () => Promise<void>;
  updateCoins: (coins: number) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuth: false,
  isLoading: true,
  error: null,

  login: async ({ email, password }) => {
    if (password.length < 8) {
      set({ error: 'Password must be at least 8 characters', isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await nakama.authenticateEmail(email, password);
      const acc = await nakama.getAccount();
      const wallet = parseWallet(acc.wallet);
      set({
        user: { id: acc.user!.id!, username: acc.user!.username!, coins: wallet.coins },
        isAuth: true,
        isLoading: false,
      });
    } catch (e) {
      console.error('[Auth] Login error:', e);
      set({ error: parseError(e), isLoading: false });
    }
  },

  register: async ({ email, password, username }) => {
    if (password.length < 8) {
      set({ error: 'Password must be at least 8 characters', isLoading: false });
      return;
    }
    if (!username || username.length < 2) {
      set({ error: 'Username must be at least 2 characters', isLoading: false });
      return;
    }
    set({ isLoading: true, error: null });
    try {
      await nakama.authenticateEmail(email, password, true, username);
      const acc = await nakama.getAccount();
      const wallet = parseWallet(acc.wallet);
      set({
        user: { id: nakama.session!.user_id!, username: acc.user?.username || username, coins: wallet.coins },
        isAuth: true,
        isLoading: false,
      });
    } catch (e) {
      console.error('[Auth] Register error:', e);
      set({ error: parseError(e), isLoading: false });
    }
  },

  loginAsGuest: async () => {
    set({ isLoading: true, error: null });
    try {
      const session = await nakama.authenticateDevice();
      const acc = await nakama.getAccount();
      const wallet = parseWallet(acc.wallet);
      set({
        user: { id: session.user_id!, username: `Guest_${session.user_id!.slice(0, 6)}`, coins: wallet.coins },
        isAuth: true,
        isLoading: false,
      });
    } catch (e) {
      console.error('[Auth] Guest login error:', e);
      set({ error: parseError(e), isLoading: false });
    }
  },

  logout: () => {
    nakama.logout();
    set({ user: null, isAuth: false, error: null });
  },

  restore: async () => {
    const ok = await nakama.restoreSession();
    if (ok) {
      try {
        const acc = await nakama.getAccount();
        const wallet = parseWallet(acc.wallet);
        set({
          user: { id: acc.user!.id!, username: acc.user!.username || 'Guest', coins: wallet.coins },
          isAuth: true,
          isLoading: false,
        });
        return;
      } catch {}
    }
    set({ isLoading: false });
  },

  updateCoins: (coins: number) => {
    set((state) => ({
      user: state.user ? { ...state.user, coins } : null,
    }));
  },
}));

// колбэк на истечение сессии
setSessionExpiredCallback(() => {
  useUserStore.getState().logout();
});
