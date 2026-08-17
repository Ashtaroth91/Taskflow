import axios from 'axios';
import { ENV } from '../config/env.config.js';
import { ENDPOINTS } from './endpoints.js';

// In-memory access token storage
let inMemoryAccessToken = null;

export const setAccessToken = (token) => {
  inMemoryAccessToken = token;
};

export const getAccessToken = () => inMemoryAccessToken;

export const axiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  withCredentials: true, // Send HTTP-only auth cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Authorization header if access token exists in memory
axiosInstance.interceptors.request.use(
  (config) => {
    if (inMemoryAccessToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${inMemoryAccessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent infinite refresh retry loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor: automatically unwrap envelope and handle 401 token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    // Envelope check: backend returns { statusCode, success, message, data }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized and auto-refresh token
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(ENDPOINTS.AUTH_LOGIN) &&
      !originalRequest.url?.includes(ENDPOINTS.AUTH_REFRESH_TOKEN)
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token call uses credentials (cookies)
        const refreshResponse = await axios.post(
          `${ENV.API_BASE_URL}${ENDPOINTS.AUTH_REFRESH_TOKEN}`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = refreshResponse.data?.data?.accessToken;
        if (newAccessToken) {
          setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Failed to obtain new access token'), null);
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        // Custom event so AuthContext can handle logout / redirect
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
