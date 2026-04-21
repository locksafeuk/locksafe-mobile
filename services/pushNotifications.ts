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
  private initializingPromise: Promise<void> | null = null;
  private oneSignal: OneSignalModule['OneSignal'] | null = null;
  private playerId: string | null = null;
  private currentUserId: string | null = null;
  private notificationOpenedHandlers: Array<(notification: NotificationPayload) => void> = [];
  private notificationReceivedHandlers: Array<(notification: NotificationPayload) => void> = [];
  private pushSubscriptionListener?: (event: any) => void;

  private logOneSignalError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
    const parsedError =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    console.error(`[Push] ${context}`, {
      error: parsedError,
      ...(metadata || {}),
    });
  }

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
      this.logOneSignalError('Failed to get OneSignal player ID', error);
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
      this.logOneSignalError('Failed to sync OneSignal player ID with backend', error, {
        userId,
        playerId,
      });
      return false;
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initializingPromise) {
      await this.initializingPromise;
      return;
    }

    this.initializingPromise = (async () => {
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
      } catch (error) {
        this.logOneSignalError('Failed to import OneSignal SDK during initialize()', error);
        this.initialized = true;
        return;
      }

      if (!this.oneSignal) {
        console.warn('[Push] OneSignal SDK import returned no module instance.');
        this.initialized = true;
        return;
      }

      try {
        this.oneSignal.initialize(ONESIGNAL_APP_ID);
      } catch (error) {
        this.logOneSignalError('OneSignal.initialize failed', error, {
          appIdConfigured: Boolean(ONESIGNAL_APP_ID),
        });
        this.initialized = true;
        return;
      }

      try {
        this.oneSignal.Notifications.addEventListener('click', (event) => {
          try {
            const payload = this.mapOneSignalEventToPayload(event as unknown as OneSignalClickEvent);
            this.notificationOpenedHandlers.forEach((handler) => {
              try {
                handler(payload);
              } catch (handlerError) {
                this.logOneSignalError('Notification opened handler failed', handlerError, {
                  notificationType: payload.type,
                  jobId: payload.jobId,
                });
              }
            });
          } catch (eventError) {
            this.logOneSignalError('Failed to process OneSignal click event', eventError);
          }
        });
      } catch (error) {
        this.logOneSignalError('Failed to add OneSignal click event listener', error);
      }

      try {
        this.oneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
          try {
            const foregroundEvent = event as unknown as OneSignalForegroundEvent;
            const payload = this.mapOneSignalEventToPayload(foregroundEvent);

            // Ensure system banner still appears while app is foregrounded.
            try {
              foregroundEvent.preventDefault?.();
              foregroundEvent.notification?.display?.();
            } catch (displayError) {
              this.logOneSignalError('Failed to display foreground notification', displayError, {
                notificationType: payload.type,
                jobId: payload.jobId,
              });
            }

            this.notificationReceivedHandlers.forEach((handler) => {
              try {
                handler(payload);
              } catch (handlerError) {
                this.logOneSignalError('Notification received handler failed', handlerError, {
                  notificationType: payload.type,
                  jobId: payload.jobId,
                });
              }
            });
          } catch (eventError) {
            this.logOneSignalError('Failed to process OneSignal foreground event', eventError);
          }
        });
      } catch (error) {
        this.logOneSignalError('Failed to add OneSignal foreground listener', error);
      }

      this.pushSubscriptionListener = async () => {
        try {
          await this.getPlayerIdFromSDK();
          if (this.currentUserId) {
            await this.syncPlayerIdWithBackend(this.currentUserId);
          }
        } catch (error) {
          this.logOneSignalError('Push subscription change handler failed', error, {
            currentUserId: this.currentUserId,
          });
        }
      };

      try {
        this.oneSignal.User.pushSubscription.addEventListener('change', this.pushSubscriptionListener);
      } catch (error) {
        this.logOneSignalError('Failed to add push subscription change listener', error);
      }

      await this.getPlayerIdFromSDK();

      this.initialized = true;
      console.log('[Push] OneSignal initialized successfully (permission request deferred).');
    })();

    try {
      await this.initializingPromise;
    } catch (error) {
      this.logOneSignalError('OneSignal initialization promise failed', error);
      this.initialized = true;
    } finally {
      this.initializingPromise = null;
    }
  }

  async requestPermission(fallbackToSettings = true): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('[Push] requestPermission skipped on web platform.');
      return false;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    if (!this.oneSignal) {
      console.warn('[Push] requestPermission called before OneSignal SDK became available.');
      return false;
    }

    try {
      const granted = await this.oneSignal.Notifications.requestPermission(fallbackToSettings);
      console.log('[Push] OneSignal permission result:', {
        granted,
        fallbackToSettings,
      });
      return Boolean(granted);
    } catch (error) {
      this.logOneSignalError('OneSignal permission request failed', error, {
        fallbackToSettings,
      });
      return false;
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
      this.logOneSignalError('Failed to register user with OneSignal', error, {
        userId,
        userType,
      });
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
      this.logOneSignalError('Failed to unsubscribe player from backend', error, {
        userId,
        userType,
        playerId: this.playerId,
      });
    }

    try {
      this.oneSignal?.logout();
    } catch (error) {
      this.logOneSignalError('Failed to logout OneSignal user', error, {
        userId,
      });
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
      this.logOneSignalError('Failed to update tags', error, {
        tags,
      });
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
