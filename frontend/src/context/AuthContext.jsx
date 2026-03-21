import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            logout();
          } else {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const res = await api.get('/auth/me');
            setUser(res.data.user);
          }
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success && res.data.token) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  const verifyOTP = async (verifyData) => {
    const res = await api.post('/auth/verify-otp', verifyData);
    if (res.data.success && res.data.token) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data;
  };

  const resendOTP = async (phone) => {
    const res = await api.post('/auth/resend-otp', { phone });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verifyOTP, resendOTP, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
