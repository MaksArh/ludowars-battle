import { Box, Button, Typography, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useUserStore } from '@/store';

export function LandingPage() {
  const navigate = useNavigate();
  const { loginAsGuest, isLoading, error, isAuth } = useUserStore();

  const handleGuest = async () => {
    await loginAsGuest();
  };

  // Navigate on successful auth
  if (isAuth) {
    navigate(ROUTES.MENU, { replace: true });
    return null;
  }

  return (
    <Box textAlign="center">
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Ludowars Battle
      </Typography>
      <Typography color="text.secondary" mb={4}>
        2D Multiplayer Platformer Shooter
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, maxWidth: 300, mx: 'auto' }}>{error}</Alert>}
      <Stack spacing={2} maxWidth={300} mx="auto">
        <Button variant="contained" size="large" onClick={handleGuest} disabled={isLoading}>
          Play as Guest
        </Button>
        <Button variant="outlined" onClick={() => navigate(ROUTES.LOGIN)}>
          Login
        </Button>
        <Button variant="text" onClick={() => navigate(ROUTES.REGISTER)}>
          Create Account
        </Button>
      </Stack>
    </Box>
  );
}


