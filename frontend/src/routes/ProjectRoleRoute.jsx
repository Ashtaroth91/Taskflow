import { Navigate, Outlet } from 'react-router-dom';
import { FullPageSpinner } from '../components/feedback/FullPageSpinner.jsx';
import { ROUTES } from '../constants/routes.js';
import { useProjectRole } from '../hooks/useProjectRole.js';

export function ProjectRoleRoute({ allowedRoles }) {
  const { projectId, projectRole, isLoadingProjectRole } = useProjectRole();

  if (isLoadingProjectRole) {
    return <FullPageSpinner message="Checking project permissions..." />;
  }

  if (!projectId || !projectRole || !allowedRoles.includes(projectRole)) {
    return <Navigate to={ROUTES.FORBIDDEN} replace />;
  }

  return <Outlet />;
}
