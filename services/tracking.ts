import { API_BASE_URL } from './api/client';

// ==========================================
// SSE Tracking Service Types
// ==========================================

export interface LocationUpdate {
  type: 'location_update';
  data: {
    lat: number;
    lng: number;
    eta: number; // minutes
    timestamp: string;
  };
}

export interface StatusUpdate {
  type: 'status_update';
  data: {
    status: string;
    timestamp: string;
  };
}

export interface ConnectedEvent {
  type: 'connected';
  jobId: string;
}

export interface PingEvent {
  type: 'ping';
}

export type TrackingEvent =
  | LocationUpdate
  | StatusUpdate
  | ConnectedEvent
  | PingEvent;

type EventCallback = (data: TrackingEvent) => void;

// ==========================================
// Tracking Service Class
// ==========================================

/**
 * TrackingService provides real-time job tracking via Server-Sent Events (SSE).
 * Provides real-time job tracking via SSE for location and status updates.
 */
class TrackingService {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds
  private currentJobId: string | null = null;

  /**
   * Connect to the tracking stream for a specific job
   */
  connect(jobId: string): void {
    if (this.eventSource) {
      this.disconnect();
    }

    this.currentJobId = jobId;
    this.reconnectAttempts = 0;

    try {
      const url = `${API_BASE_URL}/api/notifications/stream?jobId=${jobId}`;
      this.eventSource = new EventSource(url);

      this.eventSource.onopen = () => {
        console.log('Tracking SSE connected');
        this.reconnectAttempts = 0;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as TrackingEvent;
          this.emit(data.type, data);
        } catch (e) {
          console.error('SSE parse error:', e);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE error:', error);
        this.emit('error', error as any);
        this.handleReconnect();
      };
    } catch (error) {
      console.error('Failed to create EventSource:', error);
      this.handleReconnect();
    }
  }

  /**
   * Handle reconnection logic
   */
  private handleReconnect(): void {
    if (
      this.reconnectAttempts < this.maxReconnectAttempts &&
      this.currentJobId
    ) {
      this.reconnectAttempts++;
      console.log(
        `Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`
      );

      setTimeout(() => {
        if (this.currentJobId) {
          this.connect(this.currentJobId);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.log('Max reconnect attempts reached');
      this.emit('disconnected', {} as any);
    }
  }

  /**
   * Disconnect from the tracking stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.currentJobId = null;
    this.reconnectAttempts = 0;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return (
      this.eventSource !== null &&
      this.eventSource.readyState === EventSource.OPEN
    );
  }

  /**
   * Register an event listener
   */
  on(eventType: string, callback: EventCallback): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  /**
   * Remove an event listener
   */
  off(eventType: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      this.listeners.set(
        eventType,
        callbacks.filter((cb) => cb !== callback)
      );
    }
  }

  /**
   * Remove all listeners for an event type
   */
  removeAllListeners(eventType?: string): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(eventType: string, data: TrackingEvent): void {
    const callbacks = this.listeners.get(eventType) || [];
    callbacks.forEach((cb) => cb(data));

    // Also emit to 'all' listeners
    const allCallbacks = this.listeners.get('all') || [];
    allCallbacks.forEach((cb) => cb(data));
  }
}

// Export a singleton instance
export const trackingService = new TrackingService();

// ==========================================
// React Hook for Tracking
// ==========================================

import { useEffect, useState, useCallback } from 'react';

export interface TrackingState {
  isConnected: boolean;
  locksmithLocation: { lat: number; lng: number } | null;
  eta: number | null;
  lastStatus: string | null;
  error: Error | null;
}

/**
 * React hook for tracking a job
 */
export function useJobTracking(jobId: string | null): TrackingState {
  const [state, setState] = useState<TrackingState>({
    isConnected: false,
    locksmithLocation: null,
    eta: null,
    lastStatus: null,
    error: null,
  });

  useEffect(() => {
    if (!jobId) return;

    trackingService.connect(jobId);

    const handleLocationUpdate = (data: TrackingEvent) => {
      if (data.type === 'location_update') {
        setState((prev) => ({
          ...prev,
          locksmithLocation: {
            lat: data.data.lat,
            lng: data.data.lng,
          },
          eta: data.data.eta,
        }));
      }
    };

    const handleStatusUpdate = (data: TrackingEvent) => {
      if (data.type === 'status_update') {
        setState((prev) => ({
          ...prev,
          lastStatus: data.data.status,
        }));
      }
    };

    const handleConnected = () => {
      setState((prev) => ({
        ...prev,
        isConnected: true,
        error: null,
      }));
    };

    const handleError = (data: any) => {
      setState((prev) => ({
        ...prev,
        error: new Error('Connection error'),
      }));
    };

    const handleDisconnected = () => {
      setState((prev) => ({
        ...prev,
        isConnected: false,
      }));
    };

    trackingService.on('location_update', handleLocationUpdate);
    trackingService.on('status_update', handleStatusUpdate);
    trackingService.on('connected', handleConnected);
    trackingService.on('error', handleError);
    trackingService.on('disconnected', handleDisconnected);

    return () => {
      trackingService.disconnect();
      trackingService.removeAllListeners();
    };
  }, [jobId]);

  return state;
}
