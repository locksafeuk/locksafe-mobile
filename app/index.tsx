import { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Wrench, Shield } from 'lucide-react-native';
import { useAuthStore } from '../stores/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const isLoading = !isInitialized;
  const isAuthenticated = user !== null;
  const userType = user?.type;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (userType === 'customer') {
        router.replace('/(customer)/(tabs)');
      } else if (userType === 'locksmith') {
        router.replace('/(locksmith)/(tabs)');
      }
    }
  }, [isLoading, isAuthenticated, userType, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-slate-500">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-12 mt-8">
          <View className="w-20 h-20 bg-orange-500 rounded-2xl items-center justify-center mb-4">
            <Lock size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-slate-900">LockSafe</Text>
          <Text className="text-lg text-slate-500 mt-2">
            UK's Trusted Locksmith Platform
          </Text>
        </View>

        {/* Features */}
        <View className="mb-12">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
              <Shield size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Verified Professionals</Text>
              <Text className="text-slate-500 text-sm">All locksmiths are ID-verified & insured</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Lock size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Transparent Pricing</Text>
              <Text className="text-slate-500 text-sm">See full quote before work starts</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
              <Wrench size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Real-Time Tracking</Text>
              <Text className="text-slate-500 text-sm">Track your locksmith's location live</Text>
            </View>
          </View>
        </View>

        {/* Role Selection */}
        <View className="flex-1 justify-end">
          <Text className="text-center text-slate-500 mb-4">I am a...</Text>

          <Pressable
            onPress={() => router.push('/(auth)/customer-login')}
            className="bg-orange-500 py-4 px-6 rounded-xl mb-3 active:bg-orange-600"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Customer
            </Text>
            <Text className="text-orange-100 text-center text-sm">
              I need a locksmith
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/locksmith-login')}
            className="bg-slate-900 py-4 px-6 rounded-xl active:bg-slate-800"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Locksmith
            </Text>
            <Text className="text-slate-400 text-center text-sm">
              I'm a professional locksmith
            </Text>
          </Pressable>

          <Text className="text-center text-slate-400 text-xs mt-6">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
