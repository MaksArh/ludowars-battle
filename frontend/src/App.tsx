import { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/ui/theme';
import { AppRouter } from '@/router/AppRouter';
import { useUserStore } from '@/store';
import { LoadingScreen } from '@/ui/components';

export default function App() {
  const { isLoading, restore } = useUserStore();

  useEffect(() => {
    restore();
  }, [restore]);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppRouter />
    </ThemeProvider>
  );
}
