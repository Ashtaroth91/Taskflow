import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { FullPageSpinner } from '../components/feedback/FullPageSpinner.jsx';
import { ROUTES } from '../constants/routes.js';

export function PublicRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageSpinner message="Checking authentication..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.APP} replace />;
  }

  return <Outlet />;
}
