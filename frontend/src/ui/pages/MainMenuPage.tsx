import { useEffect, useState } from 'react';
import { Box, Button, Typography, Stack, Paper, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableRow, TableCell } from '@mui/material';
import { ROUTES } from '@/config/constants';
import { useUserStore } from '@/store';
import { useInventoryStore } from '@/store/inventoryStore';
import { useNavigateWithSound } from '@/hooks';
import { CoinsChip } from '@/ui/components';
import { audioService } from '@/services/AudioService';

export function MainMenuPage() {
  const navigateTo = useNavigateWithSound();
  const { user, logout } = useUserStore();
  const loadInventory = useInventoryStore((s) => s.loadInventory);
  const [faqOpen, setFaqOpen] = useState(false);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleLogout = () => {
    audioService.playSFX('ui_click');
    logout();
    navigateTo(ROUTES.LANDING);
  };

  const handleFaqOpen = () => {
    audioService.playSFX('ui_click');
    setFaqOpen(true);
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>{user?.username}</Typography>
          <Typography variant="body2" color="text.secondary">ID: {user?.id.slice(0, 8)}</Typography>
        </Box>
        <CoinsChip coins={user?.coins ?? 0} showIcon={false} />
      </Paper>

      <Stack spacing={2}>
        <Button variant="contained" size="large" onClick={() => navigateTo(ROUTES.LOADOUT)}>
          Play Match
        </Button>
        <Button variant="outlined" onClick={() => navigateTo(ROUTES.SHOP)}>Shop</Button>
        <Button variant="outlined" onClick={() => navigateTo(ROUTES.LEADERBOARD)}>Leaderboard</Button>
        <Button variant="outlined" onClick={() => navigateTo(ROUTES.PROFILE)}>Profile</Button>
        <Button variant="outlined" onClick={() => navigateTo(ROUTES.SETTINGS)}>Settings</Button>
        <Button variant="outlined" color="info" onClick={handleFaqOpen}>How to Play</Button>
        <Button color="error" onClick={handleLogout}>Logout</Button>
      </Stack>

      <Dialog open={faqOpen} onClose={() => setFaqOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>How to Play</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>Controls</Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell><strong>A / D</strong> or <strong>← / →</strong></TableCell>
                <TableCell>Move left / right</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>W</strong> or <strong>↑</strong></TableCell>
                <TableCell>Jump (double tap for double jump)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Space</strong></TableCell>
                <TableCell>Shoot</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>E</strong></TableCell>
                <TableCell>Reload weapon</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Q</strong></TableCell>
                <TableCell>Switch weapon</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>S</strong></TableCell>
                <TableCell>Roulette ability (costs 5 coins)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><strong>Double-tap A/D</strong></TableCell>
                <TableCell>Dash</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Roulette Ability</Typography>
          <Typography variant="body2" paragraph>
            Press <strong>S</strong> to spin the slot machine (costs 5 coins). Get matching symbols for powerful effects:
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>⚔️⚔️⚔️</TableCell>
                <TableCell>+100% damage for 10 sec</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>❤️❤️❤️</TableCell>
                <TableCell>+100 HP instant heal</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>🛡️🛡️🛡️</TableCell>
                <TableCell>Invulnerability for 7 sec</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>💀💀💀</TableCell>
                <TableCell>Next hit = instant kill!</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Game Rules</Typography>
          <Typography variant="body2">
            • First to 10 kills wins<br />
            • Match duration: 5 minutes<br />
            • Earn coins for kills and wins<br />
            • Buy weapons and perks in the Shop
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFaqOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
