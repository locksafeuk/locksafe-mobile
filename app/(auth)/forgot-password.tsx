import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Wrench } from 'lucide-react-native';
import { forgotPassword } from '../../services/api/auth';
import { useAuthStore } from '../../stores/authStore';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const clearAuthError = useAuthStore((state) => state.clearError);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    clearAuthError();

    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await forgotPassword(email.toLowerCase().trim());
      if (response.success) {
        setSuccessMessage(
          response.message ||
            'If an account exists for this email, a password reset link has been sent.'
        );
        return;
      }

      setError(response.error || 'Unable to start password reset. Please try again.');
    } catch (submitError: any) {
      const apiError = submitError?.response?.data?.error || submitError?.response?.data?.message;
      setError(
        apiError ||
          (submitError?.code === 'ERR_NETWORK'
            ? 'Unable to connect to server. Please check your internet connection.'
            : 'Unable to start password reset. Please try again.')
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          <View className="px-4 py-4">
            <Pressable
              onPress={() => {
                clearAuthError();
                router.back();
              }}
              className="w-10 h-10 items-center justify-center"
            >
              <ArrowLeft size={24} color="#0f172a" />
            </Pressable>
          </View>

          <View className="px-6 py-4">
            <View className="flex-row items-center mb-4">
              <View className="bg-slate-900 px-3 py-1 rounded-full flex-row items-center">
                <Wrench size={14} color="white" />
                <Text className="text-white text-sm font-medium ml-1">Professional</Text>
              </View>
            </View>

            <Text className="text-3xl font-bold text-slate-900 mb-2">Reset password</Text>
            <Text className="text-slate-500 text-lg mb-8">
              Enter your email and we&apos;ll send reset instructions.
            </Text>

            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}

            {successMessage && (
              <View className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                <Text className="text-green-700">{successMessage}</Text>
              </View>
            )}

            <View className="mb-6">
              <Text className="text-slate-700 font-medium mb-2">Email</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                <Mail size={20} color="#64748b" />
                <TextInput
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
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

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              className={`py-4 rounded-xl items-center ${
                isLoading ? 'bg-slate-600' : 'bg-slate-900 active:bg-slate-800'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">Send reset link</Text>
              )}
            </Pressable>

            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Remembered it? </Text>
              <Pressable
                onPress={() => {
                  clearAuthError();
                  router.replace('/(auth)/locksmith-login');
                }}
              >
                <Text className="text-slate-900 font-semibold">Back to Sign in</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
