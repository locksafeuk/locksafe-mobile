import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, MapPin, FileText, CreditCard, CheckCircle } from 'lucide-react-native';
import { useAuthStore } from '../../../stores/authStore';
import { get, post } from '../../../services/api/client';
import type { Notification } from '../../../types';

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case 'job_update':
    case 'locksmith_assigned':
    case 'locksmith_en_route':
    case 'locksmith_arrived':
      return <MapPin size={20} color="#f97316" />;
    case 'quote_ready':
      return <FileText size={20} color="#3b82f6" />;
    case 'payment':
      return <CreditCard size={20} color="#22c55e" />;
    case 'signature_reminder':
      return <CheckCircle size={20} color="#eab308" />;
    default:
      return <Bell size={20} color="#64748b" />;
  }
}

function NotificationCard({
  notification,
  onPress,
}: {
  notification: Notification;
  onPress: () => void;
}) {
  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <Pressable
      onPress={onPress}
      className={`p-4 mb-2 rounded-xl flex-row ${
        notification.read ? 'bg-white' : 'bg-orange-50'
      } border border-slate-200 active:bg-slate-50`}
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          notification.read ? 'bg-slate-100' : 'bg-orange-100'
        }`}
      >
        <NotificationIcon type={notification.type} />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-semibold">{notification.title}</Text>
        <Text className="text-slate-500 text-sm mt-1">{notification.message}</Text>
        <Text className="text-slate-400 text-xs mt-2">
          {timeAgo(notification.createdAt)}
        </Text>
      </View>
      {!notification.read && (
        <View className="w-2 h-2 bg-orange-500 rounded-full" />
      )}
    </Pressable>
  );
}

export default function CustomerNotificationsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const response = await get<{
        success: boolean;
        notifications: Notification[];
      }>(`/api/notifications?customerId=${user.id}`);
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await post(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.jobId) {
      router.push(`/(customer)/job/${notification.jobId}`);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-2xl font-bold text-slate-900">Notifications</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
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
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <Bell size={28} color="#94a3b8" />
            </View>
            <Text className="text-slate-500 text-center">
              {isLoading ? 'Loading...' : 'No notifications yet'}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
