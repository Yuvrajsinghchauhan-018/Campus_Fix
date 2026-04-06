import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'campusfix-user';

export const useAuth = () => useContext(AuthContext);

const readCachedUser = () => {
  const cachedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!cachedUser) {
    return null;
  }

  try {
    return JSON.parse(cachedUser);
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readCachedUser());
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY) || null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  useEffect(() => {
    let isMounted = true;

    const clearAuthState = () => {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      delete api.defaults.headers.common['Authorization'];

      if (isMounted) {
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    };

    const initAuth = async () => {
      if (!token) {
        clearAuthState();
        return;
      }

      try {
        const decoded = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now()) {
          clearAuthState();
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        const cachedUser = readCachedUser();
        if (cachedUser && isMounted) {
          setUser(cachedUser);
          setLoading(false);
        } else if (isMounted) {
          setLoading(true);
        }

        const res = await api.get('/auth/me');
        if (!isMounted) return;

        setUser(res.data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
      } catch (error) {
        clearAuthState();
        return;
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (credentials) => {
    // 1) Force prune any stale contextual tokens across both storage spaces to guarantee zero leakage
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];

    const res = await api.post('/auth/login', credentials);
    if (res.data.success && res.data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setLoading(false);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.token && userData.role === 'authority') {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setLoading(false);
    }
    return res.data;
  };

  const verifyOTP = async (verifyData) => {
    const res = await api.post('/auth/verify-otp', verifyData);
    if (res.data.success && res.data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setLoading(false);
    }
    return res.data;
  };

  const resendOTP = async (phone) => {
    const res = await api.post('/auth/resend-otp', { phone });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyOTP, resendOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
