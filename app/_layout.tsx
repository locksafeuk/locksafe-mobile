import '../global.css';
import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { InteractionManager } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';
import {
  nativePushNotificationService,
  useNativePushNotificationNavigation,
} from '../services/nativePushNotifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

const STRIPE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  Constants.expoConfig?.extra?.stripePublishableKey ||
  '';

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);
  const previousUserIdRef = useRef<string | null>(null);

  useNativePushNotificationNavigation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const currentUserId = user?.id || null;
    let cancelled = false;

    let interactionTask: { cancel?: () => void } | undefined;

    void (async () => {
      try {
        // Explicitly unregister previous user on logout/switch account
        if (!currentUserId && previousUserIdRef.current) {
          await nativePushNotificationService.unregisterUser(previousUserIdRef.current, 'locksmith');
        }
      } catch (error) {
        console.error('[Push][Native] Failed during push unregistration sync:', {
          error,
          currentUserId,
          previousUserId: previousUserIdRef.current,
        });
      }

      if (!currentUserId || user?.type !== 'locksmith') {
        previousUserIdRef.current = currentUserId;
        return;
      }

      interactionTask = InteractionManager.runAfterInteractions(() => {
        void (async () => {
          if (cancelled) {
            return;
          }

          try {
            // Initialize lazily for authenticated users only and only after UI settles.
            // This avoids startup races during app launch.
            await nativePushNotificationService.initialize();
            await nativePushNotificationService.registerUser(currentUserId, 'locksmith');
          } catch (error) {
            console.error('[Push][Native] Failed during deferred push initialization sync:', {
              error,
              currentUserId,
              userType: user?.type,
            });
          }
        })();
      });

      previousUserIdRef.current = currentUserId;
    })();

    return () => {
      cancelled = true;
      interactionTask?.cancel?.();
    };
  }, [user?.id, user?.type]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StripeProvider
          publishableKey={STRIPE_KEY}
          merchantIdentifier="merchant.uk.locksafe.app"
        >
          <QueryClientProvider client={queryClient}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#f8fafc' },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(locksmith)" options={{ headerShown: false }} />
            </Stack>
          </QueryClientProvider>
        </StripeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
