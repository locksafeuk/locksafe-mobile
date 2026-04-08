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

// Notification types the app handles (locksmith-only)
export type NotificationType =
  | 'NEW_JOB_AVAILABLE'
  | 'JOB_ACCEPTED'
  | 'LOCKSMITH_ASSIGNED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'WORK_COMPLETE'
  | 'JOB_CANCELLED'
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
    userType: 'locksmith' = 'locksmith'
  ): Promise<boolean> {
    console.log(`Push notification user registration stub: ${userId}, ${userType}`);
    return true;
  }

  /**
   * Unregister the user (stub)
   */
  async unregisterUser(
    userId: string,
    userType: 'locksmith' = 'locksmith'
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
      case 'NEW_JOB_AVAILABLE':
        return '/(locksmith)/(tabs)/available';
      case 'PAYOUT_SENT':
        return '/(locksmith)/(tabs)/earnings';
      case 'JOB_ACCEPTED':
      case 'LOCKSMITH_ASSIGNED':
      case 'QUOTE_ACCEPTED':
      case 'QUOTE_DECLINED':
      case 'WORK_COMPLETE':
      case 'JOB_CANCELLED':
      case 'SIGNATURE_REMINDER':
        return jobId ? `/(locksmith)/job/${jobId}` : '/(locksmith)/(tabs)';
      default:
        return '/(locksmith)/(tabs)';
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
