import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { FullPageSpinner } from '../components/feedback/FullPageSpinner.jsx';
import { ROUTES } from '../constants/routes.js';
import { ROLE_HIERARCHY } from '../constants/roles.js';

export function ProtectedRoute({ requiredRole }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <FullPageSpinner message="Verifying session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Role check if requiredRole parameter is supplied
  if (requiredRole && user) {
    const userRoleWeight = ROLE_HIERARCHY[user.role] || 1;
    const requiredRoleWeight = ROLE_HIERARCHY[requiredRole] || 1;

    if (userRoleWeight < requiredRoleWeight) {
      return <Navigate to={ROUTES.FORBIDDEN} replace />;
    }
  }

  return <Outlet />;
}
