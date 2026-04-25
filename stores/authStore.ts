import { create } from 'zustand';
import {
  post,
  get as apiGet,
  clearAuthToken,
  setUserData,
  getUserData,
  getAuthToken,
  setAuthToken,
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
  token?: string;
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
  if (!user) {
    return null;
  }

  const sanitizedName = user.name?.trim();
  const sanitizedEmail = user.email?.trim().toLowerCase();
  const sanitizedPhone = user.phone?.trim();
  const sanitizedCompanyName = user.companyName?.trim();

  if (!user.id || !sanitizedName || !sanitizedEmail) {
    return null;
  }

  if (user.type && user.type !== 'locksmith') {
    return null;
  }

  return {
    ...user,
    name: sanitizedName,
    email: sanitizedEmail,
    phone: sanitizedPhone,
    companyName: sanitizedCompanyName,
    type: 'locksmith',
  } as AuthUser;
}

async function loadRememberMePreference(): Promise<boolean> {
  const saved = await getStorageItem(REMEMBER_ME_KEY);
  // Default to true for production "stay signed in" behavior
  return saved !== 'false';
}

type AuthPayload = {
  token?: unknown;
  accessToken?: unknown;
  authToken?: unknown;
  user?: unknown;
  locksmith?: unknown;
  data?: {
    token?: unknown;
    user?: unknown;
    locksmith?: unknown;
  };
};

function extractAuthToken(payload: AuthPayload | undefined): string | null {
  const tokenCandidates = [
    payload?.token,
    payload?.accessToken,
    payload?.authToken,
    payload?.data?.token,
  ];

  for (const candidate of tokenCandidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  return null;
}

function extractAuthUser(payload: AuthPayload | undefined): AuthUser | null {
  const candidate =
    (payload?.user as Partial<AuthUser> | undefined) ||
    (payload?.locksmith as Partial<AuthUser> | undefined) ||
    (payload?.data?.user as Partial<AuthUser> | undefined) ||
    (payload?.data?.locksmith as Partial<AuthUser> | undefined);

  return mapAuthUser(candidate);
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

      const [cachedUserData, storedToken] = await Promise.all([
        getUserData<AuthUser>(),
        getAuthToken(),
      ]);
      const cachedUser = mapAuthUser(cachedUserData);

      // If we already have local persisted auth, prefer restoring immediately so users remain
      // signed in after app restart. Session revalidation runs in background.
      if (cachedUser || storedToken) {
        set({
          user: cachedUser,
          isInitialized: true,
          isLoading: false,
          error: null,
        });

        void (async () => {
          const isValid = await get().checkSession();
          if (isValid) {
            const latestUser = get().user || cachedUser;
            if (latestUser) {
              await setUserData(latestUser);
            }
            return;
          }

          // Keep remembered local session instead of forcing immediate logout on startup.
          // Backend auth may still be recovering (token propagation / transient edge conditions).
          console.warn('Session validation failed during startup; preserving remembered local session.');
        })();

        return;
      }

      const isValid = await get().checkSession();
      if (!isValid) {
        await clearAuthToken();
        set({ user: null, isInitialized: true, isLoading: false });
        return;
      }

      const latestUser = get().user || cachedUser;
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

      const user = extractAuthUser(response as AuthPayload);
      if (response.success && user) {
        // Ensure user type is locksmith
        if (user.type !== 'locksmith') {
          set({
            isLoading: false,
            error: 'This app is for locksmith professionals only. Please use the customer website.',
          });
          return false;
        }

        const token = extractAuthToken(response as AuthPayload);
        if (token) {
          await setAuthToken(token);
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

      // Registration may return user/locksmith and token in different payload shapes.
      const user = extractAuthUser(response as AuthPayload);
      if (response.success && user) {
        const token = extractAuthToken(response as AuthPayload);
        if (token) {
          await setAuthToken(token);
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
      const cachedUser = get().user || mapAuthUser(await getUserData<AuthUser>());
      const hasLocalSession = !!(token || cachedUser);

      if (hasLocalSession) {
        console.warn('Session check skipped due transient error, keeping local session.');
        if (cachedUser && !get().user) {
          set({ user: cachedUser });
        }
        return true;
      }

      return false;
    }
  },

  setRememberMe: async (rememberMe: boolean) => {
    // Optimistically update UI state first so login immediately uses the latest toggle choice.
    set({ rememberMe });

    try {
      await setStorageItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
    } catch (error) {
      console.error('Failed to persist remember-me preference:', error);
      // Revert to safe default if persistence fails.
      set({ rememberMe: true });
    }
  },
}));

// Export a hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const user = useAuthStore((state) => state.user);
  return user !== null;
}
