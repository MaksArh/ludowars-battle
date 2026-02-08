import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar, Divider, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { nakama } from '@/services/nakama';
import { ROUTES } from '@/config/constants';
import { refreshUserCoins } from '@/services/userService';
import { BackButton, CenteredLoader } from '@/ui/components';

interface PlayerStats {
  totalKills: number;
  totalDeaths: number;
  totalWins: number;
  totalMatches: number;
  totalScore: number;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useUserStore((s) => s.user);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await refreshUserCoins();

        const session = nakama.session;
        if (session) {
          const result = await nakama.getClient().rpc(session, 'get_player_stats', {});
          if (result.payload) {
            const data = typeof result.payload === 'string' ? JSON.parse(result.payload) : result.payload;
            setStats(data as PlayerStats);
          }
        }
      } catch (e) {
        console.error('Failed to fetch profile data:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!user) {
    navigate(ROUTES.LANDING);
    return null;
  }

  const kdRatio = stats ? (stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills.toFixed(2)) : '0.00';
  const winRate = stats && stats.totalMatches > 0 ? ((stats.totalWins / stats.totalMatches) * 100).toFixed(0) : '0';
  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();

  return (
    <Box sx={{ p: 3, maxWidth: 500, mx: 'auto' }}>
      <Box sx={{ mb: 3 }}>
        <BackButton />
      </Box>

      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mr: 3, fontSize: 32 }}>{user.username[0].toUpperCase()}</Avatar>
          <Box>
            <Typography variant="h4">{user.username}</Typography>
            <Typography color="text.secondary">ID: {user.id.slice(0, 8)}...</Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {loading ? (
          <CenteredLoader />
        ) : (
          <>
            <Grid container spacing={3} textAlign="center">
              <Grid item xs={4}>
                <Typography variant="h4" color="warning.main">{formatNumber(user.coins)}</Typography>
                <Typography variant="caption">Coins</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4">{stats?.totalMatches ?? 0}</Typography>
                <Typography variant="caption">Matches</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4">{stats?.totalWins ?? 0}</Typography>
                <Typography variant="caption">Wins</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3} textAlign="center">
              <Grid item xs={4}>
                <Typography variant="h4">{stats?.totalKills ?? 0}</Typography>
                <Typography variant="caption">Kills</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4">{stats?.totalDeaths ?? 0}</Typography>
                <Typography variant="caption">Deaths</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="h4" color="primary.main">{kdRatio}</Typography>
                <Typography variant="caption">K/D Ratio</Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Grid container spacing={3} textAlign="center">
              <Grid item xs={6}>
                <Typography variant="h4" color="success.main">{winRate}%</Typography>
                <Typography variant="caption">Win Rate</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h4">{stats?.totalScore ?? 0}</Typography>
                <Typography variant="caption">Total Score</Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
    </Box>
  );
}
