import { post, get } from './client';
import type { Notification, ApiResponse } from '../../types';

// ==========================================
// Notification API Types
// ==========================================

export interface NotificationsResponse {
  success: boolean;
  notifications: Notification[];
  unreadCount: number;
}

export interface NativePushRegistrationResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface NativePushRegistrationPayload {
  userId: string;
  userType: 'locksmith';
  deviceToken: string;
  tokenType: string;
  platform: string;
  deviceName?: string | null;
  isDevice?: boolean;
}

export interface NativePushUnregisterPayload {
  userId: string;
  userType: 'locksmith';
  deviceToken: string;
  tokenType: string;
  platform: string;
}

// ==========================================
// Notification API Functions
// ==========================================

/**
 * Get notifications for a locksmith
 */
export async function getLocksmithNotifications(
  locksmithId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
  }
): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ locksmithId });
  if (options?.unreadOnly) params.append('unreadOnly', 'true');
  if (options?.limit) params.append('limit', options.limit.toString());
  return get<NotificationsResponse>(`/api/notifications?${params.toString()}`);
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<ApiResponse> {
  return post<ApiResponse>(`/api/notifications/${notificationId}/read`, {});
}

/**
 * Mark all notifications as read for a locksmith
 */
export async function markAllLocksmithNotificationsAsRead(
  locksmithId: string
): Promise<ApiResponse> {
  return post<ApiResponse>('/api/notifications/read-all', { locksmithId });
}

/**
 * Register native push token for APNs/FCM delivery.
 */
export async function registerNativePushToken(
  data: NativePushRegistrationPayload
): Promise<NativePushRegistrationResponse> {
  return post<NativePushRegistrationResponse>('/api/push/register-device', data);
}

/**
 * Unregister native push token.
 */
export async function unregisterNativePushToken(
  data: NativePushUnregisterPayload
): Promise<ApiResponse> {
  return post<ApiResponse>('/api/push/unregister-device', data);
}

/**
 * Subscribe to web push notifications (legacy)
 */
export async function subscribeToPushNotifications(data: {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userId?: string;
  userType?: 'locksmith';
}): Promise<ApiResponse> {
  return post<ApiResponse>('/api/notifications/subscribe', data);
}

/**
 * Unsubscribe from web push notifications (legacy)
 */
export async function unsubscribeFromPushNotifications(
  endpoint: string
): Promise<ApiResponse> {
  return post<ApiResponse>('/api/notifications/unsubscribe', { endpoint });
}
