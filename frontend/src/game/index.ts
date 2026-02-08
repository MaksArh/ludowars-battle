import Phaser from 'phaser';
import { GAME, PLAYER } from './config/GameConstants';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';

export function createGame(parent: string, matchId?: string, playerWeapons?: string[]) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME.WIDTH,
    height: GAME.HEIGHT,
    backgroundColor: GAME.BG_COLOR,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    fps: {
      target: 60,
      forceSetTimeOut: true, // More consistent timing across browsers
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: PLAYER.GRAVITY },
        debug: false, // Debug rendering is expensive, disable for performance
      },
    },
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true,
    },
    scene: [BootScene, GameScene],
  });

  // Pass matchId and weapons to GameScene via registry
  game.registry.set('matchId', matchId);
  game.registry.set('playerWeapons', playerWeapons || []);

  return game;
}

export { eventBus, EVENTS } from './utils/EventBus';
