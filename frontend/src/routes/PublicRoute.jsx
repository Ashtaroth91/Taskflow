import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { FullPageSpinner } from '../components/feedback/FullPageSpinner.jsx';
import { ROUTES } from '../constants/routes.js';

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const { pathname } = useLocation();
  const isTokenFlow =
    pathname.startsWith('/verify-email/') || pathname.startsWith('/reset-password/');

  if (isLoading) {
    return <FullPageSpinner message="Checking authentication..." />;
  }

  if (isAuthenticated && !isTokenFlow) {
    return <Navigate to={ROUTES.APP} replace />;
  }

  return <Outlet />;
}
