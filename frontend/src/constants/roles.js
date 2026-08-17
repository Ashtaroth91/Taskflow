/**
 * User Project Roles as defined in FRONTEND_API_CONTRACT.md
 */
export const ROLES = {
  ADMIN: 'admin',
  PROJECT_ADMIN: 'project_admin',
  MEMBER: 'member',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.PROJECT_ADMIN]: 'Project Admin',
  [ROLES.MEMBER]: 'Member',
};

export const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.PROJECT_ADMIN]: 2,
  [ROLES.MEMBER]: 1,
};
