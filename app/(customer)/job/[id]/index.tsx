import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  User,
  Star,
  CheckCircle,
  FileText,
  Navigation,
} from 'lucide-react-native';
import { useJobStore } from '../../../../stores/jobStore';
import { getJobApplications, acceptApplication } from '../../../../services/api/jobs';
import type { LocksmithApplication } from '../../../../types';

function StatusProgress({ status }: { status: string }) {
  const steps = [
    { key: 'PENDING', label: 'Finding' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'EN_ROUTE', label: 'En Route' },
    { key: 'ARRIVED', label: 'Arrived' },
    { key: 'QUOTED', label: 'Quoted' },
    { key: 'IN_PROGRESS', label: 'Working' },
    { key: 'COMPLETED', label: 'Done' },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <View className="flex-row justify-between px-4 py-6 bg-white rounded-xl">
      {steps.map((step, index) => {
        const isActive = index <= currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <View key={step.key} className="items-center flex-1">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center ${
                isActive ? 'bg-orange-500' : 'bg-slate-200'
              } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}
            >
              {isActive && <CheckCircle size={16} color="white" />}
            </View>
            <Text
              className={`text-xs mt-1 text-center ${
                isActive ? 'text-orange-600 font-medium' : 'text-slate-400'
              }`}
            >
              {step.label}
            </Text>
            {index < steps.length - 1 && (
              <View
                className={`absolute top-4 left-1/2 w-full h-0.5 ${
                  index < currentIndex ? 'bg-orange-500' : 'bg-slate-200'
                }`}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

function ApplicationCard({
  application,
  onAccept,
  isAccepting,
}: {
  application: LocksmithApplication;
  onAccept: () => void;
  isAccepting: boolean;
}) {
  return (
    <View className="bg-white rounded-xl p-4 mb-3 border border-slate-200">
      <View className="flex-row items-center mb-3">
        <View className="w-12 h-12 bg-slate-100 rounded-full items-center justify-center mr-3">
          <User size={24} color="#64748b" />
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-900">
            {application.locksmith?.name}
          </Text>
          {application.locksmith?.companyName && (
            <Text className="text-slate-500 text-sm">
              {application.locksmith.companyName}
            </Text>
          )}
        </View>
        <View className="flex-row items-center">
          <Star size={16} color="#f59e0b" fill="#f59e0b" />
          <Text className="text-slate-900 font-medium ml-1">
            {application.locksmith?.rating.toFixed(1)}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-slate-500 text-sm">Assessment Fee</Text>
          <Text className="text-xl font-bold text-slate-900">
            £{application.assessmentFee.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text className="text-slate-500 text-sm">ETA</Text>
          <Text className="text-xl font-bold text-slate-900">
            {application.eta} mins
          </Text>
        </View>
        <View>
          <Text className="text-slate-500 text-sm">Jobs</Text>
          <Text className="text-xl font-bold text-slate-900">
            {application.locksmith?.totalJobs || 0}
          </Text>
        </View>
      </View>

      {application.message && (
        <View className="bg-slate-50 rounded-lg p-3 mb-4">
          <Text className="text-slate-600 text-sm">{application.message}</Text>
        </View>
      )}

      <Pressable
        onPress={onAccept}
        disabled={isAccepting}
        className={`py-3 rounded-xl items-center ${
          isAccepting ? 'bg-orange-300' : 'bg-orange-500 active:bg-orange-600'
        }`}
      >
        {isAccepting ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold">Select Locksmith</Text>
        )}
      </Pressable>
    </View>
  );
}

export default function CustomerJobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentJob, fetchJob, isLoading } = useJobStore();
  const [applications, setApplications] = useState<LocksmithApplication[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchJob(id);
      loadApplications();
    }
  }, [id]);

  const loadApplications = async () => {
    if (!id) return;
    try {
      const response = await getJobApplications(id);
      if (response.success) {
        setApplications(response.applications.filter((a) => a.status === 'pending'));
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchJob(id!);
    await loadApplications();
    setRefreshing(false);
  };

  const handleAcceptApplication = async (applicationId: string) => {
    setAcceptingId(applicationId);
    try {
      const response = await acceptApplication(id!, applicationId);
      if (response.success) {
        await fetchJob(id!);
        setApplications([]);
        Alert.alert('Success', 'Locksmith has been assigned to your job!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to accept application');
    } finally {
      setAcceptingId(null);
    }
  };

  if (isLoading || !currentJob) {
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
            {currentJob.jobNumber}
          </Text>
          <Text className="text-slate-500 text-sm">
            {currentJob.problemType.replace(/-/g, ' ')}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97316" />
        }
      >
        {/* Status Progress */}
        <View className="px-4 py-4">
          <StatusProgress status={currentJob.status} />
        </View>

        {/* Location */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <View className="flex-row items-start">
              <MapPin size={20} color="#f97316" />
              <View className="ml-3 flex-1">
                <Text className="text-slate-500 text-sm">Location</Text>
                <Text className="text-slate-900 font-medium">{currentJob.address}</Text>
                <Text className="text-slate-500">{currentJob.postcode}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Locksmith Info (if assigned) */}
        {currentJob.locksmith && (
          <View className="px-4 mb-4">
            <Text className="text-lg font-semibold text-slate-900 mb-3">
              Your Locksmith
            </Text>
            <View className="bg-white rounded-xl p-4 border border-slate-200">
              <View className="flex-row items-center mb-4">
                <View className="w-14 h-14 bg-orange-100 rounded-full items-center justify-center mr-4">
                  <User size={28} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-slate-900">
                    {currentJob.locksmith.name}
                  </Text>
                  {currentJob.locksmith.companyName && (
                    <Text className="text-slate-500">
                      {currentJob.locksmith.companyName}
                    </Text>
                  )}
                  <View className="flex-row items-center mt-1">
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <Text className="text-slate-600 ml-1">
                      {currentJob.locksmith.rating.toFixed(1)} • {currentJob.locksmith.totalJobs} jobs
                    </Text>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row">
                {currentJob.status === 'EN_ROUTE' && (
                  <Pressable
                    onPress={() => router.push(`/(customer)/job/${id}/track`)}
                    className="flex-1 flex-row items-center justify-center py-3 bg-blue-500 rounded-xl mr-2"
                  >
                    <Navigation size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Track</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => {/* TODO: Call locksmith */}}
                  className="flex-1 flex-row items-center justify-center py-3 bg-green-500 rounded-xl"
                >
                  <Phone size={18} color="white" />
                  <Text className="text-white font-semibold ml-2">Call</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {/* Quote Section */}
        {currentJob.quote && (
          <View className="px-4 mb-4">
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

              {currentJob.status === 'QUOTED' && !currentJob.quote.accepted && (
                <View className="flex-row mt-4">
                  <Pressable className="flex-1 py-3 border border-slate-300 rounded-xl mr-2 items-center">
                    <Text className="text-slate-700 font-semibold">Decline</Text>
                  </Pressable>
                  <Pressable className="flex-1 py-3 bg-orange-500 rounded-xl ml-2 items-center">
                    <Text className="text-white font-semibold">Accept Quote</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Applications (if pending) */}
        {currentJob.status === 'PENDING' && applications.length > 0 && (
          <View className="px-4 mb-4">
            <Text className="text-lg font-semibold text-slate-900 mb-3">
              Available Locksmiths ({applications.length})
            </Text>
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                onAccept={() => handleAcceptApplication(app.id)}
                isAccepting={acceptingId === app.id}
              />
            ))}
          </View>
        )}

        {/* Signature Required */}
        {currentJob.status === 'PENDING_CUSTOMER_CONFIRMATION' && (
          <View className="px-4 mb-4">
            <Pressable
              onPress={() => router.push(`/(customer)/job/${id}/sign`)}
              className="bg-green-500 py-4 rounded-xl flex-row items-center justify-center"
            >
              <FileText size={20} color="white" />
              <Text className="text-white font-semibold text-lg ml-2">
                Sign & Complete
              </Text>
            </Pressable>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
