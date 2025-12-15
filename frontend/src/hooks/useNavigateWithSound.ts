import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { audioService } from '@/services/AudioService';

type SoundType = 'ui_click' | 'ui_error';

export function useNavigateWithSound() {
  const navigate = useNavigate();

  return useCallback(
    (to: string, sound: SoundType = 'ui_click') => {
      audioService.playSFX(sound);
      navigate(to);
    },
    [navigate]
  );
}
