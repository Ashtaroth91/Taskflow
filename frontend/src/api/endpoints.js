/**
 * REST API Endpoints defined in FRONTEND_API_CONTRACT.md
 */
export const ENDPOINTS = {
  // Health
  HEALTHCHECK: '/healthcheck',

  // Auth
  AUTH_REGISTER: '/auth/register',
  AUTH_LOGIN: '/auth/login',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_REFRESH_TOKEN: '/auth/refresh-token',
  AUTH_CURRENT_USER: '/auth/current-user',
  AUTH_VERIFY_EMAIL: (token) => `/auth/verify-email/${token}`,
  AUTH_RESEND_VERIFICATION: '/auth/resend-email-verification',
  AUTH_FORGOT_PASSWORD: '/auth/forgot-password',
  AUTH_RESET_PASSWORD: (token) => `/auth/reset-password/${token}`,
  AUTH_CHANGE_PASSWORD: '/auth/change-password',

  // Projects
  PROJECTS: '/projects',
  PROJECT_BY_ID: (projectId) => `/projects/${projectId}`,
  PROJECT_MEMBERS: (projectId) => `/projects/${projectId}/members`,
  PROJECT_MEMBER_BY_ID: (projectId, userId) => `/projects/${projectId}/members/${userId}`,

  // Tasks & Subtasks
  TASKS: (projectId) => `/tasks/${projectId}`,
  TASK_BY_ID: (projectId, taskId) => `/tasks/${projectId}/tasks/${taskId}`,
  SUBTASKS: (projectId, taskId) => `/tasks/${projectId}/tasks/${taskId}/subtasks`,
  SUBTASK_BY_ID: (projectId, subTaskId) => `/tasks/${projectId}/subtasks/${subTaskId}`,

  // Notes
  NOTES: (projectId) => `/notes/${projectId}`,
  NOTE_BY_ID: (projectId, noteId) => `/notes/${projectId}/notes/${noteId}`,
};
