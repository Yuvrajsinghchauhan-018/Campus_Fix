import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ⚡ Change this to your machine's local IP when testing on a physical device via Expo Go
// e.g. 'http://192.168.1.5:5000/api'
export const API_BASE_URL = 'http://192.168.1.11:5000/api';
export const STATIC_BASE_URL = API_BASE_URL.replace('/api', '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (_) {}
  return config;
});

export default api;
