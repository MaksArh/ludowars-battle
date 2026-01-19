import type { Socket, MatchData } from '@heroiclabs/nakama-js';
import { nakama } from './nakama';
import { useMatchStore } from '@/store/matchStore';
import {
  OpCode,
  PositionData,
  RemotePosition,
  ShootData,
  RemoteShoot,
  DashData,
  RemoteDash,
  ReloadData,
  RemoteReload,
  WeaponSwapData,
  RemoteWeaponSwap,
  JumpData,
  RemoteJump,
  FallDeathMessage,
  DamageEvent,
  KillEvent,
  PlayersListMessage,
  MatchStartMessage,
  MatchEndMessage,
  PlayerJoinedMessage,
  TimeSyncMessage,
  FreezeMessage,
  ScoreboardMessage,
  RouletteResult,
} from '@/types/network';
import { eventBus, EVENTS } from '@/game/utils/EventBus';

const SEND_RATE = 20;

interface ParsedEvent {
  opCode: number;
  msg: unknown;
}

// синглтон для работы с сетью
// буферизует события пока GameScene не подключится
class NetworkManager {
  private socket: Socket | null = null;
  private matchId: string | null = null;
  private localId: string | null = null;
  private attached = false;
  private buffer: ParsedEvent[] = [];
  private lastSend = 0;
  private handlerInstalled = false;

  async joinMatch(matchId: string): Promise<void> {
    if (this.matchId === matchId && this.socket === nakama.socket) {
      console.log('[NetworkManager] Already in match:', matchId);
      return;
    }

    const currentSocket = nakama.socket;
    if (!currentSocket) {
      this.socket = await nakama.connectSocket();
    } else {
      this.socket = currentSocket;
    }

    const socketChanged = this.socket !== currentSocket || !this.handlerInstalled;

    if (this.matchId !== matchId) {
      this.buffer = [];
    }

    this.matchId = matchId;
    this.localId = nakama.session?.user_id || null;
    this.attached = false;

    if (socketChanged || !this.handlerInstalled) {
      this.setupSocketHandler();
      this.handlerInstalled = true;
    }

    const match = await this.socket.joinMatch(matchId);
    console.log('[NetworkManager] Joined match:', match.match_id, 'localId:', this.localId);

    const store = useMatchStore.getState();
    store.setMatch(match.match_id);
    store.setLocalId(this.localId || '');
    store.setStatus('loading');
  }

  async leaveMatch(): Promise<void> {
    const currentMatchId = this.matchId;
    if (!currentMatchId) return;

    console.log('[NetworkManager] leaveMatch called for:', currentMatchId);
    console.trace('[NetworkManager] leaveMatch stack');

    if (this.socket) {
      try {
        await this.socket.leaveMatch(currentMatchId);
      } catch {}
    }

    this.matchId = null;
    this.localId = null;
    this.buffer = [];
    this.attached = false;

    useMatchStore.getState().reset();
    console.log('[NetworkManager] Left match');
  }

  // GameScene вызывает когда готова принимать события
  attach(): void {
    if (!this.matchId) {
      console.log('[NetworkManager] Cannot attach - no match');
      return;
    }
    if (this.attached) {
      console.log('[NetworkManager] Already attached');
      return;
    }

    this.attached = true;
    console.log('[NetworkManager] Attached, flushing', this.buffer.length, 'buffered events');

    for (const event of this.buffer) {
      this.processEvent(event.opCode, event.msg);
    }
    this.buffer = [];

    this.sendReady();
  }

  detach(): void {
    this.attached = false;
    console.log('[NetworkManager] Detached');
  }

  private setupSocketHandler(): void {
    if (!this.socket) return;

    this.socket.onmatchdata = (data: MatchData) => {
      if (data.match_id !== this.matchId) return;

      const decoder = new TextDecoder();
      let msg: unknown;

      try {
        msg = JSON.parse(decoder.decode(data.data));
      } catch {
        return;
      }

      const event: ParsedEvent = { opCode: data.op_code, msg };

      if (this.attached) {
        this.processEvent(event.opCode, event.msg);
      } else {
        console.log('[NetworkManager] Buffering event:', OpCode[data.op_code] || data.op_code);
        this.buffer.push(event);
      }
    };

    console.log('[NetworkManager] Socket handler installed');
  }

  private processEvent(opCode: number, msg: unknown): void {
    switch (opCode) {
      case OpCode.POSITION:
        this.handlePosition(msg as RemotePosition);
        break;

      case OpCode.GAME_STATE:
        eventBus.emit(EVENTS.GAME_STATE, msg as PlayersListMessage);
        break;

      case OpCode.PLAYER_JOINED:
        eventBus.emit(EVENTS.PLAYER_JOINED, msg as PlayerJoinedMessage);
        break;

      case OpCode.PLAYER_LEFT:
        eventBus.emit(EVENTS.PLAYER_LEFT, msg);
        break;

      case OpCode.MATCH_START:
        eventBus.emit(EVENTS.MATCH_START, msg as MatchStartMessage);
        break;

      case OpCode.MATCH_END:
        eventBus.emit(EVENTS.MATCH_END, msg as MatchEndMessage);
        break;

      case OpCode.DAMAGE:
        eventBus.emit(EVENTS.REMOTE_DAMAGE, msg as DamageEvent);
        break;

      case OpCode.KILL:
        eventBus.emit(EVENTS.REMOTE_KILL, msg as KillEvent);
        break;

      case OpCode.SHOOT:
        this.handleRemote(msg as RemoteShoot, EVENTS.REMOTE_SHOOT);
        break;

      case OpCode.DASH:
        this.handleRemote(msg as RemoteDash, EVENTS.REMOTE_DASH);
        break;

      case OpCode.RELOAD:
        this.handleRemote(msg as RemoteReload, EVENTS.REMOTE_RELOAD);
        break;

      case OpCode.WEAPON_SWAP:
        this.handleRemote(msg as RemoteWeaponSwap, EVENTS.REMOTE_WEAPON_SWAP);
        break;

      case OpCode.JUMP:
        this.handleRemote(msg as RemoteJump, EVENTS.REMOTE_JUMP);
        break;

      case OpCode.TIME_SYNC:
        eventBus.emit(EVENTS.TIME_SYNC, msg as TimeSyncMessage);
        break;

      case OpCode.FREEZE:
        eventBus.emit(EVENTS.FREEZE, msg as FreezeMessage);
        break;

      case OpCode.SCOREBOARD: {
        const scoreMsg = msg as ScoreboardMessage;
        eventBus.emit(EVENTS.SCOREBOARD, scoreMsg);
        eventBus.emit(EVENTS.REMOTE_KILL, {
          killerId: scoreMsg.killerId,
          victimId: scoreMsg.victimId,
          weaponId: scoreMsg.weaponId,
        });
        break;
      }

      case OpCode.ROULETTE_SYNC:
        eventBus.emit(EVENTS.ROULETTE_SYNC, msg as RouletteResult);
        break;
    }
  }

  private handleRemote<T extends { playerId: string }>(msg: T, event: string): void {
    if (msg.playerId === this.localId) return;
    eventBus.emit(event, msg);
  }

  private handlePosition(msg: RemotePosition): void {
    if (msg.playerId === this.localId) return;
    eventBus.emit(EVENTS.REMOTE_POSITION, msg);
  }

  sendPosition(data: PositionData): void {
    const now = Date.now();
    if (now - this.lastSend < 1000 / SEND_RATE) return;
    this.lastSend = now;
    this.send(OpCode.POSITION, data);
  }

  sendShoot(data: ShootData): void {
    this.send(OpCode.SHOOT, data);
  }

  sendDamage(event: DamageEvent): void {
    this.send(OpCode.DAMAGE, event);
  }

  sendKill(event: KillEvent): void {
    this.send(OpCode.KILL, event);
  }

  sendDash(data: DashData): void {
    this.send(OpCode.DASH, data);
  }

  sendReload(data: ReloadData): void {
    this.send(OpCode.RELOAD, data);
  }

  sendWeaponSwap(data: WeaponSwapData): void {
    this.send(OpCode.WEAPON_SWAP, data);
  }

  sendJump(data: JumpData): void {
    this.send(OpCode.JUMP, data);
  }

  sendFallDeath(): void {
    this.send(OpCode.FALL_DEATH, {} as FallDeathMessage);
  }

  sendReady(): void {
    this.send(OpCode.PLAYER_READY, {});
  }

  sendRoulette(): void {
    this.send(OpCode.ROULETTE, {});
  }

  private send(op: OpCode, data: unknown): void {
    if (!this.socket || !this.matchId) return;
    const encoded = new TextEncoder().encode(JSON.stringify(data));
    this.socket.sendMatchState(this.matchId, op, encoded);
  }

  getLocalId(): string | null {
    return this.localId;
  }

  getMatchId(): string | null {
    return this.matchId;
  }

  isAttached(): boolean {
    return this.attached;
  }
}

export const networkManager = new NetworkManager();
