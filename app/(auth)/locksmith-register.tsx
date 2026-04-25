import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Platform,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, User, Building, Mail, Phone, Lock, Eye, EyeOff, Wrench } from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { LocationService } from '../../services/location';

export default function LocksmithRegisterScreen() {
  const router = useRouter();
  const { registerLocksmith, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);


  useEffect(() => {
    clearError();

    return () => {
      clearError();
    };
  }, [clearError]);

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

    // Get location for coverage area
    setGettingLocation(true);
    const location = await LocationService.getCurrentPosition();
    setGettingLocation(false);

    const success = await registerLocksmith({
      name: name.trim(),
      companyName: companyName.trim() || undefined,
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      password,
      baseLat: location?.lat,
      baseLng: location?.lng,
      coverageRadius: 10, // Default 10 miles
      services: ['emergency', 'residential'],
    });

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
                <Text className="text-white text-sm font-medium ml-1">
                  Professional
                </Text>
              </View>
            </View>

            <Text className="text-3xl font-bold text-slate-900 mb-2">
              Join as Partner
            </Text>
            <Text className="text-slate-500 text-lg mb-8">
              Create your locksmith account
            </Text>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <Text className="text-red-600">{error}</Text>
              </View>
            )}

            {/* Name Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-medium mb-2">Your Name *</Text>
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

            {/* Company Name Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-medium mb-2">Company Name</Text>
              <View className="flex-row items-center bg-slate-100 rounded-xl px-4">
                <Building size={20} color="#64748b" />
                <TextInput
                  value={companyName}
                  onChangeText={(text) => {
                    setCompanyName(text);
                    clearError();
                  }}
                  placeholder="Optional"
                  autoCapitalize="words"
                  className="flex-1 py-4 px-3 text-slate-900 text-base"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-slate-700 font-medium mb-2">Email *</Text>
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
              <Text className="text-slate-700 font-medium mb-2">Phone Number *</Text>
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
              <Text className="text-slate-700 font-medium mb-2">Password *</Text>
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
              <Text className="text-slate-700 font-medium mb-2">Confirm Password *</Text>
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
              disabled={isLoading || gettingLocation}
              className={`py-4 rounded-xl items-center ${
                isLoading || gettingLocation ? 'bg-slate-600' : 'bg-slate-900 active:bg-slate-800'
              }`}
            >
              {isLoading || gettingLocation ? (
                <View className="flex-row items-center">
                  <ActivityIndicator color="white" />
                  <Text className="text-white ml-2">
                    {gettingLocation ? 'Getting location...' : 'Creating account...'}
                  </Text>
                </View>
              ) : (
                <Text className="text-white text-lg font-semibold">Create Account</Text>
              )}
            </Pressable>

            {/* Login Link */}
            <View className="flex-row justify-center mt-6">
              <Text className="text-slate-500">Already a partner? </Text>
              <Pressable
                onPress={() => {
                  clearError();
                  router.push('/(auth)/locksmith-login');
                }}
              >
                <Text className="text-slate-900 font-semibold">Sign in</Text>
              </Pressable>
            </View>

            {/* Terms */}
            <Text className="text-center text-slate-400 text-xs mt-6 mb-4">
              By creating an account, you agree to our Partner Terms and Commission Structure
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
