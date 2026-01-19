import { useEffect, useMemo, useRef } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useMatchStore } from '@/store/matchStore';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import { matchmaking } from '@/services/matchmakingService';
import { refreshUserCoins } from '@/services/userService';
import { ROUTES } from '@/config/constants';
import { audioService } from '@/services/AudioService';
import { WinnerPreviewCanvas } from '@/ui/components/WinnerPreviewCanvas';

export function ResultsPage() {
  const navigate = useNavigate();
  const { winner, localId, matchResult } = useMatchStore();
  const { kills, deaths, score, players } = useGameStore();
  const user = useUserStore((s) => s.user);

  useEffect(() => {
    refreshUserCoins();
  }, []);

  const sortedPlayers = useMemo(() => {
    if (matchResult?.stats) {
      const list = Object.entries(matchResult.stats).map(([id, s]) => ({
        id,
        username: s.username || id.slice(0, 8),
        kills: s.kills,
        deaths: s.deaths,
        score: s.score,
      }));
      return list.sort((a, b) => b.score - a.score);
    }
    if (players.length > 0) {
      return [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    }
    return [];
  }, [players, matchResult]);

  const isWinner = useMemo(() => {
    if (sortedPlayers.length === 0) return false;
    if (sortedPlayers.length === 1) return sortedPlayers[0].id === localId;
    return sortedPlayers[0].id === localId || winner === localId;
  }, [sortedPlayers, localId, winner]);

  const winnerId = winner || sortedPlayers[0]?.id || null;
  const winnerPlayer = winnerId ? players.find((p) => p.id === winnerId) : null;
  const winnerName =
    (winnerId && matchResult?.stats?.[winnerId]?.username) ||
    winnerPlayer?.username ||
    'Winner';
  const winnerSkinIndex = winnerPlayer?.spawnIndex ?? 0;

  const soundPlayed = useRef(false);
  useEffect(() => {
    if (soundPlayed.current) return;
    if (sortedPlayers.length === 0) return;
    soundPlayed.current = true;
    audioService.playSFX(isWinner ? 'victory' : 'defeat');
  }, [isWinner, sortedPlayers.length]);

  const reward = matchResult?.stats?.[localId ?? '']?.reward ?? 0;

  const handlePlayAgain = () => {
    audioService.playSFX('ui_click');
    navigate(ROUTES.LOADOUT);
  };

  const handleMainMenu = async () => {
    audioService.playSFX('ui_error');
    await matchmaking.leave();
    navigate(ROUTES.MENU);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', p: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {isWinner ? (
          <>
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'warning.main' }} />
            <Typography variant="h2" color="warning.main">VICTORY!</Typography>
          </>
        ) : (
          <Typography variant="h2" color="text.secondary">DEFEAT</Typography>
        )}
      </Box>

      {winnerId && (
        <Box sx={{ mb: 3 }}>
          <WinnerPreviewCanvas skinIndex={winnerSkinIndex} username={winnerName} />
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>{user?.username}</Typography>
        <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
          <Box><Typography variant="h4">{kills}</Typography><Typography variant="caption">Kills</Typography></Box>
          <Box><Typography variant="h4">{deaths}</Typography><Typography variant="caption">Deaths</Typography></Box>
          <Box><Typography variant="h4" color="primary.main">{score}</Typography><Typography variant="caption">Score</Typography></Box>
        </Box>
        {reward > 0 && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <MonetizationOnIcon color="warning" />
            <Typography variant="h5" color="warning.main">+{reward}</Typography>
            <Typography variant="body2" color="text.secondary">coins earned</Typography>
          </Box>
        )}
      </Paper>

      <TableContainer component={Paper} sx={{ maxWidth: 600, mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Player</TableCell>
              <TableCell align="right">K</TableCell>
              <TableCell align="right">D</TableCell>
              <TableCell align="right">Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPlayers.map((p, i) => (
              <TableRow key={p.id} sx={{ bgcolor: p.id === localId ? 'action.selected' : undefined }}>
                <TableCell>
                  {i === 0 && <EmojiEventsIcon color="warning" fontSize="small" />}
                  {i + 1}
                </TableCell>
                <TableCell>
                  {p.username}
                  {p.id === localId && <Chip label="You" size="small" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell align="right">{p.kills}</TableCell>
                <TableCell align="right">{p.deaths}</TableCell>
                <TableCell align="right">{p.score ?? 0}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" startIcon={<ReplayIcon />} onClick={handlePlayAgain}>Play Again</Button>
        <Button variant="outlined" startIcon={<HomeIcon />} onClick={handleMainMenu}>Main Menu</Button>
      </Box>
    </Box>
  );
}
