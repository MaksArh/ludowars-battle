import Phaser from 'phaser';
import { Fighter } from '../entities/Fighter';
import { Projectile } from '../entities/Projectile';
import { InputSystem } from '../systems/InputSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { EffectsSystem } from '../systems/EffectsSystem';
import { audioManager } from '../systems/AudioManager';
import { networkManager } from '@/services/NetworkManager';
import { GAME, COMBAT } from '../config/GameConstants';
import { MAPS, getMapById } from '../maps';
import { eventBus, EVENTS } from '../utils/EventBus';
import type {
  RemotePosition,
  RemoteShoot,
  RemoteDash,
  RemoteJump,
  RemoteWeaponSwap,
  DamageEvent,
  KillEvent,
  PlayerJoinedMessage,
  PlayersListMessage,
  MatchStartMessage,
  MatchEndMessage,
  FreezeMessage,
  RouletteResult,
} from '@/types/network';

interface PendingSpawn {
  id: string;
  username: string;
  spawnIndex: number;
  isLocal: boolean;
}

export class GameScene extends Phaser.Scene {
  private localPlayer: Fighter | null = null;
  private fighters = new Map<string, Fighter>();
  private inputSys!: InputSystem;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private combat!: CombatSystem;
  private effects!: EffectsSystem;

  private currentMapId: string | null = null;
  private mapSpawns: { x: number; y: number }[] = [];
  private fallKillY = GAME.HEIGHT + 200;
  private localFalling = false;
  private pendingMapId: string | null = null;

  private frozen = true;
  private countdownText: Phaser.GameObjects.Text | null = null;
  private isOnlineMatch = false;

  private pendingSpawns: PendingSpawn[] = [];

  private eventListeners: { event: string; handler: (...args: unknown[]) => void }[] = [];

  private fpsText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super('Game');
  }

  create() {
    this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'battle_bg')
      .setDisplaySize(GAME.WIDTH, GAME.HEIGHT)
      .setDepth(-100);
    this.platforms = this.physics.add.staticGroup();

    this.combat = new CombatSystem(this);
    this.effects = new EffectsSystem(this);
    this.inputSys = new InputSystem(this);
    this.combat.setupCollisions(this.platforms);
    audioManager.init(this);

    this.setupEvents();

    const matchId = this.registry.get('matchId') as string | undefined;
    this.isOnlineMatch = !!matchId;

    if (import.meta.env.DEV) {
      this.fpsText = this.add.text(10, 10, '', { fontSize: '14px', color: '#0f0' }).setDepth(1000);
    }

    if (this.pendingMapId) {
      this.applyMap(this.pendingMapId);
    }

    if (matchId) {
      console.log('[GameScene] Scene ready, attaching to NetworkManager');
      networkManager.attach();
    } else {
      this.frozen = false;
      const randomMap = MAPS[Math.floor(Math.random() * MAPS.length)];
      this.applyMap(randomMap.id);
      this.spawnLocal('local', 'Player', 0);
    }

    eventBus.emit(EVENTS.SCENE_READY);

    this.events.once('shutdown', () => this.cleanup());
  }

  private cleanup() {
    networkManager.detach();
    audioManager.destroy();

    for (const { event, handler } of this.eventListeners) {
      eventBus.off(event, handler);
    }
    this.eventListeners = [];
  }

  private listen(event: string, handler: (...args: unknown[]) => void) {
    eventBus.on(event, handler);
    this.eventListeners.push({ event, handler });
  }

  update(_time: number, delta: number) {
    if (this.fpsText) {
      this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
    }
    this.processPendingSpawns();

    if (!this.localPlayer) return;

    if (this.frozen) {
      for (const fighter of this.fighters.values()) {
        if (!fighter.isLocal) fighter.interpolate();
      }
      return;
    }

    const input = this.inputSys.get();
    this.localPlayer.updateLocal(delta, input);
    this.checkFallDeath();

    // рывок
    if (input.dashLeft || input.dashRight) {
      const right = input.dashRight;
      this.effects.dashTrail(this.localPlayer.x, this.localPlayer.y, right);
      audioManager.playSFX('dash');
      if (this.isOnlineMatch) {
        networkManager.sendDash({
          direction: right ? 'right' : 'left',
          x: this.localPlayer.x,
          y: this.localPlayer.y,
        });
      }
    }

    // прыжок
    const jumpType = this.localPlayer.getLastJumpType();
    if (jumpType) {
      if (jumpType === 'double') {
        this.effects.doubleJumpEffect(this.localPlayer.x, this.localPlayer.y);
      } else {
        this.effects.jumpDust(this.localPlayer.x, this.localPlayer.y);
      }
      audioManager.playSFX('jump');
      if (this.isOnlineMatch) {
        networkManager.sendJump({
          jumpType,
          x: this.localPlayer.x,
          y: this.localPlayer.y,
        });
      }
    }

    // стрельба
    if (input.shoot) {
      const projectiles = this.localPlayer.shoot();
      if (projectiles.length > 0) {
        projectiles.forEach((p) => {
          this.combat.createProjectile(p);
          this.effects.muzzleFlash(p.x, p.y, this.localPlayer!.facingRight);
        });
        const weapon = this.localPlayer.getWeapon();
        const weaponId = weapon?.getConfig().id || 'pistol';
        this.playWeaponFireSound(weaponId);
        if (this.isOnlineMatch) {
          networkManager.sendShoot({
            x: this.localPlayer.x,
            y: this.localPlayer.y,
            facing: this.localPlayer.facingRight,
            weaponId,
          });
        }
      }
    }

    // перезарядка
    if (input.reload) {
      const weapon = this.localPlayer.getWeapon();
      if (weapon && !weapon.isReloading && weapon.ammo < weapon.getConfig().magazineSize) {
        const weaponId = weapon.getConfig().id || 'pistol';
        this.localPlayer.reload();
        this.playWeaponReloadSound(weaponId);
        if (this.isOnlineMatch) {
          networkManager.sendReload({ weaponId });
        }
      }
    }

    // смена оружия
    if (input.switchWeapon) {
      this.localPlayer.switchWeapon();
      audioManager.playSFX('weapon_swap');
      const weapon = this.localPlayer.getWeapon();
      if (this.isOnlineMatch) {
        networkManager.sendWeaponSwap({ weaponId: weapon?.getConfig().id || 'pistol' });
      }
    }

    // рулетка (cooldown устанавливается после ответа сервера в ROULETTE_SYNC)
    if (input.ability && this.localPlayer.canUseRoulette() && this.isOnlineMatch) {
      networkManager.sendRoulette();
    }

    if (this.isOnlineMatch) {
      networkManager.sendPosition(this.localPlayer.getState());
    }

    for (const fighter of this.fighters.values()) {
      if (!fighter.isLocal) fighter.interpolate();
      fighter.updateEffects();
    }
  }

  private setupEvents() {
    this.listen(EVENTS.GAME_STATE, (msg: unknown) => {
      const m = msg as PlayersListMessage;
      if (m.mapId) {
        this.applyMap(m.mapId);
      }
      const localId = networkManager.getLocalId();
      console.log('[GameScene] GAME_STATE localId:', localId, 'players:', m.players.map(p => p.id));
      for (const p of m.players) {
        const isLocal = p.id === localId;
        console.log('[GameScene] Player', p.id, 'isLocal:', isLocal);
        this.queueSpawn(p.id, p.username, p.spawnIndex ?? (isLocal ? 0 : 1), isLocal);
      }
    });

    this.listen(EVENTS.PLAYER_JOINED, (msg: unknown) => {
      const m = msg as PlayerJoinedMessage;
      if (m.playerId === networkManager.getLocalId()) {
        console.log('[GameScene] Ignoring PLAYER_JOINED about self');
        return;
      }
      this.queueSpawn(m.playerId, m.username, m.spawnIndex ?? 1, false);
    });

    this.listen(EVENTS.PLAYER_LEFT, (msg: unknown) => {
      const { playerId } = msg as { playerId: string };
      const fighter = this.fighters.get(playerId);
      if (fighter) {
        fighter.destroy();
        this.fighters.delete(playerId);
      }
    });

    this.listen(EVENTS.REMOTE_POSITION, (msg: unknown) => {
      const m = msg as RemotePosition;
      const fighter = this.fighters.get(m.playerId);
      if (fighter) {
        fighter.setTargetPosition(
          m.data.x,
          m.data.y,
          m.data.facing,
          m.data.hp,
          m.data.invuln,
          m.data.vx,
          m.data.vy
        );
      }
    });

    this.listen(EVENTS.REMOTE_SHOOT, (msg: unknown) => {
      if (!this.sys?.displayList) return;
      const m = msg as RemoteShoot;
      const fighter = this.fighters.get(m.playerId);
      if (fighter) {
        fighter.facingRight = m.data.facing;
        fighter.setFlipX(!m.data.facing);

        const projectiles = fighter.shoot();
        projectiles.forEach((p) => {
          p.ownerId = m.playerId;
          this.combat.createProjectile(p);
          this.effects.muzzleFlash(p.x, p.y, m.data.facing);
        });
        this.playWeaponFireSound(m.data.weaponId, 0.4);
      }
    });

    this.listen(EVENTS.REMOTE_DAMAGE, (msg: unknown) => {
      const event = msg as DamageEvent;
      if (event.targetId === networkManager.getLocalId() && this.localPlayer?.active) {
        this.localPlayer.takeDamage(event.damage);
        this.effects.damageNumber(this.localPlayer.x, this.localPlayer.y, event.damage);
        audioManager.playSFX('hit');
      }
    });

    this.listen(EVENTS.REMOTE_KILL, (msg: unknown) => {
      const event = msg as KillEvent;
      audioManager.playSFX('die');
      if (event.victimId === networkManager.getLocalId() && this.localPlayer?.body) {
        this.time.delayedCall(COMBAT.RESPAWN_TIME, () => {
          const nextSpawn = this.getRandomSpawn();
          this.localPlayer?.respawn(nextSpawn.x, nextSpawn.y);
          this.localFalling = false;
        });
      } else {
        const fighter = this.fighters.get(event.victimId);
        if (fighter) {
          this.time.delayedCall(COMBAT.RESPAWN_TIME, () => {
            const nextSpawn = this.getRandomSpawn();
            fighter.respawn(nextSpawn.x, nextSpawn.y);
          });
        }
      }
    });

    this.listen(EVENTS.MATCH_START, (msg: unknown) => {
      const m = msg as MatchStartMessage;
      if (!this.sys?.displayList) {
        this.time.delayedCall(50, () => eventBus.emit(EVENTS.MATCH_START, m));
        return;
      }
      if (m.mapId) {
        this.applyMap(m.mapId);
      }
      this.frozen = true;
      this.createCountdownText();
      const track = Math.random() < 0.5 ? 'battle_1' : 'battle_2';
      audioManager.playMusic(track);
    });

    this.listen(EVENTS.FREEZE, (msg: unknown) => {
      const m = msg as FreezeMessage;
      if (!this.sys?.displayList) {
        this.time.delayedCall(50, () => eventBus.emit(EVENTS.FREEZE, m));
        return;
      }
      this.frozen = m.frozen;

      if (m.frozen && m.countdown > 0) {
        this.updateCountdownText(String(m.countdown));
        audioManager.playSFX('tick');
      } else if (!m.frozen) {
        this.showGoText();
      }
    });

    this.listen(EVENTS.REMOTE_DASH, (msg: unknown) => {
      if (!this.sys?.displayList) return;
      const m = msg as RemoteDash;
      this.effects.dashTrail(m.data.x, m.data.y, m.data.direction === 'right');
      audioManager.playSFX('dash', { volume: 0.4 });
    });

    this.listen(EVENTS.REMOTE_JUMP, (msg: unknown) => {
      if (!this.sys?.displayList) return;
      const m = msg as RemoteJump;
      if (m.data.jumpType === 'double' || m.data.jumpType === 'coyote') {
        this.effects.doubleJumpEffect(m.data.x, m.data.y);
      }
      audioManager.playSFX('jump', { volume: 0.3 });
    });

    this.listen(EVENTS.REMOTE_RELOAD, () => {});

    this.listen(EVENTS.REMOTE_WEAPON_SWAP, (msg: unknown) => {
      const m = msg as RemoteWeaponSwap;
      const fighter = this.fighters.get(m.playerId);
      if (fighter && !fighter.isLocal) {
        fighter.setWeaponById(m.data.weaponId);
      }
    });

    this.listen(EVENTS.MATCH_END, (msg: unknown) => {
      const m = msg as MatchEndMessage;
      console.log('[GameScene] Match ended, winner:', m.winnerId);
      audioManager.stopMusic();
      const localId = networkManager.getLocalId();
      const isWinner = m.winnerId === localId;
      audioManager.playSFX(isWinner ? 'victory' : 'defeat');
    });

    this.listen(EVENTS.ROULETTE_SYNC, (msg: unknown) => {
      const result = msg as RouletteResult;
      if (!this.sys?.displayList) return;
      const isLocal = result.playerId === networkManager.getLocalId();
      const isError = result.effect.startsWith('error_');

      // обработка ошибок (только для локального игрока)
      if (isError) {
        if (isLocal) {
          console.log('[GameScene] Roulette error:', result.effect);
          // TODO: показать уведомление об ошибке
        }
        return;
      }

      const fighter = this.fighters.get(result.playerId)
        || (isLocal ? this.localPlayer : null);

      if (!fighter) {
        console.warn('[GameScene] ROULETTE_SYNC: fighter not found:', result.playerId,
          'available:', Array.from(this.fighters.keys()));
        return;
      }

      fighter.applyRouletteEffect(result.effect, result.duration);
      this.effects.showRouletteResult(fighter.x, fighter.y, result.symbols, result.effect);

      // cooldown только для локального игрока после успешного ответа
      if (isLocal && this.localPlayer) {
        this.localPlayer.startRouletteCooldown();
      }
    });

    this.events.on('update', () => {
      this.checkProjectileHits();
    });
  }

  private createCountdownText() {
    if (this.countdownText || !this.sys?.displayList) return;
    this.countdownText = this.add.text(GAME.WIDTH / 2, GAME.HEIGHT / 2, '', {
      fontSize: '96px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(1000);
  }

  private updateCountdownText(text: string) {
    if (!this.sys?.displayList) return;
    if (!this.countdownText) this.createCountdownText();
    if (!this.countdownText?.active) return;
    this.countdownText.setText(text);
    this.countdownText.setScale(1.5);
    this.tweens.add({
      targets: this.countdownText,
      scale: 1,
      duration: 200,
    });
  }

  private showGoText() {
    if (!this.sys?.displayList) return;
    if (!this.countdownText?.active) return;
    this.countdownText.setText('GO!');
    this.countdownText.setScale(1.5);
    this.countdownText.setAlpha(1);
    audioManager.playSFX('go');
    this.tweens.add({
      targets: this.countdownText,
      scale: 0,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this.countdownText?.destroy();
        this.countdownText = null;
      },
    });
  }

  private checkProjectileHits() {
    if (!this.localPlayer || !this.isOnlineMatch) return;

    for (const fighter of this.fighters.values()) {
      if (fighter.isLocal) continue;

      const projectiles = this.combat.getProjectiles().getChildren() as Projectile[];
      for (const proj of projectiles) {
        if (proj.ownerId !== 'local' || !proj.active || !fighter.active) continue;

        const dx = Math.abs(proj.x - fighter.x);
        const dy = Math.abs(proj.y - fighter.y);

        if (dx < 45 && dy < 60) {
          const killed = fighter.takeDamage(proj.damage);
          this.effects.damageNumber(proj.x, proj.y, proj.damage);
          this.effects.hitMarker(proj.x, proj.y);
          audioManager.playSFX('hit', { volume: 0.7 });
          (proj as Projectile).deactivate();

          networkManager.sendDamage({
            sourceId: networkManager.getLocalId() || 'local',
            targetId: fighter.id,
            damage: proj.damage,
            weaponId: proj.weaponId || 'pistol',
          });

          if (killed) {
            networkManager.sendKill({
              killerId: networkManager.getLocalId() || 'local',
              victimId: fighter.id,
              weaponId: proj.weaponId || 'pistol',
            });
          }
        }
      }
    }
  }

  private queueSpawn(id: string, username: string, spawnIndex: number, isLocal: boolean) {
    if (this.fighters.has(id)) {
      console.log('[GameScene] Player already spawned:', id);
      return;
    }

    if (this.pendingSpawns.some(p => p.id === id)) {
      console.log('[GameScene] Player already queued:', id);
      return;
    }

    console.log('[GameScene] queueSpawn:', id, 'isLocal:', isLocal, 'spawnIndex:', spawnIndex);

    if (this.sys?.displayList) {
      if (isLocal) {
        this.spawnLocal(id, username, spawnIndex);
      } else {
        this.spawnRemote(id, username, spawnIndex);
      }
    } else {
      console.log('[GameScene] Scene not ready, queuing spawn for:', id);
      this.pendingSpawns.push({ id, username, spawnIndex, isLocal });
    }
  }

  private processPendingSpawns() {
    if (!this.sys?.displayList || this.pendingSpawns.length === 0) return;

    for (const spawn of this.pendingSpawns) {
      if (spawn.isLocal && !this.localPlayer) {
        this.spawnLocal(spawn.id, spawn.username, spawn.spawnIndex);
      } else if (!spawn.isLocal && !this.fighters.has(spawn.id)) {
        this.spawnRemote(spawn.id, spawn.username, spawn.spawnIndex);
      }
    }
    this.pendingSpawns = [];
  }

  private spawnLocal(id: string, username: string, spawnIndex: number) {
    if (this.localPlayer) {
      console.log('[GameScene] Local player already exists');
      return;
    }

    const spawn = this.getSpawnByIndex(spawnIndex);
    console.log('[GameScene] Spawning local player at', spawn.x, spawn.y, 'index:', spawnIndex);
    const fighter = new Fighter(this, spawn.x, spawn.y, id, username, true, spawnIndex);
    this.physics.add.collider(fighter, this.platforms);
    this.combat.setupCollisions(this.platforms, fighter);
    this.fighters.set(id, fighter);
    this.localPlayer = fighter;
    this.localFalling = false;

    const weaponIds = this.registry.get('playerWeapons') as string[] | undefined;
    if (weaponIds && weaponIds.length > 0) {
      fighter.loadWeapons(weaponIds);
    }
  }

  private spawnRemote(id: string, username: string, spawnIndex: number) {
    if (this.fighters.has(id)) {
      console.log('[GameScene] Remote player already exists:', id);
      return;
    }
    const spawn = this.getSpawnByIndex(spawnIndex);
    console.log('[GameScene] Spawning remote player:', username, 'at', spawn.x, spawn.y);
    const fighter = new Fighter(this, spawn.x, spawn.y, id, username, false, spawnIndex);
    this.fighters.set(id, fighter);
  }

  private playWeaponFireSound(weaponId: string, volume = 1) {
    const soundMap: Record<string, string> = {
      pistol: 'pistol_fire',
      shotgun: 'shotgun_fire',
      smg: 'smg_fire',
      assault: 'smg_fire',
    };
    const key = soundMap[weaponId] || 'pistol_fire';
    audioManager.playSFX(key, { volume });
  }

  private playWeaponReloadSound(weaponId: string) {
    const soundMap: Record<string, string> = {
      pistol: 'pistol_reload',
      shotgun: 'pistol_reload',
      smg: 'smg_reload',
      assault: 'smg_reload',
    };
    const key = soundMap[weaponId] || 'pistol_reload';
    audioManager.playSFX(key);
  }

  private applyMap(mapId: string) {
    if (!mapId) return;
    if (!this.physics || !this.physics.add) {
      this.pendingMapId = mapId;
      return;
    }
    if (this.currentMapId === mapId) return;
    const map = getMapById(mapId);
    this.currentMapId = map.id;
    this.pendingMapId = null;

    const scaleX = GAME.WIDTH / map.size.width;
    const scaleY = GAME.HEIGHT / map.size.height;

    if (this.platforms) {
      try {
        const children = this.platforms.getChildren();
        for (const child of children) {
          child.destroy();
        }
      } catch {
        // ignore teardown issues in Phaser internals
      }
    }
    this.platforms = this.physics.add.staticGroup();
    for (const p of map.platforms) {
      const w = p.w * scaleX;
      const h = p.h * scaleY;
      const x = p.x * scaleX + w / 2;
      const y = p.y * scaleY + h / 2;
      const key = h >= 30 ? 'tile_ground' : 'tile_platform';
      const platform = this.platforms.create(x, y, key);
      platform.setDisplaySize(w, h);
      platform.refreshBody();
    }

    if (this.localPlayer) {
      this.physics.add.collider(this.localPlayer, this.platforms);
    }
    this.combat.setupCollisions(this.platforms, this.localPlayer || undefined);

    this.mapSpawns = map.spawns.map((s) => ({
      x: s.x * scaleX,
      y: s.y * scaleY,
    }));
    this.fallKillY = GAME.HEIGHT + 200;
    this.physics.world.setBounds(0, 0, GAME.WIDTH, GAME.HEIGHT + 800);
  }

  private getSpawnByIndex(idx: number) {
    const list = this.mapSpawns.length ? this.mapSpawns : [{ x: 200, y: 600 }];
    return list[idx % list.length];
  }

  private getRandomSpawn() {
    const list = this.mapSpawns.length ? this.mapSpawns : [{ x: 200, y: 600 }];
    return list[Math.floor(Math.random() * list.length)];
  }

  private checkFallDeath() {
    if (!this.localPlayer || !this.isOnlineMatch || this.localFalling) return;
    if (this.localPlayer.y > this.fallKillY) {
      this.localFalling = true;
      this.localPlayer.die();
      networkManager.sendFallDeath();
    }
  }
}
