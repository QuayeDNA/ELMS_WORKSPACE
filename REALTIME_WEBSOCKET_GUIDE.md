# ELMS Real-Time WebSocket System - Complete Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Backend Setup](#backend-setup)
4. [Frontend Integration](#frontend-integration)
5. [Usage Examples](#usage-examples)
6. [Event Types & Payloads](#event-types--payloads)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The ELMS Real-Time WebSocket System provides live, bi-directional communication between the backend and frontend using **Socket.IO**. It enables instant updates for script submissions, batch management, timetable changes, incidents, and notifications without requiring page refreshes.

### Key Features
- ✅ **5 Event Channels**: Script Submission, Batch Updates, Exam Timetable, Incidents, Notifications
- ✅ **Room-Based Subscriptions**: Subscribe to specific institutions, users, batches, or timetables
- ✅ **Type-Safe Events**: Full TypeScript support with strict interfaces
- ✅ **Auto-Reconnection**: Built-in connection recovery with exponential backoff
- ✅ **React Integration**: Context API + custom hooks for easy usage

---

## Architecture

### Connection Flow
```
Frontend (React) → Socket.IO Client → Backend (Express + Socket.IO Server) → Database
         ↓                                            ↓
    useRealtime Hook                         realtimeService
         ↓                                            ↓
  Event Subscriptions                        Event Emissions
         ↓                                            ↓
    UI Auto-Updates  ←──────────────────  Service Operations
```

### Room Structure
Rooms enable targeted message delivery:
- `institution:{id}` - All users in an institution
- `user:{id}` - Specific user notifications
- `batch:{id}` - Updates for a specific batch
- `timetable:{id}` - Timetable-related events

---

## Backend Setup

### 1. Service Layer (`backend/src/services/realtimeService.ts`)

The `realtimeService` manages WebSocket connections, authentication, and broadcasting:

```typescript
import { realtimeService } from './services/realtimeService';

// Initialize in server.ts
const server = app.listen(PORT);
realtimeService.initialize(server);
```

**Key Methods:**
- `initialize(httpServer)` - Start Socket.IO server
- `emitToRoom(room, event)` - Send event to all users in a room
- `emitToUser(userId, event)` - Send event to specific user
- `emitToInstitution(institutionId, event)` - Broadcast to entire institution

### 2. Event Emitters (`backend/src/utils/realtimeEmitters.ts`)

Helper functions to emit events from your service layer:

```typescript
import {
  emitScriptSubmitted,
  emitBatchCreated,
  emitTimetablePublished,
  emitIncidentReported,
  emitNewNotification,
} from '../utils/realtimeEmitters';
```

**Example: Emit event when a script is submitted**
```typescript
// In scriptSubmissionService.ts
const submission = await prisma.scriptSubmission.create({ ... });

// Emit real-time event
emitScriptSubmitted({
  submissionId: submission.id,
  batchScriptId: submission.batchScriptId,
  studentId: submission.studentId,
  studentName: student.name,
  submittedAt: submission.submittedAt.toISOString(),
  institutionId: batch.institutionId,
});
```

### 3. Type Definitions (`backend/src/types/realtime.ts`)

All events are strongly typed:

```typescript
export enum RealtimeChannel {
  SCRIPT_SUBMISSION = 'script_submission',
  BATCH_UPDATE = 'batch_update',
  EXAM_TIMETABLE = 'exam_timetable',
  INCIDENT = 'incident',
  NOTIFICATION = 'notification',
}

export interface ScriptSubmittedPayload {
  submissionId: number;
  batchScriptId: number;
  studentId: number;
  studentName: string;
  submittedAt: string;
}
```

---

## Frontend Integration

### 1. Context Provider (Already Integrated)

The `RealtimeProvider` is already wrapped around your app in `App.tsx`:

```tsx
<Router>
  <RealtimeProvider>
    <AppRoutes />
    <Toaster />
  </RealtimeProvider>
</Router>
```

The provider:
- Automatically connects when user is authenticated
- Passes `userId`, `institutionId`, `role`, and `token` from auth store
- Manages connection state and reconnection logic
- Provides hooks for subscribing to events

### 2. Basic Hook: `useRealtime`

Access WebSocket connection and state:

```tsx
import { useRealtime } from '@/hooks/useRealtime';

function MyComponent() {
  const {
    isConnected,      // Connection status
    connectionState,  // 'connected' | 'disconnected' | 'reconnecting'
    subscribe,        // Subscribe to events
    joinRoom,         // Join a specific room
    leaveRoom,        // Leave a room
  } = useRealtime();

  return (
    <div>
      <StatusIndicator connected={isConnected} />
      {connectionState === 'reconnecting' && <p>Reconnecting...</p>}
    </div>
  );
}
```

### 3. Subscription Hook: `useRealtimeSubscription`

Subscribe to specific events with auto-cleanup:

```tsx
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { RealtimeChannel } from '@/types/realtime';

function BatchScriptDetailsPage() {
  const { batchId } = useParams();

  // Subscribe to script submission events
  useRealtimeSubscription({
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    events: ['script:submitted', 'script:verified', 'script:collected'],
    room: `batch:${batchId}`,
    onEvent: (event) => {
      console.log('New script event:', event);

      // Auto-refresh data
      queryClient.invalidateQueries(['batch-scripts', batchId]);

      // Show toast notification
      toast.success(`Script ${event.payload.submissionId} submitted!`);
    },
  });

  return <div>...</div>;
}
```

---

## Usage Examples

### Example 1: Live Script Submission Updates

```tsx
import { useQueryClient } from '@tanstack/react-query';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { RealtimeChannel } from '@/types/realtime';
import { toast } from 'sonner';

function ScriptSubmissionPage() {
  const queryClient = useQueryClient();
  const { batchId } = useParams();

  // Subscribe to all script submission events for this batch
  useRealtimeSubscription({
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    events: [
      'script:submitted',
      'script:verified',
      'script:collected',
      'script:graded',
    ],
    room: `batch:${batchId}`,
    onEvent: (event) => {
      // Invalidate and refetch data
      queryClient.invalidateQueries(['batch-scripts', batchId]);
      queryClient.invalidateQueries(['script-submissions', batchId]);

      // Show notification based on event type
      const { payload } = event;
      switch (event.event) {
        case 'script:submitted':
          toast.success(`${payload.studentName} submitted their script`);
          break;
        case 'script:verified':
          toast.info(`Script verified by ${payload.verifiedBy}`);
          break;
        case 'script:collected':
          toast.info(`Script collected by ${payload.collectedBy}`);
          break;
        case 'script:graded':
          toast.success(`Script graded: ${payload.grade}`);
          break;
      }
    },
  });

  return <div>Your component UI...</div>;
}
```

### Example 2: Batch Status Updates

```tsx
import { useBatchUpdates } from '@/hooks/useRealtimeSubscription';

function BatchManagementPage() {
  const queryClient = useQueryClient();

  // Use the specialized hook for batch updates
  useBatchUpdates({
    events: ['batch:created', 'batch:sealed', 'batch:assigned', 'batch:stats_updated'],
    onEvent: (event) => {
      queryClient.invalidateQueries(['batches']);

      if (event.event === 'batch:sealed') {
        toast.warning(`Batch ${event.payload.batchQRCode} has been sealed!`);
      }
    },
  });

  return <div>Batch list...</div>;
}
```

### Example 3: Timetable Publication Alerts

```tsx
import { useTimetableUpdates } from '@/hooks/useRealtimeSubscription';

function TimetableDashboard() {
  const queryClient = useQueryClient();

  useTimetableUpdates({
    events: ['timetable:published', 'timetable:updated', 'timetable:batches:created'],
    onEvent: (event) => {
      if (event.event === 'timetable:published') {
        toast.success(`New timetable published: ${event.payload.title}`);
        toast.info(`${event.payload.batchesCreated} batches created`);
      }

      queryClient.invalidateQueries(['exam-timetables']);
    },
  });

  return <div>Timetable UI...</div>;
}
```

### Example 4: Incident Reporting

```tsx
import { useIncidentUpdates } from '@/hooks/useRealtimeSubscription';

function IncidentMonitoring() {
  const queryClient = useQueryClient();
  const [incidents, setIncidents] = useState([]);

  useIncidentUpdates({
    events: ['incident:reported', 'incident:updated', 'incident:resolved'],
    onEvent: (event) => {
      const { payload } = event;

      if (event.event === 'incident:reported') {
        toast.error(`New ${payload.severity} incident: ${payload.type}`);

        // Add to local state for real-time display
        setIncidents(prev => [payload, ...prev]);
      }

      queryClient.invalidateQueries(['incidents']);
    },
  });

  return (
    <div>
      {incidents.map(incident => (
        <IncidentCard key={incident.incidentId} incident={incident} />
      ))}
    </div>
  );
}
```

### Example 5: User-Specific Notifications

```tsx
import { useNotifications } from '@/hooks/useRealtimeSubscription';

function NotificationCenter() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useNotifications({
    events: ['notification:new', 'notification:read'],
    room: `user:${user?.id}`, // Only this user's notifications
    onEvent: (event) => {
      if (event.event === 'notification:new') {
        const { payload } = event;

        // Show toast
        toast.info(payload.title, {
          description: payload.message,
        });

        // Play sound (optional)
        new Audio('/notification.mp3').play();
      }

      queryClient.invalidateQueries(['notifications']);
    },
  });

  return <div>Notification list...</div>;
}
```

---

## Event Types & Payloads

### 1. Script Submission Channel

**Events:**
- `script:submitted` - Student submits script
- `script:verified` - Lecturer verifies script
- `script:collected` - Lecturer collects script
- `script:graded` - Script has been graded
- `batch:sealed` - Batch is sealed (no more submissions)
- `batch:assigned` - Batch assigned to lecturer

**Example Payload (script:submitted):**
```typescript
{
  submissionId: 123,
  batchScriptId: 45,
  studentId: 678,
  studentName: "John Doe",
  submittedAt: "2025-11-12T10:30:00Z"
}
```

### 2. Batch Update Channel

**Events:**
- `batch:created` - New batch created
- `batch:status_changed` - Batch status updated
- `batch:stats_updated` - Batch statistics recalculated

**Example Payload (batch:created):**
```typescript
{
  batchId: 10,
  batchQRCode: "BATCH-CSC101-2025",
  courseCode: "CSC101",
  courseName: "Introduction to Computer Science",
  totalScripts: 150,
  createdBy: "Dr. Smith"
}
```

### 3. Exam Timetable Channel

**Events:**
- `timetable:published` - Timetable published
- `timetable:updated` - Timetable modified
- `timetable:batches:created` - Batches auto-created from timetable

**Example Payload (timetable:published):**
```typescript
{
  timetableId: 5,
  title: "Final Exams - Fall 2025",
  publishedBy: "Admin User",
  publishedAt: "2025-11-12T09:00:00Z",
  totalExams: 25,
  batchesCreated: 25
}
```

### 4. Incident Channel

**Events:**
- `incident:reported` - New incident reported
- `incident:updated` - Incident status/details updated
- `incident:resolved` - Incident resolved

**Example Payload (incident:reported):**
```typescript
{
  incidentId: 7,
  type: "Missing Script",
  severity: "high",
  description: "Student claims script was submitted but not found",
  reportedBy: "John Doe",
  reportedAt: "2025-11-12T14:20:00Z",
  batchId: 10,
  examId: 3
}
```

### 5. Notification Channel

**Events:**
- `notification:new` - New notification for user
- `notification:read` - Notification marked as read

**Example Payload (notification:new):**
```typescript
{
  id: 99,
  type: "script_submission",
  title: "Script Submission Reminder",
  message: "You have 24 hours left to submit your CSC101 script",
  userId: 678,
  createdAt: "2025-11-12T08:00:00Z",
  data: {
    examId: 3,
    batchId: 10,
    deadline: "2025-11-13T08:00:00Z"
  }
}
```

---

## Best Practices

### 1. ✅ Always Use Rooms for Targeted Updates

```tsx
// ❌ Bad - receives ALL institution events
useRealtimeSubscription({
  channel: RealtimeChannel.SCRIPT_SUBMISSION,
  onEvent: (event) => { ... }
});

// ✅ Good - only receives events for this batch
useRealtimeSubscription({
  channel: RealtimeChannel.SCRIPT_SUBMISSION,
  room: `batch:${batchId}`,
  onEvent: (event) => { ... }
});
```

### 2. ✅ Invalidate React Query Cache on Events

```tsx
useRealtimeSubscription({
  channel: RealtimeChannel.BATCH_UPDATE,
  onEvent: (event) => {
    // Trigger refetch of relevant data
    queryClient.invalidateQueries(['batches']);
    queryClient.invalidateQueries(['batch-scripts', event.payload.batchId]);
  }
});
```

### 3. ✅ Use Specialized Hooks for Cleaner Code

```tsx
// Instead of:
useRealtimeSubscription({
  channel: RealtimeChannel.SCRIPT_SUBMISSION,
  events: ['script:submitted', 'script:verified'],
  onEvent: ...
});

// Use:
useScriptSubmissionUpdates({
  events: ['script:submitted', 'script:verified'],
  onEvent: ...
});
```

### 4. ✅ Handle Connection State in UI

```tsx
function MyComponent() {
  const { isConnected, connectionState } = useRealtime();

  return (
    <div>
      {connectionState === 'reconnecting' && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Reconnecting to server...
          </AlertDescription>
        </Alert>
      )}

      {!isConnected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Connection lost. Updates may be delayed.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### 5. ✅ Clean Up Subscriptions

The `useRealtimeSubscription` hook automatically cleans up when the component unmounts, but you can also manually leave rooms:

```tsx
const { joinRoom, leaveRoom } = useRealtime();

useEffect(() => {
  joinRoom(`batch:${batchId}`);

  return () => {
    leaveRoom(`batch:${batchId}`);
  };
}, [batchId]);
```

---

## Troubleshooting

### Issue 1: "Not receiving real-time events"

**Solution:**
1. Check WebSocket connection status:
   ```tsx
   const { isConnected, connectionState } = useRealtime();
   console.log('Connected:', isConnected, 'State:', connectionState);
   ```

2. Verify you're subscribed to the correct room:
   ```tsx
   useRealtimeSubscription({
     room: `batch:${batchId}`, // Make sure batchId is defined
     onEvent: (event) => console.log('Event received:', event)
   });
   ```

3. Check browser console for Socket.IO errors

### Issue 2: "Events firing multiple times"

**Solution:** This usually happens when subscriptions aren't cleaned up properly. Use the specialized hooks which handle cleanup automatically:

```tsx
// ✅ This handles cleanup
useScriptSubmissionUpdates({ ... });

// Instead of manually managing subscriptions
```

### Issue 3: "Connection keeps reconnecting"

**Solution:**
1. Check authentication token is valid
2. Verify backend server is running on correct port
3. Check CORS settings in backend
4. Look for network/firewall issues

### Issue 4: "TypeScript errors with event payloads"

**Solution:** Make sure frontend types match backend types. Check:
- `frontend/src/types/realtime.ts`
- `backend/src/types/realtime.ts`

Both should have the same event enums and payload interfaces.

---

## Adding New Event Types

### Backend:

1. **Define event in `realtime.ts`:**
```typescript
export enum MyNewEvent {
  SOMETHING_HAPPENED = 'something:happened',
}

export interface SomethingHappenedPayload {
  id: number;
  description: string;
}
```

2. **Create emitter in `realtimeEmitters.ts`:**
```typescript
export const emitSomethingHappened = (payload: SomethingHappenedPayload) => {
  const event: RealtimeEvent<SomethingHappenedPayload> = {
    channel: RealtimeChannel.MY_CHANNEL,
    event: MyNewEvent.SOMETHING_HAPPENED,
    payload,
    timestamp: new Date().toISOString(),
  };
  realtimeService.emitToInstitution(payload.institutionId, event);
};
```

3. **Call emitter in your service:**
```typescript
emitSomethingHappened({
  id: result.id,
  description: result.description,
  institutionId: user.institutionId,
});
```

### Frontend:

1. **Copy types from backend** to `frontend/src/types/realtime.ts`

2. **Create specialized hook (optional):**
```typescript
export const useSomethingUpdates = (
  options: Omit<UseRealtimeSubscriptionOptions, 'channel'> = {}
) => {
  useRealtimeSubscription({
    channel: RealtimeChannel.MY_CHANNEL,
    events: ['something:happened'],
    ...options,
  });
};
```

3. **Use in component:**
```typescript
useSomethingUpdates({
  onEvent: (event) => {
    toast.info(event.payload.description);
  }
});
```

---

## Summary

The ELMS Real-Time WebSocket System is **fully implemented and ready to use**. Key points:

✅ **Backend**: Socket.IO server running, emitter functions available
✅ **Frontend**: Context + hooks implemented, integrated in App.tsx
✅ **Type Safety**: Full TypeScript support across 5 event channels
✅ **Auto-Reconnection**: Built-in connection recovery
✅ **Room-Based**: Targeted event delivery to specific users/batches

**To use in any component:**
```tsx
import { useScriptSubmissionUpdates } from '@/hooks/useRealtimeSubscription';

useScriptSubmissionUpdates({
  room: `batch:${batchId}`,
  onEvent: (event) => {
    // Handle event - auto-refresh data, show toast, etc.
  }
});
```

For questions or issues, refer to the troubleshooting section or check the implementation in:
- `backend/src/services/realtimeService.ts`
- `frontend/src/contexts/RealtimeContext.tsx`
- `frontend/src/hooks/useRealtimeSubscription.ts`
