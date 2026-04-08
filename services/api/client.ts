import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  Constants.expoConfig?.extra?.apiUrl ||
  'https://locksafe.uk';

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
  withCredentials: true,
});

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// Request interceptor - add auth token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
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
        await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
      } catch (error) {
        console.error('Error saving token:', error);
      }
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
    return Promise.reject(error);
  }
);

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function setUserData(user: unknown): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUserData<T>(): Promise<T | null> {
  const data = await SecureStore.getItemAsync(USER_KEY);
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
