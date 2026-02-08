import Phaser from 'phaser';
import { SKINS, getSkinByIndex } from '../config/skins';
import { PLAYER } from '../config/GameConstants';
import { MENU_AMBIENT } from '../config/MenuAmbientConfig';

const WEAPON_KEYS = ['weapon_pistol', 'weapon_shotgun', 'weapon_assault'] as const;
const WEAPON_OFFSET_X = PLAYER.WIDTH * 0.0;
const WEAPON_OFFSET_Y = PLAYER.HEIGHT * 0.9;
const PLAYER_SPRITE_SCALE = PLAYER.HEIGHT / 100;

type AmbientActor = {
  container: Phaser.GameObjects.Container;
  speed: number;
  rotateSpeed: number;
};

export class MenuAmbientScene extends Phaser.Scene {
  private actors: AmbientActor[] = [];
  private spawnTimer?: Phaser.Time.TimerEvent;
  private nextSide: 'left' | 'right' = 'left';

  constructor() {
    super('MenuAmbient');
  }

  preload() {
    this.load.spritesheet('player_atlas', '/assets/player/player_atlas.png', {
      frameWidth: 160,
      frameHeight: 256,
    });
    this.load.image('weapon_pistol', '/assets/weapons/pistol.png');
    this.load.image('weapon_shotgun', '/assets/weapons/shotgun.png');
    this.load.image('weapon_assault', '/assets/weapons/rifle.png');
  }

  create() {
    this.createPlayerAnimations();
    this.enableSmoothTextures();
    this.startSpawnLoop();

    this.scale.on('resize', () => {
      this.cleanupOutOfBounds();
    });
  }

  update(_time: number, delta: number) {
    const height = this.scale.height;
    const dt = delta / 1000;

    for (let i = this.actors.length - 1; i >= 0; i--) {
      const actor = this.actors[i];
      actor.container.y += actor.speed * dt;
      actor.container.rotation += actor.rotateSpeed * dt;

      if (actor.container.y > height + 200) {
        actor.container.destroy();
        this.actors.splice(i, 1);
      }
    }
  }

  private startSpawnLoop() {
    this.spawnTimer?.destroy();
    this.spawnActor();
    this.spawnTimer = this.time.addEvent({
      delay: MENU_AMBIENT.spawnIntervalMs,
      loop: true,
      callback: () => this.spawnActor(),
    });
  }

  private spawnActor() {
    if (this.actors.length >= MENU_AMBIENT.maxActors) return;

    const width = this.scale.width;
    const height = this.scale.height;
    if (width <= 0 || height <= 0) return;

    const safeWidth = Math.min(MENU_AMBIENT.safeZoneWidth, Math.max(0, width - MENU_AMBIENT.spawnMargin * 2));
    const safeLeft = (width - safeWidth) / 2;
    const safeRight = safeLeft + safeWidth;

    const leftMax = Math.max(MENU_AMBIENT.spawnMargin, safeLeft - MENU_AMBIENT.spawnMargin);
    const rightMin = Math.min(width - MENU_AMBIENT.spawnMargin, safeRight + MENU_AMBIENT.spawnMargin);

    let x: number | null = null;
    const side = this.nextSide;
    this.nextSide = side === 'left' ? 'right' : 'left';

    if (side === 'left' && leftMax > MENU_AMBIENT.spawnMargin + 10) {
      x = Phaser.Math.Between(MENU_AMBIENT.spawnMargin, leftMax);
    } else if (side === 'right' && rightMin < width - MENU_AMBIENT.spawnMargin - 10) {
      x = Phaser.Math.Between(rightMin, width - MENU_AMBIENT.spawnMargin);
    } else if (leftMax > MENU_AMBIENT.spawnMargin + 10) {
      x = Phaser.Math.Between(MENU_AMBIENT.spawnMargin, leftMax);
    } else if (rightMin < width - MENU_AMBIENT.spawnMargin - 10) {
      x = Phaser.Math.Between(rightMin, width - MENU_AMBIENT.spawnMargin);
    }

    if (x === null) return;

    const y = Phaser.Math.Between(-200, -40);
    const depth = Phaser.Math.FloatBetween(0.2, 1);
    const scale = Phaser.Math.Linear(MENU_AMBIENT.playerScaleMin, MENU_AMBIENT.playerScaleMax, depth);
    const speed = Phaser.Math.Linear(MENU_AMBIENT.fallSpeedMin, MENU_AMBIENT.fallSpeedMax, depth);
    const rotateSpeed = Phaser.Math.FloatBetween(MENU_AMBIENT.rotSpeedMin, MENU_AMBIENT.rotSpeedMax) * (Math.random() < 0.5 ? -1 : 1);
    const alpha = 1;
    const brightness = Phaser.Math.Linear(MENU_AMBIENT.brightnessFar, MENU_AMBIENT.brightnessNear, depth);

    const skin = getSkinByIndex(Phaser.Math.Between(0, SKINS.length - 1));
    const anim = this.pickAnimation(skin);
    const weaponKey = WEAPON_KEYS[Phaser.Math.Between(0, WEAPON_KEYS.length - 1)];
    const facingRight = Math.random() < 0.5;

    const player = this.add.sprite(0, 0, 'player_atlas');
    player.play(anim);
    player.setOrigin(0.5, 0.5);
    player.setFlipX(!facingRight);
    player.setTint(this.getTint(brightness));
    player.setScale(PLAYER_SPRITE_SCALE * scale);

    const weapon = this.add.image(
      facingRight ? WEAPON_OFFSET_X : -WEAPON_OFFSET_X,
      WEAPON_OFFSET_Y,
      weaponKey
    );
    weapon.setOrigin(0.2, 0.5);
    weapon.setScale(PLAYER_SPRITE_SCALE * scale);
    weapon.setFlipX(!facingRight);
    weapon.setTint(this.getTint(brightness));

    const container = this.add.container(x, y, [player, weapon]);
    container.setScale(1);
    container.setAlpha(alpha);
    container.rotation = Phaser.Math.FloatBetween(-0.4, 0.4);

    this.actors.push({ container, speed, rotateSpeed });
  }

  private pickAnimation(skin: string): string {
    const roll = Math.random();
    if (roll < 0.5) return `player_${skin}_idle`;
    if (roll < 0.75) return `player_${skin}_run`;
    return `player_${skin}_jump`;
  }

  private createPlayerAnimations() {
    const createAnim = (key: string, start: number, end: number, frameRate: number, repeat: number) => {
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers('player_atlas', { start, end }),
        frameRate,
        repeat,
      });
    };

    SKINS.forEach((skin, row) => {
      const start = row * 8;
      createAnim(`player_${skin}_run`, start, start + 7, 16, -1);
    });

    const jumpRows = [4, 5];
    jumpRows.forEach((row, i) => {
      const base = row * 8;
      const leftSkin = SKINS[i * 2];
      const rightSkin = SKINS[i * 2 + 1];
      createAnim(`player_${leftSkin}_jump`, base, base + 3, 8, -1);
      createAnim(`player_${rightSkin}_jump`, base + 4, base + 7, 8, -1);
    });

    const idleRows = [6, 7];
    idleRows.forEach((row, i) => {
      const base = row * 8;
      const leftSkin = SKINS[i * 2];
      const rightSkin = SKINS[i * 2 + 1];
      createAnim(`player_${leftSkin}_idle`, base, base + 3, 0.5, -1);
      createAnim(`player_${rightSkin}_idle`, base + 4, base + 7, 0.5, -1);
    });
  }

  private enableSmoothTextures() {
    this.textures.get('player_atlas').setFilter(Phaser.Textures.FilterMode.LINEAR);
    WEAPON_KEYS.forEach((key) => {
      this.textures.get(key).setFilter(Phaser.Textures.FilterMode.LINEAR);
    });
  }

  private getTint(brightness: number) {
    const v = Math.floor(255 * Phaser.Math.Clamp(brightness, 0, 1));
    return (v << 16) | (v << 8) | v;
  }

  private cleanupOutOfBounds() {
    const height = this.scale.height;
    for (let i = this.actors.length - 1; i >= 0; i--) {
      const actor = this.actors[i];
      if (actor.container.y > height + 200) {
        actor.container.destroy();
        this.actors.splice(i, 1);
      }
    }
  }
}
