import { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, Image as ImageIcon, Trash2, Plus } from 'lucide-react-native';
import { useJobStore } from '../../../../stores/jobStore';
import { uploadJobPhoto, getJobPhotos, deleteJobPhoto } from '../../../../services/api/jobs';
import { LocationService } from '../../../../services/location';
import type { Photo, PhotoType } from '../../../../types';

const PHOTO_TYPES: { value: PhotoType; label: string; description: string }[] = [
  { value: 'BEFORE', label: 'Before', description: 'Show the problem before work starts' },
  { value: 'LOCK_SERIAL', label: 'Lock Serial', description: 'Capture the lock serial number' },
  { value: 'DURING', label: 'During', description: 'Document work in progress' },
  { value: 'AFTER', label: 'After', description: 'Show completed work' },
  { value: 'DAMAGE', label: 'Damage', description: 'Document any existing damage' },
];

export default function LocksmithPhotosScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentJob, fetchJob } = useJobStore();

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedType, setSelectedType] = useState<PhotoType>('BEFORE');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJob(id);
      loadPhotos();
    }
  }, [id]);

  const loadPhotos = async () => {
    try {
      const response = await getJobPhotos(id!);
      if (response.success) {
        setPhotos(response.photos);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take photos.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0]);
    }
  };

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Photo library permission is required to select photos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      await uploadPhoto(result.assets[0]);
    }
  };

  const uploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    setIsUploading(true);

    try {
      const gps = await LocationService.getCurrentPosition();
      const base64 = `data:image/jpeg;base64,${asset.base64}`;

      const response = await uploadJobPhoto(id!, {
        url: base64,
        type: selectedType,
        caption: `${selectedType} photo`,
        gpsLat: gps?.lat,
        gpsLng: gps?.lng,
      });

      if (response.success) {
        await loadPhotos();
        Alert.alert('Success', 'Photo uploaded successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = (photoId: string) => {
    Alert.alert('Delete Photo', 'Are you sure you want to delete this photo?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteJobPhoto(id!, photoId);
            setPhotos(photos.filter((p) => p.id !== photoId));
          } catch (error) {
            Alert.alert('Error', 'Failed to delete photo');
          }
        },
      },
    ]);
  };

  const getPhotosByType = (type: PhotoType) => {
    return photos.filter((p) => p.type === type);
  };

  if (!currentJob) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0f172a" />
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
            Job Photos
          </Text>
          <Text className="text-slate-500 text-sm">{currentJob.jobNumber}</Text>
        </View>
        <View className="bg-slate-100 px-3 py-1 rounded-full">
          <Text className="text-slate-600 font-medium">{photos.length} photos</Text>
        </View>
      </View>

      <ScrollView className="flex-1">
        {/* Photo Type Selector */}
        <View className="px-4 pt-4">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            Photo Type
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {PHOTO_TYPES.map((type) => {
                const count = getPhotosByType(type.value).length;
                return (
                  <Pressable
                    key={type.value}
                    onPress={() => setSelectedType(type.value)}
                    className={`px-4 py-2 rounded-full flex-row items-center ${
                      selectedType === type.value
                        ? 'bg-slate-900'
                        : 'bg-white border border-slate-200'
                    }`}
                  >
                    <Text
                      className={
                        selectedType === type.value ? 'text-white' : 'text-slate-700'
                      }
                    >
                      {type.label}
                    </Text>
                    {count > 0 && (
                      <View
                        className={`ml-2 w-5 h-5 rounded-full items-center justify-center ${
                          selectedType === type.value ? 'bg-white/20' : 'bg-slate-100'
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            selectedType === type.value
                              ? 'text-white'
                              : 'text-slate-600'
                          }`}
                        >
                          {count}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Selected Type Description */}
          <Text className="text-slate-500 text-sm mt-2">
            {PHOTO_TYPES.find((t) => t.value === selectedType)?.description}
          </Text>
        </View>

        {/* Capture Buttons */}
        <View className="px-4 pt-4">
          <View className="flex-row gap-3">
            <Pressable
              onPress={takePhoto}
              disabled={isUploading}
              className={`flex-1 py-4 rounded-xl flex-row items-center justify-center ${
                isUploading ? 'bg-slate-200' : 'bg-slate-900 active:bg-slate-800'
              }`}
            >
              {isUploading ? (
                <ActivityIndicator color="#64748b" />
              ) : (
                <>
                  <Camera size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Take Photo</Text>
                </>
              )}
            </Pressable>
            <Pressable
              onPress={pickPhoto}
              disabled={isUploading}
              className={`flex-1 py-4 rounded-xl flex-row items-center justify-center border ${
                isUploading ? 'border-slate-200 bg-slate-50' : 'border-slate-300 bg-white'
              }`}
            >
              <ImageIcon size={20} color={isUploading ? '#94a3b8' : '#0f172a'} />
              <Text className={`font-semibold ml-2 ${isUploading ? 'text-slate-400' : 'text-slate-900'}`}>
                From Gallery
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Photos Grid */}
        <View className="px-4 pt-6 pb-4">
          <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
            {selectedType} Photos
          </Text>

          {isLoading ? (
            <View className="py-12 items-center">
              <ActivityIndicator size="large" color="#0f172a" />
            </View>
          ) : getPhotosByType(selectedType).length > 0 ? (
            <View className="flex-row flex-wrap gap-3">
              {getPhotosByType(selectedType).map((photo) => (
                <View
                  key={photo.id}
                  className="w-[48%] aspect-square rounded-xl overflow-hidden bg-slate-200"
                >
                  <Image
                    source={{ uri: photo.url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  <Pressable
                    onPress={() => handleDeletePhoto(photo.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                  >
                    <Trash2 size={16} color="white" />
                  </Pressable>
                  <View className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                    <Text className="text-white text-xs">
                      {new Date(photo.takenAt).toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-12 items-center bg-white rounded-xl border border-dashed border-slate-300">
              <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-3">
                <Camera size={28} color="#94a3b8" />
              </View>
              <Text className="text-slate-500 text-center">
                No {selectedType.toLowerCase()} photos yet
              </Text>
              <Text className="text-slate-400 text-sm text-center mt-1">
                Use the buttons above to add photos
              </Text>
            </View>
          )}
        </View>

        {/* All Photos Summary */}
        {photos.length > 0 && (
          <View className="mx-4 mb-6">
            <Text className="text-sm font-medium text-slate-500 uppercase mb-3">
              All Photos Summary
            </Text>
            <View className="bg-white rounded-xl p-4 border border-slate-200">
              {PHOTO_TYPES.map((type) => {
                const count = getPhotosByType(type.value).length;
                return (
                  <View
                    key={type.value}
                    className="flex-row items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <Text className="text-slate-600">{type.label}</Text>
                    <View
                      className={`px-3 py-1 rounded-full ${
                        count > 0 ? 'bg-green-100' : 'bg-slate-100'
                      }`}
                    >
                      <Text
                        className={count > 0 ? 'text-green-700' : 'text-slate-500'}
                      >
                        {count} photo{count !== 1 ? 's' : ''}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Done Button */}
      <View className="p-4 bg-white border-t border-slate-200">
        <Pressable
          onPress={() => router.back()}
          className="py-4 bg-slate-900 rounded-xl items-center active:bg-slate-800"
        >
          <Text className="text-white font-semibold text-lg">Done</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
