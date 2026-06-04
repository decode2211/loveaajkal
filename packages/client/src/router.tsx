import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './store/authStore';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './features/auth/LoginPage';
import { HomePage } from './features/home/HomePage';
import { QuizPage } from './features/quiz/QuizPage';
import { TimelinePage } from './features/timeline/TimelinePage';
import { DistancePage } from './features/distance/DistancePage';
import { ThisOrThatPage } from './features/thisorthat/ThisOrThatPage';
import { MissMeterPage } from './features/missmeter/MissMeterPage';
import { WatchTogetherPage } from './features/watchtogether/WatchTogetherPage';
import { TripPage } from './features/trip/TripPage';

function ProtectedLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <Outlet />
      </AnimatePresence>
    </AppShell>
  );
}

function PublicLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/quiz', element: <QuizPage /> },
      { path: '/timeline', element: <TimelinePage /> },
      { path: '/distance', element: <DistancePage /> },
      { path: '/this-or-that', element: <ThisOrThatPage /> },
      { path: '/miss-meter', element: <MissMeterPage /> },
      { path: '/watch', element: <WatchTogetherPage /> },
      { path: '/trip', element: <TripPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
