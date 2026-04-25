import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  Switch,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Wrench } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export default function LocksmithLoginScreen() {
  const router = useRouter();
  const {
    loginLocksmith,
    isLoading,
    error,
    clearError,
    rememberMe,
    setRememberMe,
  } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    clearError();

    return () => {
      clearError();
    };
  }, [clearError]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    const success = await loginLocksmith(email.toLowerCase().trim(), password, rememberMe);
    if (success) {
      router.replace('/(locksmith)/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 100}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="px-4 py-4">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 items-center justify-center"
            >
              <ArrowLeft size={24} color="#0f172a" />
            </Pressable>
          </View>

          <View className="px-6 py-4">
            {/* Pro Badge */}
            <View className="flex-row items-center mb-4">
              <View className="bg-slate-900 px-3 py-1 rounded-full flex-row items-center">
                <Wrench size={14} color="white" />
                <Text className="text-white text-sm font-medium ml-1">Professional</Text>
              </View>
            </View>

            <Text className="text-3xl font-bold text-slate-900 mb-2">Welcome back</Text>
            <Text className="text-slate-500 text-lg mb-8">
              Sign in to your LockSafe account
            </Text>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-medium mb-2">Email</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                <Mail size={20} color="#64748b" />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError();
                  }}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  className="flex-1 py-4 px-3 text-slate-900 text-base"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-medium mb-2">Password</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                <Lock size={20} color="#64748b" />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError();
                  }}
                  placeholder="Enter password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 py-4 px-3 text-slate-900 text-base"
                  placeholderTextColor="#94a3b8"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <EyeOff size={20} color="#64748b" />
                  ) : (
                    <Eye size={20} color="#64748b" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Remember Me */}
            <View className="flex-row items-center justify-between bg-slate-50 rounded-xl px-4 py-3 mb-6">
              <View className="flex-1 pr-3">
                <Text className="text-slate-900 font-medium">Remember me</Text>
                <Text className="text-slate-500 text-xs mt-1">
                  Keep me signed in on this device
                </Text>
              </View>
              <Switch
                value={rememberMe}
                onValueChange={(value) => {
                  clearError();
                  void setRememberMe(value);
                }}
                trackColor={{ false: '#cbd5e1', true: '#0f172a' }}
                thumbColor="#ffffff"
              />
            </View>

            {/* Forgot Password */}
            <Pressable
              className="mb-8"
              onPress={() => {
                clearError();
                router.push('/(auth)/forgot-password');
              }}
            >
              <Text className="text-slate-900 text-center font-medium">Forgot password?</Text>
            </Pressable>

            {/* Login Button */}
            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              className={`py-4 rounded-xl items-center ${
                isLoading ? 'bg-slate-600' : 'bg-slate-900 active:bg-slate-800'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">Sign In</Text>
              )}
            </Pressable>

            {/* Register Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">New to LockSafe? </Text>
              <Pressable
                onPress={() => {
                  clearError();
                  router.push('/(auth)/locksmith-register');
                }}
              >
                <Text className="text-slate-900 font-semibold">Join as Partner</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
