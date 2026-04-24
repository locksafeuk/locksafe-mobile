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
  const CANONICAL_URL = 'https://www.locksafe.uk';

  if (isWeb && typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('preview.abacusai.app')) {
      const proxyHost = hostname.replace(/-\d+\./, '-3001.');
      return `https://${proxyHost}`;
    }
    return 'http://localhost:3001';
  }

  const envUrl = Constants.expoConfig?.extra?.apiUrl;

  if (envUrl && typeof envUrl === 'string') {
    if (envUrl.includes('locksafe.uk') && !envUrl.includes('www.locksafe.uk')) {
      return CANONICAL_URL;
    }
    if (envUrl.includes('locksafe.uk')) {
      return envUrl.replace(/\/$/, '');
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
  // For native platforms, cookies may be used in addition to Bearer auth.
  // Web proxy flow relies on Bearer tokens in storage.
  withCredentials: !isWeb,
});

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

type ApiRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

function shouldSkipRefresh(config?: ApiRequestConfig): boolean {
  if (!config) return true;
  if (config.headers?.['x-skip-auth-refresh']) return true;

  const url = config.url || '';
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/logout') ||
    url.includes('/api/auth/refresh')
  );
}

async function extractAndPersistTokenFromResponse(response: AxiosResponse): Promise<string | null> {
  if (response.data?.token) {
    await secureSetItem(TOKEN_KEY, response.data.token);
    return response.data.token;
  }

  if (!isWeb) {
    const setCookie = response.headers?.['set-cookie'];
    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      for (const cookie of cookies) {
        const match = cookie.match(/auth_token=([^;]+)/);
        if (match && match[1]) {
          await secureSetItem(TOKEN_KEY, match[1]);
          return match[1];
        }
      }
    }
  }

  return null;
}

async function refreshAuthToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshResponse = await api.post(
        '/api/auth/refresh',
        {},
        {
          headers: {
            'x-skip-auth-refresh': 'true',
          },
        }
      );

      const refreshedToken = await extractAndPersistTokenFromResponse(refreshResponse);
      if (refreshedToken) {
        console.log('[API Client] Token refresh successful');
      }
      return refreshedToken;
    } catch (refreshError: any) {
      // If refresh endpoint is unavailable or refresh fails, return null and allow caller to handle.
      console.log('[API Client] Token refresh unavailable/failed:', refreshError?.response?.status || refreshError?.message);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

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
    await extractAndPersistTokenFromResponse(response);
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as ApiRequestConfig | undefined;

    if (status === 401 && originalRequest && !originalRequest._retry && !shouldSkipRefresh(originalRequest)) {
      originalRequest._retry = true;

      const refreshedToken = await refreshAuthToken();
      if (refreshedToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${refreshedToken}`;
        return api(originalRequest);
      }

      await secureDeleteItem(TOKEN_KEY);
    }

    if (status === 401 && shouldSkipRefresh(originalRequest)) {
      await secureDeleteItem(TOKEN_KEY);
    }

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

export async function setStorageItem(key: string, value: string): Promise<void> {
  await secureSetItem(key, value);
}

export async function getStorageItem(key: string): Promise<string | null> {
  return await secureGetItem(key);
}

export async function deleteStorageItem(key: string): Promise<void> {
  await secureDeleteItem(key);
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
