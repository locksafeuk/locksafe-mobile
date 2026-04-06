import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Lock,
  Key,
  Home,
  Car,
  Building,
  Wrench,
  AlertTriangle,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../stores/authStore';
import { createJob } from '../../services/api/jobs';
import { LocationService } from '../../services/location';
import type { ProblemType, PropertyType } from '../../types';

const PROBLEM_TYPES: { value: ProblemType; label: string; icon: typeof Lock }[] = [
  { value: 'lockout', label: 'Locked Out', icon: Lock },
  { value: 'broken', label: 'Broken Lock', icon: Wrench },
  { value: 'key-stuck', label: 'Key Stuck', icon: Key },
  { value: 'snapped-key', label: 'Snapped Key', icon: Key },
  { value: 'lock-change', label: 'Lock Change', icon: Lock },
  { value: 'burglary', label: 'Burglary Damage', icon: AlertTriangle },
  { value: 'car', label: 'Car Lockout', icon: Car },
];

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: typeof Home }[] = [
  { value: 'house', label: 'House', icon: Home },
  { value: 'flat', label: 'Flat', icon: Building },
  { value: 'commercial', label: 'Commercial', icon: Building },
  { value: 'car', label: 'Car', icon: Car },
  { value: 'garage', label: 'Garage', icon: Home },
];

export default function CustomerRequestScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [problemType, setProblemType] = useState<ProblemType | null>(null);
  const [propertyType, setPropertyType] = useState<PropertyType | null>(null);
  const [postcode, setPostcode] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    const coords = await LocationService.getCurrentPosition();
    setIsGettingLocation(false);

    if (coords) {
      // TODO: Reverse geocode to get address
      Alert.alert('Location Found', 'Please enter your full address manually.');
    } else {
      Alert.alert('Location Error', 'Could not get your location. Please enter manually.');
    }
  };

  const handleSubmit = async () => {
    if (!problemType || !propertyType || !postcode || !address) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    try {
      const gps = await LocationService.getCurrentPosition();

      const response = await createJob({
        name: user?.name || 'Customer',
        phone: user?.phone || '',
        email: user?.email,
        postcode: postcode.toUpperCase(),
        address,
        problemType,
        propertyType,
        description: description || undefined,
        requestGps: gps || undefined,
      });

      if (response.success) {
        router.replace(`/(customer)/job/${response.id}`);
      } else {
        Alert.alert('Error', 'Failed to create job request.');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create job request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View className="px-6 py-4">
      <Text className="text-xl font-bold text-slate-900 mb-2">
        What's the problem?
      </Text>
      <Text className="text-slate-500 mb-6">Select the issue you're facing</Text>

      {PROBLEM_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = problemType === type.value;
        return (
          <Pressable
            key={type.value}
            onPress={() => setProblemType(type.value)}
            className={`flex-row items-center p-4 mb-3 rounded-xl border-2 ${
              isSelected
                ? 'bg-orange-50 border-orange-500'
                : 'bg-white border-slate-200'
            }`}
          >
            <View
              className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                isSelected ? 'bg-orange-500' : 'bg-slate-100'
              }`}
            >
              <Icon size={24} color={isSelected ? 'white' : '#64748b'} />
            </View>
            <Text
              className={`text-lg font-medium ${
                isSelected ? 'text-orange-700' : 'text-slate-900'
              }`}
            >
              {type.label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => problemType && setStep(2)}
        disabled={!problemType}
        className={`mt-6 py-4 rounded-xl items-center ${
          problemType ? 'bg-orange-500 active:bg-orange-600' : 'bg-slate-300'
        }`}
      >
        <Text className="text-white text-lg font-semibold">Continue</Text>
      </Pressable>
    </View>
  );

  const renderStep2 = () => (
    <View className="px-6 py-4">
      <Text className="text-xl font-bold text-slate-900 mb-2">
        Property type?
      </Text>
      <Text className="text-slate-500 mb-6">What kind of property is it?</Text>

      {PROPERTY_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = propertyType === type.value;
        return (
          <Pressable
            key={type.value}
            onPress={() => setPropertyType(type.value)}
            className={`flex-row items-center p-4 mb-3 rounded-xl border-2 ${
              isSelected
                ? 'bg-orange-50 border-orange-500'
                : 'bg-white border-slate-200'
            }`}
          >
            <View
              className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
                isSelected ? 'bg-orange-500' : 'bg-slate-100'
              }`}
            >
              <Icon size={24} color={isSelected ? 'white' : '#64748b'} />
            </View>
            <Text
              className={`text-lg font-medium ${
                isSelected ? 'text-orange-700' : 'text-slate-900'
              }`}
            >
              {type.label}
            </Text>
          </Pressable>
        );
      })}

      <View className="flex-row mt-6">
        <Pressable
          onPress={() => setStep(1)}
          className="flex-1 mr-2 py-4 rounded-xl items-center border border-slate-300"
        >
          <Text className="text-slate-700 font-semibold">Back</Text>
        </Pressable>
        <Pressable
          onPress={() => propertyType && setStep(3)}
          disabled={!propertyType}
          className={`flex-1 ml-2 py-4 rounded-xl items-center ${
            propertyType ? 'bg-orange-500 active:bg-orange-600' : 'bg-slate-300'
          }`}
        >
          <Text className="text-white font-semibold">Continue</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView className="flex-1 px-6 py-4" keyboardShouldPersistTaps="handled">
        <Text className="text-xl font-bold text-slate-900 mb-2">
          Your location
        </Text>
        <Text className="text-slate-500 mb-6">Where do you need a locksmith?</Text>

        {/* Get Location Button */}
        <Pressable
          onPress={handleGetLocation}
          disabled={isGettingLocation}
          className="flex-row items-center p-4 mb-4 bg-blue-50 rounded-xl border border-blue-200"
        >
          <View className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center mr-3">
            <MapPin size={20} color="white" />
          </View>
          <View className="flex-1">
            <Text className="text-blue-700 font-medium">
              {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
            </Text>
          </View>
          {isGettingLocation && <ActivityIndicator color="#3b82f6" />}
        </Pressable>

        {/* Postcode */}
        <View className="mb-4">
          <Text className="text-slate-700 font-medium mb-2">Postcode *</Text>
          <TextInput
            value={postcode}
            onChangeText={setPostcode}
            placeholder="e.g. SW1A 1AA"
            autoCapitalize="characters"
            className="bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-900"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Address */}
        <View className="mb-4">
          <Text className="text-slate-700 font-medium mb-2">Full Address *</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Street address, city"
            multiline
            numberOfLines={2}
            className="bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-900"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Description */}
        <View className="mb-6">
          <Text className="text-slate-700 font-medium mb-2">
            Additional Details (optional)
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Any extra details that might help..."
            multiline
            numberOfLines={3}
            className="bg-white border border-slate-200 rounded-xl px-4 py-4 text-slate-900"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Submit */}
        <View className="flex-row">
          <Pressable
            onPress={() => setStep(2)}
            className="flex-1 mr-2 py-4 rounded-xl items-center border border-slate-300"
          >
            <Text className="text-slate-700 font-semibold">Back</Text>
          </Pressable>
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || !postcode || !address}
            className={`flex-1 ml-2 py-4 rounded-xl items-center ${
              isSubmitting || !postcode || !address
                ? 'bg-slate-300'
                : 'bg-orange-500 active:bg-orange-600'
            }`}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold">Find Locksmiths</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-slate-200 bg-white">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <Text className="flex-1 text-center text-lg font-semibold text-slate-900">
          Request Locksmith
        </Text>
        <View className="w-10" />
      </View>

      {/* Progress */}
      <View className="flex-row px-6 py-4 bg-white">
        {[1, 2, 3].map((s) => (
          <View key={s} className="flex-1 flex-row items-center">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                step >= s ? 'bg-orange-500' : 'bg-slate-200'
              }`}
            >
              <Text className={step >= s ? 'text-white font-bold' : 'text-slate-500'}>
                {s}
              </Text>
            </View>
            {s < 3 && (
              <View
                className={`flex-1 h-1 mx-2 ${
                  step > s ? 'bg-orange-500' : 'bg-slate-200'
                }`}
              />
            )}
          </View>
        ))}
      </View>

      <ScrollView className="flex-1">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}
