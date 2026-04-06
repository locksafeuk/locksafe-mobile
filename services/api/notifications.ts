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

export interface OneSignalSubscribeResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// ==========================================
// Notification API Functions
// ==========================================

/**
 * Get notifications for a customer
 */
export async function getCustomerNotifications(
  customerId: string,
  options?: {
    unreadOnly?: boolean;
    limit?: number;
  }
): Promise<NotificationsResponse> {
  const params = new URLSearchParams({ customerId });
  if (options?.unreadOnly) params.append('unreadOnly', 'true');
  if (options?.limit) params.append('limit', options.limit.toString());
  return get<NotificationsResponse>(`/api/notifications?${params.toString()}`);
}

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
 * Mark all notifications as read for a customer
 */
export async function markAllCustomerNotificationsAsRead(
  customerId: string
): Promise<ApiResponse> {
  return post<ApiResponse>('/api/notifications/read-all', { customerId });
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
 * Subscribe to push notifications with OneSignal
 */
export async function subscribeToOneSignal(data: {
  playerId: string;
  userId: string;
  userType: 'customer' | 'locksmith';
}): Promise<OneSignalSubscribeResponse> {
  return post<OneSignalSubscribeResponse>('/api/onesignal/subscribe', {
    playerId: data.playerId,
    userId: data.userId,
    userType: data.userType,
  });
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromOneSignal(data: {
  playerId: string;
  userId: string;
  userType: 'customer' | 'locksmith';
}): Promise<ApiResponse> {
  return post<ApiResponse>('/api/onesignal/unsubscribe', data);
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
  userType?: 'customer' | 'locksmith';
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
