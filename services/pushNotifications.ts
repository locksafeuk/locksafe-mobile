import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  subscribeToOneSignal,
  unsubscribeFromOneSignal,
} from './api';

const ONESIGNAL_APP_ID =
  Constants.expoConfig?.extra?.oneSignalAppId || process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || 'cd19d270-4a74-4bdf-b534-3287cfb8b4e4';

export type NotificationType =
  | 'NEW_JOB_AVAILABLE'
  | 'NEW_JOB_ASSIGNED'
  | 'JOB_ACCEPTED'
  | 'JOB_EN_ROUTE'
  | 'JOB_ARRIVED'
  | 'JOB_COMPLETED'
  | 'JOB_STATUS_CHANGED'
  | 'NEW_MESSAGE'
  | 'PAYMENT_RECEIVED'
  | 'PAYOUT_SENT'
  | 'LOCKSMITH_ASSIGNED'
  | 'QUOTE_ACCEPTED'
  | 'QUOTE_DECLINED'
  | 'WORK_COMPLETE'
  | 'JOB_CANCELLED'
  | 'SIGNATURE_REMINDER'
  | 'GENERAL_ALERT';

export interface NotificationPayload {
  type: NotificationType;
  jobId?: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

type OneSignalModule = typeof import('react-native-onesignal');

type OneSignalClickEvent = {
  notification?: {
    title?: string;
    body?: string;
    additionalData?: Record<string, unknown>;
  };
  result?: {
    url?: string;
    actionId?: string;
  };
};

type OneSignalForegroundEvent = {
  notification?: {
    title?: string;
    body?: string;
    additionalData?: Record<string, unknown>;
    display?: () => void;
  };
  preventDefault?: () => void;
};

class PushNotificationService {
  private initialized = false;
  private oneSignal: OneSignalModule['OneSignal'] | null = null;
  private playerId: string | null = null;
  private currentUserId: string | null = null;
  private notificationOpenedHandlers: Array<(notification: NotificationPayload) => void> = [];
  private notificationReceivedHandlers: Array<(notification: NotificationPayload) => void> = [];
  private pushSubscriptionListener?: (event: any) => void;

  private parseNotificationType(rawType: unknown): NotificationType {
    if (!rawType || typeof rawType !== 'string') {
      return 'GENERAL_ALERT';
    }

    const normalized = rawType.toUpperCase().trim();

    const supportedTypes: NotificationType[] = [
      'NEW_JOB_AVAILABLE',
      'NEW_JOB_ASSIGNED',
      'JOB_ACCEPTED',
      'JOB_EN_ROUTE',
      'JOB_ARRIVED',
      'JOB_COMPLETED',
      'JOB_STATUS_CHANGED',
      'NEW_MESSAGE',
      'PAYMENT_RECEIVED',
      'PAYOUT_SENT',
      'LOCKSMITH_ASSIGNED',
      'QUOTE_ACCEPTED',
      'QUOTE_DECLINED',
      'WORK_COMPLETE',
      'JOB_CANCELLED',
      'SIGNATURE_REMINDER',
      'GENERAL_ALERT',
    ];

    return supportedTypes.includes(normalized as NotificationType)
      ? (normalized as NotificationType)
      : 'GENERAL_ALERT';
  }

  private mapOneSignalEventToPayload(event: OneSignalClickEvent | OneSignalForegroundEvent): NotificationPayload {
    const additionalData = (event.notification?.additionalData || {}) as Record<string, unknown>;
    const dataType = additionalData.type || additionalData.notificationType || additionalData.eventType;

    const jobIdRaw =
      additionalData.jobId || additionalData.job_id || additionalData.id || additionalData.referenceId;

    return {
      type: this.parseNotificationType(dataType),
      jobId: typeof jobIdRaw === 'string' ? jobIdRaw : undefined,
      title: event.notification?.title || 'LockSafe Update',
      body: event.notification?.body || 'You have a new update.',
      data: additionalData,
    };
  }

  private async getPlayerIdFromSDK(): Promise<string | null> {
    if (!this.oneSignal) return null;

    try {
      const id = await this.oneSignal.User.pushSubscription.getIdAsync();
      if (id) {
        this.playerId = id;
      }
      return id || null;
    } catch (error) {
      console.error('[Push] Failed to get OneSignal player ID:', error);
      return null;
    }
  }

  private async syncPlayerIdWithBackend(userId: string): Promise<boolean> {
    const playerId = this.playerId || (await this.getPlayerIdFromSDK());

    if (!playerId) {
      console.warn('[Push] Player ID not available yet; backend sync deferred.');
      return false;
    }

    try {
      await subscribeToOneSignal({
        playerId,
        userId,
        userType: 'locksmith',
      });
      return true;
    } catch (error) {
      console.error('[Push] Failed to sync OneSignal player ID with backend:', error);
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (Platform.OS === 'web') {
      console.log('[Push] OneSignal disabled on web platform.');
      this.initialized = true;
      return;
    }

    if (!ONESIGNAL_APP_ID || ONESIGNAL_APP_ID === 'YOUR_ONESIGNAL_APP_ID') {
      console.warn('[Push] Missing OneSignal App ID. Push notifications are disabled.');
      this.initialized = true;
      return;
    }

    try {
      const oneSignalModule = await import('react-native-onesignal');
      this.oneSignal = oneSignalModule.OneSignal;

      this.oneSignal.initialize(ONESIGNAL_APP_ID);
      this.oneSignal.Notifications.requestPermission(true).catch(() => {
        // Permission prompt may be denied by user; app should keep working.
      });

      this.oneSignal.Notifications.addEventListener('click', (event) => {
        const payload = this.mapOneSignalEventToPayload(event as unknown as OneSignalClickEvent);
        this.notificationOpenedHandlers.forEach((handler) => handler(payload));
      });

      this.oneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
        const foregroundEvent = event as unknown as OneSignalForegroundEvent;
        const payload = this.mapOneSignalEventToPayload(foregroundEvent);

        // Ensure system banner still appears while app is foregrounded.
        foregroundEvent.preventDefault?.();
        foregroundEvent.notification?.display?.();

        this.notificationReceivedHandlers.forEach((handler) => handler(payload));
      });

      this.pushSubscriptionListener = async () => {
        await this.getPlayerIdFromSDK();
        if (this.currentUserId) {
          await this.syncPlayerIdWithBackend(this.currentUserId);
        }
      };

      this.oneSignal.User.pushSubscription.addEventListener('change', this.pushSubscriptionListener);

      await this.getPlayerIdFromSDK();

      this.initialized = true;
      console.log('[Push] OneSignal initialized successfully.');
    } catch (error) {
      console.error('[Push] OneSignal initialization failed:', error);
      // Mark as initialized to avoid repeated crashes/loops.
      this.initialized = true;
    }
  }

  async registerUser(userId: string, userType: 'locksmith' = 'locksmith'): Promise<boolean> {
    if (userType !== 'locksmith') {
      console.warn('[Push] Non-locksmith user type ignored in locksmith app.');
      return false;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    if (Platform.OS === 'web' || !this.oneSignal) {
      return false;
    }

    this.currentUserId = userId;

    try {
      this.oneSignal.login(userId);
      this.oneSignal.User.addTag('user_type', 'locksmith');
      this.oneSignal.User.addTag('platform', Platform.OS);

      return await this.syncPlayerIdWithBackend(userId);
    } catch (error) {
      console.error('[Push] Failed to register user with OneSignal:', error);
      return false;
    }
  }

  async unregisterUser(userId: string, userType: 'locksmith' = 'locksmith'): Promise<void> {
    if (userType !== 'locksmith') {
      return;
    }

    if (Platform.OS === 'web') {
      this.currentUserId = null;
      this.playerId = null;
      return;
    }

    try {
      if (this.playerId) {
        await unsubscribeFromOneSignal({
          playerId: this.playerId,
          userId,
          userType: 'locksmith',
        });
      }
    } catch (error) {
      console.error('[Push] Failed to unsubscribe player from backend:', error);
    }

    try {
      this.oneSignal?.logout();
    } catch (error) {
      console.error('[Push] Failed to logout OneSignal user:', error);
    }

    this.currentUserId = null;
    this.playerId = null;
  }

  async updateTags(tags: Record<string, string>): Promise<void> {
    if (Platform.OS === 'web' || !this.oneSignal) {
      return;
    }

    try {
      this.oneSignal.User.addTags(tags);
    } catch (error) {
      console.error('[Push] Failed to update tags:', error);
    }
  }

  getPlayerId(): string | null {
    return this.playerId;
  }

  onNotificationOpened(handler: (notification: NotificationPayload) => void): () => void {
    this.notificationOpenedHandlers.push(handler);
    return () => {
      this.notificationOpenedHandlers = this.notificationOpenedHandlers.filter((h) => h !== handler);
    };
  }

  onNotificationReceived(handler: (notification: NotificationPayload) => void): () => void {
    this.notificationReceivedHandlers.push(handler);
    return () => {
      this.notificationReceivedHandlers = this.notificationReceivedHandlers.filter((h) => h !== handler);
    };
  }

  getDeepLinkPath(notification: NotificationPayload): string {
    const { type, jobId } = notification;

    switch (type) {
      case 'NEW_JOB_AVAILABLE':
        return '/(locksmith)/(tabs)/available';
      case 'PAYOUT_SENT':
      case 'PAYMENT_RECEIVED':
        return '/(locksmith)/(tabs)/earnings';
      case 'NEW_JOB_ASSIGNED':
      case 'JOB_ACCEPTED':
      case 'JOB_EN_ROUTE':
      case 'JOB_ARRIVED':
      case 'JOB_COMPLETED':
      case 'JOB_STATUS_CHANGED':
      case 'NEW_MESSAGE':
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

export function usePushNotificationNavigation(): void {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = pushNotificationService.onNotificationOpened((notification) => {
      const path = pushNotificationService.getDeepLinkPath(notification);
      router.push(path as Parameters<typeof router.push>[0]);
    });

    return unsubscribe;
  }, [router]);
}
