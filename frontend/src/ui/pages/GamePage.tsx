import { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { GameCanvas } from '@/ui/components/GameCanvas';
import { GameHUD, PauseMenu } from '@/ui/components/game';
import { useMatchStore } from '@/store/matchStore';
import { useGameStore } from '@/store/gameStore';
import { eventBus, EVENTS } from '@/game/utils/EventBus';
import { ROUTES } from '@/config/constants';

export function GamePage() {
  const navigate = useNavigate();
  const matchId = useMatchStore((s) => s.matchId);
  const { reset, setHp, setTime, setAmmo, setWeapon, addKill, addDeath, addPlayer, removePlayer, setPlayers } = useGameStore();
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  const matchConfigRef = useRef<{ startTimeUtc: number; duration: number; freezeTime: number } | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    reset();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPaused((p) => !p);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [reset]);

  const updateLocalTimer = () => {
    if (!matchConfigRef.current) return;
    const { startTimeUtc, duration, freezeTime } = matchConfigRef.current;
    const now = Date.now();
    const elapsed = now - startTimeUtc;
    const gameTime = elapsed - freezeTime;
    const remaining = duration - gameTime;
    setTime(Math.max(0, Math.floor(remaining / 1000)));
  };

  useEffect(() => {
    const onHp = (e: { hp: number }) => setHp(e.hp);
    const onAmmo = (e: { ammo: number; max: number; reloading?: boolean }) => setAmmo(e.ammo, e.max, e.reloading);
    const onWeapon = (e: { weaponId: string }) => setWeapon(e.weaponId);
    const onPlayerJoined = (e: { playerId: string; username: string }) => {
      addPlayer(e.playerId, e.username);
    };
    const onPlayerLeft = (e: { playerId: string }) => {
      removePlayer(e.playerId);
    };
    const onGameState = (e: { players: { id: string; username: string }[] }) => {
      e.players.forEach((p) => addPlayer(p.id, p.username));
    };
    const onMatchStart = (e: { startTimeUtc: number; duration: number; freezeTime: number }) => {
      matchConfigRef.current = e;
      setTime(Math.floor(e.duration / 1000));
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = window.setInterval(updateLocalTimer, 1000);
    };
    const onTimeSync = (e: { remainingMs: number }) => {
      setTime(Math.floor(e.remainingMs / 1000));
    };
    const onScoreboard = (e: { killerId: string; victimId: string; scoreboard: { id: string; username: string; kills: number; deaths: number; score: number }[] }) => {
      const localId = useMatchStore.getState().localId;
      if (e.killerId === localId) addKill();
      if (e.victimId === localId) addDeath();
      setPlayers(e.scoreboard);
    };
    const onMatchEnd = (e: { reason: string; winnerId: string; stats: Record<string, { username: string; kills: number; deaths: number; score: number; reward: number }> }) => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      const { setWinner, setMatchResult } = useMatchStore.getState();
      setWinner(e.winnerId);
      setMatchResult({ stats: e.stats, reason: e.reason });
      setTimeout(() => navigate(ROUTES.RESULTS), 2000);
    };

    eventBus.on(EVENTS.HP_CHANGED, onHp);
    eventBus.on(EVENTS.AMMO_CHANGED, onAmmo);
    eventBus.on(EVENTS.WEAPON_CHANGED, onWeapon);
    eventBus.on(EVENTS.PLAYER_JOINED, onPlayerJoined);
    eventBus.on(EVENTS.PLAYER_LEFT, onPlayerLeft);
    eventBus.on(EVENTS.GAME_STATE, onGameState);
    eventBus.on(EVENTS.MATCH_START, onMatchStart);
    eventBus.on(EVENTS.TIME_SYNC, onTimeSync);
    eventBus.on(EVENTS.SCOREBOARD, onScoreboard);
    eventBus.on(EVENTS.MATCH_END, onMatchEnd);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      eventBus.off(EVENTS.HP_CHANGED, onHp);
      eventBus.off(EVENTS.AMMO_CHANGED, onAmmo);
      eventBus.off(EVENTS.WEAPON_CHANGED, onWeapon);
      eventBus.off(EVENTS.PLAYER_JOINED, onPlayerJoined);
      eventBus.off(EVENTS.PLAYER_LEFT, onPlayerLeft);
      eventBus.off(EVENTS.GAME_STATE, onGameState);
      eventBus.off(EVENTS.MATCH_START, onMatchStart);
      eventBus.off(EVENTS.TIME_SYNC, onTimeSync);
      eventBus.off(EVENTS.SCOREBOARD, onScoreboard);
      eventBus.off(EVENTS.MATCH_END, onMatchEnd);
    };
  }, [navigate, setHp, setTime, setAmmo, setWeapon, addKill, addDeath, addPlayer, removePlayer, setPlayers]);

  return (
    <Box sx={{ position: 'fixed', inset: 0, overflow: 'hidden', bgcolor: '#0a0a15' }}>
      <GameCanvas onReady={() => setReady(true)} matchId={matchId || undefined} />
      {ready && <GameHUD />}
      <PauseMenu open={paused} onResume={() => setPaused(false)} />
      {!ready && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#1a1a2e', zIndex: 50 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
}
