import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, Briefcase, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/authStore';
import { useJobStore } from '../../../stores/jobStore';
import type { Job, Locksmith } from '../../../types';

function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000 / 60);

    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-200 active:bg-slate-50"
    >
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="bg-orange-100 px-3 py-1 rounded-full">
          <Text className="text-orange-700 font-medium">
            {job.problemType.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
        </View>
        <Text className="text-slate-500 text-sm">{timeAgo(job.createdAt)}</Text>
      </View>

      {/* Property Type */}
      <Text className="text-slate-600 text-sm mb-2">
        {job.propertyType.charAt(0).toUpperCase() + job.propertyType.slice(1)}
      </Text>

      {/* Location */}
      <View className="flex-row items-center mb-3">
        <MapPin size={16} color="#64748b" />
        <Text className="text-slate-700 ml-2 flex-1" numberOfLines={1}>
          {job.postcode}
        </Text>
        {job.distanceMiles !== undefined && (
          <Text className="text-slate-500 text-sm">
            {job.distanceMiles.toFixed(1)} mi away
          </Text>
        )}
      </View>

      {/* Description */}
      {job.description && (
        <View className="bg-slate-50 rounded-lg p-3 mb-3">
          <Text className="text-slate-600 text-sm" numberOfLines={2}>
            {job.description}
          </Text>
        </View>
      )}

      {/* Footer */}
      <View className="flex-row items-center justify-between pt-3 border-t border-slate-100">
        <View>
          <Text className="text-slate-500 text-xs">Assessment Fee</Text>
          <Text className="text-2xl font-bold text-green-600">
            £{job.assessmentFee.toFixed(2)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-slate-900 font-semibold mr-2">View Job</Text>
          <View className="w-8 h-8 bg-slate-900 rounded-full items-center justify-center">
            <ChevronRight size={18} color="white" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export default function LocksmithAvailableJobsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { availableJobs, fetchAvailableJobs, isLoading } = useJobStore();
  const [refreshing, setRefreshing] = useState(false);

  const locksmith = user as Locksmith;

  useEffect(() => {
    if (locksmith?.id) {
      fetchAvailableJobs(locksmith.id);
    }
  }, [locksmith?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (locksmith?.id) {
      await fetchAvailableJobs(locksmith.id);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-slate-50">
        <Text className="text-2xl font-bold text-slate-900">Available Jobs</Text>
        <Text className="text-slate-500 mt-1">
          {availableJobs.length} job{availableJobs.length !== 1 ? 's' : ''} in your area
        </Text>
      </View>

      <FlatList
        data={availableJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => router.push(`/(locksmith)/job/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0f172a"
          />
        }
        ListEmptyComponent={
          <View className="py-12 items-center">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Briefcase size={28} color="#94a3b8" />
            </View>
            <Text className="text-slate-600 text-lg font-medium mb-1">
              No jobs available
            </Text>
            <Text className="text-slate-400 text-center px-8">
              {locksmith?.isAvailable
                ? 'New jobs will appear here when customers request help in your area'
                : 'Go online from your dashboard to see available jobs'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
