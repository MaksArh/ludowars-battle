// опкоды должны совпадать с backend/modules/constants.go
export enum OpCode {
  POSITION = 1,
  DAMAGE = 2,
  KILL = 3,
  SHOOT = 4,
  DASH = 5,
  RELOAD = 6,
  WEAPON_SWAP = 7,
  JUMP = 8,

  GAME_STATE = 10,
  PLAYER_JOINED = 11,
  PLAYER_LEFT = 12,
  MATCH_START = 13,
  MATCH_END = 14,
  TIME_SYNC = 15,
  FREEZE = 16,
  SCOREBOARD = 17,
  PLAYER_READY = 18,
  FALL_DEATH = 19,

  ROULETTE = 20,
  ROULETTE_SYNC = 21,
}

export interface FallDeathMessage {
  playerId: string;
}

export interface PositionData {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: boolean;
  hp: number;
  invuln?: boolean;
}

export interface ShootData {
  x: number;
  y: number;
  facing: boolean;
  weaponId: string;
}

export interface RemoteShoot {
  playerId: string;
  data: ShootData;
}

export interface RemotePosition {
  playerId: string;
  data: PositionData;
}

export interface DamageEvent {
  sourceId: string;
  targetId: string;
  damage: number;
  weaponId: string;
}

export interface KillEvent {
  killerId: string;
  victimId: string;
  weaponId: string;
}

export interface PlayerInfo {
  id: string;
  username: string;
  spawnIndex?: number;
}

export interface PlayerJoinedMessage {
  playerId: string;
  username: string;
  spawnIndex?: number;
}

export interface PlayersListMessage {
  players: PlayerInfo[];
  mapId?: string;
}

export interface MatchStartMessage {
  duration: number;
  killsToWin: number;
  freezeTime: number;
  startTimeUtc: number;
  mapId?: string;
}

export interface PlayerMatchResult {
  username: string;
  kills: number;
  deaths: number;
  score: number;
  reward: number;
}

export interface MatchEndMessage {
  reason: 'time_up' | 'kills_reached' | 'not_enough_players';
  winnerId: string;
  stats: Record<string, PlayerMatchResult>;
}

export interface DashData {
  direction: 'left' | 'right';
  x: number;
  y: number;
}

export interface RemoteDash {
  playerId: string;
  data: DashData;
}

export interface ReloadData {
  weaponId: string;
}

export interface RemoteReload {
  playerId: string;
  data: ReloadData;
}

export interface WeaponSwapData {
  weaponId: string;
}

export interface RemoteWeaponSwap {
  playerId: string;
  data: WeaponSwapData;
}

export interface JumpData {
  jumpType: 'normal' | 'double' | 'coyote';
  x: number;
  y: number;
}

export interface RemoteJump {
  playerId: string;
  data: JumpData;
}

export interface TimeSyncMessage {
  remainingMs: number;
}

export interface FreezeMessage {
  countdown: number;
  frozen: boolean;
}

export interface PlayerScoreInfo {
  id: string;
  username: string;
  kills: number;
  deaths: number;
  score: number;
}

export interface ScoreboardMessage {
  killerId: string;
  victimId: string;
  weaponId: string;
  scoreboard: PlayerScoreInfo[];
}

// рулетка
// symbols: 0=урон 1=хил 2=щит 3=череп
export interface RouletteResult {
  playerId: string;
  symbols: [number, number, number];
  effect: string;
  duration: number;
}

export interface RemoteRouletteSync {
  playerId: string;
  data: RouletteResult;
}
