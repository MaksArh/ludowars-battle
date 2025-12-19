export interface WeaponConfig {
  id: string;
  name: string;
  damage: number;
  fireRate: number;
  magazineSize: number;
  reloadTime: number;
  projectileSpeed: number;
  projectileCount: number;
  spread: number;
  spreadRandom?: number;
  range: number;
  automatic: boolean;
}

export interface ProjectileData {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  damage: number;
  ownerId: string;
  weaponId: string;
}

export interface DamageEvent {
  sourceId: string;
  targetId: string;
  damage: number;
  position: { x: number; y: number };
  weaponId: string;
  isCritical: boolean;
}
