import Phaser from 'phaser';
import { PLAYER, COLORS, PROJECTILE } from '../config/GameConstants';

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
  }

  create() {
    // игрок
    const g = this.make.graphics({});
    g.fillStyle(COLORS.PLAYER);
    g.fillRect(0, 0, PLAYER.WIDTH, PLAYER.HEIGHT);
    g.generateTexture('player', PLAYER.WIDTH, PLAYER.HEIGHT);
    g.destroy();

    // удаленный игрок
    const gr = this.make.graphics({});
    gr.fillStyle(0xf44336);
    gr.fillRect(0, 0, PLAYER.WIDTH, PLAYER.HEIGHT);
    gr.generateTexture('player_remote', PLAYER.WIDTH, PLAYER.HEIGHT);
    gr.destroy();

    // платформа
    const p = this.make.graphics({});
    p.fillStyle(COLORS.PLATFORM);
    p.fillRect(0, 0, 32, 32);
    p.generateTexture('platform', 32, 32);
    p.destroy();

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

    this.scene.start('Game');
  }
}
