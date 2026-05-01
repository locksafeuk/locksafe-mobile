import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  Switch,
  Linking,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Bell,
  CreditCard,
  Shield,
  FileText,
  HelpCircle,
  LogOut,
  ChevronRight,
  Star,
  TriangleAlert,
} from 'lucide-react-native';
import { useAuthStore } from '../../../stores/authStore';
import { deleteLocksmithAccount } from '../../../services/api/auth';
import type { Locksmith } from '../../../types';

const DELETE_CONFIRMATION_TEXT = 'DELETE';

function SettingsItem({
  icon: Icon,
  label,
  value,
  onPress,
  danger,
  toggle,
  toggleValue,
  onToggle,
}: {
  icon: typeof User;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={toggle}
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
      {toggle ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#cbd5e1', true: '#22c55e' }}
          thumbColor="white"
        />
      ) : (
        onPress && <ChevronRight size={20} color="#94a3b8" />
      )}
    </Pressable>
  );
}

export default function LocksmithSettingsScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuthStore();

  const locksmith = user as Locksmith;
  const appVersion = Constants.expoConfig?.version || '1.0.0';

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const openSupportLink = async (url: string, label: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Unable to open link', `${label} is currently unavailable.`);
        return;
      }

      await Linking.openURL(url);
    } catch (error) {
      console.error(`[Settings] Failed to open ${label} link:`, error);
      Alert.alert('Unable to open link', `Please try again later or visit ${url}`);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/locksmith-login');
        },
      },
    ]);
  };

  const deleteAccountRequest = async () => {
    await deleteLocksmithAccount();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account?',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            setDeleteConfirmationInput('');
            setIsDeleteModalVisible(true);
          },
        },
      ]
    );
  };

  const closeDeleteModal = () => {
    if (isDeletingAccount) {
      return;
    }

    setDeleteConfirmationInput('');
    setIsDeleteModalVisible(false);
  };

  const confirmDeleteAccount = async () => {
    const normalizedInput = deleteConfirmationInput.trim().toUpperCase();
    if (normalizedInput !== DELETE_CONFIRMATION_TEXT) {
      Alert.alert('Confirmation Required', "Please type 'DELETE' to confirm account deletion.");
      return;
    }

    if (isDeletingAccount) {
      return;
    }

    setIsDeletingAccount(true);

    try {
      await deleteAccountRequest();
      setDeleteConfirmationInput('');
      setIsDeleteModalVisible(false);

      await logout();

      Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
        {
          text: 'OK',
          onPress: () => router.replace('/(auth)/locksmith-login'),
        },
      ]);
    } catch (error: any) {
      console.error('[Settings] Account deletion failed:', error);

      const apiError = error?.response?.data?.error || error?.response?.data?.message;
      Alert.alert(
        'Error',
        apiError || 'Failed to delete account. Please try again or contact support.'
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const isDeleteInputValid =
    deleteConfirmationInput.trim().toUpperCase() === DELETE_CONFIRMATION_TEXT;

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
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-slate-900 rounded-full items-center justify-center mr-4">
                <Text className="text-2xl font-bold text-white">
                  {locksmith?.name?.charAt(0) || 'L'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-slate-900">{locksmith?.name}</Text>
                {locksmith?.companyName && (
                  <Text className="text-slate-500">{locksmith.companyName}</Text>
                )}
                <View className="flex-row items-center mt-1">
                  {locksmith?.isVerified ? (
                    <View className="flex-row items-center bg-green-100 px-2 py-0.5 rounded-full">
                      <Shield size={12} color="#22c55e" />
                      <Text className="text-green-700 text-xs ml-1 font-medium">Verified</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center bg-yellow-100 px-2 py-0.5 rounded-full">
                      <Text className="text-yellow-700 text-xs font-medium">Pending</Text>
                    </View>
                  )}
                  <View className="flex-row items-center ml-2">
                    <Star size={12} color="#f59e0b" fill="#f59e0b" />
                    <Text className="text-slate-600 text-sm ml-1">
                      {locksmith?.rating?.toFixed(1)} • {locksmith?.totalJobs} jobs
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <SettingsItem icon={User} label="Name" value={locksmith?.name} />
          <SettingsItem icon={Building} label="Company" value={locksmith?.companyName || 'Not set'} />
          <SettingsItem icon={Mail} label="Email" value={locksmith?.email} />
          <SettingsItem icon={Phone} label="Phone" value={locksmith?.phone} />
          <SettingsItem
            icon={MapPin}
            label="Coverage Area"
            value={`${locksmith?.coverageRadius || 10} mile radius`}
          />
        </View>

        {/* Notifications */}
        <Text className="px-6 py-2 text-sm font-medium text-slate-500 uppercase">
          Notifications
        </Text>
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-4">
          <SettingsItem
            icon={Bell}
            label="Push Notifications"
            toggle
            toggleValue={locksmith?.pushNotifications ?? true}
            onToggle={(value) => updateUser({ pushNotifications: value })}
          />
          <SettingsItem
            icon={Phone}
            label="SMS Notifications"
            toggle
            toggleValue={locksmith?.smsNotifications ?? true}
            onToggle={(value) => updateUser({ smsNotifications: value })}
          />
          <SettingsItem
            icon={Mail}
            label="Email Notifications"
            toggle
            toggleValue={locksmith?.emailNotifications ?? true}
            onToggle={(value) => updateUser({ emailNotifications: value })}
          />
        </View>

        {/* Payments */}
        <Text className="px-6 py-2 text-sm font-medium text-slate-500 uppercase">
          Payments
        </Text>
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-4">
          <SettingsItem
            icon={CreditCard}
            label="Stripe Connect"
            value={locksmith?.stripeConnectOnboarded ? 'Connected' : 'Not set up'}
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
            onPress={() => void openSupportLink('https://www.locksafe.uk/help', 'Help Center')}
          />
          <SettingsItem
            icon={FileText}
            label="Partner Terms"
            onPress={() => void openSupportLink('https://www.locksafe.uk/terms', 'Partner Terms')}
          />
          <SettingsItem
            icon={Shield}
            label="Privacy Policy"
            onPress={() => void openSupportLink('https://www.locksafe.uk/privacy', 'Privacy Policy')}
          />
        </View>

        {/* Danger Zone */}
        <Text className="px-6 py-2 text-sm font-medium text-red-500 uppercase">Danger Zone</Text>
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-4 border border-red-200">
          <View className="px-4 py-4 border-b border-red-100 flex-row items-center">
            <TriangleAlert size={18} color="#ef4444" />
            <Text className="text-red-600 font-semibold ml-2">Delete Account</Text>
          </View>
          <View className="px-4 py-4">
            <Text className="text-slate-600 text-sm mb-4">
              This will permanently delete your account and all associated data.
            </Text>
            <Pressable
              onPress={handleDeleteAccount}
              className="bg-red-600 rounded-xl py-3 items-center active:bg-red-700"
            >
              <Text className="text-white font-semibold">Delete Account</Text>
            </Pressable>
          </View>
        </View>

        {/* Logout */}
        <View className="bg-white mx-4 rounded-2xl overflow-hidden mb-8">
          <SettingsItem icon={LogOut} label="Log Out" onPress={handleLogout} danger />
        </View>

        <Text className="text-center text-slate-400 text-sm mb-8">LockSafe Partner v{appVersion}</Text>
      </ScrollView>

      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeDeleteModal}
      >
        <View className="flex-1 bg-black/50 justify-center px-6">
          <View className="bg-white rounded-2xl p-5">
            <Text className="text-xl font-bold text-slate-900 mb-2">Are you absolutely sure?</Text>
            <Text className="text-slate-600 mb-4">
              Type 'DELETE' to confirm account deletion.
            </Text>

            <TextInput
              value={deleteConfirmationInput}
              onChangeText={setDeleteConfirmationInput}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isDeletingAccount}
              placeholder="Type DELETE"
              placeholderTextColor="#94a3b8"
              className="border border-slate-300 rounded-xl px-4 py-3 text-slate-900"
            />

            <View className="flex-row justify-end mt-5">
              <Pressable
                onPress={closeDeleteModal}
                disabled={isDeletingAccount}
                className="px-4 py-2 mr-2"
              >
                <Text className="text-slate-600 font-medium">Cancel</Text>
              </Pressable>

              <Pressable
                onPress={() => void confirmDeleteAccount()}
                disabled={!isDeleteInputValid || isDeletingAccount}
                className={`px-4 py-2 rounded-lg flex-row items-center ${
                  !isDeleteInputValid || isDeletingAccount ? 'bg-red-300' : 'bg-red-600'
                }`}
              >
                {isDeletingAccount ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="text-white font-semibold ml-2">Deleting...</Text>
                  </>
                ) : (
                  <Text className="text-white font-semibold">Delete Account</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
