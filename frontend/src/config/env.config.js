const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api/v1';

if (!apiBaseUrl.startsWith('/') && !/^https?:\/\//.test(apiBaseUrl)) {
  throw new Error(
    'VITE_API_BASE_URL must be an absolute HTTP(S) URL or a path starting with "/".'
  );
}

/**
 * Runtime environment configuration. Local development uses the Vite proxy;
 * deployments can provide an absolute API URL instead.
 */
export const ENV = {
  API_BASE_URL: apiBaseUrl.replace(/\/$/, ''),
  APP_NAME: import.meta.env.VITE_APP_NAME || 'TaskFlow',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
