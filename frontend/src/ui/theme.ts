import { createTheme } from '@mui/material/styles';
import type { ItemRarity } from '@/types/shop';

export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
};

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#FF6B35' },
    secondary: { main: '#004E89' },
    background: { default: '#1A1A2E', paper: '#25253A' },
    warning: { main: '#FFD700' },
  },
  typography: {
    fontFamily: 'system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { padding: '12px 24px' },
      },
    },
  },
});
