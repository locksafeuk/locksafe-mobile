import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wallet, TrendingUp, ArrowUpRight, Calendar, ExternalLink } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/authStore';
import { useJobStore } from '../../../stores/jobStore';
import type { Locksmith, Job } from '../../../types';

function EarningCard({ job }: { job: Job }) {
  const getEarning = () => {
    if (job.quote?.total) {
      // 75% for quote, 85% for assessment
      const quoteShare = job.quote.total * 0.75;
      const assessmentShare = job.assessmentFee * 0.85;
      return quoteShare + assessmentShare;
    }
    return job.assessmentFee * 0.85;
  };

  return (
    <View className="bg-white rounded-xl p-4 mb-2 flex-row items-center border border-slate-200">
      <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
        <ArrowUpRight size={20} color="#22c55e" />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-medium">{job.jobNumber}</Text>
        <Text className="text-slate-500 text-sm">
          {new Date(job.signedAt || job.workCompletedAt || job.createdAt).toLocaleDateString('en-GB')}
        </Text>
      </View>
      <Text className="text-green-600 font-bold text-lg">
        +£{getEarning().toFixed(2)}
      </Text>
    </View>
  );
}

export default function LocksmithEarningsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { locksmithJobs, fetchLocksmithJobs } = useJobStore();
  const [refreshing, setRefreshing] = useState(false);

  const locksmith = user as Locksmith;

  useEffect(() => {
    if (locksmith?.id) {
      fetchLocksmithJobs(locksmith.id);
    }
  }, [locksmith?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (locksmith?.id) {
      await fetchLocksmithJobs(locksmith.id);
    }
    setRefreshing(false);
  };

  // Filter completed jobs
  const completedJobs = locksmithJobs.filter((j) =>
    ['COMPLETED', 'SIGNED'].includes(j.status)
  );

  // Calculate earnings this month
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);

  const monthlyJobs = completedJobs.filter(
    (j) => new Date(j.createdAt) >= thisMonthStart
  );

  const monthlyEarnings = monthlyJobs.reduce((sum, job) => {
    if (job.quote?.total) {
      return sum + job.quote.total * 0.75 + job.assessmentFee * 0.85;
    }
    return sum + job.assessmentFee * 0.85;
  }, 0);

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
          <Text className="text-2xl font-bold text-slate-900">Earnings</Text>
        </View>

        {/* Total Earnings Card */}
        <View className="mx-6 mb-6">
          <View className="bg-slate-900 rounded-2xl p-6">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-white/20 rounded-xl items-center justify-center mr-4">
                <Wallet size={24} color="white" />
              </View>
              <View>
                <Text className="text-slate-400 text-sm">Total Earnings</Text>
                <Text className="text-white text-3xl font-bold">
                  £{(locksmith?.totalEarnings || 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Stripe Connect Status */}
            {locksmith?.stripeConnectOnboarded ? (
              <Pressable className="flex-row items-center justify-between bg-white/10 rounded-xl p-3 mt-2">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-green-400 rounded-full mr-2" />
                  <Text className="text-white">Stripe Connected</Text>
                </View>
                <ExternalLink size={18} color="white" />
              </Pressable>
            ) : (
              <Pressable className="flex-row items-center justify-center bg-white rounded-xl p-3 mt-2">
                <Text className="text-slate-900 font-semibold">Set Up Payouts</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* This Month */}
        <View className="mx-6 mb-6">
          <View className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Calendar size={20} color="#22c55e" />
                <Text className="text-green-700 font-medium ml-2">This Month</Text>
              </View>
              <View className="flex-row items-center">
                <TrendingUp size={18} color="#22c55e" />
                <Text className="text-green-700 font-bold text-lg ml-1">
                  £{monthlyEarnings.toFixed(2)}
                </Text>
              </View>
            </View>
            <Text className="text-green-600 text-sm mt-2">
              {monthlyJobs.length} job{monthlyJobs.length !== 1 ? 's' : ''} completed
            </Text>
          </View>
        </View>

        {/* Commission Info */}
        <View className="mx-6 mb-6">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            Commission Structure
          </Text>
          <View className="bg-white rounded-xl p-4 border border-slate-200">
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-600">Assessment Fee</Text>
              <Text className="text-slate-900 font-medium">You keep 85%</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-slate-600">Quote/Work Total</Text>
              <Text className="text-slate-900 font-medium">You keep 75%</Text>
            </View>
          </View>
        </View>

        {/* Recent Earnings */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-slate-900 mb-3">
            Recent Earnings
          </Text>
          {completedJobs.length > 0 ? (
            completedJobs.slice(0, 10).map((job) => (
              <EarningCard key={job.id} job={job} />
            ))
          ) : (
            <View className="py-8 items-center">
              <Text className="text-slate-400">No earnings yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
