import Phaser from 'phaser';
import { PLAYER, COMBAT } from '../config/GameConstants';
import { SKINS, SkinId } from '../config/skins';
import { WEAPONS } from '../config/WeaponConfigs';
import { Weapon } from './Weapon';
import { eventBus, EVENTS } from '../utils/EventBus';
import type { InputState } from '../systems/InputSystem';
import type { ProjectileData } from '@/types/combat';

// скорость интерполяции для удаленных игроков
const INTERPOLATION_SPEED = 0.5;
const PLAYER_SPRITE_SCALE = PLAYER.HEIGHT / 256;
const WEAPON_BOB_OFFSET = 2;

// Fighter это и локальный и удаленный игрок
// isLocal=true физика работает полностью
// isLocal=false просто интерполируем позицию
export class Fighter extends Phaser.Physics.Arcade.Sprite {
  public readonly id: string;
  public readonly username: string;
  public readonly isLocal: boolean;
  public facingRight = true;
  public readonly skin: SkinId;

  private jumps = PLAYER.MAX_JUMPS;
  private coyote = 0;
  private wasGrounded = true;

  private dashing = false;
  private dashEnd = 0;
  private lastDash = 0;

  private lastJumpType: 'normal' | 'double' | null = null;

  private hp = COMBAT.MAX_HP;
  private weapons: Weapon[] = [];
  private weaponIdx = 0;
  private invuln = false;

  private damageMultiplier = 1.0;
  private shieldActive = false;
  private instakillReady = false;
  private rouletteCooldown = 0;
  private effectEndTime = 0;

  private targetX = 0;
  private targetY = 0;
  private remoteVx = 0;
  private remoteVy = 0;

  private nameText?: Phaser.GameObjects.Text;
  private hpBarBg?: Phaser.GameObjects.Rectangle;
  private hpBarFill?: Phaser.GameObjects.Rectangle;
  private lastDisplayedHp = COMBAT.MAX_HP;

  private shieldGraphic?: Phaser.GameObjects.Arc;
  private damageAura?: Phaser.GameObjects.Arc;
  private weaponSprite?: Phaser.GameObjects.Image;
  private weaponBobTween?: Phaser.Tweens.Tween;
  private weaponBobOffset = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    username: string,
    isLocal: boolean,
    skinIndex: number
  ) {
    super(scene, x, y, 'player_atlas');
    this.id = id;
    this.username = username;
    this.isLocal = isLocal;
    this.skin = SKINS[skinIndex % SKINS.length];
    this.targetX = x;
    this.targetY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    body.setCollideWorldBounds(true);

    if (isLocal) {
      body.setMaxVelocity(PLAYER.SPEED, PLAYER.MAX_FALL);
      body.setDrag(PLAYER.DRAG, 0);
    } else {
      body.setAllowGravity(false);
      body.setImmovable(true);

      this.nameText = scene.add
        .text(x, y - PLAYER.HEIGHT / 2 - 20, username, {
          fontSize: '12px',
          color: '#fff',
          stroke: '#000',
          strokeThickness: 2,
        })
        .setOrigin(0.5);

      const w = 40, h = 4;
      const bx = x, by = y - PLAYER.HEIGHT / 2 - 8;
      this.hpBarBg = scene.add.rectangle(bx, by, w, h, 0x333333).setOrigin(0.5);
      this.hpBarFill = scene.add.rectangle(bx, by, w, h, 0x4caf50).setOrigin(0.5);
    }

    this.weapons.push(new Weapon(scene, WEAPONS.pistol, this));
    this.setScale(PLAYER_SPRITE_SCALE);
    this.play(`player_${this.skin}_idle`);
    this.createWeaponSprite();

    if (isLocal) {
      this.scene.time.delayedCall(0, () => {
        eventBus.emit(EVENTS.HP_CHANGED, { hp: this.hp, max: COMBAT.MAX_HP });
        this.emitAmmoChanged();
        eventBus.emit(EVENTS.WEAPON_CHANGED, { weaponId: 'pistol' });
      });
    }
  }

  updateLocal(dt: number, input: InputState) {
    if (!this.isLocal) return;

    const now = Date.now();
    const body = this.body as Phaser.Physics.Arcade.Body;
    const grounded = body.blocked.down;

    if (grounded) {
      this.jumps = PLAYER.MAX_JUMPS;
      this.coyote = PLAYER.COYOTE;
    } else if (this.wasGrounded && this.jumps === PLAYER.MAX_JUMPS) {
      this.coyote -= dt;
      if (this.coyote <= 0) this.jumps--;
    }
    this.wasGrounded = grounded;

    if (this.dashing && now > this.dashEnd) {
      this.dashing = false;
      body.setMaxVelocity(PLAYER.SPEED, PLAYER.MAX_FALL);
    }

    if (!this.dashing && now - this.lastDash > PLAYER.DASH_COOLDOWN) {
      if (input.dashLeft) {
        this.startDash(false, now, body);
      } else if (input.dashRight) {
        this.startDash(true, now, body);
      }
    }

    if (!this.dashing) {
      if (input.left) {
        body.setAccelerationX(-PLAYER.ACCEL);
        this.facingRight = false;
        this.setFlipX(true);
      } else if (input.right) {
        body.setAccelerationX(PLAYER.ACCEL);
        this.facingRight = true;
        this.setFlipX(false);
      } else {
        body.setAccelerationX(0);
      }
    }

    this.lastJumpType = null;
    if (input.jump && this.jumps > 0) {
      const isDouble = this.jumps < PLAYER.MAX_JUMPS;
      body.setVelocityY(isDouble ? PLAYER.DOUBLE_JUMP : PLAYER.JUMP);
      this.jumps--;
      this.coyote = 0;
      this.lastJumpType = isDouble ? 'double' : 'normal';
    }

    this.updateAnimation(grounded, body.velocity.x, body.velocity.y);
    this.updateWeaponSpritePosition();
  }

  getLastJumpType(): 'normal' | 'double' | null {
    return this.lastJumpType;
  }

  private startDash(right: boolean, now: number, body: Phaser.Physics.Arcade.Body) {
    this.dashing = true;
    this.dashEnd = now + PLAYER.DASH_DURATION;
    this.lastDash = now;
    this.facingRight = right;
    this.setFlipX(!right);

    body.setMaxVelocity(PLAYER.DASH_SPEED, PLAYER.MAX_FALL);
    body.setVelocityX(right ? PLAYER.DASH_SPEED : -PLAYER.DASH_SPEED);
    body.setAccelerationX(0);
  }

  setTargetPosition(
    x: number,
    y: number,
    facing: boolean,
    hp: number,
    invuln?: boolean,
    vx = 0,
    vy = 0
  ) {
    this.targetX = x;
    this.targetY = y;
    this.remoteVx = vx;
    this.remoteVy = vy;
    this.facingRight = facing;
    this.setFlipX(!facing);
    this.hp = hp;
    if (invuln !== undefined) {
      this.invuln = invuln;
      this.setAlpha(invuln ? 0.5 : 1);
    }
  }

  interpolate() {
    if (this.isLocal) return;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;

    if (Math.abs(dx) > 150 || Math.abs(dy) > 150) {
      this.setPosition(this.targetX, this.targetY);
    } else {
      this.x += dx * INTERPOLATION_SPEED;
      this.y += dy * INTERPOLATION_SPEED;
    }

    this.updateRemoteUI();
    const grounded = Math.abs(this.remoteVy) < 5;
    this.updateAnimation(grounded, this.remoteVx, this.remoteVy);
    this.updateWeaponSpritePosition();
  }

  private updateRemoteUI() {
    if (!this.nameText || !this.hpBarBg || !this.hpBarFill) return;

    const by = this.y - PLAYER.HEIGHT / 2 - 8;

    this.nameText.setPosition(this.x, this.y - PLAYER.HEIGHT / 2 - 20);
    this.hpBarBg.setPosition(this.x, by);
    this.hpBarFill.setPosition(this.x, by);

    if (this.hp !== this.lastDisplayedHp) {
      this.lastDisplayedHp = this.hp;
      const pct = this.hp / COMBAT.MAX_HP;
      const color = pct > 0.5 ? 0x4caf50 : pct > 0.25 ? 0xffeb3b : 0xf44336;
      this.hpBarFill.setScale(pct, 1);
      this.hpBarFill.setFillStyle(color);
    }
  }

  shoot(): ProjectileData[] {
    const weapon = this.weapons[this.weaponIdx];
    if (!weapon) return [];
    const projectiles = weapon.fire(this.facingRight);

    if (projectiles.length > 0) {
      this.playWeaponFireAnim();
    }

    if (this.damageMultiplier !== 1.0) {
      for (const p of projectiles) {
        p.damage = Math.floor(p.damage * this.damageMultiplier);
      }
    }

    if (this.instakillReady && projectiles.length > 0) {
      projectiles[0].damage = 10000;
      this.instakillReady = false;
      if (this.isLocal) {
        eventBus.emit(EVENTS.ROULETTE_EFFECT_END, { effect: 'instakill_used' });
      }
    }

    if (projectiles.length > 0 && this.isLocal) {
      this.emitAmmoChanged();
    }
    return projectiles;
  }

  reload() {
    const weapon = this.weapons[this.weaponIdx];
    if (!weapon) return;
    const wasReloading = weapon.isReloading;
    weapon.reload();
    if (!wasReloading && weapon.isReloading && this.isLocal) {
      this.emitAmmoChanged();
      this.scene.time.delayedCall(weapon.getConfig().reloadTime, () => {
        this.emitAmmoChanged();
      });
    }
  }

  private updateAnimation(grounded: boolean, vx: number, vy: number) {
    if (!this.active) return;
    const absVx = Math.abs(vx);
    const absVy = Math.abs(vy);
    let state: 'run' | 'jump' | 'idle' = 'idle';

    if (!grounded && absVy > 5) {
      state = 'jump';
    } else if (absVx > 10) {
      state = 'run';
    }

    const key = `player_${this.skin}_${state}`;
    if (this.anims?.currentAnim?.key !== key) {
      this.anims.play(key, true);
    }
  }

  private createWeaponSprite() {
    const key = this.getWeaponTextureKey(this.getWeapon()?.getConfig().id);
    this.weaponSprite = this.scene.add.image(this.x, this.y, key);
    this.weaponSprite.setOrigin(0.2, 0.5);
    this.weaponSprite.setScale(PLAYER_SPRITE_SCALE);
    this.weaponSprite.setDepth(this.depth + 1);
  }

  private updateWeaponSpritePosition() {
    if (!this.weaponSprite || !this.active) return;
    const offsetX = this.facingRight ? PLAYER.WIDTH * 0.45 : -PLAYER.WIDTH * 0.45;
    const offsetY = PLAYER.HEIGHT * 0.3 + this.weaponBobOffset;
    this.weaponSprite.setPosition(this.x + offsetX, this.y + offsetY);
    this.weaponSprite.setFlipX(!this.facingRight);
  }

  private playWeaponFireAnim() {
    if (!this.weaponSprite) return;
    this.weaponBobTween?.stop();
    this.weaponBobOffset = -WEAPON_BOB_OFFSET;
    this.weaponBobTween = this.scene.tweens.add({
      targets: this,
      weaponBobOffset: 0,
      duration: 120,
      ease: 'Quad.Out',
    });
  }

  private getWeaponTextureKey(weaponId?: string): string {
    if (!weaponId) return 'weapon_pistol';
    if (weaponId === 'shotgun') return 'weapon_shotgun';
    if (weaponId === 'assault_rifle' || weaponId === 'assault') return 'weapon_assault';
    return 'weapon_pistol';
  }

  private updateWeaponSpriteTexture() {
    if (!this.weaponSprite || !this.weaponSprite.scene) return;
    const key = this.getWeaponTextureKey(this.getWeapon()?.getConfig().id);
    this.weaponSprite.setTexture(key);
  }

  switchWeapon() {
    if (this.weapons.length <= 1) return;
    this.weapons[this.weaponIdx]?.cancelReload();
    this.weaponIdx = (this.weaponIdx + 1) % this.weapons.length;
    this.updateWeaponSpriteTexture();
    if (this.isLocal) {
      const weapon = this.weapons[this.weaponIdx];
      eventBus.emit(EVENTS.WEAPON_CHANGED, { weaponId: weapon?.getConfig().id || 'pistol' });
      this.emitAmmoChanged();
    }
  }

  private emitAmmoChanged() {
    const weapon = this.weapons[this.weaponIdx];
    if (weapon) {
      eventBus.emit(EVENTS.AMMO_CHANGED, {
        ammo: weapon.ammo,
        max: weapon.getConfig().magazineSize,
        reloading: weapon.isReloading,
      });
    }
  }

  addWeapon(id: string) {
    const cfg = WEAPONS[id];
    if (cfg && !this.weapons.find((w) => w.getConfig().id === id)) {
      this.weapons.push(new Weapon(this.scene, cfg, this));
    }
  }

  setWeaponById(id: string) {
    const idx = this.weapons.findIndex((w) => w.getConfig().id === id);
    if (idx >= 0) {
      this.weaponIdx = idx;
    } else {
      this.addWeapon(id);
      this.weaponIdx = this.weapons.length - 1;
    }
    this.updateWeaponSpriteTexture();
  }

  loadWeapons(weaponIds: string[]) {
    this.weapons = [];
    this.weaponIdx = 0;

    for (const id of weaponIds) {
      const cfg = WEAPONS[id];
      if (cfg) {
        this.weapons.push(new Weapon(this.scene, cfg, this));
      }
    }

    if (this.weapons.length === 0) {
      this.weapons.push(new Weapon(this.scene, WEAPONS.pistol, this));
    }
    this.updateWeaponSpriteTexture();

    if (this.isLocal) {
      const weapon = this.getWeapon();
      if (weapon) {
        eventBus.emit(EVENTS.WEAPON_CHANGED, { weaponId: weapon.getConfig().id });
        eventBus.emit(EVENTS.AMMO_CHANGED, {
          ammo: weapon.ammo,
          max: weapon.getConfig().magazineSize,
          reloading: weapon.isReloading,
        });
      }
    }
  }

  getWeapon() {
    return this.weapons[this.weaponIdx];
  }

  takeDamage(amount: number): boolean {
    if (this.invuln || this.shieldActive || !this.active || !this.body) return false;

    this.hp = Math.max(0, this.hp - amount);

    if (this.isLocal) {
      eventBus.emit(EVENTS.HP_CHANGED, { hp: this.hp, max: COMBAT.MAX_HP });
    }

    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  heal(amount: number) {
    this.hp = Math.min(COMBAT.MAX_HP, this.hp + amount);
    if (this.isLocal) {
      eventBus.emit(EVENTS.HP_CHANGED, { hp: this.hp, max: COMBAT.MAX_HP });
    }
  }

  die() {
    this.setAngle(90);
    this.setVisible(true);
    this.setActive(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = false;
    this.weaponSprite?.setVisible(false);

    if (this.isLocal) {
      eventBus.emit(EVENTS.PLAYER_DIED, { playerId: this.id });
    }
  }

  respawn(x: number, y: number) {
    this.hp = COMBAT.MAX_HP;
    this.setPosition(x, y);
    this.targetX = x;
    this.targetY = y;
    this.setAngle(0);
    this.setVisible(true);
    this.setActive(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = true;
    this.jumps = PLAYER.MAX_JUMPS;
    this.weaponSprite?.setVisible(true);
    this.play(`player_${this.skin}_idle`);

    if (this.isLocal) {
      this.invuln = true;
      this.setAlpha(0.5);
      this.scene.time.delayedCall(COMBAT.INVULN_TIME, () => {
        this.invuln = false;
        this.setAlpha(1);
      });
      eventBus.emit(EVENTS.HP_CHANGED, { hp: this.hp, max: COMBAT.MAX_HP });
    }
  }

  getHp() {
    return this.hp;
  }

  canUseRoulette(): boolean {
    return Date.now() > this.rouletteCooldown;
  }

  startRouletteCooldown(cooldownMs = 15000) {
    this.rouletteCooldown = Date.now() + cooldownMs;
  }

  getRouletteCooldownRemaining(): number {
    return Math.max(0, this.rouletteCooldown - Date.now());
  }

  applyRouletteEffect(effect: string, duration: number) {
    const now = Date.now();

    this.damageMultiplier = 1.0;
    this.shieldActive = false;
    this.clearRouletteVisuals();

    if (duration > 0) {
      this.effectEndTime = now + duration;
    }

    switch (effect) {
      case 'damage_25':
        this.damageMultiplier = 1.25;
        this.createDamageAura();
        break;
      case 'damage_50':
        this.damageMultiplier = 1.5;
        this.createDamageAura();
        break;
      case 'damage_75':
        this.damageMultiplier = 1.75;
        this.createDamageAura();
        break;
      case 'damage_100':
        this.damageMultiplier = 2.0;
        this.createDamageAura();
        break;
      case 'heal_25':
        this.heal(25);
        break;
      case 'heal_50':
        this.heal(50);
        break;
      case 'heal_100':
        this.heal(100);
        break;
      case 'shield_3':
      case 'shield_5':
      case 'shield_7':
        this.shieldActive = true;
        this.createShieldVisual();
        break;
      case 'instakill':
        this.instakillReady = true;
        break;
      case 'nothing':
        break;
    }

    if (this.isLocal) {
      eventBus.emit(EVENTS.ROULETTE_EFFECT_START, { effect, duration });
    }
  }

  private createShieldVisual() {
    if (!this.scene || !this.scene.sys?.displayList || !this.scene.add || !this.active) return;
    if (this.shieldGraphic) this.shieldGraphic.destroy();
    this.shieldGraphic = this.scene.add.circle(this.x, this.y, 35, 0x4488ff, 0.3);
    this.shieldGraphic.setStrokeStyle(2, 0x88ccff);
    this.shieldGraphic.setDepth(this.depth - 1);
  }

  private createDamageAura() {
    if (!this.scene || !this.scene.sys?.displayList || !this.scene.add || !this.active) return;
    if (this.damageAura) this.damageAura.destroy();
    this.damageAura = this.scene.add.circle(this.x, this.y, 30, 0xff4444, 0.2);
    this.damageAura.setDepth(this.depth - 1);
  }

  private clearRouletteVisuals() {
    if (this.shieldGraphic) {
      this.shieldGraphic.destroy();
      this.shieldGraphic = undefined;
    }
    if (this.damageAura) {
      this.damageAura.destroy();
      this.damageAura = undefined;
    }
  }

  updateEffects() {
    if (this.shieldGraphic) {
      this.shieldGraphic.setPosition(this.x, this.y);
    }
    if (this.damageAura) {
      this.damageAura.setPosition(this.x, this.y);
    }

    if (this.effectEndTime > 0 && Date.now() > this.effectEndTime) {
      this.damageMultiplier = 1.0;
      this.shieldActive = false;
      this.effectEndTime = 0;
      this.clearRouletteVisuals();
      if (this.isLocal) {
        eventBus.emit(EVENTS.ROULETTE_EFFECT_END, {});
      }
    }
  }

  getDamageMultiplier(): number {
    return this.damageMultiplier;
  }

  isShieldActive(): boolean {
    return this.shieldActive;
  }

  hasInstakill(): boolean {
    return this.instakillReady;
  }

  consumeInstakill(): boolean {
    if (this.instakillReady) {
      this.instakillReady = false;
      return true;
    }
    return false;
  }

  getState() {
    return {
      x: this.x,
      y: this.y,
      vx: (this.body as Phaser.Physics.Arcade.Body).velocity.x,
      vy: (this.body as Phaser.Physics.Arcade.Body).velocity.y,
      facing: this.facingRight,
      hp: this.hp,
      invuln: this.invuln,
    };
  }

  destroy(fromScene?: boolean) {
    this.nameText?.destroy();
    this.hpBarBg?.destroy();
    this.hpBarFill?.destroy();
    this.clearRouletteVisuals();
    this.weaponSprite?.destroy();
    super.destroy(fromScene);
  }
}
