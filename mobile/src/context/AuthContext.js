import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('token');
        if (storedToken) {
          const decoded = jwtDecode(storedToken);
          if (decoded.exp * 1000 < Date.now()) {
            await logout();
          } else {
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            setToken(storedToken);
            const res = await api.get('/auth/me');
            setUser(res.data.user);
          }
        }
      } catch (e) {
        await _clearAuth();
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const _saveAuth = async (tok, userData) => {
    await SecureStore.setItemAsync('token', tok);
    api.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    setToken(tok);
    setUser(userData);
  };

  const _clearAuth = async () => {
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const login = async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.success && res.data.token) {
      await _saveAuth(res.data.token, res.data.user);
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success && res.data.token) {
      // Maintainer registration doesn't return a token immediately since it goes to pending status
      await _saveAuth(res.data.token, res.data.user);
    }
    return res.data;
  };

  const logout = async () => {
    await _clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
