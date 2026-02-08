// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Callback = (...args: any[]) => void;

class EventBus {
  private events = new Map<string, Callback[]>();

  on(event: string, cb: Callback) {
    if (!this.events.has(event)) this.events.set(event, []);
    this.events.get(event)!.push(cb);
  }

  off(event: string, cb: Callback) {
    const cbs = this.events.get(event);
    if (cbs) {
      const i = cbs.indexOf(cb);
      if (i !== -1) cbs.splice(i, 1);
    }
  }

  emit(event: string, ...args: unknown[]) {
    this.events.get(event)?.forEach((cb) => cb(...args));
  }

  clear() {
    this.events.clear();
  }
}

export const eventBus = new EventBus();

export const EVENTS = {
  SCENE_READY: 'scene-ready',

  HP_CHANGED: 'hp-changed',
  AMMO_CHANGED: 'ammo-changed',
  WEAPON_CHANGED: 'weapon-changed',
  PLAYER_DIED: 'player-died',
  SCORE_CHANGED: 'score-changed',

  GAME_STATE: 'game-state',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  REMOTE_POSITION: 'remote-position',
  REMOTE_SHOOT: 'remote-shoot',
  REMOTE_DASH: 'remote-dash',
  REMOTE_RELOAD: 'remote-reload',
  REMOTE_WEAPON_SWAP: 'remote-weapon-swap',
  REMOTE_JUMP: 'remote-jump',
  REMOTE_DAMAGE: 'remote-damage',
  REMOTE_KILL: 'remote-kill',
  SCOREBOARD: 'scoreboard',

  MATCH_START: 'match-start',
  MATCH_END: 'match-end',
  TIME_SYNC: 'time-sync',
  FREEZE: 'freeze',

  ROULETTE_SYNC: 'roulette-sync',
  ROULETTE_EFFECT_START: 'roulette-effect-start',
  ROULETTE_EFFECT_END: 'roulette-effect-end',

  GAME_PAUSE: 'game-pause',
  GAME_RESUME: 'game-resume',
} as const;

export const GAME_EVENTS = EVENTS;
