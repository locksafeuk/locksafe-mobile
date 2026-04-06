import { post, get } from './client';
import type { Customer, Locksmith, ApiResponse } from '../../types';

// ==========================================
// Auth API Types
// ==========================================

export interface LoginResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    type: 'customer' | 'locksmith' | 'admin';
    companyName?: string;
    isVerified?: boolean;
    stripeConnectOnboarded?: boolean;
    onboardingCompleted?: boolean;
  };
  error?: string;
  redirectTo?: string;
}

export interface RegisterCustomerResponse {
  success: boolean;
  customer?: Customer;
  error?: string;
}

export interface RegisterLocksmithResponse {
  success: boolean;
  locksmith?: Locksmith;
  error?: string;
}

export interface SessionResponse {
  success: boolean;
  authenticated: boolean;
  user?: {
    id: string;
    type: 'customer' | 'locksmith' | 'admin';
    name: string;
    email: string;
  };
}

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ==========================================
// Auth API Functions
// ==========================================

/**
 * Login with email and password
 * Works for both customers and locksmiths via unified endpoint
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  return post<LoginResponse>('/api/auth/login', {
    email: email.toLowerCase().trim(),
    password,
  });
}

/**
 * Register a new customer account
 */
export async function registerCustomer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<RegisterCustomerResponse> {
  return post<RegisterCustomerResponse>('/api/auth/register', {
    name: data.name,
    email: data.email.toLowerCase().trim(),
    phone: data.phone,
    password: data.password,
  });
}

/**
 * Register a new locksmith account
 */
export async function registerLocksmith(data: {
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  password: string;
  baseLat?: number;
  baseLng?: number;
  coverageRadius?: number;
  services?: string[];
}): Promise<RegisterLocksmithResponse> {
  return post<RegisterLocksmithResponse>('/api/locksmiths/register', {
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
}

/**
 * Logout the current user
 */
export async function logout(): Promise<{ success: boolean }> {
  return post<{ success: boolean }>('/api/auth/logout', {});
}

/**
 * Check current session status
 */
export async function checkSession(): Promise<SessionResponse> {
  return get<SessionResponse>('/api/auth/session');
}

/**
 * Request password reset email
 */
export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return post<ForgotPasswordResponse>('/api/auth/forgot-password', {
    email: email.toLowerCase().trim(),
  });
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  password: string
): Promise<ResetPasswordResponse> {
  return post<ResetPasswordResponse>('/api/auth/reset-password', {
    token,
    password,
  });
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<ApiResponse> {
  return post<ApiResponse>('/api/auth/verify-email', { token });
}

/**
 * Accept terms and conditions for customers
 */
export async function acceptCustomerTerms(): Promise<ApiResponse> {
  return post<ApiResponse>('/api/customer/accept-terms', {});
}

/**
 * Accept terms and conditions for locksmiths
 */
export async function acceptLocksmithTerms(): Promise<ApiResponse> {
  return post<ApiResponse>('/api/locksmith/accept-terms', {});
}

/**
 * Update customer profile
 */
export async function updateCustomerProfile(data: {
  name?: string;
  phone?: string;
}): Promise<ApiResponse<Customer>> {
  return post<ApiResponse<Customer>>('/api/customer/profile', data);
}

/**
 * Update customer password
 */
export async function updateCustomerPassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<ApiResponse> {
  return post<ApiResponse>('/api/customer/password', data);
}

/**
 * Get locksmith profile
 */
export async function getLocksmithProfile(
  locksmithId: string
): Promise<ApiResponse<Locksmith>> {
  return get<ApiResponse<Locksmith>>(`/api/locksmiths/${locksmithId}`);
}

/**
 * Update locksmith profile
 */
export async function updateLocksmithProfile(data: {
  name?: string;
  companyName?: string;
  phone?: string;
  baseLat?: number;
  baseLng?: number;
  coverageRadius?: number;
  services?: string[];
  defaultAssessmentFee?: number;
}): Promise<ApiResponse<Locksmith>> {
  return post<ApiResponse<Locksmith>>('/api/locksmith/profile', data);
}

/**
 * Get locksmith dashboard data
 */
export async function getLocksmithDashboard(locksmithId: string): Promise<{
  locksmith: Locksmith;
  stats: {
    activeJobs: number;
    completedJobs: number;
    totalEarnings: number;
    averageRating: number;
    pendingPayout?: number;
  };
  recentJobs: any[];
}> {
  return get(`/api/locksmiths/${locksmithId}/dashboard`);
}

/**
 * Toggle locksmith availability
 */
export async function toggleLocksmithAvailability(
  locksmithId: string,
  isAvailable: boolean
): Promise<{
  success: boolean;
  isAvailable: boolean;
  lastChanged: string;
  message: string;
}> {
  return post('/api/locksmith/availability', {
    locksmithId,
    isAvailable,
  });
}

/**
 * Get locksmith availability status
 */
export async function getLocksmithAvailability(locksmithId: string): Promise<{
  success: boolean;
  isAvailable: boolean;
  lastChanged?: string;
  scheduleEnabled: boolean;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  scheduleDays?: string[];
}> {
  return get(`/api/locksmith/availability?locksmithId=${locksmithId}`);
}

/**
 * Update locksmith availability schedule
 */
export async function updateLocksmithSchedule(data: {
  locksmithId: string;
  scheduleEnabled: boolean;
  scheduleStartTime?: string;
  scheduleEndTime?: string;
  scheduleDays?: string[];
}): Promise<ApiResponse> {
  return post('/api/locksmith/availability/schedule', data);
}
