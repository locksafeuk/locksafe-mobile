import { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Wrench, Shield, Star, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../stores/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { user, isInitialized } = useAuthStore();

  const isLoading = !isInitialized;
  const isAuthenticated = user !== null;

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(locksmith)/(tabs)');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0f172a" />
        <Text className="mt-4 text-slate-500">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 py-8">
        {/* Header */}
        <View className="items-center mb-10 mt-8">
          <View className="w-20 h-20 bg-slate-900 rounded-2xl items-center justify-center mb-4">
            <Lock size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-slate-900">LockSafe</Text>
          <Text className="text-base text-slate-500 mt-2">
            Professional Locksmith Platform
          </Text>
        </View>

        {/* Features */}
        <View className="mb-10">
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Wrench size={20} color="#3b82f6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Manage Your Jobs</Text>
              <Text className="text-slate-500 text-sm">Accept jobs, submit quotes & track earnings</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-4">
              <MapPin size={20} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Jobs In Your Area</Text>
              <Text className="text-slate-500 text-sm">Get matched with nearby customer requests</Text>
            </View>
          </View>
          <View className="flex-row items-center mb-5">
            <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-4">
              <Star size={20} color="#f97316" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Build Your Reputation</Text>
              <Text className="text-slate-500 text-sm">Earn ratings & grow your business</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-4">
              <Shield size={20} color="#8b5cf6" />
            </View>
            <View className="flex-1">
              <Text className="text-slate-900 font-semibold">Secure Payments</Text>
              <Text className="text-slate-500 text-sm">Get paid directly via Stripe Connect</Text>
            </View>
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="flex-1 justify-end">
          <Pressable
            onPress={() => router.push('/(auth)/locksmith-login')}
            className="bg-slate-900 py-4 px-6 rounded-xl mb-3 active:bg-slate-800"
          >
            <Text className="text-white text-center text-lg font-semibold">
              Sign In
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/locksmith-register')}
            className="bg-white border-2 border-slate-900 py-4 px-6 rounded-xl active:bg-slate-50"
          >
            <Text className="text-slate-900 text-center text-lg font-semibold">
              Join as Partner
            </Text>
          </Pressable>

          <Text className="text-center text-slate-400 text-xs mt-6">
            By continuing, you agree to our Partner Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
