import { createContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { projectsApi } from '../api/projects.api.js';
import { QUERY_KEYS } from '../constants/queryKeys.js';
import { useAuth } from '../hooks/useAuth.js';

export const ProjectRoleContext = createContext({
  projectId: null,
  projectRole: null,
  isLoadingProjectRole: false,
});

const getProjectIdFromPath = (pathname) => {
  const match = pathname.match(/^\/app\/projects\/([^/]+)/);
  const candidate = match?.[1];

  return candidate && candidate !== 'new' ? candidate : null;
};

export function ProjectRoleProvider({ children }) {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const projectId = getProjectIdFromPath(pathname);
  const projectsQuery = useQuery({
    queryKey: QUERY_KEYS.PROJECTS,
    queryFn: projectsApi.getProjects,
    enabled: isAuthenticated && Boolean(projectId),
  });

  const projectRole = useMemo(() => {
    if (!projectId || !projectsQuery.data) return null;

    return (
      projectsQuery.data.find((membership) => membership.project?._id === projectId)
        ?.role || null
    );
  }, [projectId, projectsQuery.data]);

  const value = useMemo(
    () => ({
      projectId,
      projectRole,
      isLoadingProjectRole: Boolean(projectId) && projectsQuery.isLoading,
    }),
    [projectId, projectRole, projectsQuery.isLoading]
  );

  return <ProjectRoleContext.Provider value={value}>{children}</ProjectRoleContext.Provider>;
}
