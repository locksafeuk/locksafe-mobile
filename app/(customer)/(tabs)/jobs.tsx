import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/authStore';
import { useJobStore } from '../../../stores/jobStore';
import type { Job } from '../../../types';

function JobStatusBadge({ status }: { status: string }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'PENDING':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Finding Locksmith' };
      case 'ACCEPTED':
        return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Accepted' };
      case 'EN_ROUTE':
        return { bg: 'bg-purple-100', text: 'text-purple-700', label: 'On the Way' };
      case 'ARRIVED':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Arrived' };
      case 'QUOTED':
        return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Quote Ready' };
      case 'IN_PROGRESS':
        return { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress' };
      case 'PENDING_CUSTOMER_CONFIRMATION':
        return { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Sign Required' };
      case 'COMPLETED':
      case 'SIGNED':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
      case 'CANCELLED':
        return { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
    }
  };

  const style = getStatusStyle();
  return (
    <View className={`px-2 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs font-medium ${style.text}`}>{style.label}</Text>
    </View>
  );
}

function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-200 active:bg-slate-50"
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-slate-500 font-medium">{job.jobNumber}</Text>
        <JobStatusBadge status={job.status} />
      </View>

      <Text className="text-lg font-semibold text-slate-900 mb-2">
        {job.problemType.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
      </Text>

      <View className="flex-row items-center mb-2">
        <MapPin size={16} color="#64748b" />
        <Text className="text-slate-600 ml-2 flex-1" numberOfLines={1}>
          {job.address}
        </Text>
      </View>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Clock size={16} color="#64748b" />
          <Text className="text-slate-500 ml-2">{formatDate(job.createdAt)}</Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-slate-900 font-semibold">
            £{job.quote?.total?.toFixed(2) || job.assessmentFee.toFixed(2)}
          </Text>
          <ChevronRight size={20} color="#94a3b8" className="ml-2" />
        </View>
      </View>
    </Pressable>
  );
}

export default function CustomerJobsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { customerJobs, fetchCustomerJobs, isLoading } = useJobStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCustomerJobs(user.id);
    }
  }, [user?.id, fetchCustomerJobs]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchCustomerJobs(user.id);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 pt-6 pb-4 bg-slate-50">
        <Text className="text-2xl font-bold text-slate-900">My Jobs</Text>
        <Text className="text-slate-500 mt-1">
          {customerJobs.length} job{customerJobs.length !== 1 ? 's' : ''} total
        </Text>
      </View>

      <FlatList
        data={customerJobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => router.push(`/(customer)/job/${item.id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
        ListEmptyComponent={
          <View className="py-12 items-center">
            <Text className="text-slate-500 text-center">
              {isLoading ? 'Loading jobs...' : 'No jobs found'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
