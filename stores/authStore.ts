import { create } from 'zustand';
import { post, get as apiGet, setAuthToken, clearAuthToken, setUserData, getUserData, API_BASE_URL } from '../services/api';
import type { Locksmith } from '../types';

// User type - locksmith only
export type UserType = 'locksmith';

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
  error: string | null;

  // Actions
  initialize: () => Promise<void>;
  loginLocksmith: (email: string, password: string) => Promise<boolean>;
  registerLocksmith: (data: LocksmithRegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  checkSession: () => Promise<boolean>;
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
            error: 'This app is for locksmith professionals only. Please use the customer website.',
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
          rating: response.user.rating,
          totalJobs: response.user.totalJobs,
          totalEarnings: response.user.totalEarnings,
          isActive: response.user.isActive,
          licenseNumber: response.user.licenseNumber,
          insuranceNumber: response.user.insuranceNumber,
          coverageAreas: response.user.coverageAreas,
          services: response.user.services,
          yearsExperience: response.user.yearsExperience,
          baseLat: response.user.baseLat,
          baseLng: response.user.baseLng,
          baseAddress: response.user.baseAddress,
          coverageRadius: response.user.coverageRadius,
          defaultAssessmentFee: response.user.defaultAssessmentFee,
          stripeConnectId: response.user.stripeConnectId,
          stripeConnectVerified: response.user.stripeConnectVerified,
          smsNotifications: response.user.smsNotifications,
          emailNotifications: response.user.emailNotifications,
          pushNotifications: response.user.pushNotifications,
          isAvailable: response.user.isAvailable,
          lastAvailabilityChange: response.user.lastAvailabilityChange,
          scheduleEnabled: response.user.scheduleEnabled,
          scheduleTimezone: response.user.scheduleTimezone,
          scheduleStartTime: response.user.scheduleStartTime,
          scheduleEndTime: response.user.scheduleEndTime,
          scheduleDays: response.user.scheduleDays,
          oneSignalPlayerId: response.user.oneSignalPlayerId,
          termsAcceptedAt: response.user.termsAcceptedAt,
          profileImage: response.user.profileImage,
          createdAt: response.user.createdAt,
          updatedAt: response.user.updatedAt,
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
      const apiError = error.response?.data?.error || error.response?.data?.message;
      set({
        isLoading: false,
        error: apiError || (error.code === 'ERR_NETWORK' ? 'Unable to connect to server. Please check your internet connection.' : 'An error occurred during login'),
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
          rating: response.user.rating,
          totalJobs: response.user.totalJobs,
          totalEarnings: response.user.totalEarnings,
          isActive: response.user.isActive,
          licenseNumber: response.user.licenseNumber,
          insuranceNumber: response.user.insuranceNumber,
          coverageAreas: response.user.coverageAreas,
          services: response.user.services,
          yearsExperience: response.user.yearsExperience,
          baseLat: response.user.baseLat,
          baseLng: response.user.baseLng,
          baseAddress: response.user.baseAddress,
          coverageRadius: response.user.coverageRadius,
          defaultAssessmentFee: response.user.defaultAssessmentFee,
          stripeConnectId: response.user.stripeConnectId,
          stripeConnectVerified: response.user.stripeConnectVerified,
          smsNotifications: response.user.smsNotifications,
          emailNotifications: response.user.emailNotifications,
          pushNotifications: response.user.pushNotifications,
          isAvailable: response.user.isAvailable,
          lastAvailabilityChange: response.user.lastAvailabilityChange,
          scheduleEnabled: response.user.scheduleEnabled,
          scheduleTimezone: response.user.scheduleTimezone,
          scheduleStartTime: response.user.scheduleStartTime,
          scheduleEndTime: response.user.scheduleEndTime,
          scheduleDays: response.user.scheduleDays,
          oneSignalPlayerId: response.user.oneSignalPlayerId,
          termsAcceptedAt: response.user.termsAcceptedAt,
          profileImage: response.user.profileImage,
          createdAt: response.user.createdAt,
          updatedAt: response.user.updatedAt,
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
      const apiError = error.response?.data?.error || error.response?.data?.message;
      set({
        isLoading: false,
        error: apiError || (error.code === 'ERR_NETWORK' ? 'Unable to connect to server. Please check your internet connection.' : 'An error occurred during registration'),
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
      const response = await apiGet<{
        success: boolean;
        authenticated: boolean;
        user?: AuthUser;
      }>('/api/auth/session');

      if (response && response.success && response.authenticated && response.user) {
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

// Export a hook to check if user is authenticated
export function useIsAuthenticated(): boolean {
  const user = useAuthStore((state) => state.user);
  return user !== null;
}
