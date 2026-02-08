import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { createGame, eventBus, EVENTS } from '@/game';
import { useInventoryStore } from '@/store/inventoryStore';

interface Props {
  onReady?: () => void;
  matchId?: string;
}

export function GameCanvas({ onReady, matchId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const initRef = useRef(false);
  const playerWeapons = useInventoryStore((s) => s.weapons);

  useEffect(() => {
    // Prevent double initialization (React StrictMode)
    if (initRef.current || !containerRef.current) return;
    initRef.current = true;

    // Destroy any existing game instance
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    console.log('[GameCanvas] Creating game with matchId:', matchId, 'weapons:', playerWeapons);
    gameRef.current = createGame('game-canvas', matchId, playerWeapons);

    const handleReady = () => {
      console.log('[GameCanvas] Scene ready');
      onReady?.();
    };
    eventBus.on(EVENTS.SCENE_READY, handleReady);

    return () => {
      console.log('[GameCanvas] Cleanup');
      eventBus.off(EVENTS.SCENE_READY, handleReady);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      initRef.current = false;
    };
  }, [matchId]); // Only depend on matchId, not onReady

  return (
    <Box
      id="game-canvas"
      ref={containerRef}
      sx={{
        position: 'absolute',
        inset: 0,
        '& canvas': {
          display: 'block', // Remove inline spacing
        },
      }}
    />
  );
}
