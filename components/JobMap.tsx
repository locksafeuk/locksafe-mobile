/**
 * JobMap Component
 *
 * Reusable map component for displaying job locations,
 * locksmith tracking, and customer positions.
 *
 * Uses react-native-maps (MapView) with Google Maps provider on Android
 * and Apple Maps on iOS (default).
 */

import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { MapPin, Navigation, User } from 'lucide-react-native';

// UK default center (London)
const UK_DEFAULT: Region = {
  latitude: 51.5074,
  longitude: -0.1278,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

interface JobMapProps {
  /** Job/customer location */
  jobLocation?: MapLocation | null;
  /** Locksmith's current location (for live tracking) */
  locksmithLocation?: MapLocation | null;
  /** Customer's current location */
  customerLocation?: MapLocation | null;
  /** Map height (default: 250) */
  height?: number;
  /** Whether to show the route line between locksmith and job */
  showRoute?: boolean;
  /** Whether to auto-fit markers in view */
  autoFitMarkers?: boolean;
  /** Additional style */
  style?: object;
  /** Whether the map is interactive */
  interactive?: boolean;
}

export default function JobMap({
  jobLocation,
  locksmithLocation,
  customerLocation,
  height = 250,
  showRoute = true,
  autoFitMarkers = true,
  style,
  interactive = true,
}: JobMapProps) {
  const mapRef = useRef<MapView>(null);

  // Calculate initial region based on available locations
  const initialRegion = useMemo(() => {
    if (jobLocation) {
      return {
        latitude: jobLocation.latitude,
        longitude: jobLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
    }
    if (locksmithLocation) {
      return {
        latitude: locksmithLocation.latitude,
        longitude: locksmithLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
    }
    if (customerLocation) {
      return {
        latitude: customerLocation.latitude,
        longitude: customerLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
    }
    return UK_DEFAULT;
  }, []);

  // Auto-fit markers when locations change
  useEffect(() => {
    if (!autoFitMarkers || !mapRef.current) return;

    const coords: Array<{ latitude: number; longitude: number }> = [];
    if (jobLocation) coords.push({ latitude: jobLocation.latitude, longitude: jobLocation.longitude });
    if (locksmithLocation) coords.push({ latitude: locksmithLocation.latitude, longitude: locksmithLocation.longitude });
    if (customerLocation) coords.push({ latitude: customerLocation.latitude, longitude: customerLocation.longitude });

    if (coords.length >= 2) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
    } else if (coords.length === 1) {
      mapRef.current.animateToRegion(
        {
          latitude: coords[0].latitude,
          longitude: coords[0].longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    }
  }, [
    jobLocation?.latitude,
    jobLocation?.longitude,
    locksmithLocation?.latitude,
    locksmithLocation?.longitude,
    autoFitMarkers,
  ]);

  // Route line between locksmith and job
  const routeCoords = useMemo(() => {
    if (!showRoute || !locksmithLocation || !jobLocation) return null;
    return [
      { latitude: locksmithLocation.latitude, longitude: locksmithLocation.longitude },
      { latitude: jobLocation.latitude, longitude: jobLocation.longitude },
    ];
  }, [showRoute, locksmithLocation, jobLocation]);

  return (
    <View style={[styles.container, { height }, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={false}
        mapType="standard"
      >
        {/* Job/Destination Marker */}
        {jobLocation && (
          <Marker
            coordinate={{
              latitude: jobLocation.latitude,
              longitude: jobLocation.longitude,
            }}
            title={jobLocation.title || 'Job Location'}
            description={jobLocation.description}
            pinColor="#f97316"
          />
        )}

        {/* Locksmith Marker */}
        {locksmithLocation && (
          <Marker
            coordinate={{
              latitude: locksmithLocation.latitude,
              longitude: locksmithLocation.longitude,
            }}
            title={locksmithLocation.title || 'Locksmith'}
            description={locksmithLocation.description}
          >
            <View style={styles.locksmithMarker}>
              <Navigation size={16} color="white" />
            </View>
          </Marker>
        )}

        {/* Customer Marker */}
        {customerLocation && (
          <Marker
            coordinate={{
              latitude: customerLocation.latitude,
              longitude: customerLocation.longitude,
            }}
            title={customerLocation.title || 'Customer'}
            description={customerLocation.description}
            pinColor="#3b82f6"
          />
        )}

        {/* Route line */}
        {routeCoords && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#3b82f6"
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#e2e8f0',
  },
  map: {
    flex: 1,
  },
  locksmithMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
