/**
 * MapPlaceholder Component
 *
 * Fallback component shown when MapView cannot be rendered
 * (e.g., missing API key, web platform, or errors).
 */

import React from 'react';
import { View, Text, Pressable, Linking, Platform } from 'react-native';
import { MapPin, Navigation, ExternalLink } from 'lucide-react-native';

interface MapPlaceholderProps {
  address?: string;
  postcode?: string;
  latitude?: number;
  longitude?: number;
  height?: number;
  message?: string;
}

export default function MapPlaceholder({
  address,
  postcode,
  latitude,
  longitude,
  height = 200,
  message = 'Map view',
}: MapPlaceholderProps) {
  const handleOpenMaps = () => {
    if (latitude && longitude) {
      const url = Platform.select({
        ios: `maps:0,0?q=${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
        default: `https://maps.google.com/?q=${latitude},${longitude}`,
      });
      if (url) Linking.openURL(url);
    } else if (postcode) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(postcode)}`;
      Linking.openURL(url);
    }
  };

  return (
    <Pressable
      onPress={handleOpenMaps}
      style={{ height }}
      className="bg-slate-200 rounded-xl items-center justify-center"
    >
      <View className="items-center">
        <View className="w-12 h-12 bg-slate-300 rounded-full items-center justify-center mb-2">
          <MapPin size={24} color="#64748b" />
        </View>
        <Text className="text-slate-500 font-medium">{message}</Text>
        {address && (
          <Text className="text-slate-400 text-sm text-center mt-1 px-4" numberOfLines={2}>
            {address}
          </Text>
        )}
        {(latitude || postcode) && (
          <View className="flex-row items-center mt-2">
            <ExternalLink size={14} color="#3b82f6" />
            <Text className="text-blue-500 text-sm ml-1">Open in Maps</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
