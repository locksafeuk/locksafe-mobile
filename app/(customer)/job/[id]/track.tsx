import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, Linking, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Phone, Navigation, Clock, MapPin, User } from 'lucide-react-native';
import { useJobStore } from '../../../../stores/jobStore';
import { useJobTracking } from '../../../../services/tracking';
import JobMap, { type MapLocation } from '../../../../components/JobMap';
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
      const url = Platform.select({
        ios: `maps:0,0?q=${currentJob.latitude},${currentJob.longitude}`,
        android: `geo:${currentJob.latitude},${currentJob.longitude}?q=${currentJob.latitude},${currentJob.longitude}`,
        default: `https://maps.google.com/?q=${currentJob.latitude},${currentJob.longitude}`,
      });
      if (url) Linking.openURL(url);
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
      case 'DIAGNOSING':
        return 'Locksmith is diagnosing the issue';
      case 'IN_PROGRESS':
        return 'Work in progress';
      default:
        return 'Tracking locksmith...';
    }
  };

  // Build map locations
  const jobLocation: MapLocation | null =
    currentJob.latitude && currentJob.longitude
      ? {
          latitude: currentJob.latitude,
          longitude: currentJob.longitude,
          title: 'Job Location',
          description: `${currentJob.address}, ${currentJob.postcode}`,
        }
      : null;

  const locksmithMapLocation: MapLocation | null = tracking.locksmithLocation
    ? {
        latitude: tracking.locksmithLocation.lat,
        longitude: tracking.locksmithLocation.lng,
        title: currentJob.locksmith?.name || 'Locksmith',
        description: currentJob.locksmith?.companyName,
      }
    : null;

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
        {/* Connection Status Indicator */}
        <View className="flex-row items-center">
          <View
            className={`w-2 h-2 rounded-full mr-2 ${
              tracking.isConnected ? 'bg-green-500' : 'bg-orange-500'
            }`}
          />
          <Text className="text-slate-400 text-xs">
            {tracking.isConnected ? 'Live' : 'Connecting'}
          </Text>
        </View>
      </View>

      {/* Live Map */}
      <View className="flex-1">
        <JobMap
          jobLocation={jobLocation}
          locksmithLocation={locksmithMapLocation}
          height={undefined}
          showRoute={currentJob.status === 'EN_ROUTE'}
          autoFitMarkers={true}
          style={{ flex: 1, borderRadius: 0 }}
        />

        {/* Status Overlay */}
        <View className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <View className="bg-white rounded-2xl p-4 shadow-lg">
            {/* Status Row */}
            <View className="flex-row items-center mb-3">
              {tracking.isConnected ? (
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <Navigation size={20} color="#22c55e" />
                </View>
              ) : (
                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <Clock size={20} color="#f97316" />
                </View>
              )}
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  {getStatusMessage()}
                </Text>
                {tracking.locksmithLocation && (
                  <Text className="text-slate-500 text-sm">
                    Live tracking active
                  </Text>
                )}
              </View>
            </View>

            {/* ETA */}
            {(eta || currentJob.acceptedEta) && currentJob.status === 'EN_ROUTE' && (
              <View className="bg-blue-50 rounded-xl p-3 mb-3">
                <Text className="text-blue-600 text-xs text-center">
                  Estimated arrival
                </Text>
                <Text className="text-2xl font-bold text-blue-700 text-center">
                  {eta || currentJob.acceptedEta} min
                </Text>
              </View>
            )}

            {/* Locksmith Info */}
            {currentJob.locksmith && (
              <View className="flex-row items-center pt-3 border-t border-slate-100">
                <View className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-3">
                  <User size={20} color="#64748b" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-medium">
                    {currentJob.locksmith.name}
                  </Text>
                  {currentJob.locksmith.companyName && (
                    <Text className="text-slate-500 text-xs">
                      {currentJob.locksmith.companyName}
                    </Text>
                  )}
                </View>
              </View>
            )}
          </View>
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
