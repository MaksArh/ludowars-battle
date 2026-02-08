import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Phaser from 'phaser';
import { SKINS, getSkinByIndex } from '@/game/config/skins';

const CANVAS_SIZE = 240;

class WinnerPreviewScene extends Phaser.Scene {
  constructor() {
    super('WinnerPreview');
  }

  preload() {
    this.load.spritesheet('player_atlas', '/assets/player/player_atlas.png', {
      frameWidth: 160,
      frameHeight: 256,
    });
  }

  create() {
  const skinIndex = Number(this.registry.get('winnerSkinIndex') ?? 0);
  const username = String(this.registry.get('winnerName') ?? 'Winner');
  const skin = getSkinByIndex(skinIndex);

    this.createPlayerAnimations();
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2 + 20;

    const sprite = this.add.sprite(centerX, centerY, 'player_atlas');
    sprite.setScale(0.6);
    sprite.play(`player_${skin}_idle`);

    this.add.text(centerX, centerY - 70, username, {
      fontSize: '16px',
      color: '#fff',
      stroke: '#000',
      strokeThickness: 3,
    }).setOrigin(0.5);
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
}

interface Props {
  skinIndex: number;
  username: string;
}

export function WinnerPreviewCanvas({ skinIndex, username }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gameRef.current?.destroy(true);
    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: CANVAS_SIZE,
      height: CANVAS_SIZE,
      transparent: true,
      scale: {
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true,
      },
      scene: [WinnerPreviewScene],
    });

    gameRef.current.registry.set('winnerSkinIndex', skinIndex);
    gameRef.current.registry.set('winnerName', username);
    gameRef.current.scene.start('WinnerPreview');

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [skinIndex, username]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
        mx: 'auto',
        '& canvas': {
          display: 'block',
        },
      }}
    />
  );
}
