import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { subscribeToOneSignal, unsubscribeFromOneSignal } from './api';

// ==========================================
// OneSignal Push Notification Service
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

// Type definitions for OneSignal (without full SDK dependency)
interface OneSignalNotification {
  notificationId: string;
  body: string;
  title: string;
  additionalData?: Record<string, unknown>;
}

/**
 * Push Notification Service for handling OneSignal integration
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
   * Initialize OneSignal SDK
   * Call this early in app lifecycle (usually in App.tsx or _layout.tsx)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Note: In production, you'd use the actual OneSignal SDK
      // For now, we set up the structure and log
      console.log('Initializing OneSignal with App ID:', ONESIGNAL_APP_ID);

      // Dynamic import of OneSignal to avoid build issues if not installed
      try {
        const OneSignal = await import('react-native-onesignal');

        // Initialize OneSignal
        OneSignal.default.initialize(ONESIGNAL_APP_ID);

        // Request notification permission
        const granted =
          await OneSignal.default.Notifications.requestPermission(true);
        console.log('Push notification permission:', granted);

        // Get player ID
        this.playerId = await OneSignal.default.User.getOnesignalId();
        console.log('OneSignal Player ID:', this.playerId);

        // Set up notification handlers
        OneSignal.default.Notifications.addEventListener(
          'click',
          (event: { notification: OneSignalNotification }) => {
            this.handleNotificationOpened(event.notification);
          }
        );

        OneSignal.default.Notifications.addEventListener(
          'foregroundWillDisplay',
          (event: {
            notification: OneSignalNotification;
            preventDefault: () => void;
          }) => {
            this.handleNotificationReceived(event.notification);
          }
        );

        this.initialized = true;
      } catch (importError) {
        console.log(
          'OneSignal SDK not available, push notifications disabled'
        );
        // Continue without push notifications
        this.initialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize OneSignal:', error);
    }
  }

  /**
   * Register the user with OneSignal and our backend
   */
  async registerUser(
    userId: string,
    userType: 'customer' | 'locksmith'
  ): Promise<boolean> {
    if (!this.playerId) {
      console.warn('No OneSignal player ID available');
      return false;
    }

    try {
      // Dynamic import
      try {
        const OneSignal = await import('react-native-onesignal');

        // Set external user ID
        await OneSignal.default.login(userId);

        // Add user tags
        await OneSignal.default.User.addTags({
          user_type: userType,
          platform: Platform.OS,
        });
      } catch (e) {
        // OneSignal not available
      }

      // Register with our backend
      const response = await subscribeToOneSignal({
        playerId: this.playerId,
        userId,
        userType,
      });

      return response.success;
    } catch (error) {
      console.error('Failed to register user with OneSignal:', error);
      return false;
    }
  }

  /**
   * Unregister the user from OneSignal
   */
  async unregisterUser(
    userId: string,
    userType: 'customer' | 'locksmith'
  ): Promise<void> {
    if (!this.playerId) return;

    try {
      // Dynamic import
      try {
        const OneSignal = await import('react-native-onesignal');
        await OneSignal.default.logout();
      } catch (e) {
        // OneSignal not available
      }

      // Unregister from our backend
      await unsubscribeFromOneSignal({
        playerId: this.playerId,
        userId,
        userType,
      });
    } catch (error) {
      console.error('Failed to unregister from OneSignal:', error);
    }
  }

  /**
   * Update user tags (e.g., after availability change)
   */
  async updateTags(tags: Record<string, string>): Promise<void> {
    try {
      const OneSignal = await import('react-native-onesignal');
      await OneSignal.default.User.addTags(tags);
    } catch (error) {
      console.error('Failed to update OneSignal tags:', error);
    }
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
   * Handle notification opened
   */
  private handleNotificationOpened(
    notification: OneSignalNotification
  ): void {
    const payload = this.parseNotification(notification);
    this.notificationOpenedHandlers.forEach((handler) => handler(payload));
  }

  /**
   * Handle notification received in foreground
   */
  private handleNotificationReceived(
    notification: OneSignalNotification
  ): void {
    const payload = this.parseNotification(notification);
    this.notificationReceivedHandlers.forEach((handler) => handler(payload));
  }

  /**
   * Parse OneSignal notification to our format
   */
  private parseNotification(
    notification: OneSignalNotification
  ): NotificationPayload {
    const additionalData = notification.additionalData || {};

    return {
      type: (additionalData.type as NotificationType) || 'NEW_JOB_AVAILABLE',
      jobId: additionalData.jobId as string | undefined,
      title: notification.title || 'LockSafe',
      body: notification.body || '',
      data: additionalData,
    };
  }

  /**
   * Get the deep link path for a notification
   */
  getDeepLinkPath(notification: NotificationPayload): string {
    const { type, jobId } = notification;

    switch (type) {
      // Customer paths
      case 'LOCKSMITH_ASSIGNED':
      case 'LOCKSMITH_EN_ROUTE':
      case 'LOCKSMITH_ARRIVED':
        return jobId ? `/(customer)/job/${jobId}` : '/(customer)/(tabs)';
      case 'QUOTE_READY':
        return jobId
          ? `/(customer)/job/${jobId}?tab=quote`
          : '/(customer)/(tabs)';
      case 'WORK_COMPLETE':
        return jobId
          ? `/(customer)/job/${jobId}?tab=sign`
          : '/(customer)/(tabs)';
      case 'JOB_CANCELLED':
        return '/(customer)/(tabs)/jobs';

      // Locksmith paths
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

import { useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';

/**
 * React hook to handle push notification navigation
 */
export function usePushNotificationNavigation(): void {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = pushNotificationService.onNotificationOpened(
      (notification) => {
        const path = pushNotificationService.getDeepLinkPath(notification);
        router.push(path as any);
      }
    );

    return unsubscribe;
  }, [router]);
}
