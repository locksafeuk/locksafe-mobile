/**
 * useLocationTracking Hook
 *
 * Provides real-time locksmith location tracking for customers.
 * Automatically polls the server for location updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getLocksmithLocation,
  calculateDistance,
  calculateETA,
  formatETA,
  type LocksmithLocation,
  type LocationUpdate,
} from '../services/locationStreaming';

interface UseLocationTrackingOptions {
  // Job ID to track
  jobId: string;
  // Customer's location for ETA calculation
  customerLocation?: { lat: number; lng: number };
  // Polling interval in milliseconds (default: 5000)
  pollInterval?: number;
  // Enable/disable tracking
  enabled?: boolean;
}

interface UseLocationTrackingResult {
  // Current locksmith location
  location: LocationUpdate | null;
  // Locksmith info
  locksmith: { id: string; name: string; rating: number } | null;
  // Whether we have a valid location
  hasLocation: boolean;
  // Whether the location data is stale
  isStale: boolean;
  // Loading state
  isLoading: boolean;
  // Error message if any
  error: string | null;
  // Estimated time of arrival in minutes
  etaMinutes: number | null;
  // Formatted ETA string
  etaFormatted: string | null;
  // Distance to customer in meters
  distanceMeters: number | null;
  // Manually refresh location
  refresh: () => Promise<void>;
}

export function useLocationTracking(
  options: UseLocationTrackingOptions
): UseLocationTrackingResult {
  const { jobId, customerLocation, pollInterval = 5000, enabled = true } = options;

  const [location, setLocation] = useState<LocationUpdate | null>(null);
  const [locksmith, setLocksmith] = useState<{
    id: string;
    name: string;
    rating: number;
  } | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [isStale, setIsStale] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate distance and ETA
  const distanceMeters =
    location && customerLocation
      ? calculateDistance(
          location.lat,
          location.lng,
          customerLocation.lat,
          customerLocation.lng
        )
      : null;

  const etaMinutes = distanceMeters ? calculateETA(distanceMeters) : null;
  const etaFormatted = etaMinutes ? formatETA(etaMinutes) : null;

  // Fetch location
  const fetchLocation = useCallback(async () => {
    if (!jobId || !enabled) return;

    try {
      const result = await getLocksmithLocation(jobId);

      setHasLocation(result.hasLocation);
      setIsStale(result.isStale ?? false);
      setLocation(result.location ?? null);
      setLocksmith(result.locksmith ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  }, [jobId, enabled]);

  // Manual refresh
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchLocation();
  }, [fetchLocation]);

  // Set up polling
  useEffect(() => {
    if (!enabled || !jobId) {
      setIsLoading(false);
      return;
    }

    // Initial fetch
    fetchLocation();

    // Set up polling interval
    intervalRef.current = setInterval(fetchLocation, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, pollInterval, enabled, fetchLocation]);

  return {
    location,
    locksmith,
    hasLocation,
    isStale,
    isLoading,
    error,
    etaMinutes,
    etaFormatted,
    distanceMeters,
    refresh,
  };
}

/**
 * useLocksmithLocationStreaming Hook
 *
 * For locksmiths to stream their location to customers.
 */

import {
  startLocationStreaming,
  stopLocationStreaming,
  isLocationStreaming,
} from '../services/locationStreaming';

interface UseLocksmithStreamingOptions {
  jobId: string;
  // Whether the locksmith should be streaming (e.g., when en route)
  shouldStream: boolean;
}

interface UseLocksmithStreamingResult {
  isStreaming: boolean;
  error: string | null;
  startStreaming: () => Promise<boolean>;
  stopStreaming: () => Promise<void>;
}

export function useLocksmithLocationStreaming(
  options: UseLocksmithStreamingOptions
): UseLocksmithStreamingResult {
  const { jobId, shouldStream } = options;

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startStreaming = useCallback(async () => {
    setError(null);
    const success = await startLocationStreaming(jobId);
    setIsStreaming(success);
    if (!success) {
      setError('Failed to start location streaming. Check location permissions.');
    }
    return success;
  }, [jobId]);

  const stopStreaming = useCallback(async () => {
    await stopLocationStreaming();
    setIsStreaming(false);
  }, []);

  // Auto-start/stop based on shouldStream
  useEffect(() => {
    if (shouldStream && !isStreaming) {
      startStreaming();
    } else if (!shouldStream && isStreaming) {
      stopStreaming();
    }
  }, [shouldStream, isStreaming, startStreaming, stopStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isLocationStreaming()) {
        stopLocationStreaming();
      }
    };
  }, []);

  return {
    isStreaming,
    error,
    startStreaming,
    stopStreaming,
  };
}
