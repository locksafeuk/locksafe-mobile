import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { post, get, setAuthToken, clearAuthToken, setUserData, getUserData, API_BASE_URL } from '../services/api';
import type { Customer, Locksmith } from '../types';

// Token and user storage keys
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';

// User types matching web app
export type UserType = 'customer' | 'locksmith' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: UserType;
  companyName?: string;
  isVerified?: boolean;
  stripeConnectOnboarded?: boolean;
  onboardingCompleted?: boolean;
}

interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  customer?: AuthUser;
  locksmith?: AuthUser;
  error?: string;
  redirectTo?: string;
}

interface RegisterResponse {
  success: boolean;
  user?: AuthUser;
  customer?: Customer;
  locksmith?: Locksmith;
  token?: string;
  error?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  loginCustomer: (email: string, password: string) => Promise<boolean>;
  loginLocksmith: (email: string, password: string) => Promise<boolean>;
  registerCustomer: (data: CustomerRegisterData) => Promise<boolean>;
  registerLocksmith: (data: LocksmithRegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  checkSession: () => Promise<boolean>;
}

export interface CustomerRegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LocksmithRegisterData {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  password: string;
  baseLat?: number;
  baseLng?: number;
  coverageRadius?: number;
  services?: string[];
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  // Initialize auth state from secure storage on app load
  initialize: async () => {
    try {
      const userData = await getUserData<AuthUser>();
      if (userData) {
        // Verify the session is still valid
        const isValid = await get().checkSession();
        if (!isValid) {
          await clearAuthToken();
          set({ user: null, isInitialized: true });
          return;
        }
        set({ user: userData, isInitialized: true });
      } else {
        set({ isInitialized: true });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isInitialized: true });
    }
  },

  // Customer login - uses unified /api/auth/login endpoint
  loginCustomer: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await post<LoginResponse>('/api/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      if (response.success && response.user) {
        // Ensure user type is customer
        if (response.user.type !== 'customer') {
          set({
            isLoading: false,
            error: 'Please use the locksmith login for professional accounts.',
          });
          return false;
        }

        const user: AuthUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          type: 'customer',
          onboardingCompleted: response.user.onboardingCompleted,
        };

        await setUserData(user);
        set({ user, isLoading: false, error: null });
        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Invalid email or password',
      });
      return false;
    } catch (error: any) {
      console.error('Customer login error:', error);
      set({
        isLoading: false,
        error: error.message || 'An error occurred during login',
      });
      return false;
    }
  },

  // Locksmith login - uses unified /api/auth/login endpoint
  loginLocksmith: async (email: string, password: string) => {
    set({ isLoading: true, error: null });

    try {
      const response = await post<LoginResponse>('/api/auth/login', {
        email: email.toLowerCase().trim(),
        password,
      });

      if (response.success && response.user) {
        // Ensure user type is locksmith
        if (response.user.type !== 'locksmith') {
          set({
            isLoading: false,
            error: 'Please use the customer login for customer accounts.',
          });
          return false;
        }

        const user: AuthUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          type: 'locksmith',
          companyName: response.user.companyName,
          isVerified: response.user.isVerified,
          stripeConnectOnboarded: response.user.stripeConnectOnboarded,
          onboardingCompleted: response.user.onboardingCompleted,
        };

        await setUserData(user);
        set({ user, isLoading: false, error: null });
        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Invalid email or password',
      });
      return false;
    } catch (error: any) {
      console.error('Locksmith login error:', error);
      set({
        isLoading: false,
        error: error.message || 'An error occurred during login',
      });
      return false;
    }
  },

  // Customer registration
  registerCustomer: async (data: CustomerRegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await post<RegisterResponse>('/api/auth/register', {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        password: data.password,
      });

      // Registration now returns user and token directly for mobile apps
      if (response.success && response.user) {
        const user: AuthUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          type: 'customer',
          onboardingCompleted: response.user.onboardingCompleted,
        };

        await setUserData(user);
        set({ user, isLoading: false, error: null });
        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Registration failed',
      });
      return false;
    } catch (error: any) {
      console.error('Customer registration error:', error);
      set({
        isLoading: false,
        error: error.message || 'An error occurred during registration',
      });
      return false;
    }
  },

  // Locksmith registration
  registerLocksmith: async (data: LocksmithRegisterData) => {
    set({ isLoading: true, error: null });

    try {
      const response = await post<RegisterResponse>('/api/locksmiths/register', {
        name: data.name,
        companyName: data.companyName,
        email: data.email.toLowerCase().trim(),
        phone: data.phone,
        password: data.password,
        baseLat: data.baseLat,
        baseLng: data.baseLng,
        coverageRadius: data.coverageRadius || 10,
        services: data.services || [],
      });

      // Registration now returns user and token directly for mobile apps
      if (response.success && response.user) {
        const user: AuthUser = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          phone: response.user.phone,
          type: 'locksmith',
          companyName: response.user.companyName,
          isVerified: response.user.isVerified,
          stripeConnectOnboarded: response.user.stripeConnectOnboarded,
          onboardingCompleted: response.user.onboardingCompleted,
        };

        await setUserData(user);
        set({ user, isLoading: false, error: null });
        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Registration failed',
      });
      return false;
    } catch (error: any) {
      console.error('Locksmith registration error:', error);
      set({
        isLoading: false,
        error: error.message || 'An error occurred during registration',
      });
      return false;
    }
  },

  // Logout
  logout: async () => {
    set({ isLoading: true });

    try {
      // Call logout endpoint to clear server-side session
      await post('/api/auth/logout', {});
    } catch (error) {
      // Continue with local logout even if server call fails
      console.error('Logout API error:', error);
    }

    // Clear local storage
    await clearAuthToken();
    set({ user: null, isLoading: false, error: null });
  },

  // Clear error message
  clearError: () => {
    set({ error: null });
  },

  // Update user data locally
  updateUser: (updates: Partial<AuthUser>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates };
      setUserData(updatedUser);
      set({ user: updatedUser });
    }
  },

  // Check if current session is valid
  checkSession: async () => {
    try {
      const response = await get<{
        success: boolean;
        authenticated: boolean;
        user?: AuthUser;
      }>('/api/auth/session');

      if (response.success && response.authenticated && response.user) {
        // Update local user data with server data
        await setUserData(response.user);
        set({ user: response.user });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  },
}));

// Export a hook to get the user type for routing
export function useUserType(): UserType | null {
  const user = useAuthStore((state) => state.user);
  return user?.type ?? null;
}

// Export a hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const user = useAuthStore((state) => state.user);
  return user !== null;
}
