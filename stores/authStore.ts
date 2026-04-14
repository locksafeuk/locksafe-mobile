import { create } from 'zustand';
import {
  post,
  get as apiGet,
  clearAuthToken,
  setUserData,
  getUserData,
  getAuthToken,
  setStorageItem,
  getStorageItem,
} from '../services/api';
import type { Locksmith } from '../types';

// User type - locksmith only
export type UserType = 'locksmith';

const REMEMBER_ME_KEY = 'remember_me';

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
  // Locksmith-specific fields
  rating?: number;
  totalJobs?: number;
  totalEarnings?: number;
  isActive?: boolean;
  licenseNumber?: string;
  insuranceNumber?: string;
  coverageAreas?: string[];
  services?: string[];
  yearsExperience?: number;
  baseLat?: number;
  baseLng?: number;
  baseAddress?: string;
  coverageRadius?: number;
  defaultAssessmentFee?: number;
  stripeConnectId?: string;
  stripeConnectVerified?: boolean;
  smsNotifications?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  isAvailable?: boolean;
  lastAvailabilityChange?: string;
  scheduleEnabled?: boolean;
  scheduleTimezone?: string;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  scheduleDays?: string[];
  oneSignalPlayerId?: string;
  termsAcceptedAt?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  locksmith?: AuthUser;
  error?: string;
  redirectTo?: string;
}

interface RegisterResponse {
  success: boolean;
  user?: AuthUser;
  locksmith?: Locksmith;
  token?: string;
  error?: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  rememberMe: boolean;
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  loginLocksmith: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  registerLocksmith: (data: LocksmithRegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  checkSession: () => Promise<boolean>;
  setRememberMe: (rememberMe: boolean) => Promise<void>;
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

function mapAuthUser(user: Partial<AuthUser> | undefined): AuthUser | null {
  if (!user || !user.id || !user.name || !user.email) {
    return null;
  }

  if (user.type && user.type !== 'locksmith') {
    return null;
  }

  return {
    ...user,
    type: 'locksmith',
  } as AuthUser;
}

async function loadRememberMePreference(): Promise<boolean> {
  const saved = await getStorageItem(REMEMBER_ME_KEY);
  // Default to true for production "stay signed in" behavior
  return saved !== 'false';
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,
  rememberMe: true,
  error: null,

  // Initialize auth state from secure storage on app load
  initialize: async () => {
    set({ isLoading: true });

    try {
      const rememberMe = await loadRememberMePreference();
      set({ rememberMe });

      if (!rememberMe) {
        await clearAuthToken();
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      const [userData, token] = await Promise.all([getUserData<AuthUser>(), getAuthToken()]);

      if (!token) {
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      if (userData) {
        set({ user: userData });
      }

      // Verify session using backend, but don't log out user on transient network issues.
      const isValid = await get().checkSession();
      if (!isValid) {
        await clearAuthToken();
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      // If checkSession succeeded but did not return user payload, keep cached user.
      const latestUser = get().user || userData;
      if (latestUser) {
        await setUserData(latestUser);
      }

      set({ user: latestUser ?? null, isInitialized: true, isLoading: false, error: null });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isInitialized: true, isLoading: false });
    }
  },

  // Locksmith login - uses unified /api/auth/login endpoint
  loginLocksmith: async (email: string, password: string, rememberMe = true) => {
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
            error: 'This app is for locksmith professionals only. Please use the customer website.',
          });
          return false;
        }

        const user = mapAuthUser(response.user);
        if (!user) {
          set({
            isLoading: false,
            error: 'Invalid user response from server.',
          });
          return false;
        }

        await setUserData(user);
        await setStorageItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');

        set({
          user,
          rememberMe,
          isLoading: false,
          isInitialized: true,
          error: null,
        });

        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Invalid email or password',
      });
      return false;
    } catch (error: any) {
      console.error('Locksmith login error:', error);
      const apiError = error.response?.data?.error || error.response?.data?.message;
      set({
        isLoading: false,
        error:
          apiError ||
          (error.code === 'ERR_NETWORK'
            ? 'Unable to connect to server. Please check your internet connection.'
            : 'An error occurred during login'),
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
        const user = mapAuthUser(response.user);

        if (!user) {
          set({
            isLoading: false,
            error: 'Invalid user response from server.',
          });
          return false;
        }

        await setUserData(user);
        await setStorageItem(REMEMBER_ME_KEY, 'true');

        set({
          user,
          rememberMe: true,
          isLoading: false,
          isInitialized: true,
          error: null,
        });
        return true;
      }

      set({
        isLoading: false,
        error: response.error || 'Registration failed',
      });
      return false;
    } catch (error: any) {
      console.error('Locksmith registration error:', error);
      const apiError = error.response?.data?.error || error.response?.data?.message;
      set({
        isLoading: false,
        error:
          apiError ||
          (error.code === 'ERR_NETWORK'
            ? 'Unable to connect to server. Please check your internet connection.'
            : 'An error occurred during registration'),
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

    await clearAuthToken();
    set({ user: null, isLoading: false, error: null, isInitialized: true });
  },

  // Clear error message
  clearError: () => {
    set({ error: null });
  },

  // Update user data locally
  updateUser: (updates: Partial<AuthUser>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates, type: 'locksmith' as const };
      setUserData(updatedUser);
      set({ user: updatedUser });
    }
  },

  // Check if current session is valid
  checkSession: async () => {
    try {
      const response = await apiGet<{
        success: boolean;
        authenticated: boolean;
        user?: AuthUser;
      }>('/api/auth/session');

      if (response?.success && response.authenticated) {
        const mappedUser = mapAuthUser(response.user);
        if (mappedUser) {
          await setUserData(mappedUser);
          set({ user: mappedUser });
        }
        return true;
      }

      return false;
    } catch (error: any) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        return false;
      }

      // Network/transient backend issue:
      // keep local session and avoid forcing logout.
      const token = await getAuthToken();
      const hasLocalSession = !!(token && (get().user || (await getUserData<AuthUser>())));

      if (hasLocalSession) {
        console.warn('Session check skipped due transient error, keeping local session.');
        return true;
      }

      return false;
    }
  },

  setRememberMe: async (rememberMe: boolean) => {
    await setStorageItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
    set({ rememberMe });
  },
}));

// Export a hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const user = useAuthStore((state) => state.user);
  return user !== null;
}
