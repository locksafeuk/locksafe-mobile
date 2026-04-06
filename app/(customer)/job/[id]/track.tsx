import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Navigation, Clock, MapPin, User } from 'lucide-react-native';
import { useJobStore } from '../../../../stores/jobStore';
import { useJobTracking } from '../../../../services/tracking';
import type { GPSCoordinates } from '../../../../types';

export default function CustomerTrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentJob, fetchJob } = useJobStore();
  const tracking = useJobTracking(id || null);

  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      fetchJob(id);
    }
  }, [id]);

  useEffect(() => {
    if (tracking.eta) {
      setEta(tracking.eta);
    }
  }, [tracking.eta]);

  const handleCall = () => {
    if (currentJob?.locksmith?.phone) {
      Linking.openURL(`tel:${currentJob.locksmith.phone}`);
    }
  };

  const handleOpenMaps = () => {
    if (currentJob?.latitude && currentJob?.longitude) {
      const url = `https://maps.google.com/?q=${currentJob.latitude},${currentJob.longitude}`;
      Linking.openURL(url);
    }
  };

  if (!currentJob) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  const getStatusMessage = () => {
    switch (currentJob.status) {
      case 'ACCEPTED':
        return 'Locksmith has accepted your job';
      case 'EN_ROUTE':
        return 'Locksmith is on the way';
      case 'ARRIVED':
        return 'Locksmith has arrived';
      default:
        return 'Tracking locksmith...';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 bg-white border-b border-slate-200">
        <Pressable onPress={() => router.back()} className="p-2">
          <ArrowLeft size={24} color="#0f172a" />
        </Pressable>
        <View className="flex-1 ml-2">
          <Text className="text-lg font-semibold text-slate-900">
            Track Locksmith
          </Text>
          <Text className="text-slate-500 text-sm">{currentJob.jobNumber}</Text>
        </View>
      </View>

      {/* Map Placeholder */}
      <View className="flex-1 bg-slate-200 items-center justify-center">
        <View className="bg-white rounded-2xl p-6 mx-4 shadow-lg">
          <View className="items-center mb-4">
            {tracking.isConnected ? (
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-3">
                <Navigation size={32} color="#22c55e" />
              </View>
            ) : (
              <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
                <Clock size={32} color="#f97316" />
              </View>
            )}

            <Text className="text-xl font-bold text-slate-900 text-center">
              {getStatusMessage()}
            </Text>

            {tracking.locksmithLocation && (
              <Text className="text-slate-500 mt-1">
                Live tracking active
              </Text>
            )}
          </View>

          {/* ETA */}
          {(eta || currentJob.acceptedEta) && currentJob.status === 'EN_ROUTE' && (
            <View className="bg-blue-50 rounded-xl p-4 mb-4">
              <Text className="text-blue-600 text-sm text-center">
                Estimated arrival
              </Text>
              <Text className="text-3xl font-bold text-blue-700 text-center">
                {eta || currentJob.acceptedEta} min
              </Text>
            </View>
          )}

          {/* Location Info */}
          <View className="flex-row items-center mb-4">
            <MapPin size={18} color="#64748b" />
            <Text className="text-slate-600 ml-2 flex-1" numberOfLines={2}>
              {currentJob.address}, {currentJob.postcode}
            </Text>
          </View>

          {/* Locksmith Info */}
          {currentJob.locksmith && (
            <View className="border-t border-slate-100 pt-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-3">
                  <User size={24} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-semibold">
                    {currentJob.locksmith.name}
                  </Text>
                  {currentJob.locksmith.companyName && (
                    <Text className="text-slate-500 text-sm">
                      {currentJob.locksmith.companyName}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Connection Status */}
        <View className="mt-4 flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              tracking.isConnected ? 'bg-green-500' : 'bg-orange-500'
            }`}
          />
          <Text className="text-slate-500 text-sm">
            {tracking.isConnected ? 'Live tracking connected' : 'Connecting...'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="p-4 bg-white border-t border-slate-200">
        <View className="flex-row gap-3">
          <Pressable
            onPress={handleOpenMaps}
            className="flex-1 py-4 bg-blue-500 rounded-xl flex-row items-center justify-center active:bg-blue-600"
          >
            <MapPin size={20} color="white" />
            <Text className="text-white font-semibold ml-2">Open Maps</Text>
          </Pressable>

          {currentJob.locksmith && (
            <Pressable
              onPress={handleCall}
              className="flex-1 py-4 bg-green-500 rounded-xl flex-row items-center justify-center active:bg-green-600"
            >
              <Phone size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Call</Text>
            </Pressable>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
