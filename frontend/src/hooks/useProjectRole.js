import { useContext } from 'react';
import { ProjectRoleContext } from '../context/ProjectRoleContext.jsx';

export function useProjectRole() {
  const context = useContext(ProjectRoleContext);

  if (!context) {
    throw new Error('useProjectRole must be used within a ProjectRoleProvider');
  }

  return context;
}
