import Phaser from 'phaser';
import { COLORS, PROJECTILE } from '../config/GameConstants';
import { SKINS } from '../config/skins';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    // звуки
    this.load.audio('jump', '/sounds/sfx/jump.mp3');
    this.load.audio('dash', '/sounds/sfx/dash.mp3');
    this.load.audio('walk1', '/sounds/sfx/walk_metal1.mp3');
    this.load.audio('walk2', '/sounds/sfx/walk_metal2.mp3');
    this.load.audio('walk3', '/sounds/sfx/walk_metal3.mp3');
    this.load.audio('walk4', '/sounds/sfx/walk_metal4.mp3');
    this.load.audio('pistol_fire', '/sounds/sfx/pistol_fire.mp3');
    this.load.audio('shotgun_fire', '/sounds/sfx/shotgun_fire.mp3');
    this.load.audio('smg_fire', '/sounds/sfx/smg_fire.mp3');
    this.load.audio('pistol_reload', '/sounds/sfx/pistol_reload.mp3');
    this.load.audio('smg_reload', '/sounds/sfx/smg_reload.mp3');
    this.load.audio('pistol_empty', '/sounds/sfx/pistol_empty.mp3');
    this.load.audio('shotgun_empty', '/sounds/sfx/shotgun_empty.mp3');
    this.load.audio('smg_empty', '/sounds/sfx/smg_empty.mp3');
    this.load.audio('weapon_swap', '/sounds/sfx/change_weapon.mp3');
    this.load.audio('hit', '/sounds/sfx/hit.mp3');
    this.load.audio('die', '/sounds/sfx/die.mp3');
    this.load.audio('tick', '/sounds/sfx/tick.mp3');
    this.load.audio('go', '/sounds/sfx/go.mp3');
    this.load.audio('pickup', '/sounds/sfx/pickup.mp3');
    this.load.audio('ui_click', '/sounds/sfx/ui_click.mp3');
    this.load.audio('ui_error', '/sounds/sfx/ui_error.mp3');

    // музыка
    this.load.audio('menu_music', '/sounds/music/menu.mp3');
    this.load.audio('battle_1', '/sounds/music/battle1.mp3');
    this.load.audio('battle_2', '/sounds/music/battle2.mp3');
    this.load.audio('victory', '/sounds/music/victory.mp3');
    this.load.audio('defeat', '/sounds/music/defeat.mp3');

    // ассеты
    this.load.spritesheet('player_atlas', '/assets/player/player_atlas.png', {
      frameWidth: 160,
      frameHeight: 256,
    });
    this.load.image('tile_ground', '/assets/tiles/tile_ground.png');
    this.load.image('tile_platform', '/assets/tiles/tile_platform.png');
    this.load.image('battle_bg', '/assets/bg/battle_bg.png');
    this.load.image('weapon_pistol', '/assets/weapons/pistol.png');
    this.load.image('weapon_shotgun', '/assets/weapons/shotgun.png');
    this.load.image('weapon_assault', '/assets/weapons/rifle.png');
  }

  create() {
    // пуля
    const pr = this.make.graphics({});
    pr.fillStyle(COLORS.PROJECTILE);
    pr.fillRect(0, 0, PROJECTILE.WIDTH, PROJECTILE.HEIGHT);
    pr.generateTexture('projectile', PROJECTILE.WIDTH, PROJECTILE.HEIGHT);
    pr.destroy();

    // аптечка
    const h = this.make.graphics({});
    h.fillStyle(COLORS.HEALTH);
    h.fillRect(0, 0, 20, 20);
    h.fillStyle(0xffffff);
    h.fillRect(8, 4, 4, 12);
    h.fillRect(4, 8, 12, 4);
    h.generateTexture('health_pickup', 20, 20);
    h.destroy();

    this.createPlayerAnimations();
    this.scene.start('Game');
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

    // run: rows 0..3 (8 frames each)
    SKINS.forEach((skin, row) => {
      const start = row * 8;
      createAnim(`player_${skin}_run`, start, start + 7, 16, -1);
    });

    // jump: rows 4..5 (по 2 скина в ряд, 4 кадра)
    const jumpRows = [4, 5];
    jumpRows.forEach((row, i) => {
      const base = row * 8;
      const leftSkin = SKINS[i * 2];
      const rightSkin = SKINS[i * 2 + 1];
      createAnim(`player_${leftSkin}_jump`, base, base + 3, 8, -1);
      createAnim(`player_${rightSkin}_jump`, base + 4, base + 7, 8, -1);
    });

    // idle: rows 6..7 (по 2 скина в ряд, 4 кадра)
    const idleRows = [6, 7];
    idleRows.forEach((row, i) => {
      const base = row * 8;
      const leftSkin = SKINS[i * 2];
      const rightSkin = SKINS[i * 2 + 1];
      createAnim(`player_${leftSkin}_idle`, base, base + 3, 0.5, -1);
      createAnim(`player_${rightSkin}_idle`, base + 4, base + 7, 0.5, -1);
    });
  }
}
