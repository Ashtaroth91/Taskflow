import { axiosInstance, setAccessToken } from './axiosInstance.js';
import { ENDPOINTS } from './endpoints.js';

export const authApi = {
  async register(data) {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_REGISTER, data);
    return res.data.data;
  },

  async login(credentials) {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_LOGIN, credentials);
    const data = res.data.data;
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  async logout() {
    try {
      const res = await axiosInstance.post(ENDPOINTS.AUTH_LOGOUT);
      return res.data.data;
    } finally {
      setAccessToken(null);
    }
  },

  async getCurrentUser() {
    const res = await axiosInstance.get(ENDPOINTS.AUTH_CURRENT_USER);
    return res.data.data;
  },

  async refreshToken() {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_REFRESH_TOKEN);
    const data = res.data.data;
    if (data?.accessToken) {
      setAccessToken(data.accessToken);
    }
    return data;
  },

  async verifyEmail(token) {
    const res = await axiosInstance.get(ENDPOINTS.AUTH_VERIFY_EMAIL(token));
    return res.data.data;
  },

  async resendVerificationEmail() {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_RESEND_VERIFICATION);
    return res.data.data;
  },

  async forgotPassword(data) {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_FORGOT_PASSWORD, data);
    return res.data.data;
  },

  async resetPassword(token, data) {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_RESET_PASSWORD(token), data);
    return res.data.data;
  },

  async changePassword(data) {
    const res = await axiosInstance.post(ENDPOINTS.AUTH_CHANGE_PASSWORD, data);
    return res.data.data;
  },
};
