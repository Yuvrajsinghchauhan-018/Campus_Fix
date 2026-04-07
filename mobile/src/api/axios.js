import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const DEFAULT_PORT = '5000';
const DEFAULT_PATH = '/api';
const FALLBACK_DEV_HOST = '192.168.1.11';

const getExpoHost = () => {
  const hostCandidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.manifest2?.extra?.expoGo?.debuggerHost,
    Constants.manifest?.debuggerHost,
  ].filter(Boolean);

  const rawHost = hostCandidates.find(Boolean);
  if (!rawHost) return null;

  return rawHost.split(':')[0];
};

const normalizeBaseUrl = (value) => {
  if (!value) return null;
  return value.replace(/\/+$/, '');
};

const resolveApiBaseUrl = () => {
  const extraBaseUrl =
    Constants.expoConfig?.extra?.apiBaseUrl ||
    Constants.manifest2?.extra?.expoClient?.extra?.apiBaseUrl ||
    Constants.manifest?.extra?.apiBaseUrl;

  const normalizedExtraBaseUrl = normalizeBaseUrl(extraBaseUrl);
  if (normalizedExtraBaseUrl) {
    return normalizedExtraBaseUrl.endsWith('/api')
      ? normalizedExtraBaseUrl
      : `${normalizedExtraBaseUrl}${DEFAULT_PATH}`;
  }

  const expoHost = getExpoHost();
  if (expoHost) {
    return `http://${expoHost}:${DEFAULT_PORT}${DEFAULT_PATH}`;
  }

  return `http://${FALLBACK_DEV_HOST}:${DEFAULT_PORT}${DEFAULT_PATH}`;
};

export const API_BASE_URL = resolveApiBaseUrl();
export const STATIC_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

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
