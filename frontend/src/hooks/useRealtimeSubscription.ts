import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from './useRealtime';
import {
  RealtimeChannel,
  RealtimeEvent,
  ScriptSubmissionEvent,
  BatchUpdateEvent,
  ExamTimetableEvent,
  IncidentEvent,
  NotificationEvent,
} from '../types/realtime';

/**
 * Custom hook for subscribing to real-time events
 * Automatically handles subscription/unsubscription and React Query cache invalidation
 *
 * @example
 * useRealtimeSubscription({
 *   channel: RealtimeChannel.SCRIPT_SUBMISSION,
 *   event: ScriptSubmissionEvent.SCRIPT_SUBMITTED,
 *   onEvent: (event) => console.log('New script submitted:', event.payload),
 *   invalidateQueries: ['batch-scripts'], // Optional: queries to invalidate
 * });
 */
export interface UseRealtimeSubscriptionOptions {
  channel: RealtimeChannel;
  event?: string; // If undefined, subscribe to all events in channel
  enabled?: boolean; // If false, don't subscribe
  onEvent?: (event: RealtimeEvent) => void;
  invalidateQueries?: string[]; // Query keys to invalidate when event is received
  room?: string; // Optional room to join
}

export const useRealtimeSubscription = (options: UseRealtimeSubscriptionOptions): void => {
  const { channel, event, enabled = true, onEvent, invalidateQueries, room } = options;
  const { subscribe, joinRoom, leaveRoom } = useRealtime();
  const queryClient = useQueryClient();
  const onEventRef = useRef(onEvent);

  // Keep onEvent callback up to date without re-subscribing
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  // Handle event with callback and query invalidation
  const handleEvent = useCallback(
    (realtimeEvent: RealtimeEvent) => {
      // Call user-provided callback
      if (onEventRef.current) {
        onEventRef.current(realtimeEvent);
      }

      // Invalidate specified queries
      if (invalidateQueries && invalidateQueries.length > 0) {
        invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey: [queryKey] });
        });
        console.log('🔄 Invalidated queries:', invalidateQueries);
      }
    },
    [queryClient, invalidateQueries]
  );

  // Subscribe to real-time events
  useEffect(() => {
    if (!enabled) return;

    const unsubscribe = subscribe({
      channel,
      event,
      handler: handleEvent,
    });

    return () => {
      unsubscribe();
    };
  }, [enabled, channel, event, subscribe, handleEvent]);

  // Join/leave room if specified
  useEffect(() => {
    if (!enabled || !room) return;

    joinRoom(room);

    return () => {
      leaveRoom(room);
    };
  }, [enabled, room, joinRoom, leaveRoom]);
};

/**
 * Pre-configured hooks for common real-time subscriptions
 */

// Script Submission Events
export const useScriptSubmissionEvents = (
  options: Omit<UseRealtimeSubscriptionOptions, 'channel'> = {}
): void => {
  useRealtimeSubscription({
    ...options,
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    invalidateQueries: options.invalidateQueries || ['script-submissions', 'batch-scripts'],
  });
};

export const useScriptSubmittedEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.SCRIPT_SUBMITTED,
    enabled,
    onEvent,
    invalidateQueries: ['script-submissions', 'batch-scripts'],
  });
};

export const useBatchSealedEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    event: ScriptSubmissionEvent.BATCH_SEALED,
    enabled,
    onEvent,
    invalidateQueries: ['batch-scripts'],
  });
};

// Batch Update Events
export const useBatchUpdateEvents = (
  options: Omit<UseRealtimeSubscriptionOptions, 'channel'> = {}
): void => {
  useRealtimeSubscription({
    ...options,
    channel: RealtimeChannel.BATCH_UPDATE,
    invalidateQueries: options.invalidateQueries || ['batch-scripts', 'batch-stats'],
  });
};

export const useBatchCreatedEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.BATCH_UPDATE,
    event: BatchUpdateEvent.BATCH_CREATED,
    enabled,
    onEvent,
    invalidateQueries: ['batch-scripts'],
  });
};

export const useBatchStatusChangedEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.BATCH_UPDATE,
    event: BatchUpdateEvent.BATCH_STATUS_CHANGED,
    enabled,
    onEvent,
    invalidateQueries: ['batch-scripts'],
  });
};

// Exam Timetable Events
export const useExamTimetableEvents = (
  options: Omit<UseRealtimeSubscriptionOptions, 'channel'> = {}
): void => {
  useRealtimeSubscription({
    ...options,
    channel: RealtimeChannel.EXAM_TIMETABLE,
    invalidateQueries: options.invalidateQueries || ['exam-timetables', 'batch-scripts'],
  });
};

export const useTimetablePublishedEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.EXAM_TIMETABLE,
    event: ExamTimetableEvent.TIMETABLE_PUBLISHED,
    enabled,
    onEvent,
    invalidateQueries: ['exam-timetables'],
  });
};

export const useBatchesCreatedEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.EXAM_TIMETABLE,
    event: ExamTimetableEvent.BATCHES_CREATED,
    enabled,
    onEvent,
    invalidateQueries: ['batch-scripts'],
  });
};

// Incident Events
export const useIncidentEvents = (
  options: Omit<UseRealtimeSubscriptionOptions, 'channel'> = {}
): void => {
  useRealtimeSubscription({
    ...options,
    channel: RealtimeChannel.INCIDENT,
    invalidateQueries: options.invalidateQueries || ['incidents'],
  });
};

export const useIncidentReportedEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.INCIDENT,
    event: IncidentEvent.INCIDENT_REPORTED,
    enabled,
    onEvent,
    invalidateQueries: ['incidents'],
  });
};

// Notification Events
export const useNotificationEvents = (
  options: Omit<UseRealtimeSubscriptionOptions, 'channel'> = {}
): void => {
  useRealtimeSubscription({
    ...options,
    channel: RealtimeChannel.NOTIFICATION,
    invalidateQueries: options.invalidateQueries || ['notifications'],
  });
};

export const useNewNotificationEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.NOTIFICATION,
    event: NotificationEvent.NEW_NOTIFICATION,
    enabled,
    onEvent,
    invalidateQueries: ['notifications'],
  });
};
