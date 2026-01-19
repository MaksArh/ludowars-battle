import { Box, Button, Typography, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useUserStore } from '@/store';

export function LandingPage() {
  const navigate = useNavigate();
  const { loginAsGuest, isLoading, error, isAuth } = useUserStore();
  const logoUrl = `${import.meta.env.BASE_URL}assets/logo.png`;

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
      <Box
        component="img"
        src={logoUrl}
        alt="Ludowars Battle"
        sx={{ width: '100%', maxWidth: 360, height: 'auto', mx: 'auto', mb: 2, display: 'block' }}
      />
      <Typography variant="h3" fontWeight={700} gutterBottom>
        Ludowars Battle
      </Typography>
      <Typography color="text.secondary" mb={4}>
        powered by poor trio from ITMO University
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


