import { useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { audioService } from '@/services/AudioService';
import { ROUTES } from '@/config/constants';

// тут музыка не играет
const NO_MUSIC_ROUTES: string[] = [ROUTES.GAME, ROUTES.MATCHMAKING];

export function MainLayout() {
  const location = useLocation();

  useEffect(() => {
    const shouldPlayMusic = !NO_MUSIC_ROUTES.includes(location.pathname);

    if (shouldPlayMusic) {
      audioService.playMusic('menu_music');
    } else {
      audioService.stopMusic();
    }
  }, [location.pathname]);

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(180deg, #1A1A2E 0%, #16162A 100%)' }}>
      <Container maxWidth="sm" sx={{ py: 4, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Outlet />
      </Container>
    </Box>
  );
}
