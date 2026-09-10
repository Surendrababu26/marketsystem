import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load stored credentials on initial render
  useEffect(() => {
    const initAuth = async () => {
      const storedAccess = localStorage.getItem('access_token');
      const storedRefresh = localStorage.getItem('refresh_token');
      const storedUser = localStorage.getItem('user');

      if (storedAccess) {
        setAccessToken(storedAccess);
        setRefreshToken(storedRefresh);

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }

        // Fetch current user details from backend to ensure freshness
        try {
          const res = await authAPI.getMe();
          const meData = res.data;
          setUser(meData);
          localStorage.setItem('user', JSON.stringify(meData));
        } catch (err) {
          console.warn('Failed to fetch user profile on startup:', err);
          // If token is completely invalid, clear
          if (err.response && err.response.status === 401) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('user');
            setAccessToken(null);
            setRefreshToken(null);
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login handler
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const data = response.data;

      // Extract tokens (supports common DRF token formats)
      const access = data.access || data.access_token || data.token;
      const refresh = data.refresh || data.refresh_token || '';

      if (!access) {
        throw new Error('Access token missing in server response.');
      }

      localStorage.setItem('access_token', access);
      setAccessToken(access);

      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
        setRefreshToken(refresh);
      }

      // Determine user details & role
      let userInfo = data.user || data;
      
      // If profile info isn't completely returned in login response, fetch /me/
      if (!userInfo || !userInfo.role) {
        try {
          const meRes = await authAPI.getMe();
          userInfo = meRes.data;
        } catch (e) {
          console.warn('Could not fetch user details, using login payload.', e);
        }
      }

      setUser(userInfo);
      localStorage.setItem('user', JSON.stringify(userInfo));

      const normalizedRole = (userInfo?.role || '').toLowerCase();
      return { success: true, role: normalizedRole, user: userInfo };
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.response?.data?.non_field_errors?.[0] ||
        'Login failed. Please check your credentials.';
      return { success: false, error: message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      return { success: true, data: response.data };
    } catch (error) {
      const serverErrors = error.response?.data;
      let message = 'Registration failed. Please check your inputs.';

      if (typeof serverErrors === 'string') {
        message = serverErrors;
      } else if (serverErrors && typeof serverErrors === 'object') {
        // Collect field error messages
        const messages = Object.entries(serverErrors).map(
          ([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`
        );
        if (messages.length > 0) {
          message = messages.join(' | ');
        }
      }

      return { success: false, error: message };
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // Derived user role normalized to lowercase ('buyer' or 'supplier')
  const role = user?.role ? user.role.toLowerCase() : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        role,
        isAuthenticated: !!accessToken,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
