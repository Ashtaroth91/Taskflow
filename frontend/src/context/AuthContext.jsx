import { createContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/auth.api.js';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshSession: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      // First try to fetch current user (with existing access token or cookie)
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      // If fetching current user fails, try refreshing the access token once
      try {
        await authApi.refreshToken();
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (refreshErr) {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [checkAuth]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    if (data?.user) {
      setUser(data.user);
    } else {
      // Re-fetch current user if user object wasn't in response root
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
    }
    return data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      setUser(null);
    }
  };

  const refreshSession = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
