import Phaser from 'phaser';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
  reload: boolean;
  switchWeapon: boolean;
  dashLeft: boolean;
  dashRight: boolean;
  ability: boolean;
}

const DASH_WINDOW = 250; // мс между нажатиями для дабл-тапа

// управление
// A/D или стрелки = движение (дабл-тап = рывок)
// W или вверх = прыжок
// пробел = стрельба
// E = перезарядка
// Q = смена оружия
// S = способность рулетки
export class InputSystem {
  private keys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    e: Phaser.Input.Keyboard.Key;
    q: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
  };
  private jumpWas = false;
  private shootWas = false;
  private abilityWas = false;

  private leftWas = false;
  private rightWas = false;
  private lastLeftTap = 0;
  private lastRightTap = 0;

  constructor(scene: Phaser.Scene) {
    const kb = scene.input.keyboard;
    if (!kb) {
      throw new Error('Keyboard input not available');
    }

    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      space: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      e: kb.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      q: kb.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    };

    kb.addCapture([Phaser.Input.Keyboard.KeyCodes.SPACE, Phaser.Input.Keyboard.KeyCodes.S]);
  }

  get(): InputState {
    const now = Date.now();

    const jumpHeld = this.keys.w.isDown || this.keys.up.isDown;
    const jump = jumpHeld && !this.jumpWas;
    this.jumpWas = jumpHeld;

    const shootHeld = this.keys.space.isDown;
    const shoot = shootHeld && !this.shootWas;
    this.shootWas = shootHeld;

    const abilityHeld = this.keys.s.isDown;
    const ability = abilityHeld && !this.abilityWas;
    this.abilityWas = abilityHeld;

    const leftHeld = this.keys.a.isDown || this.keys.left.isDown;
    const rightHeld = this.keys.d.isDown || this.keys.right.isDown;

    let dashLeft = false;
    let dashRight = false;

    if (leftHeld && !this.leftWas) {
      if (now - this.lastLeftTap < DASH_WINDOW) {
        dashLeft = true;
      }
      this.lastLeftTap = now;
    }
    this.leftWas = leftHeld;

    if (rightHeld && !this.rightWas) {
      if (now - this.lastRightTap < DASH_WINDOW) {
        dashRight = true;
      }
      this.lastRightTap = now;
    }
    this.rightWas = rightHeld;

    return {
      left: leftHeld,
      right: rightHeld,
      jump,
      shoot,
      reload: Phaser.Input.Keyboard.JustDown(this.keys.e),
      switchWeapon: Phaser.Input.Keyboard.JustDown(this.keys.q),
      dashLeft,
      dashRight,
      ability,
    };
  }
}
