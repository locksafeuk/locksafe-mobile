import { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';

export default function CustomerRegisterScreen() {
  const router = useRouter();
  const { registerCustomer, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    const success = await registerCustomer({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
    });
    if (success) {
      router.replace('/(customer)/(tabs)');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
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
            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Create account
            </Text>
            <Text className="text-slate-500 text-lg mb-8">
              Sign up to find trusted locksmiths
            </Text>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-medium mb-2">Full Name</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                <User size={20} color="#64748b" />
                <TextInput
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    clearError();
                  }}
                  placeholder="John Smith"
                  autoCapitalize="words"
                  className="flex-1 py-4 px-3 text-slate-900 text-base"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

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

            {/* Phone Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-medium mb-2">Phone Number</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                <Phone size={20} color="#64748b" />
                <TextInput
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    clearError();
                  }}
                  placeholder="07123 456789"
                  keyboardType="phone-pad"
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
                  placeholder="Min. 6 characters"
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

            {/* Confirm Password Input */}
            <View className="mb-8">
              <Text className="text-slate-700 font-medium mb-2">Confirm Password</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                <Lock size={20} color="#64748b" />
                <TextInput
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError();
                  }}
                  placeholder="Confirm password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  className="flex-1 py-4 px-3 text-slate-900 text-base"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Register Button */}
            <Pressable
              onPress={handleRegister}
              disabled={isLoading}
              className={`py-4 rounded-xl items-center ${
                isLoading ? 'bg-orange-300' : 'bg-orange-500 active:bg-orange-600'
              }`}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-semibold">Create Account</Text>
              )}
            </Pressable>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Already have an account? </Text>
              <Pressable onPress={() => router.push('/(auth)/customer-login')}>
                <Text className="text-orange-500 font-semibold">Sign in</Text>
              </Pressable>
            </View>

            {/* Terms */}
            <Text className="text-center text-slate-400 text-xs mt-6 mb-4">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
