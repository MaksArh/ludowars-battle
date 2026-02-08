import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES } from '@/config/constants';
import { useUserStore } from '@/store';
import { MainLayout } from '@/ui/layouts/MainLayout';
import {
  LandingPage,
  LoginPage,
  RegisterPage,
  MainMenuPage,
  LoadoutPage,
  MatchmakingPage,
  GamePage,
  ResultsPage,
  ShopPage,
  ProfilePage,
  LeaderboardPage,
  SettingsPage,
} from '@/ui/pages';

function Protected({ children }: { children: React.ReactNode }) {
  const isAuth = useUserStore((s) => s.isAuth);
  return isAuth ? <>{children}</> : <Navigate to={ROUTES.LANDING} replace />;
}

function Public({ children }: { children: React.ReactNode }) {
  const isAuth = useUserStore((s) => s.isAuth);
  return isAuth ? <Navigate to={ROUTES.MENU} replace /> : <>{children}</>;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ROUTES.LANDING} element={<Public><LandingPage /></Public>} />
          <Route path={ROUTES.LOGIN} element={<Public><LoginPage /></Public>} />
          <Route path={ROUTES.REGISTER} element={<Public><RegisterPage /></Public>} />
          <Route path={ROUTES.MENU} element={<Protected><MainMenuPage /></Protected>} />
          <Route path={ROUTES.LOADOUT} element={<Protected><LoadoutPage /></Protected>} />
          <Route path={ROUTES.MATCHMAKING} element={<Protected><MatchmakingPage /></Protected>} />
          <Route path={ROUTES.RESULTS} element={<Protected><ResultsPage /></Protected>} />
          <Route path={ROUTES.SHOP} element={<Protected><ShopPage /></Protected>} />
          <Route path={ROUTES.PROFILE} element={<Protected><ProfilePage /></Protected>} />
          <Route path={ROUTES.LEADERBOARD} element={<Protected><LeaderboardPage /></Protected>} />
          <Route path={ROUTES.SETTINGS} element={<Protected><SettingsPage /></Protected>} />
        </Route>
        {/* Game page outside MainLayout for fullscreen */}
        <Route path={ROUTES.GAME} element={<Protected><GamePage /></Protected>} />
        <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
