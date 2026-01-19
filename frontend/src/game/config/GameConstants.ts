export const GAME = {
  WIDTH: 1920,
  HEIGHT: 1080,
  BG_COLOR: 0x1a1a2e,
} as const;

export const PLAYER = {
  WIDTH: 80,
  HEIGHT: 128,
  SPEED: 450,
  ACCEL: 2250,
  DRAG: 1800,
  JUMP: -675,
  DOUBLE_JUMP: -600,
  MAX_JUMPS: 2,
  GRAVITY: 1650,
  MAX_FALL: 1200,
  COYOTE: 120,
  JUMP_BUFFER: 100,
  // Dash
  DASH_SPEED: 1500,
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
  WIDTH: 12,
  HEIGHT: 6,
} as const;

export const TILE = {
  SIZE: 54,
} as const;


