import { useState, useEffect } from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { nakama } from '@/services/nakama';
import { audioService } from '@/services/AudioService';
import { PageHeader, CenteredLoader } from '@/ui/components';

type LBType = 'kills' | 'wins' | 'score';
const LEADERBOARDS: Record<LBType, string> = { kills: 'total_kills', wins: 'total_wins', score: 'total_score' };

interface Entry { rank: number; username: string; score: number }

export function LeaderboardPage() {
  const [tab, setTab] = useState<LBType>('kills');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const session = nakama.session;
        if (!session) return;
        const result = await nakama.getClient().listLeaderboardRecords(session, LEADERBOARDS[tab], undefined, 50);
        setEntries(result.records?.map((r, i) => ({ rank: i + 1, username: r.username || 'Unknown', score: Number(r.score) })) || []);
      } catch (e) {
        console.error('Leaderboard load failed:', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const medalColor = (rank: number) => rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';

  const handleTabChange = (_: React.SyntheticEvent, value: LBType) => {
    audioService.playSFX('ui_click');
    setTab(value);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <PageHeader title="Leaderboard" />

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab value="kills" label="Kills" />
        <Tab value="wins" label="Wins" />
        <Tab value="score" label="Score" />
      </Tabs>

      {loading ? (
        <CenteredLoader />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={60}>Rank</TableCell>
                <TableCell>Player</TableCell>
                <TableCell align="right">{tab === 'kills' ? 'Kills' : tab === 'wins' ? 'Wins' : 'Score'}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.length === 0 ? (
                <TableRow><TableCell colSpan={3} align="center">No records yet</TableCell></TableRow>
              ) : (
                entries.map((e) => (
                  <TableRow key={e.rank}>
                    <TableCell>{e.rank <= 3 ? <EmojiEventsIcon sx={{ color: medalColor(e.rank) }} /> : e.rank}</TableCell>
                    <TableCell>{e.username}</TableCell>
                    <TableCell align="right">{e.score}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
