import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'campusfix-user';
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const clearAuth = async () => {
      await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
      await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
      delete api.defaults.headers.common['Authorization'];

      if (isMounted) {
        setToken(null);
        setUser(null);
        setLoading(false);
      }
    };

    const initAuth = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          SecureStore.getItemAsync(TOKEN_STORAGE_KEY),
          SecureStore.getItemAsync(USER_STORAGE_KEY),
        ]);

        if (storedToken) {
          const decoded = jwtDecode(storedToken);
          if (decoded.exp * 1000 < Date.now()) {
            await clearAuth();
          } else {
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            if (isMounted) {
              setToken(storedToken);
            }

            if (storedUser && isMounted) {
              try {
                setUser(JSON.parse(storedUser));
                setLoading(false);
              } catch {
                await SecureStore.deleteItemAsync(USER_STORAGE_KEY);
              }
            }

            const res = await api.get('/auth/me');
            await SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(res.data.user));

            if (isMounted) {
              setUser(res.data.user);
            }
          }
        }
      } catch (e) {
        await clearAuth();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const _saveAuth = async (tok, userData) => {
    await Promise.all([
      SecureStore.setItemAsync(TOKEN_STORAGE_KEY, tok),
      SecureStore.setItemAsync(USER_STORAGE_KEY, JSON.stringify(userData)),
    ]);
    api.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    setToken(tok);
    setUser(userData);
    setLoading(false);
  };

  const _clearAuth = async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY),
      SecureStore.deleteItemAsync(USER_STORAGE_KEY),
    ]);
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
    setLoading(false);
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
