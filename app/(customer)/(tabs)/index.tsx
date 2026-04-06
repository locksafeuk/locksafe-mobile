import { View, Text, Pressable, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Plus, Clock, MapPin, CheckCircle2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
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
      case 'COMPLETED':
      case 'SIGNED':
        return { bg: 'bg-green-100', text: 'text-green-700', label: 'Completed' };
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

function ActiveJobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-slate-200 active:bg-slate-50"
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-slate-900">
            {job.problemType.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
          </Text>
          <Text className="text-slate-500 text-sm">{job.propertyType}</Text>
        </View>
        <JobStatusBadge status={job.status} />
      </View>

      <View className="flex-row items-center mb-2">
        <MapPin size={16} color="#64748b" />
        <Text className="text-slate-600 ml-2 flex-1" numberOfLines={1}>
          {job.address}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Clock size={16} color="#64748b" />
        <Text className="text-slate-500 ml-2">
          {new Date(job.createdAt).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>

      {job.locksmith && (
        <View className="mt-3 pt-3 border-t border-slate-100">
          <Text className="text-slate-600 text-sm">
            Locksmith: <Text className="font-medium">{job.locksmith.name}</Text>
            {job.locksmith.companyName && ` • ${job.locksmith.companyName}`}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function CustomerHomeScreen() {
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

  // Filter active jobs (not completed or cancelled)
  const activeJobs = customerJobs.filter(
    (job) => !['COMPLETED', 'SIGNED', 'CANCELLED'].includes(job.status)
  );

  // Recent completed jobs
  const recentJobs = customerJobs
    .filter((job) => ['COMPLETED', 'SIGNED'].includes(job.status))
    .slice(0, 3);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-slate-900">
            Hello, {user?.name?.split(' ')[0] || 'there'}
          </Text>
          <Text className="text-slate-500 mt-1">Need a locksmith?</Text>
        </View>

        {/* Request Button */}
        <View className="px-6 mb-6">
          <Pressable
            onPress={() => router.push('/(customer)/request')}
            className="bg-orange-500 rounded-2xl p-6 flex-row items-center justify-between active:bg-orange-600"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-orange-400 rounded-xl items-center justify-center mr-4">
                <Lock size={24} color="white" />
              </View>
              <View>
                <Text className="text-white text-lg font-semibold">
                  Request Locksmith
                </Text>
                <Text className="text-orange-100">24/7 Emergency Service</Text>
              </View>
            </View>
            <View className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
              <Plus size={24} color="white" />
            </View>
          </Pressable>
        </View>

        {/* Active Jobs */}
        {activeJobs.length > 0 && (
          <View className="px-6 mb-6">
            <Text className="text-lg font-semibold text-slate-900 mb-3">
              Active Jobs
            </Text>
            {activeJobs.map((job) => (
              <ActiveJobCard
                key={job.id}
                job={job}
                onPress={() => router.push(`/(customer)/job/${job.id}`)}
              />
            ))}
          </View>
        )}

        {/* Recent Jobs */}
        {recentJobs.length > 0 && (
          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-slate-900">
                Recent Jobs
              </Text>
              <Pressable onPress={() => router.push('/(customer)/(tabs)/jobs')}>
                <Text className="text-orange-500 font-medium">See all</Text>
              </Pressable>
            </View>
            {recentJobs.map((job) => (
              <Pressable
                key={job.id}
                onPress={() => router.push(`/(customer)/job/${job.id}`)}
                className="bg-white rounded-xl p-4 mb-2 flex-row items-center border border-slate-200"
              >
                <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                  <CheckCircle2 size={20} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-medium">{job.jobNumber}</Text>
                  <Text className="text-slate-500 text-sm">
                    {new Date(job.createdAt).toLocaleDateString('en-GB')}
                  </Text>
                </View>
                <Text className="text-slate-500 text-sm">
                  £{job.quote?.total?.toFixed(2) || job.assessmentFee.toFixed(2)}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Empty State */}
        {activeJobs.length === 0 && recentJobs.length === 0 && !isLoading && (
          <View className="px-6 py-12 items-center">
            <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Lock size={32} color="#94a3b8" />
            </View>
            <Text className="text-slate-600 text-lg font-medium mb-1">
              No jobs yet
            </Text>
            <Text className="text-slate-400 text-center">
              Request your first locksmith service above
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
