import Phaser from 'phaser';
import { PROJECTILE, GAME } from '../config/GameConstants';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number;
  public ownerId: string;
  public weaponId: string;
  private maxRange: number;
  private startX: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture?: string) {
    super(scene, x, y, texture || 'projectile');
    this.damage = 0;
    this.ownerId = '';
    this.weaponId = '';
    this.maxRange = 0;
    this.startX = 0;

    this.setActive(false);
    this.setVisible(false);
  }

  init(
    x: number,
    y: number,
    vx: number,
    vy: number,
    damage: number,
    ownerId: string,
    weaponId: string,
    range: number
  ): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);

    this.damage = damage;
    this.ownerId = ownerId;
    this.weaponId = weaponId;
    this.maxRange = range;
    this.startX = x;

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setSize(PROJECTILE.WIDTH * 2, PROJECTILE.HEIGHT * 2);
      body.setVelocity(vx, vy);
      body.setAllowGravity(false);
      body.setCollideWorldBounds(false);
      body.enable = true;
    }
    this.rotation = Math.atan2(vy, vx);
  }

  // возвращаем в пул вместо уничтожения
  deactivate(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.setVelocity(0, 0);
      body.enable = false;
    }
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);

    if (!this.active) return;

    if (
      Math.abs(this.x - this.startX) > this.maxRange ||
      this.x < -50 || this.x > GAME.WIDTH + 50 ||
      this.y < -50 || this.y > GAME.HEIGHT + 50
    ) {
      this.deactivate();
    }
  }
}
