import { Platform } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  registerNativePushToken,
  unregisterNativePushToken,
} from './api';

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

type NotificationSubscription = Notifications.EventSubscription;

class NativePushNotificationService {
  private initialized = false;
  private initializingPromise: Promise<void> | null = null;
  private currentUserId: string | null = null;
  private nativePushToken: string | null = null;
  private nativePushTokenType: string | null = null;
  private notificationOpenedHandlers: Array<(notification: NotificationPayload) => void> = [];
  private notificationReceivedHandlers: Array<(notification: NotificationPayload) => void> = [];
  private receivedSubscription: NotificationSubscription | null = null;
  private responseSubscription: NotificationSubscription | null = null;

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

  private mapDataToPayload(
    title: string | null | undefined,
    body: string | null | undefined,
    rawData: Record<string, unknown> | undefined
  ): NotificationPayload {
    const additionalData = rawData || {};
    const dataType = additionalData.type || additionalData.notificationType || additionalData.eventType;

    const jobIdRaw =
      additionalData.jobId || additionalData.job_id || additionalData.id || additionalData.referenceId;

    return {
      type: this.parseNotificationType(dataType),
      jobId: typeof jobIdRaw === 'string' ? jobIdRaw : undefined,
      title: title || 'LockSafe Update',
      body: body || 'You have a new update.',
      data: additionalData,
    };
  }

  private logPushError(context: string, error: unknown, metadata?: Record<string, unknown>): void {
    const parsedError =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;

    console.error(`[Push][Native] ${context}`, {
      error: parsedError,
      ...(metadata || {}),
    });
  }

  private attachNotificationListeners(): void {
    if (!this.receivedSubscription) {
      this.receivedSubscription = Notifications.addNotificationReceivedListener((event) => {
        try {
          const payload = this.mapDataToPayload(
            event.request.content.title,
            event.request.content.body,
            event.request.content.data as Record<string, unknown>
          );
          this.notificationReceivedHandlers.forEach((handler) => {
            try {
              handler(payload);
            } catch (handlerError) {
              this.logPushError('Foreground handler failed', handlerError, {
                notificationType: payload.type,
                jobId: payload.jobId,
              });
            }
          });
        } catch (eventError) {
          this.logPushError('Failed to process foreground notification event', eventError);
        }
      });
    }

    if (!this.responseSubscription) {
      this.responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const payload = this.mapDataToPayload(
            response.notification.request.content.title,
            response.notification.request.content.body,
            response.notification.request.content.data as Record<string, unknown>
          );
          this.notificationOpenedHandlers.forEach((handler) => {
            try {
              handler(payload);
            } catch (handlerError) {
              this.logPushError('Opened handler failed', handlerError, {
                notificationType: payload.type,
                jobId: payload.jobId,
              });
            }
          });
        } catch (eventError) {
          this.logPushError('Failed to process notification response event', eventError);
        }
      });
    }
  }

  private resolveTokenType(rawType: unknown): string {
    if (typeof rawType === 'string' && rawType.trim().length > 0) {
      return rawType.trim().toLowerCase();
    }
    return Platform.OS === 'android' ? 'fcm' : 'apns';
  }

  private async getNativePushTokenFromDevice(): Promise<{ token: string; tokenType: string } | null> {
    try {
      const nativeToken = await Notifications.getDevicePushTokenAsync();
      const token = typeof nativeToken.data === 'string' ? nativeToken.data.trim() : '';
      if (!token) {
        console.warn('[Push][Native] Device token call returned an empty token value.');
        return null;
      }

      const tokenType = this.resolveTokenType(nativeToken.type);

      console.log('[Push][Native] Device token acquired.', {
        platform: Platform.OS,
        tokenType,
        tokenLength: token.length,
      });

      return {
        token,
        tokenType,
      };
    } catch (error) {
      this.logPushError('Failed to read native push token from device', error, {
        platform: Platform.OS,
        hint:
          Platform.OS === 'android'
            ? 'Ensure google-services.json is configured in app config for Android FCM token generation.'
            : undefined,
      });
      return null;
    }
  }

  private async syncNativeTokenWithBackend(
    userId: string,
    overrideTokenType?: string
  ): Promise<boolean> {
    const token = this.nativePushToken;
    const tokenType = overrideTokenType || this.nativePushTokenType;

    if (!token || !tokenType) {
      console.warn('[Push][Native] No native token available; backend sync deferred.');
      return false;
    }

    try {
      await registerNativePushToken({
        userId,
        userType: 'locksmith',
        deviceToken: token,
        tokenType,
        platform: Platform.OS,
        deviceName: Device.modelName || null,
        isDevice: Device.isDevice,
      });
      return true;
    } catch (error) {
      this.logPushError('Failed to sync native token with backend', error, {
        userId,
        tokenType,
        platform: Platform.OS,
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
        console.log('[Push][Native] Push notifications disabled on web platform.');
        this.initialized = true;
        return;
      }

      if (!Device.isDevice) {
        console.warn('[Push][Native] Push registration skipped: physical device required.');
        this.initialized = true;
        return;
      }

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

      if (Platform.OS === 'android') {
        try {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#f97316',
          });
        } catch (error) {
          this.logPushError('Failed to configure Android notification channel', error);
        }
      }

      this.attachNotificationListeners();

      try {
        const lastResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastResponse?.notification) {
          const payload = this.mapDataToPayload(
            lastResponse.notification.request.content.title,
            lastResponse.notification.request.content.body,
            lastResponse.notification.request.content.data as Record<string, unknown>
          );
          this.notificationOpenedHandlers.forEach((handler) => {
            try {
              handler(payload);
            } catch (handlerError) {
              this.logPushError('Initial notification response handler failed', handlerError, {
                notificationType: payload.type,
                jobId: payload.jobId,
              });
            }
          });
          await Notifications.clearLastNotificationResponseAsync();
        }
      } catch (error) {
        this.logPushError('Failed to inspect last notification response', error);
      }

      this.initialized = true;
      console.log('[Push][Native] Native push notification service initialized.');
    })();

    try {
      await this.initializingPromise;
    } catch (error) {
      this.logPushError('Native push initialization promise failed', error);
      this.initialized = true;
    } finally {
      this.initializingPromise = null;
    }
  }

  async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const existing = await Notifications.getPermissionsAsync();
      let finalStatus = existing.status;

      if (existing.status !== 'granted') {
        const requested = await Notifications.requestPermissionsAsync({
          ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
          },
        });
        finalStatus = requested.status;
      }

      const granted = finalStatus === 'granted';
      console.log('[Push][Native] Notification permission status:', {
        granted,
        finalStatus,
      });
      return granted;
    } catch (error) {
      this.logPushError('Permission request failed', error);
      return false;
    }
  }

  async registerUser(userId: string, userType: 'locksmith' = 'locksmith'): Promise<boolean> {
    if (userType !== 'locksmith') {
      console.warn('[Push][Native] Non-locksmith user type ignored in locksmith app.');
      return false;
    }

    if (!this.initialized) {
      await this.initialize();
    }

    if (Platform.OS === 'web') {
      return false;
    }

    this.currentUserId = userId;

    const permissionGranted = await this.requestPermission();
    if (!permissionGranted) {
      console.warn('[Push][Native] Permission not granted; registration skipped.');
      return false;
    }

    const nativeToken = await this.getNativePushTokenFromDevice();
    if (!nativeToken) {
      return false;
    }

    this.nativePushToken = nativeToken.token;
    this.nativePushTokenType = nativeToken.tokenType;

    const tokenTypeCandidates = Array.from(
      new Set([
        nativeToken.tokenType,
        Platform.OS === 'android' ? 'fcm' : 'apns',
        Platform.OS === 'android' ? 'fcmv1' : 'apns2',
      ])
    );

    for (const tokenTypeCandidate of tokenTypeCandidates) {
      const synced = await this.syncNativeTokenWithBackend(userId, tokenTypeCandidate);
      if (synced) {
        this.nativePushTokenType = tokenTypeCandidate;
        return true;
      }
    }

    this.logPushError('Failed to register native token with any tokenType variant', new Error('Push registration failed after retries'), {
      userId,
      tokenTypesTried: tokenTypeCandidates,
      platform: Platform.OS,
    });

    return false;
  }

  async unregisterUser(userId: string, userType: 'locksmith' = 'locksmith'): Promise<void> {
    if (userType !== 'locksmith') {
      return;
    }

    const token = this.nativePushToken;
    const tokenType = this.nativePushTokenType;

    try {
      if (token && tokenType) {
        await unregisterNativePushToken({
          userId,
          userType: 'locksmith',
          deviceToken: token,
          tokenType,
          platform: Platform.OS,
        });
      }
    } catch (error) {
      this.logPushError('Failed to unregister native token from backend', error, {
        userId,
        tokenType,
        platform: Platform.OS,
      });
    }

    this.currentUserId = null;
    this.nativePushToken = null;
    this.nativePushTokenType = null;
  }

  getDeviceToken(): string | null {
    return this.nativePushToken;
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

export const nativePushNotificationService = new NativePushNotificationService();

export function useNativePushNotificationNavigation(): void {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = nativePushNotificationService.onNotificationOpened((notification) => {
      const path = nativePushNotificationService.getDeepLinkPath(notification);
      router.push(path as Parameters<typeof router.push>[0]);
    });

    return unsubscribe;
  }, [router]);
}
