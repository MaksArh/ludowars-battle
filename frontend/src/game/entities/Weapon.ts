import Phaser from 'phaser';
import type { WeaponConfig, ProjectileData } from '@/types/combat';

export class Weapon {
  private scene: Phaser.Scene;
  private config: WeaponConfig;
  private owner: Phaser.Physics.Arcade.Sprite;
  private lastFire = 0;
  private reloadTimer?: Phaser.Time.TimerEvent;

  public ammo: number;
  public isReloading = false;

  constructor(scene: Phaser.Scene, config: WeaponConfig, owner: Phaser.Physics.Arcade.Sprite) {
    this.scene = scene;
    this.config = config;
    this.owner = owner;
    this.ammo = config.magazineSize;
  }

  canFire(): boolean {
    if (this.isReloading || this.ammo <= 0) return false;
    return this.scene.time.now - this.lastFire >= 1000 / this.config.fireRate;
  }

  fire(facingRight: boolean): ProjectileData[] {
    if (!this.canFire()) return [];

    this.lastFire = this.scene.time.now;
    this.ammo--;

    const baseAngle = facingRight ? 0 : 180;
    const projectiles: ProjectileData[] = [];

    for (let i = 0; i < this.config.projectileCount; i++) {
      const spread = this.getSpread(i);
      const angle = Phaser.Math.DegToRad(baseAngle + spread);

      projectiles.push({
        id: Phaser.Utils.String.UUID(),
        x: this.owner.x + (facingRight ? 20 : -20),
        y: this.owner.y,
        velocityX: Math.cos(angle) * this.config.projectileSpeed,
        velocityY: Math.sin(angle) * this.config.projectileSpeed,
        damage: this.config.damage,
        ownerId: 'local',
        weaponId: this.config.id,
      });
    }

    if (this.ammo <= 0) this.reload();
    return projectiles;
  }

  private getSpread(i: number): number {
    if (this.config.projectileCount === 1) {
      return Phaser.Math.Between(-this.config.spread, this.config.spread);
    }
    const step = (this.config.spread * 2) / (this.config.projectileCount - 1);
    let angle = -this.config.spread + step * i;

    if (this.config.spreadRandom) {
      angle += Phaser.Math.FloatBetween(-this.config.spreadRandom, this.config.spreadRandom);
    }
    return angle;
  }

  reload(): void {
    if (this.isReloading || this.ammo === this.config.magazineSize) return;
    this.isReloading = true;
    this.reloadTimer = this.scene.time.delayedCall(this.config.reloadTime, () => {
      this.ammo = this.config.magazineSize;
      this.isReloading = false;
    });
  }

  cancelReload(): void {
    this.reloadTimer?.destroy();
    this.isReloading = false;
  }

  getConfig(): WeaponConfig {
    return this.config;
  }
}
