import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthStore } from '../../stores/authStore';

export default function LocksmithLayout() {
  const user = useAuthStore((state) => state.user);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  // Wait for auth bootstrap to finish before deciding access.
  if (!isInitialized) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0f172a" />
        <Text className="mt-4 text-slate-500">Checking session...</Text>
      </View>
    );
  }

  // Strict route-level guard to block deep links for unauthenticated users.
  if (!user || user.type !== 'locksmith') {
    return <Redirect href="/(auth)/locksmith-login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#f8fafc' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="job/[id]" />
    </Stack>
  );
}
