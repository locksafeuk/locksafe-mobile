import * as Location from 'expo-location';
import { Alert, Linking } from 'react-native';
import type { GPSCoordinates } from '../types';

export class LocationService {
  private static watchSubscription: Location.LocationSubscription | null = null;

  static async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Required',
          'LockSafe needs your location to find nearby locksmiths.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Linking.openSettings() },
          ]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Location permission error:', error);
      return false;
    }
  }

  static async getCurrentPosition(): Promise<GPSCoordinates | null> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return null;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
      };
    } catch (error) {
      console.error('Get location error:', error);
      return null;
    }
  }

  static async startWatching(
    callback: (position: GPSCoordinates) => void,
    options: { distanceInterval?: number; timeInterval?: number } = {}
  ): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) return;

      this.stopWatching();

      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: options.distanceInterval || 10,
          timeInterval: options.timeInterval || 5000,
        },
        (location) => {
          callback({
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            accuracy: location.coords.accuracy || undefined,
          });
        }
      );
    } catch (error) {
      console.error('Watch location error:', error);
    }
  }

  static stopWatching(): void {
    if (this.watchSubscription) {
      this.watchSubscription.remove();
      this.watchSubscription = null;
    }
  }

  static calculateDistance(from: GPSCoordinates, to: GPSCoordinates): number {
    const R = 3959;
    const dLat = this.toRad(to.lat - from.lat);
    const dLng = this.toRad(to.lng - from.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(from.lat)) *
        Math.cos(this.toRad(to.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  static formatDistance(miles: number): string {
    if (miles < 0.1) return 'Nearby';
    if (miles < 1) return `${Math.round(miles * 10) / 10} mi`;
    return `${Math.round(miles)} mi`;
  }

  private static toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
