import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Phaser from 'phaser';
import { MenuAmbientScene } from '@/game/scenes/MenuAmbientScene';

export function MenuAmbientCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      fps: {
        target: 60,
        forceSetTimeOut: true,
      },
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: false,
      },
      scene: [MenuAmbientScene],
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      initRef.current = false;
    };
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        '& canvas': {
          display: 'block',
        },
      }}
    />
  );
}
