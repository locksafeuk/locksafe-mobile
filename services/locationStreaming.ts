/**
 * Location Streaming Service
 *
 * Handles real-time location updates for locksmith tracking.
 * - Locksmiths: Stream their location to the server
 * - Customers: Poll for locksmith location updates
 */

import * as Location from 'expo-location';
import { post, get } from './api/client';

// Types
export interface LocationUpdate {
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

export interface LocksmithLocation {
  hasLocation: boolean;
  isStale?: boolean;
  location?: LocationUpdate;
  locksmith?: {
    id: string;
    name: string;
    rating: number;
  };
}

// Location streaming state
let locationSubscription: Location.LocationSubscription | null = null;
let isStreaming = false;
let currentJobId: string | null = null;

/**
 * Start streaming locksmith location to server
 * Call this when locksmith starts EN_ROUTE
 */
export async function startLocationStreaming(jobId: string): Promise<boolean> {
  if (isStreaming && currentJobId === jobId) {
    console.log('[Location] Already streaming for this job');
    return true;
  }

  // Stop any existing stream
  await stopLocationStreaming();

  try {
    // Request permissions
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();

    if (foregroundStatus !== 'granted') {
      console.error('[Location] Foreground permission not granted');
      return false;
    }

    // Try to get background permissions (optional but recommended)
    try {
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === 'granted') {
        console.log('[Location] Background permission granted');
      }
    } catch (error) {
      console.log('[Location] Background permission not available');
    }

    // Start watching location
    currentJobId = jobId;
    isStreaming = true;

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5 seconds
        distanceInterval: 10, // Or when moved 10 meters
      },
      async (location) => {
        if (!isStreaming || !currentJobId) return;

        try {
          await sendLocationUpdate(currentJobId, {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
            heading: location.coords.heading ?? undefined,
            speed: location.coords.speed ?? undefined,
            accuracy: location.coords.accuracy ?? undefined,
          });
        } catch (error) {
          console.error('[Location] Failed to send update:', error);
        }
      }
    );

    console.log('[Location] Started streaming for job:', jobId);
    return true;
  } catch (error) {
    console.error('[Location] Failed to start streaming:', error);
    isStreaming = false;
    currentJobId = null;
    return false;
  }
}

/**
 * Stop streaming location
 * Call this when job is completed or locksmith goes offline
 */
export async function stopLocationStreaming(): Promise<void> {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
  isStreaming = false;
  currentJobId = null;
  console.log('[Location] Stopped streaming');
}

/**
 * Send a single location update to the server
 */
async function sendLocationUpdate(
  jobId: string,
  location: Omit<LocationUpdate, 'timestamp'>
): Promise<void> {
  await post(`/api/jobs/${jobId}/location-stream`, location);
}

/**
 * Get current locksmith location for a job
 * Call this from customer app to track locksmith
 */
export async function getLocksmithLocation(
  jobId: string
): Promise<LocksmithLocation> {
  try {
    const response = await get<{
      success: boolean;
      hasLocation: boolean;
      isStale?: boolean;
      location?: LocationUpdate;
      locksmith?: {
        id: string;
        name: string;
        rating: number;
      };
    }>(`/api/jobs/${jobId}/location-stream`);

    if (response.success) {
      return {
        hasLocation: response.hasLocation,
        isStale: response.isStale,
        location: response.location,
        locksmith: response.locksmith,
      };
    }

    return { hasLocation: false };
  } catch (error) {
    console.error('[Location] Failed to get locksmith location:', error);
    return { hasLocation: false };
  }
}

/**
 * Check if currently streaming
 */
export function isLocationStreaming(): boolean {
  return isStreaming;
}

/**
 * Get current streaming job ID
 */
export function getCurrentStreamingJobId(): string | null {
  return currentJobId;
}

/**
 * Calculate distance between two coordinates in meters
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate ETA in minutes based on distance and average speed
 * @param distanceMeters Distance in meters
 * @param speedMps Speed in meters per second (default: 8.33 m/s = 30 km/h city traffic)
 */
export function calculateETA(
  distanceMeters: number,
  speedMps: number = 8.33
): number {
  const timeSeconds = distanceMeters / speedMps;
  return Math.ceil(timeSeconds / 60); // Round up to nearest minute
}

/**
 * Format ETA for display
 */
export function formatETA(minutes: number): string {
  if (minutes < 1) {
    return 'Arriving now';
  } else if (minutes === 1) {
    return '1 minute away';
  } else if (minutes < 60) {
    return `${minutes} minutes away`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} away`;
    }
    return `${hours}h ${mins}m away`;
  }
}
