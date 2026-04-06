import { View, Text, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Phone,
  Mail,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import { useAuthStore } from '../../../stores/authStore';

function SettingsItem({
  icon: Icon,
  label,
  value,
  onPress,
  danger,
}: {
  icon: typeof User;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center py-4 px-4 bg-white border-b border-slate-100 active:bg-slate-50"
    >
      <View
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
          danger ? 'bg-red-100' : 'bg-slate-100'
        }`}
      >
        <Icon size={20} color={danger ? '#ef4444' : '#64748b'} />
      </View>
      <View className="flex-1">
        <Text className={`font-medium ${danger ? 'text-red-600' : 'text-slate-900'}`}>
          {label}
        </Text>
        {value && <Text className="text-slate-500 text-sm">{value}</Text>}
      </View>
      {onPress && <ChevronRight size={20} color="#94a3b8" />}
    </Pressable>
  );
}

export default function CustomerSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-slate-900">Settings</Text>
        </View>

        {/* Profile Section */}
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-4">
          <View className="p-4 border-b border-slate-100">
            <View className="w-16 h-16 bg-orange-100 rounded-full items-center justify-center mb-3">
              <Text className="text-2xl font-bold text-orange-500">
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </View>
            <Text className="text-xl font-bold text-slate-900">{user?.name}</Text>
            <Text className="text-slate-500">Customer Account</Text>
          </View>

          <SettingsItem icon={User} label="Name" value={user?.name} />
          <SettingsItem icon={Mail} label="Email" value={user?.email || 'Not set'} />
          <SettingsItem icon={Phone} label="Phone" value={user?.phone} />
        </View>

        {/* Preferences */}
        <Text className="px-6 py-2 text-sm font-medium text-slate-500 uppercase">
          Preferences
        </Text>
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-4">
          <SettingsItem
            icon={Bell}
            label="Notifications"
            value="Push & SMS enabled"
            onPress={() => {}}
          />
        </View>

        {/* Support */}
        <Text className="px-6 py-2 text-sm font-medium text-slate-500 uppercase">
          Support
        </Text>
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-4">
          <SettingsItem
            icon={HelpCircle}
            label="Help Center"
            onPress={() => {}}
          />
          <SettingsItem
            icon={FileText}
            label="Terms of Service"
            onPress={() => {}}
          />
          <SettingsItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-8">
          <SettingsItem icon={LogOut} label="Log Out" onPress={handleLogout} danger />
        </View>

        <Text className="text-center text-slate-400 text-sm mb-8">
          LockSafe v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
