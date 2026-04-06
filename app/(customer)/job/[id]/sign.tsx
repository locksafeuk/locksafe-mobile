import { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CheckCircle, FileText, PenLine, RotateCcw } from 'lucide-react-native';
import { useJobStore } from '../../../../stores/jobStore';
import { submitSignature, confirmJobCompletion } from '../../../../services/api/jobs';
import { LocationService } from '../../../../services/location';

// Note: For production, you would use react-native-signature-canvas
// This is a simplified placeholder that captures touch events

export default function CustomerSignatureScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentJob, fetchJob } = useJobStore();

  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [confirmsWork, setConfirmsWork] = useState(true);
  const [confirmsPrice, setConfirmsPrice] = useState(true);
  const [confirmsSatisfied, setConfirmsSatisfied] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  const handleClearSignature = () => {
    setSignatureData(null);
  };

  const handleSubmit = async () => {
    if (!signatureData) {
      Alert.alert('Signature Required', 'Please sign in the box above.');
      return;
    }

    if (!confirmsWork || !confirmsPrice || !confirmsSatisfied) {
      Alert.alert(
        'Confirmation Required',
        'Please confirm all checkboxes before signing.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const gps = await LocationService.getCurrentPosition();

      const response = await submitSignature(id!, {
        signatureData,
        signerName: currentJob?.customer?.name || 'Customer',
        confirmsWork,
        confirmsPrice,
        confirmsSatisfied,
        gps: gps || undefined,
      });

      if (response.success) {
        // Also confirm completion
        await confirmJobCompletion(id!, gps || undefined);

        Alert.alert(
          'Job Complete',
          'Thank you! Your signature has been recorded.',
          [
            {
              text: 'OK',
              onPress: () => router.replace(`/(customer)/job/${id}`),
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit signature');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simulate signature capture - in production use react-native-signature-canvas
  const handleSignatureCapture = () => {
    // Generate a placeholder signature data
    const placeholderSignature = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
    setSignatureData(placeholderSignature);
  };

  if (!currentJob) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-200">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-semibold text-slate-900">
            Sign & Complete
          </Text>
          <Text className="text-slate-500 text-sm">{currentJob.jobNumber}</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Job Summary */}
        <View className="mx-4 mt-4">
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <View className="flex-row items-center mb-3">
              <FileText size={20} color="#f97316" />
              <Text className="text-lg font-semibold text-slate-900 ml-2">
                Job Summary
              </Text>
            </View>

            {currentJob.quote && (
              <>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-slate-600">Assessment Fee</Text>
                  <Text className="text-slate-900">
                    £{currentJob.assessmentFee.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-slate-600">Work Total</Text>
                  <Text className="text-slate-900">
                    £{currentJob.quote.total.toFixed(2)}
                  </Text>
                </View>
                <View className="border-t border-slate-200 pt-2 mt-2 flex-row justify-between">
                  <Text className="text-lg font-semibold text-slate-900">
                    Total Paid
                  </Text>
                  <Text className="text-lg font-bold text-green-600">
                    £{(currentJob.assessmentFee + currentJob.quote.total).toFixed(2)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Confirmations */}
        <View className="mx-4 mt-4">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            Confirmations
          </Text>
          <View className="bg-white rounded-xl border border-slate-200">
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
              <Text className="text-slate-900 flex-1 mr-4">
                I confirm the work has been completed as described
              </Text>
              <Switch
                value={confirmsWork}
                onValueChange={setConfirmsWork}
                trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
                thumbColor="white"
              />
            </View>
            <View className="flex-row items-center justify-between p-4 border-b border-slate-100">
              <Text className="text-slate-900 flex-1 mr-4">
                I confirm the price charged matches the quote
              </Text>
              <Switch
                value={confirmsPrice}
                onValueChange={setConfirmsPrice}
                trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
                thumbColor="white"
              />
            </View>
            <View className="flex-row items-center justify-between p-4">
              <Text className="text-slate-900 flex-1 mr-4">
                I am satisfied with the work performed
              </Text>
              <Switch
                value={confirmsSatisfied}
                onValueChange={setConfirmsSatisfied}
                trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
                thumbColor="white"
              />
            </View>
          </View>
        </View>

        {/* Signature Box */}
        <View className="mx-4 mt-4 mb-6">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            Your Signature
          </Text>
          <View className="bg-white rounded-xl border-2 border-dashed border-slate-300 overflow-hidden">
            {signatureData ? (
              <View className="h-48 items-center justify-center bg-slate-50">
                <CheckCircle size={48} color="#22c55e" />
                <Text className="text-green-600 font-medium mt-2">
                  Signature captured
                </Text>
                <Pressable
                  onPress={handleClearSignature}
                  className="flex-row items-center mt-3 px-4 py-2 bg-slate-200 rounded-lg"
                >
                  <RotateCcw size={16} color="#64748b" />
                  <Text className="text-slate-600 ml-2">Clear & Redo</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleSignatureCapture}
                className="h-48 items-center justify-center"
              >
                <PenLine size={32} color="#94a3b8" />
                <Text className="text-slate-400 mt-2">Tap to sign</Text>
                <Text className="text-slate-300 text-sm mt-1">
                  Sign with your finger
                </Text>
              </Pressable>
            )}
          </View>
          <Text className="text-slate-400 text-xs text-center mt-2">
            Your signature will be securely stored with GPS verification
          </Text>
        </View>
      </ScrollView>

      {/* Submit Button */}
      <View className="p-4 bg-white border-t border-slate-200">
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !signatureData}
          className={`py-4 rounded-xl items-center flex-row justify-center ${
            isSubmitting || !signatureData
              ? 'bg-slate-300'
              : 'bg-green-500 active:bg-green-600'
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <CheckCircle size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Complete Job
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
