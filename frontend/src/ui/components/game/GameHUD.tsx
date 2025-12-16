import { Box, Typography, LinearProgress, Dialog, DialogTitle, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { matchmaking } from '@/services/matchmakingService';
import { ROUTES } from '@/config/constants';

// Timer - top center
function Timer() {
  const timeLeft = useGameStore((s) => s.timeLeft);
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const low = timeLeft < 60;

  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 12, 
      left: '50%', 
      transform: 'translateX(-50%)',
      bgcolor: 'rgba(0,0,0,0.7)',
      px: 3,
      py: 1,
      borderRadius: 2,
    }}>
      <Typography 
        variant="h5" 
        fontWeight="bold" 
        color={low ? 'error.main' : 'text.primary'}
        fontFamily="monospace"
      >
        {mins}:{secs.toString().padStart(2, '0')}
      </Typography>
    </Box>
  );
}

// Score - top left
function ScoreDisplay() {
  const { kills, deaths } = useGameStore();
  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 12, 
      left: 12,
      bgcolor: 'rgba(0,0,0,0.7)',
      px: 2,
      py: 1,
      borderRadius: 1,
    }}>
      <Typography variant="body2">
        <Box component="span" color="success.main" fontWeight="bold">{kills}</Box>
        {' / '}
        <Box component="span" color="error.main" fontWeight="bold">{deaths}</Box>
      </Typography>
    </Box>
  );
}

// Scoreboard - top right
function Scoreboard() {
  const players = useGameStore((s) => s.players);
  // Sort by kills desc
  const sorted = [...players].sort((a, b) => b.kills - a.kills);

  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 12, 
      right: 12, 
      bgcolor: 'rgba(0,0,0,0.8)', 
      borderRadius: 1,
      p: 1,
      minWidth: 140,
    }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
        Scoreboard
      </Typography>
      {sorted.map((p) => (
        <Box key={p.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.25 }}>
          <Typography variant="caption" noWrap sx={{ maxWidth: 80 }}>
            {p.username.slice(0, 10)}
          </Typography>
          <Typography variant="caption" fontFamily="monospace">
            <Box component="span" color="success.main">{p.kills}</Box>
            {' / '}
            <Box component="span" color="error.main">{p.deaths}</Box>
          </Typography>
        </Box>
      ))}
      {players.length === 0 && (
        <Typography variant="caption" color="text.secondary">Waiting...</Typography>
      )}
    </Box>
  );
}

// HP Bar - bottom center
function HPBar() {
  const { hp, maxHp } = useGameStore();
  const pct = (hp / maxHp) * 100;
  const color = pct > 50 ? 'success' : pct > 25 ? 'warning' : 'error';

  return (
    <Box sx={{ width: 250 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" fontWeight="bold">HP</Typography>
        <Typography variant="caption">{hp}/{maxHp}</Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={pct} 
        color={color} 
        sx={{ height: 12, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.5)' }} 
      />
    </Box>
  );
}

// Weapon slot
function WeaponSlot({ active }: { active: boolean }) {
  const { weapon, ammo, maxAmmo, reloading } = useGameStore();
  
  return (
    <Box sx={{ 
      width: 56, 
      height: 56, 
      bgcolor: active ? 'rgba(76,175,80,0.3)' : 'rgba(0,0,0,0.5)',
      border: active ? '2px solid #4caf50' : '2px solid transparent',
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.15s',
    }}>
      <Typography variant="caption" fontWeight="bold" sx={{ textTransform: 'uppercase', fontSize: '0.6rem' }}>
        {weapon}
      </Typography>
      <Typography variant="caption" color={reloading ? 'warning.main' : 'text.secondary'} fontSize="0.7rem">
        {reloading ? 'R' : `${ammo}/${maxAmmo}`}
      </Typography>
    </Box>
  );
}

// Bottom bar - HP + Weapons
function BottomBar() {
  return (
    <Box sx={{ 
      position: 'absolute', 
      bottom: 16, 
      left: '50%', 
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      bgcolor: 'rgba(0,0,0,0.7)',
      px: 2,
      py: 1.5,
      borderRadius: 2,
    }}>
      <HPBar />
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <WeaponSlot active={true} />
        {/* Future: more weapon slots */}
      </Box>
    </Box>
  );
}

// Pause Menu
export function PauseMenu({ open, onResume }: { open: boolean; onResume: () => void }) {
  const navigate = useNavigate();

  const handleQuit = async () => {
    await matchmaking.leave();
    navigate(ROUTES.MENU);
  };

  return (
    <Dialog open={open} onClose={onResume}>
      <DialogTitle>Paused</DialogTitle>
      <Stack spacing={2} sx={{ p: 3, pt: 0, minWidth: 200 }}>
        <Button variant="contained" onClick={onResume}>Resume</Button>
        <Button variant="outlined" color="error" onClick={handleQuit}>Quit</Button>
      </Stack>
    </Dialog>
  );
}

// Main HUD
export function GameHUD() {
  return (
    <Box sx={{ 
      position: 'absolute', 
      inset: 0, 
      pointerEvents: 'none', 
      zIndex: 10,
      overflow: 'hidden',
    }}>
      <Timer />
      <ScoreDisplay />
      <Scoreboard />
      <BottomBar />
    </Box>
  );
}
