import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress, Paper, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import { useMatchStore } from '@/store/matchStore';
import { matchmaking } from '@/services/matchmakingService';
import { ROUTES } from '@/config/constants';

export function MatchmakingPage() {
  const navigate = useNavigate();
  const { status, players } = useMatchStore();
  const [time, setTime] = useState(0);

  useEffect(() => {
    matchmaking.start().catch(() => navigate(ROUTES.MENU));
    return () => { if (status === 'searching') matchmaking.cancel(); };
  }, []);

  useEffect(() => {
    if (status !== 'searching') return;
    const id = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => {
    if (status === 'loading') {
      // Navigate immediately (small delay for UI to update)
      // Events are buffered in NetworkManager until GameScene attaches
      setTimeout(() => navigate(ROUTES.GAME), 100);
    }
  }, [status, navigate]);

  const handleCancel = () => {
    matchmaking.cancel();
    navigate(ROUTES.MENU);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      {status === 'searching' && (
        <>
          <CircularProgress size={80} sx={{ mb: 4 }} />
          <Typography variant="h4" gutterBottom>Finding Match...</Typography>
          <Typography variant="h6" color="text.secondary">{fmt(time)}</Typography>
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={handleCancel} sx={{ mt: 4 }}>Cancel</Button>
        </>
      )}

      {status === 'found' && (
        <>
          <Typography variant="h4" color="success.main" gutterBottom>Match Found!</Typography>
          <Paper sx={{ p: 3, mt: 2, minWidth: 280 }}>
            <Typography variant="h6" gutterBottom>Players ({players.length})</Typography>
            <List dense>
              {players.map((p) => (
                <ListItem key={p.id}>
                  <ListItemIcon><PersonIcon /></ListItemIcon>
                  <ListItemText primary={p.username} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      {status === 'loading' && (
        <>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5">Loading Game...</Typography>
        </>
      )}
    </Box>
  );
}
