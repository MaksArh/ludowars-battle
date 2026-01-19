const envSsl = import.meta.env.VITE_NAKAMA_USE_SSL;
const runtimeHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
const ssl =
  envSsl === 'true'
    ? true
    : envSsl === 'false'
      ? false
      : runtimeHttps;

const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : null;
const envHost = import.meta.env.VITE_NAKAMA_HOST || 'localhost';

// если env даёт localhost, а реальный хост не localhost (туннели/деплой), берём реальный
const host =
  envHost === 'localhost' && runtimeHost && runtimeHost !== 'localhost'
    ? runtimeHost
    : envHost;

const port =
  import.meta.env.VITE_NAKAMA_PORT ||
  (ssl ? '443' : '7350');

export const NAKAMA = {
  host,
  port,
  key: import.meta.env.VITE_NAKAMA_SERVER_KEY || 'ludowars_dev_key',
  ssl,
} as const;

export const STORAGE = {
  TOKEN: 'lw_token',
  REFRESH: 'lw_refresh',
  DEVICE: 'lw_device',
} as const;

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  MENU: '/menu',
  LOADOUT: '/loadout',
  MATCHMAKING: '/matchmaking',
  GAME: '/game',
  RESULTS: '/results',
  SHOP: '/shop',
  PROFILE: '/profile',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings',
} as const;



