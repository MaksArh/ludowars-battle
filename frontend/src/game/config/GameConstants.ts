export const GAME = {
  WIDTH: 1280,
  HEIGHT: 720,
  BG_COLOR: 0x1a1a2e,
} as const;

export const PLAYER = {
  WIDTH: 32,
  HEIGHT: 48,
  SPEED: 300,
  ACCEL: 1500,
  DRAG: 1200,
  JUMP: -450,
  DOUBLE_JUMP: -400,
  MAX_JUMPS: 2,
  GRAVITY: 1200,
  MAX_FALL: 800,
  COYOTE: 100,
  JUMP_BUFFER: 100,
  // Dash
  DASH_SPEED: 600,
  DASH_DURATION: 150,
  DASH_COOLDOWN: 500,
} as const;

export const COLORS = {
  PLAYER: 0x4caf50,
  PLATFORM: 0x4a4a6a,
  PROJECTILE: 0xffd700,
  HEALTH: 0x4caf50,
} as const;

export const COMBAT = {
  MAX_HP: 100,
  HEALTH_PACK: 25,
  PICKUP_RESPAWN: 15000,
  HIT_MARKER_DUR: 200,
  DMG_NUMBER_DUR: 800,
  SHAKE_INTENSITY: 5,
  SHAKE_DUR: 100,
  INVULN_TIME: 2000,
  RESPAWN_TIME: 2000,
} as const;

export const PROJECTILE = {
  WIDTH: 8,
  HEIGHT: 4,
} as const;


