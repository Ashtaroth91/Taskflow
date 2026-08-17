/**
 * Environment configuration reader with fallbacks.
 */
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
