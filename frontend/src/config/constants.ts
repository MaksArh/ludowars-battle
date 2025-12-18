export const NAKAMA = {
  host: import.meta.env.VITE_NAKAMA_HOST || 'localhost',
  port: import.meta.env.VITE_NAKAMA_PORT || '7350',
  key: import.meta.env.VITE_NAKAMA_SERVER_KEY || 'ludowars_dev_key',
  ssl: import.meta.env.VITE_NAKAMA_USE_SSL === 'true',
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



