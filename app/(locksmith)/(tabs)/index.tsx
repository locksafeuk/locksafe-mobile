import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Briefcase,
  TrendingUp,
  Star,
  Clock,
  MapPin,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../../stores/authStore';
import { useJobStore } from '../../../stores/jobStore';
import { get, post } from '../../../services/api/client';
import type { Locksmith, Job } from '../../../types';

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Briefcase;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <View className="bg-white rounded-xl p-4 flex-1 border border-slate-200">
      <View className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${color}`}>
        <Icon size={20} color="white" />
      </View>
      <Text className="text-2xl font-bold text-slate-900">{value}</Text>
      <Text className="text-slate-500 text-sm">{label}</Text>
    </View>
  );
}

function ActiveJobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return 'Accepted';
      case 'EN_ROUTE': return 'En Route';
      case 'ARRIVED': return 'On Site';
      case 'DIAGNOSING': return 'Diagnosing';
      case 'QUOTED': return 'Quote Sent';
      case 'QUOTE_ACCEPTED': return 'Quote Accepted';
      case 'IN_PROGRESS': return 'Working';
      default: return status;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-xl p-4 mb-3 border border-slate-200 active:bg-slate-50"
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-semibold text-slate-900">{job.jobNumber}</Text>
        <View className="bg-blue-100 px-2 py-1 rounded-full">
          <Text className="text-blue-700 text-xs font-medium">
            {getStatusLabel(job.status)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center mb-2">
        <MapPin size={14} color="#64748b" />
        <Text className="text-slate-600 text-sm ml-2 flex-1" numberOfLines={1}>
          {job.address}
        </Text>
      </View>
      <View className="flex-row items-center justify-between">
        <Text className="text-slate-500 text-sm">
          {job.problemType.replace(/-/g, ' ')}
        </Text>
        <ChevronRight size={18} color="#94a3b8" />
      </View>
    </Pressable>
  );
}

export default function LocksmithDashboardScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const { locksmithJobs, availableJobs, fetchLocksmithJobs, fetchAvailableJobs } = useJobStore();
  const [isAvailable, setIsAvailable] = useState((user as Locksmith)?.isAvailable ?? true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const locksmith = user as Locksmith;

  useEffect(() => {
    if (locksmith?.id) {
      fetchLocksmithJobs(locksmith.id);
      fetchAvailableJobs(locksmith.id);
    }
  }, [locksmith?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (locksmith?.id) {
      await Promise.all([
        fetchLocksmithJobs(locksmith.id),
        fetchAvailableJobs(locksmith.id),
      ]);
    }
    setRefreshing(false);
  };

  const toggleAvailability = async (value: boolean) => {
    setTogglingAvailability(true);
    try {
      const response = await post<{ success: boolean; isAvailable: boolean }>(
        '/api/locksmith/availability',
        {
          locksmithId: locksmith.id,
          isAvailable: value,
        }
      );
      if (response.success) {
        setIsAvailable(response.isAvailable);
        updateUser({ isAvailable: response.isAvailable });
      }
    } catch (error) {
      console.error('Toggle availability error:', error);
    } finally {
      setTogglingAvailability(false);
    }
  };

  // Filter active jobs
  const activeJobs = locksmithJobs.filter(
    (job) => !['COMPLETED', 'SIGNED', 'CANCELLED', 'PENDING'].includes(job.status)
  );

  // Calculate stats
  const completedJobs = locksmithJobs.filter((j) =>
    ['COMPLETED', 'SIGNED'].includes(j.status)
  ).length;
  const totalEarnings = locksmith?.totalEarnings || 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0f172a" />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-slate-900">
            Hello, {locksmith?.name?.split(' ')[0] || 'Partner'}
          </Text>
          <Text className="text-slate-500 mt-1">
            {locksmith?.companyName || 'Locksmith Partner'}
          </Text>
        </View>

        {/* Availability Toggle */}
        <View className="mx-6 mb-6">
          <View
            className={`rounded-2xl p-4 flex-row items-center justify-between ${
              isAvailable ? 'bg-green-50 border border-green-200' : 'bg-slate-100 border border-slate-200'
            }`}
          >
            <View>
              <Text className={`text-lg font-semibold ${isAvailable ? 'text-green-700' : 'text-slate-700'}`}>
                {isAvailable ? 'You\'re Online' : 'You\'re Offline'}
              </Text>
              <Text className={`text-sm ${isAvailable ? 'text-green-600' : 'text-slate-500'}`}>
                {isAvailable ? 'Receiving job notifications' : 'Not receiving jobs'}
              </Text>
            </View>
            <Switch
              value={isAvailable}
              onValueChange={toggleAvailability}
              disabled={togglingAvailability}
              trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
              thumbColor="white"
            />
          </View>
        </View>

        {/* Stats */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            <StatCard
              icon={Briefcase}
              label="Completed"
              value={completedJobs}
              color="bg-blue-500"
            />
            <StatCard
              icon={TrendingUp}
              label="Earnings"
              value={`£${totalEarnings.toFixed(0)}`}
              color="bg-green-500"
            />
          </View>
          <View className="flex-row gap-3 mt-3">
            <StatCard
              icon={Star}
              label="Rating"
              value={locksmith?.rating?.toFixed(1) || '5.0'}
              color="bg-amber-500"
            />
            <StatCard
              icon={Clock}
              label="Available Jobs"
              value={availableJobs.length}
              color="bg-purple-500"
            />
          </View>
        </View>

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-slate-900">
                Active Jobs
              </Text>
              <View className="bg-orange-100 px-2 py-1 rounded-full">
                <Text className="text-orange-700 text-sm font-medium">
                  {activeJobs.length}
                </Text>
              </View>
            </View>
            {activeJobs.map((job) => (
              <ActiveJobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/(locksmith)/job/${job.id}`)}
              />
            ))}
          </View>
        )}

        {/* Available Jobs Preview */}
        {availableJobs.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-slate-900">
                Nearby Jobs
              </Text>
              <Pressable onPress={() => router.push('/(locksmith)/(tabs)/available')}>
                <Text className="text-slate-900 font-medium">See all</Text>
              </Pressable>
            </View>
            {availableJobs.slice(0, 2).map((job) => (
              <Pressable
                key={job.id}
                onPress={() => router.push(`/(locksmith)/job/${job.id}`)}
                className="bg-white rounded-xl p-4 mb-2 border border-slate-200 flex-row items-center"
              >
                <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                  <MapPin size={20} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-medium">
                    {job.problemType.replace(/-/g, ' ')}
                  </Text>
                  <Text className="text-slate-500 text-sm" numberOfLines={1}>
                    {job.postcode} • {job.distanceMiles?.toFixed(1) || '?'} mi
                  </Text>
                </View>
                <Text className="text-green-600 font-semibold">
                  £{job.assessmentFee.toFixed(0)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {activeJobs.length === 0 && availableJobs.length === 0 && (
          <View className="px-6 py-12 items-center">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Briefcase size={32} color="#94a3b8" />
            </View>
            <Text className="text-slate-600 text-lg font-medium mb-1">
              No jobs available
            </Text>
            <Text className="text-slate-400 text-center">
              {isAvailable
                ? 'New jobs will appear here when available in your area'
                : 'Go online to start receiving job notifications'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
