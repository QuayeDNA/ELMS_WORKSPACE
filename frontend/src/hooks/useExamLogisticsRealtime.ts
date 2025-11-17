import { useEffect, useCallback } from 'react';
import { useRealtimeContext } from '@/contexts/RealtimeContext';
import { ExamLogisticsEvent, ExamLogisticsWebSocketData } from '@/types/examLogistics';
import { RealtimeChannel } from '@/types/realtime';

interface LogisticsSubscription {
  event: ExamLogisticsEvent;
  handler: (data: ExamLogisticsWebSocketData) => void;
}

export function useExamLogisticsRealtime() {
  const { isConnected, subscribe, joinRoom, leaveRoom } = useRealtimeContext();

  // Subscribe to logistics events
  const subscribeToLogistics = useCallback((subscription: LogisticsSubscription) => {
    return subscribe({
      channel: RealtimeChannel.EXAM_LOGISTICS,
      event: subscription.event,
      handler: (event) => {
        // Type assertion since we know this is a logistics event
        subscription.handler(event.payload as ExamLogisticsWebSocketData);
      }
    });
  }, [subscribe]);

  // Join institution room for institution-wide updates
  const joinInstitutionRoom = useCallback((institutionId: number) => {
    joinRoom(`institution_${institutionId}`);
  }, [joinRoom]);

  // Join venue room for venue-specific updates
  const joinVenueRoom = useCallback((venueId: string) => {
    joinRoom(`venue_${venueId}`);
  }, [joinRoom]);

  // Leave institution room
  const leaveInstitutionRoom = useCallback((institutionId: number) => {
    leaveRoom(`institution_${institutionId}`);
  }, [leaveRoom]);

  // Leave venue room
  const leaveVenueRoom = useCallback((venueId: string) => {
    leaveRoom(`venue_${venueId}`);
  }, [leaveRoom]);

  return {
    isConnected,
    subscribeToLogistics,
    joinInstitutionRoom,
    joinVenueRoom,
    leaveInstitutionRoom,
    leaveVenueRoom
  };
}

// Hook for dashboard real-time updates
export function useLogisticsDashboardRealtime(onUpdate: () => void) {
  const { subscribeToLogistics, joinInstitutionRoom, leaveInstitutionRoom } = useExamLogisticsRealtime();

  useEffect(() => {
    // Subscribe to dashboard updates
    const unsubscribeDashboard = subscribeToLogistics({
      event: ExamLogisticsEvent.DASHBOARD_UPDATED,
      handler: (data) => {
        console.log('Dashboard update received:', data);
        onUpdate();
      }
    });

    // Subscribe to student check-ins
    const unsubscribeStudentCheckIn = subscribeToLogistics({
      event: ExamLogisticsEvent.STUDENT_CHECKED_IN,
      handler: (data) => {
        console.log('Student checked in:', data);
        onUpdate();
      }
    });

    // Subscribe to invigilator check-ins
    const unsubscribeInvigilatorCheckIn = subscribeToLogistics({
      event: ExamLogisticsEvent.INVIGILATOR_CHECKED_IN,
      handler: (data) => {
        console.log('Invigilator checked in:', data);
        onUpdate();
      }
    });

    // Subscribe to incidents
    const unsubscribeIncidentReported = subscribeToLogistics({
      event: ExamLogisticsEvent.INCIDENT_REPORTED,
      handler: (data) => {
        console.log('Incident reported:', data);
        onUpdate();
      }
    });

    const unsubscribeIncidentResolved = subscribeToLogistics({
      event: ExamLogisticsEvent.INCIDENT_RESOLVED,
      handler: (data) => {
        console.log('Incident resolved:', data);
        onUpdate();
      }
    });

    // Join institution room (assuming institution ID is available)
    // This would typically come from user context
    const institutionId = 1; // Placeholder - should come from auth context
    joinInstitutionRoom(institutionId);

    return () => {
      unsubscribeDashboard();
      unsubscribeStudentCheckIn();
      unsubscribeInvigilatorCheckIn();
      unsubscribeIncidentReported();
      unsubscribeIncidentResolved();
      leaveInstitutionRoom(institutionId);
    };
  }, [subscribeToLogistics, joinInstitutionRoom, leaveInstitutionRoom, onUpdate]);
}

// Hook for venue-specific real-time updates
export function useVenueRealtime(venueId: string, onUpdate: () => void) {
  const { subscribeToLogistics, joinVenueRoom, leaveVenueRoom } = useExamLogisticsRealtime();

  useEffect(() => {
    if (!venueId) return;

    // Subscribe to venue status changes
    const unsubscribeVenueStatus = subscribeToLogistics({
      event: ExamLogisticsEvent.VENUE_STATUS_CHANGED,
      handler: (data) => {
        if (data.venueId === venueId) {
          console.log('Venue status changed:', data);
          onUpdate();
        }
      }
    });

    // Subscribe to session events for this venue
    const unsubscribeSessionStarted = subscribeToLogistics({
      event: ExamLogisticsEvent.SESSION_STARTED,
      handler: (data) => {
        if (data.venueId === venueId) {
          console.log('Session started:', data);
          onUpdate();
        }
      }
    });

    const unsubscribeSessionEnded = subscribeToLogistics({
      event: ExamLogisticsEvent.SESSION_ENDED,
      handler: (data) => {
        if (data.venueId === venueId) {
          console.log('Session ended:', data);
          onUpdate();
        }
      }
    });

    // Join venue room
    joinVenueRoom(venueId);

    return () => {
      unsubscribeVenueStatus();
      unsubscribeSessionStarted();
      unsubscribeSessionEnded();
      leaveVenueRoom(venueId);
    };
  }, [venueId, subscribeToLogistics, joinVenueRoom, leaveVenueRoom, onUpdate]);
}

// Hook for real-time notifications
export function useLogisticsNotifications() {
  const { subscribeToLogistics } = useExamLogisticsRealtime();

  useEffect(() => {
    // Subscribe to all logistics events for notifications
    const events = [
      ExamLogisticsEvent.STUDENT_CHECKED_IN,
      ExamLogisticsEvent.INVIGILATOR_CHECKED_IN,
      ExamLogisticsEvent.INCIDENT_REPORTED,
      ExamLogisticsEvent.INCIDENT_RESOLVED,
      ExamLogisticsEvent.SESSION_STARTED,
      ExamLogisticsEvent.SESSION_ENDED,
      ExamLogisticsEvent.VENUE_STATUS_CHANGED
    ];

    const unsubscribers = events.map(event =>
      subscribeToLogistics({
        event,
        handler: (data) => {
          // Here you could integrate with a notification system
          // For now, just log the events
          console.log(`Logistics notification: ${event}`, data);

          // You could dispatch to a notification store or show toast notifications
          // Example: showToast(`${getEventMessage(event, data)}`, { type: getEventType(event) });
        }
      })
    );

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [subscribeToLogistics]);
}
