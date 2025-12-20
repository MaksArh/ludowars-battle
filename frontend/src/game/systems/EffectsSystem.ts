import Phaser from 'phaser';
import { COMBAT, GAME } from '../config/GameConstants';

const POOL_SIZE = {
  DAMAGE_TEXT: 20,
  CIRCLES: 30,
};

export class EffectsSystem {
  private scene: Phaser.Scene;

  private textPool: Phaser.GameObjects.Text[] = [];
  private circlePool: Phaser.GameObjects.Arc[] = [];
  private textPoolIndex = 0;
  private circlePoolIndex = 0;

  private vignetteOverlay: Phaser.GameObjects.Graphics | null = null;
  private hitMarkerSprite: Phaser.GameObjects.Container | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.initPools();
  }

  private initPools() {
    for (let i = 0; i < POOL_SIZE.DAMAGE_TEXT; i++) {
      const text = this.scene.add.text(0, 0, '', {
        fontSize: '18px',
        color: '#FFFFFF',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5).setVisible(false);
      this.textPool.push(text);
    }

    for (let i = 0; i < POOL_SIZE.CIRCLES; i++) {
      const circle = this.scene.add.circle(0, 0, 10, 0xffffff, 1).setVisible(false);
      this.circlePool.push(circle);
    }

    this.vignetteOverlay = this.scene.add.graphics();
    this.vignetteOverlay.setDepth(100).setVisible(false);

    this.hitMarkerSprite = this.scene.add.container(0, 0);
    const s = 10;
    const line1 = this.scene.add.line(0, 0, -s, -s, s, s, 0xffffff).setLineWidth(2);
    const line2 = this.scene.add.line(0, 0, s, -s, -s, s, 0xffffff).setLineWidth(2);
    this.hitMarkerSprite.add([line1, line2]);
    this.hitMarkerSprite.setVisible(false).setDepth(50);
  }

  private getText(): Phaser.GameObjects.Text {
    const text = this.textPool[this.textPoolIndex];
    this.textPoolIndex = (this.textPoolIndex + 1) % POOL_SIZE.DAMAGE_TEXT;
    return text;
  }

  private getCircle(): Phaser.GameObjects.Arc {
    const circle = this.circlePool[this.circlePoolIndex];
    this.circlePoolIndex = (this.circlePoolIndex + 1) % POOL_SIZE.CIRCLES;
    return circle;
  }

  damageNumber(x: number, y: number, dmg: number, crit = false) {
    const text = this.getText();
    if (!text?.active === false && !text) return;

    try {
      text.setPosition(x, y);
      text.setText(`-${dmg}`);
      text.setFontSize(crit ? 24 : 18);
      text.setColor(crit ? '#FF0000' : '#FFFFFF');
      text.setAlpha(1).setVisible(true);

      this.scene.tweens.add({
        targets: text,
        y: y - 50,
        alpha: 0,
        duration: COMBAT.DMG_NUMBER_DUR,
        ease: 'Power2',
        onComplete: () => text.setVisible(false),
      });
    } catch {}
  }

  hitMarker(x: number, y: number) {
    if (!this.hitMarkerSprite?.active) return;

    try {
      this.hitMarkerSprite.setPosition(x, y);
      this.hitMarkerSprite.setAlpha(1).setScale(1).setVisible(true);

      this.scene.tweens.add({
        targets: this.hitMarkerSprite,
        alpha: 0,
        scale: 1.5,
        duration: COMBAT.HIT_MARKER_DUR,
        onComplete: () => this.hitMarkerSprite?.setVisible(false),
      });
    } catch {}
  }

  shake() {
    this.scene.cameras.main.shake(COMBAT.SHAKE_DUR, COMBAT.SHAKE_INTENSITY / 1000);
  }

  redVignette(intensity = 0.3) {
    if (!this.vignetteOverlay) return;

    this.vignetteOverlay.clear();
    this.vignetteOverlay.fillStyle(0xff0000, intensity);
    this.vignetteOverlay.fillRect(0, 0, GAME.WIDTH, GAME.HEIGHT);
    this.vignetteOverlay.setAlpha(1).setVisible(true);

    this.scene.tweens.add({
      targets: this.vignetteOverlay,
      alpha: 0,
      duration: 300,
      onComplete: () => this.vignetteOverlay?.setVisible(false),
    });
  }

  muzzleFlash(x: number, y: number, right: boolean) {
    const flash = this.getCircle();
    flash.setPosition(x + (right ? 30 : -30), y);
    flash.setRadius(8).setFillStyle(0xffff00).setAlpha(1).setScale(1).setVisible(true);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 2,
      duration: 50,
      onComplete: () => flash.setVisible(false),
    });
  }

  dashTrail(x: number, y: number, right: boolean) {
    for (let i = 0; i < 5; i++) {
      const offset = (right ? -1 : 1) * i * 15;
      const trail = this.getCircle();
      trail.setPosition(x + offset, y);
      trail.setRadius(12 - i * 2).setFillStyle(0x00ffff, 0.5 - i * 0.1);
      trail.setAlpha(1).setScale(1).setVisible(true);

      this.scene.tweens.add({
        targets: trail,
        alpha: 0,
        duration: 200,
        delay: i * 20,
        onComplete: () => trail.setVisible(false),
      });
    }
  }

  doubleJumpEffect(x: number, y: number) {
    const ring = this.getCircle();
    ring.setPosition(x, y + 20);
    ring.setRadius(10).setFillStyle(0xffffff, 0);
    ring.setStrokeStyle(2, 0xffffff);
    ring.setAlpha(1).setScale(1).setVisible(true);

    this.scene.tweens.add({
      targets: ring,
      scale: 3,
      alpha: 0,
      duration: 300,
      onComplete: () => ring.setVisible(false),
    });
  }

  jumpDust(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      const offsetX = (Math.random() - 0.5) * 30;
      const dust = this.getCircle();
      dust.setPosition(x + offsetX, y + 20);
      dust.setRadius(4).setFillStyle(0xcccccc, 0.6);
      dust.setAlpha(1).setScale(1).setVisible(true);

      this.scene.tweens.add({
        targets: dust,
        y: y + 35,
        alpha: 0,
        scale: 0.5,
        duration: 200,
        delay: i * 30,
        onComplete: () => dust.setVisible(false),
      });
    }
  }

  private readonly ROULETTE_SYMBOLS = ['⚔️', '❤️', '🛡️', '💀'];

  showRouletteResult(x: number, y: number, symbols: [number, number, number], effect: string) {
    const slotY = y - 60;
    const slotWidth = 30;
    const startX = x - slotWidth;

    const bg = this.scene.add.rectangle(x, slotY, 100, 40, 0x222222, 0.9)
      .setStrokeStyle(2, 0xffd700)
      .setDepth(100);

    const symbolTexts: Phaser.GameObjects.Text[] = [];
    for (let i = 0; i < 3; i++) {
      const symbolText = this.scene.add.text(startX + i * slotWidth, slotY, '', {
        fontSize: '24px',
      }).setOrigin(0.5).setDepth(101);
      symbolTexts.push(symbolText);

      let spinCount = 0;
      const maxSpins = 10 + i * 5;
      const spinTimer = this.scene.time.addEvent({
        delay: 50,
        repeat: maxSpins,
        callback: () => {
          spinCount++;
          if (spinCount < maxSpins) {
            symbolText.setText(this.ROULETTE_SYMBOLS[Math.floor(Math.random() * 4)]);
          } else {
            symbolText.setText(this.ROULETTE_SYMBOLS[symbols[i]]);
            this.scene.tweens.add({
              targets: symbolText,
              scale: 1.3,
              duration: 100,
              yoyo: true,
            });
          }
        },
      });
    }

    this.scene.time.delayedCall(1500, () => {
      const effectColor = this.getEffectColor(effect);
      const effectText = this.scene.add.text(x, slotY + 35, this.formatEffect(effect), {
        fontSize: '14px',
        color: effectColor,
        stroke: '#000',
        strokeThickness: 2,
      }).setOrigin(0.5).setDepth(101);

      this.scene.time.delayedCall(2000, () => {
        this.scene.tweens.add({
          targets: [bg, effectText, ...symbolTexts],
          alpha: 0,
          duration: 300,
          onComplete: () => {
            bg.destroy();
            effectText.destroy();
            symbolTexts.forEach(t => t.destroy());
          },
        });
      });
    });
  }

  private getEffectColor(effect: string): string {
    if (effect.startsWith('damage')) return '#ff4444';
    if (effect.startsWith('heal')) return '#44ff44';
    if (effect.startsWith('shield')) return '#4488ff';
    if (effect === 'instakill') return '#ff0000';
    return '#888888';
  }

  private formatEffect(effect: string): string {
    switch (effect) {
      case 'damage_25': return '+25% DMG';
      case 'damage_50': return '+50% DMG';
      case 'damage_75': return '+75% DMG';
      case 'damage_100': return '+100% DMG';
      case 'heal_25': return '+25 HP';
      case 'heal_50': return '+50 HP';
      case 'heal_100': return '+100 HP';
      case 'shield_3': return 'SHIELD 3s';
      case 'shield_5': return 'SHIELD 5s';
      case 'shield_7': return 'SHIELD 7s';
      case 'instakill': return '💀 INSTAKILL';
      case 'nothing': return 'Nothing...';
      default: return effect;
    }
  }
}
