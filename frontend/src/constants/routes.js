/**
 * Application Route Paths
 */
export const ROUTES = {
  // Public Auth Routes
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email/:token',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',

  // Authenticated App Shell Routes
  APP: '/app',
  PROJECTS: '/app/projects',
  PROJECT_NEW: '/app/projects/new',
  PROJECT_DETAIL: '/app/projects/:projectId',
  PROJECT_TASKS: '/app/projects/:projectId/tasks',
  TASK_DETAIL: '/app/projects/:projectId/tasks/:taskId',
  PROJECT_NOTES: '/app/projects/:projectId/notes',
  NOTE_DETAIL: '/app/projects/:projectId/notes/:noteId',
  PROJECT_MEMBERS: '/app/projects/:projectId/members',
  PROJECT_SETTINGS: '/app/projects/:projectId/settings',
  ACCOUNT: '/app/account',

  // Fallback Error Routes
  FORBIDDEN: '/403',
  NOT_FOUND: '/404',
};
