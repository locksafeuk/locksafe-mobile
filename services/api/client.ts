import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// ==========================================
// Web-compatible storage (SecureStore fallback)
// ==========================================
// expo-secure-store does not work on web platform,
// so we use localStorage as a fallback for web.

const isWeb = Platform.OS === 'web';

let SecureStoreModule: any = null;

async function getSecureStoreModule() {
  if (!isWeb && !SecureStoreModule) {
    SecureStoreModule = await import('expo-secure-store');
  }
  return SecureStoreModule;
}

async function secureGetItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    const store = await getSecureStoreModule();
    return await store.getItemAsync(key);
  } catch {
    return null;
  }
}

async function secureSetItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
    return;
  }
  try {
    const store = await getSecureStoreModule();
    await store.setItemAsync(key, value);
  } catch {
    // ignore
  }
}

async function secureDeleteItem(key: string): Promise<void> {
  if (isWeb) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  try {
    const store = await getSecureStoreModule();
    await store.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

// ==========================================
// API Base URL Configuration
// ==========================================
// The canonical backend URL is https://www.locksafe.uk
// Note: locksafe.uk (without www) returns 307 redirects which break POST requests.
// We must use the www subdomain directly to avoid redirect issues.

function resolveApiUrl(): string {
  // Hard-coded canonical URL - the backend lives here
  const CANONICAL_URL = 'https://www.locksafe.uk';

  // For web development, ALWAYS use the CORS proxy server to avoid cross-origin issues.
  // The proxy runs on port 3001 and forwards /api/* to www.locksafe.uk.
  // Start it with: node proxy-server.js
  if (isWeb && typeof window !== 'undefined') {
    return 'http://localhost:3001';
  }

  // For native platforms, check environment/config for overrides
  const envUrl = Constants.expoConfig?.extra?.apiUrl;

  // If the env URL is a locksafe.uk domain, always use www version
  if (envUrl && typeof envUrl === 'string') {
    if (envUrl.includes('locksafe.uk') && !envUrl.includes('www.locksafe.uk')) {
      return CANONICAL_URL;
    }
    // Only use env URL if it's actually a locksafe domain
    if (envUrl.includes('locksafe.uk')) {
      return envUrl.replace(/\/$/, ''); // strip trailing slash
    }
  }

  return CANONICAL_URL;
}

const API_BASE_URL = resolveApiUrl();

console.log(`[API Client] Platform: ${Platform.OS}, Base URL: ${API_BASE_URL || '(proxy via dev server)'}`);

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    // Identify as mobile app for proper token handling
    'x-mobile-app': 'true',
    'x-platform': Platform.OS,
    'x-app-version': Constants.expoConfig?.version || '1.0.0',
  },
  // Only send credentials (cookies) for same-origin requests on web
  // For cross-origin (native), we use Bearer tokens
  withCredentials: !isWeb,
});

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await secureGetItem(TOKEN_KEY);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token from response and 401 errors
api.interceptors.response.use(
  async (response: AxiosResponse) => {
    // If response includes a token (from login/register), save it
    if (response.data?.token) {
      try {
        await secureSetItem(TOKEN_KEY, response.data.token);
      } catch (error) {
        console.error('Error saving token:', error);
      }
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      await secureDeleteItem(TOKEN_KEY);
      await secureDeleteItem(USER_KEY);
    }

    // Provide more helpful error messages
    if (error.code === 'ERR_NETWORK') {
      console.error('[API Client] Network error - check backend connectivity');
    }

    return Promise.reject(error);
  }
);

export async function setAuthToken(token: string): Promise<void> {
  await secureSetItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await secureGetItem(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await secureDeleteItem(TOKEN_KEY);
  await secureDeleteItem(USER_KEY);
}

export async function setUserData(user: unknown): Promise<void> {
  await secureSetItem(USER_KEY, JSON.stringify(user));
}

export async function getUserData<T>(): Promise<T | null> {
  const data = await secureGetItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export async function get<T>(endpoint: string): Promise<T> {
  const response = await api.get<T>(endpoint);
  return response.data;
}

export async function post<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await api.post<T>(endpoint, data);
  return response.data;
}

export async function put<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await api.put<T>(endpoint, data);
  return response.data;
}

export async function patch<T>(endpoint: string, data?: unknown): Promise<T> {
  const response = await api.patch<T>(endpoint, data);
  return response.data;
}

export async function del<T>(endpoint: string): Promise<T> {
  const response = await api.delete<T>(endpoint);
  return response.data;
}

export default api;
export { API_BASE_URL };
