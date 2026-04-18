import '../global.css';
import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import { useAuthStore } from '../stores/authStore';
import {
  pushNotificationService,
  usePushNotificationNavigation,
} from '../services/pushNotifications';

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

  usePushNotificationNavigation();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const currentUserId = user?.id || null;

    const syncPushRegistration = async () => {
      try {
        if (currentUserId && user?.type === 'locksmith') {
          // Initialize lazily for authenticated users only.
          // This avoids startup races during app launch.
          await pushNotificationService.registerUser(currentUserId, 'locksmith');
        }

        // Explicitly unregister previous user on logout/switch account
        if (!currentUserId && previousUserIdRef.current) {
          await pushNotificationService.unregisterUser(previousUserIdRef.current, 'locksmith');
        }

        previousUserIdRef.current = currentUserId;
      } catch (error) {
        console.error('[Push] Failed during push registration sync:', error);
      }
    };

    void syncPushRegistration();
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
