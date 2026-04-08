import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { subscribeToOneSignal, unsubscribeFromOneSignal } from './api';

// ==========================================
// Push Notification Service (Stub)
// OneSignal temporarily disabled for build compatibility
// ==========================================

// OneSignal App ID - should be configured in app.json or env
const ONESIGNAL_APP_ID =
  Constants.expoConfig?.extra?.oneSignalAppId || 'YOUR_ONESIGNAL_APP_ID';

// Notification types the app handles
export type NotificationType =
  // Customer notifications
  | 'LOCKSMITH_ASSIGNED'
  | 'LOCKSMITH_EN_ROUTE'
  | 'LOCKSMITH_ARRIVED'
  | 'QUOTE_READY'
  | 'WORK_COMPLETE'
  | 'JOB_CANCELLED'
  // Locksmith notifications
  | 'NEW_JOB_AVAILABLE'
  | 'JOB_ACCEPTED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'PAYOUT_SENT'
  | 'SIGNATURE_REMINDER';

export interface NotificationPayload {
  type: NotificationType;
  jobId?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

/**
 * Push Notification Service stub
 * OneSignal is temporarily disabled for build compatibility
 */
class PushNotificationService {
  private initialized = false;
  private playerId: string | null = null;
  private notificationOpenedHandlers: Array<
    (notification: NotificationPayload) => void
  > = [];
  private notificationReceivedHandlers: Array<
    (notification: NotificationPayload) => void
  > = [];

  /**
   * Initialize push notification service (stub)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    console.log('Push notification service initialized (OneSignal disabled)');
    this.initialized = true;
  }

  /**
   * Register the user (stub)
   */
  async registerUser(
    userId: string,
    userType: 'customer' | 'locksmith'
  ): Promise<boolean> {
    console.log(`Push notification user registration stub: ${userId}, ${userType}`);
    return true;
  }

  /**
   * Unregister the user (stub)
   */
  async unregisterUser(
    userId: string,
    userType: 'customer' | 'locksmith'
  ): Promise<void> {
    console.log(`Push notification user unregistration stub: ${userId}, ${userType}`);
  }

  /**
   * Update user tags (stub)
   */
  async updateTags(tags: Record<string, string>): Promise<void> {
    console.log('Push notification tags update stub:', tags);
  }

  /**
   * Get the current player ID
   */
  getPlayerId(): string | null {
    return this.playerId;
  }

  /**
   * Add a handler for when a notification is opened (tapped)
   */
  onNotificationOpened(
    handler: (notification: NotificationPayload) => void
  ): () => void {
    this.notificationOpenedHandlers.push(handler);
    return () => {
      this.notificationOpenedHandlers = this.notificationOpenedHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  /**
   * Add a handler for when a notification is received in foreground
   */
  onNotificationReceived(
    handler: (notification: NotificationPayload) => void
  ): () => void {
    this.notificationReceivedHandlers.push(handler);
    return () => {
      this.notificationReceivedHandlers =
        this.notificationReceivedHandlers.filter((h) => h !== handler);
    };
  }

  /**
   * Get the deep link path for a notification
   */
  getDeepLinkPath(notification: NotificationPayload): string {
    const { type, jobId } = notification;

    switch (type) {
      // Locksmith paths
      case 'LOCKSMITH_ASSIGNED':
      case 'LOCKSMITH_EN_ROUTE':
      case 'LOCKSMITH_ARRIVED':
      case 'QUOTE_READY':
      case 'WORK_COMPLETE':
      case 'JOB_CANCELLED':
        return jobId ? `/(locksmith)/job/${jobId}` : '/(locksmith)/(tabs)';
      case 'NEW_JOB_AVAILABLE':
        return '/(locksmith)/(tabs)/available';
      case 'JOB_ACCEPTED':
        return jobId ? `/(locksmith)/job/${jobId}` : '/(locksmith)/(tabs)';
      case 'QUOTE_ACCEPTED':
      case 'QUOTE_DECLINED':
        return jobId ? `/(locksmith)/job/${jobId}` : '/(locksmith)/(tabs)';
      case 'PAYOUT_SENT':
        return '/(locksmith)/(tabs)/earnings';
      case 'SIGNATURE_REMINDER':
        return jobId ? `/(locksmith)/job/${jobId}` : '/(locksmith)/(tabs)';

      default:
        return '/';
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// ==========================================
// React Hook for Push Notifications
// ==========================================

/**
 * React hook to handle push notification navigation
 */
export function usePushNotificationNavigation(): void {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = pushNotificationService.onNotificationOpened(
      (notification) => {
        const path = pushNotificationService.getDeepLinkPath(notification);
        router.push(path as Parameters<typeof router.push>[0]);
      }
    );

    return unsubscribe;
  }, [router]);
}
