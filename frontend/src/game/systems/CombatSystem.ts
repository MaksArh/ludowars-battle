import Phaser from 'phaser';
import { Projectile } from '../entities/Projectile';
import { COMBAT } from '../config/GameConstants';
import { WEAPONS } from '../config/WeaponConfigs';
import type { ProjectileData } from '@/types/combat';
import type { Fighter } from '../entities/Fighter';

const POOL_SIZE = 200;

export class CombatSystem {
  private scene: Phaser.Scene;
  private projectiles: Phaser.Physics.Arcade.Group;
  private pickups: Phaser.Physics.Arcade.StaticGroup;
  private projectileColliderTarget: Phaser.Physics.Arcade.StaticGroup | null = null;
  private pickupOverlapSet = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // пул снарядов
    this.projectiles = scene.physics.add.group({
      classType: Projectile,
      maxSize: POOL_SIZE,
      runChildUpdate: true,
      allowGravity: false,
    });

    this.pickups = scene.physics.add.staticGroup();
  }

  createProjectile(data: ProjectileData): Projectile | null {
    const range = WEAPONS[data.weaponId]?.range || 600;

    // берем из пула
    const proj = this.projectiles.get(data.x, data.y) as Projectile | null;
    if (!proj) return null;

    proj.init(
      data.x, data.y,
      data.velocityX, data.velocityY,
      data.damage, data.ownerId, data.weaponId, range
    );

    return proj;
  }

  setupCollisions(platforms: Phaser.Physics.Arcade.StaticGroup, player?: Fighter) {
    if (this.projectileColliderTarget !== platforms) {
      this.scene.physics.add.collider(this.projectiles, platforms, (p) => {
        (p as Projectile).deactivate();
      });
      this.projectileColliderTarget = platforms;
    }

    if (player && !this.pickupOverlapSet) {
      this.scene.physics.add.overlap(player, this.pickups, (_, pickup) => {
        const hp = (pickup as Phaser.GameObjects.GameObject).getData('heal') as number;
        player.heal(hp);
        (pickup as Phaser.Physics.Arcade.Sprite).destroy();
        this.scene.time.delayedCall(COMBAT.PICKUP_RESPAWN, () => {
          this.spawnPickup((pickup as Phaser.Physics.Arcade.Sprite).x, (pickup as Phaser.Physics.Arcade.Sprite).y);
        });
      });
      this.pickupOverlapSet = true;
    }
  }

  spawnPickup(x: number, y: number, heal = COMBAT.HEALTH_PACK) {
    const p = this.pickups.create(x, y, 'health_pickup') as Phaser.Physics.Arcade.Sprite;
    p.setData('heal', heal);
  }

  getProjectiles() {
    return this.projectiles;
  }

  getActiveProjectiles(): Projectile[] {
    return this.projectiles.getMatching('active', true) as Projectile[];
  }
}
