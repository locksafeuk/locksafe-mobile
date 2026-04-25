import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  findNodeHandle,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Navigation,
  Camera,
  FileText,
  CheckCircle,
  User,
} from 'lucide-react-native';
import { useJobStore } from '../../../../stores/jobStore';
import { useAuthStore } from '../../../../stores/authStore';
import {
  submitApplication,
  updateJobStatus,
} from '../../../../services/api/jobs';
import { LocationService } from '../../../../services/location';
import JobMap from '../../../../components/JobMap';
import type { JobStatus } from '../../../../types';

const formatProblemType = (value: unknown): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return 'other';
  }
  return value.replace(/-/g, ' ');
};

const parsePositiveNumber = (value: string): number => {
  const normalized = value.replace(',', '.').trim();
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
};

export default function LocksmithJobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentJob, fetchJob, isLoading, updateJobInList } = useJobStore();
  const { user } = useAuthStore();
  const locksmith = user;

  const [assessmentFee, setAssessmentFee] = useState('29');
  const [eta, setEta] = useState('15');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const keyboardScrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const messageInputRef = useRef<TextInput | null>(null);

  const scrollToInput = (inputRef: { current: TextInput | null }) => {
    const node = findNodeHandle(inputRef.current);
    if (!node) {
      return;
    }

    requestAnimationFrame(() => {
      keyboardScrollRef.current?.scrollToFocusedInput(node);
    });
  };

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  // Check if locksmith has already applied
  const hasApplied = currentJob?.applications?.some(
    (app) => app.locksmithId === locksmith?.id
  );

  // Check if this locksmith is assigned
  const isAssigned = currentJob?.locksmithId === locksmith?.id;

  const handleApply = async () => {
    const parsedAssessmentFee = parsePositiveNumber(assessmentFee);
    const parsedEta = parsePositiveNumber(eta);
    const trimmedMessage = message.trim();

    if (!Number.isFinite(parsedAssessmentFee) || !Number.isFinite(parsedEta)) {
      Alert.alert('Missing Information', 'Please enter a valid assessment fee and ETA.');
      return;
    }

    if (!locksmith?.id) {
      Alert.alert('Authentication Error', 'Please sign in again before submitting an application.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await submitApplication(id!, {
        locksmithId: locksmith.id,
        assessmentFee: parsedAssessmentFee,
        eta: Math.round(parsedEta),
        // Backend validation currently expects message to be present; send a safe default.
        message: trimmedMessage.length > 0 ? trimmedMessage : 'Application submitted from LockSafe mobile app.',
      });

      if (response.success) {
        Alert.alert('Application Sent', 'The customer will be notified of your application.');
        await fetchJob(id!);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (newStatus: JobStatus) => {
    setIsSubmitting(true);
    try {
      const gps = await LocationService.getCurrentPosition();
      const response = await updateJobStatus(id!, newStatus, gps || undefined);

      if (response.success && response.data) {
        updateJobInList(response.data);
        await fetchJob(id!);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNextAction = () => {
    if (!isAssigned) return null;

    switch (currentJob?.status) {
      case 'ACCEPTED':
        return {
          label: 'Start Navigation',
          action: () => handleStatusUpdate('EN_ROUTE'),
          color: 'bg-blue-500',
        };
      case 'EN_ROUTE':
        return {
          label: 'Mark Arrived',
          action: () => handleStatusUpdate('ARRIVED'),
          color: 'bg-green-500',
        };
      case 'ARRIVED':
        return {
          label: 'Start Diagnosis',
          action: () => handleStatusUpdate('DIAGNOSING'),
          color: 'bg-purple-500',
        };
      case 'DIAGNOSING':
        return {
          label: 'Create Quote',
          action: () => router.push(`/(locksmith)/job/${id}/quote`),
          color: 'bg-orange-500',
        };
      case 'QUOTE_ACCEPTED':
        return {
          label: 'Start Work',
          action: () => handleStatusUpdate('IN_PROGRESS'),
          color: 'bg-indigo-500',
        };
      case 'IN_PROGRESS':
        return {
          label: 'Mark Complete',
          action: () => handleStatusUpdate('PENDING_CUSTOMER_CONFIRMATION'),
          color: 'bg-green-500',
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();

  if (isLoading || !currentJob) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-200">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-semibold text-slate-900">
            {currentJob.jobNumber}
          </Text>
          <Text className="text-slate-500 text-sm">
            {formatProblemType(currentJob.problemType)}
          </Text>
        </View>
        {isAssigned && (
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-700 font-medium text-sm">Assigned</Text>
          </View>
        )}
      </View>

      <KeyboardAwareScrollView
        innerRef={keyboardScrollRef}
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        keyboardOpeningTime={0}
        extraScrollHeight={20}
        extraHeight={Platform.OS === 'android' ? 160 : 100}
        resetScrollToCoords={{ x: 0, y: 0 }}
      >
        {/* Customer Info */}
        {isAssigned && currentJob.customer && (
          <View className="mx-4 mt-4">
            <View className="bg-white rounded-xl p-4 border border-slate-200">
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-3">
                  <User size={24} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-slate-900">
                    {currentJob.customer.name}
                  </Text>
                  <Text className="text-slate-500">{currentJob.customer.phone}</Text>
                </View>
                <Pressable className="w-10 h-10 bg-green-500 rounded-full items-center justify-center">
                  <Phone size={20} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Job Details */}
        <View className="mx-4 mt-4">
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <View className="flex-row items-center mb-4">
              <View className="bg-orange-100 px-3 py-1 rounded-full">
                <Text className="text-orange-700 font-medium">
                  {formatProblemType(currentJob.problemType).replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </View>
              <Text className="text-slate-500 ml-2">
                • {currentJob.propertyType}
              </Text>
            </View>

            <View className="flex-row items-start mb-3">
              <MapPin size={18} color="#64748b" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-900 font-medium">{currentJob.address}</Text>
                <Text className="text-slate-500">{currentJob.postcode}</Text>
                {currentJob.distanceMiles && (
                  <Text className="text-slate-500 text-sm mt-1">
                    {currentJob.distanceMiles.toFixed(1)} miles away
                  </Text>
                )}
              </View>
            </View>

            {currentJob.description && (
              <View className="bg-slate-50 rounded-lg p-3 mt-2">
                <Text className="text-slate-600">{currentJob.description}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Map */}
        {currentJob.latitude && currentJob.longitude && (
          <View className="mx-4 mt-4">
            <JobMap
              jobLocation={{
                latitude: currentJob.latitude,
                longitude: currentJob.longitude,
                title: 'Job Location',
                description: `${currentJob.address}, ${currentJob.postcode}`,
              }}
              locksmithLocation={
                locksmith?.baseLat && locksmith?.baseLng
                  ? {
                      latitude: locksmith.baseLat,
                      longitude: locksmith.baseLng,
                      title: 'Your Location',
                    }
                  : undefined
              }
              height={180}
              showRoute={isAssigned}
            />
          </View>
        )}

        {/* Assessment Fee Display */}
        <View className="mx-4 mt-4">
          <View className="bg-green-50 rounded-xl p-4 border border-green-200">
            <Text className="text-green-700 text-sm mb-1">Assessment Fee</Text>
            <Text className="text-3xl font-bold text-green-700">
              £{currentJob.assessmentFee.toFixed(2)}
            </Text>
            <Text className="text-green-600 text-sm mt-1">
              You keep 85% = £{(currentJob.assessmentFee * 0.85).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Apply Form (for pending jobs not applied to) */}
        {currentJob.status === 'PENDING' && !hasApplied && !isAssigned && (
          <View className="mx-4 mt-4">
            <Text className="text-lg font-semibold text-slate-900 mb-3">
              Submit Application
            </Text>
            <View className="bg-white rounded-xl p-4 border border-slate-200">
              <View className="flex-row mb-4">
                <View className="flex-1 mr-2">
                  <Text className="text-slate-700 font-medium mb-2">
                    Assessment Fee (£)
                  </Text>
                  <TextInput
                    value={assessmentFee}
                    onChangeText={setAssessmentFee}
                    keyboardType="numeric"
                    className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900"
                    placeholder="29"
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-slate-700 font-medium mb-2">ETA (mins)</Text>
                  <TextInput
                    value={eta}
                    onChangeText={setEta}
                    keyboardType="numeric"
                    className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900"
                    placeholder="15"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-slate-700 font-medium mb-2">
                  Message (optional)
                </Text>
                <TextInput
                  ref={messageInputRef}
                  value={message}
                  onChangeText={setMessage}
                  onFocus={() => scrollToInput(messageInputRef)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  className="bg-slate-100 rounded-xl px-4 py-3 text-slate-900"
                  placeholder="Add a note for the customer..."
                />
              </View>

              <Pressable
                onPress={handleApply}
                disabled={isSubmitting}
                className={`py-4 rounded-xl items-center ${
                  isSubmitting ? 'bg-slate-300' : 'bg-slate-900 active:bg-slate-800'
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Submit Application
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        )}

        {/* Already Applied */}
        {hasApplied && !isAssigned && (
          <View className="mx-4 mt-4">
            <View className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex-row items-center">
              <Clock size={24} color="#3b82f6" />
              <View className="ml-3">
                <Text className="text-blue-700 font-semibold">Application Pending</Text>
                <Text className="text-blue-600 text-sm">
                  Waiting for customer to select a locksmith
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Action Buttons for Assigned Jobs */}
        {nextAction && (
          <View className="mx-4 mt-6 mb-4">
            <Pressable
              onPress={nextAction.action}
              disabled={isSubmitting}
              className={`py-4 rounded-xl items-center flex-row justify-center ${
                isSubmitting ? 'bg-slate-300' : `${nextAction.color} active:opacity-90`
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  {currentJob.status === 'ACCEPTED' && <Navigation size={20} color="white" />}
                  {currentJob.status === 'EN_ROUTE' && <MapPin size={20} color="white" />}
                  {currentJob.status === 'ARRIVED' && <Camera size={20} color="white" />}
                  {currentJob.status === 'DIAGNOSING' && <FileText size={20} color="white" />}
                  {currentJob.status === 'QUOTE_ACCEPTED' && <CheckCircle size={20} color="white" />}
                  {currentJob.status === 'IN_PROGRESS' && <CheckCircle size={20} color="white" />}
                  <Text className="text-white font-semibold text-lg ml-2">
                    {nextAction.label}
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Quote Display */}
        {currentJob.quote && (
          <View className="mx-4 mt-4 mb-4">
            <Text className="text-lg font-semibold text-slate-900 mb-3">Quote</Text>
            <View className="bg-white rounded-xl p-4 border border-slate-200">
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-600">Parts</Text>
                <Text className="text-slate-900">£{currentJob.quote.partsTotal.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-600">Labour</Text>
                <Text className="text-slate-900">£{currentJob.quote.labourCost.toFixed(2)}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-slate-600">VAT (20%)</Text>
                <Text className="text-slate-900">£{currentJob.quote.vat.toFixed(2)}</Text>
              </View>
              <View className="border-t border-slate-200 pt-2 mt-2 flex-row justify-between">
                <Text className="text-lg font-semibold text-slate-900">Total</Text>
                <Text className="text-lg font-bold text-orange-500">
                  £{currentJob.quote.total.toFixed(2)}
                </Text>
              </View>
              <View className="mt-3 pt-3 border-t border-slate-100">
                <Text className="text-sm text-slate-500">
                  Your earnings: £{((currentJob.quote.total * 0.75) + (currentJob.assessmentFee * 0.85)).toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-8" />
      </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}
