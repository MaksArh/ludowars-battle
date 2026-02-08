import { Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { audioService } from '@/services/AudioService';
import { ROUTES } from '@/config/constants';

interface BackButtonProps {
  to?: string;
  sound?: 'ui_click' | 'ui_error';
}

export function BackButton({ to = ROUTES.MENU, sound = 'ui_error' }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    audioService.playSFX(sound);
    navigate(to);
  };

  return (
    <Button startIcon={<ArrowBackIcon />} onClick={handleClick}>
      Back
    </Button>
  );
}
