/**
 * Centralized TanStack Query cache keys
 */
export const QUERY_KEYS = {
  AUTH_USER: ['auth', 'user'],
  PROJECTS: ['projects'],
  PROJECT_DETAIL: (projectId) => ['projects', projectId],
  PROJECT_MEMBERS: (projectId) => ['projects', projectId, 'members'],
  PROJECT_TASKS: (projectId) => ['tasks', projectId],
  TASK_DETAIL: (projectId, taskId) => ['tasks', projectId, taskId],
  PROJECT_NOTES: (projectId) => ['notes', projectId],
  NOTE_DETAIL: (projectId, noteId) => ['notes', projectId, noteId],
};
