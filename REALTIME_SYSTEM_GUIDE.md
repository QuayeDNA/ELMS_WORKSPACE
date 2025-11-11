# Real-Time Update System Documentation

## Overview

The ELMS application features a robust WebSocket-based real-time update system built with Socket.IO. This system enables automatic UI updates across all connected clients without requiring page refreshes.

## Architecture

### Technology Stack

- **Backend**: Socket.IO Server (Node.js)
- **Frontend**: Socket.IO Client (React)
- **Communication**: WebSocket with polling fallback
- **Type Safety**: Full TypeScript support across client and server

### Key Components

#### Backend Components

1. **Type Definitions** (`backend/src/types/realtime.ts`)
   - Comprehensive type system for all real-time events
   - 5 event channels: SCRIPT_SUBMISSION, BATCH_UPDATE, EXAM_TIMETABLE, INCIDENT, NOTIFICATION
   - 14+ event types with detailed payload interfaces

2. **Realtime Service** (`backend/src/services/realtimeService.ts`)
   - Singleton service managing WebSocket connections
   - Room-based subscription system
   - User authentication and connection tracking
   - Event broadcasting methods

3. **Event Emitters** (`backend/src/utils/realtimeEmitters.ts`)
   - Helper functions to emit typed events
   - Pre-configured emitters for common operations
   - Automatic room routing based on institution/user

#### Frontend Components

1. **Type Definitions** (`frontend/src/types/realtime.ts`)
   - Mirrors backend types for type-safe communication
   - Event interfaces and payload structures

2. **Realtime Context** (`frontend/src/contexts/RealtimeContext.tsx`)
   - React Context Provider managing WebSocket connection
   - Auto-reconnection with exponential backoff
   - Authentication with JWT tokens
   - Room subscription management

3. **Custom Hooks** (`frontend/src/hooks/useRealtimeSubscription.ts`)
   - `useRealtimeSubscription` - Core subscription hook
   - Pre-configured hooks for common events
   - Automatic React Query cache invalidation

## Event Channels

### 1. SCRIPT_SUBMISSION

Events related to script submission and tracking:

- `SCRIPT_SUBMITTED` - New script submitted
- `SCRIPT_VERIFIED` - Script verified by admin
- `SCRIPT_COLLECTED` - Script collected for grading
- `SCRIPT_GRADED` - Script graded with score
- `BATCH_SEALED` - Batch sealed and ready
- `BATCH_ASSIGNED` - Batch assigned to grader

### 2. BATCH_UPDATE

Events related to batch management:

- `BATCH_CREATED` - New batch created
- `BATCH_STATUS_CHANGED` - Batch status updated
- `BATCH_STATS_UPDATED` - Batch statistics changed

### 3. EXAM_TIMETABLE

Events related to exam timetables:

- `TIMETABLE_PUBLISHED` - New timetable published
- `TIMETABLE_UPDATED` - Timetable modified
- `BATCHES_CREATED` - Batches auto-generated from timetable

### 4. INCIDENT

Events related to incident management:

- `INCIDENT_REPORTED` - New incident reported
- `INCIDENT_UPDATED` - Incident details updated
- `INCIDENT_RESOLVED` - Incident resolved

### 5. NOTIFICATION

Events for user notifications:

- `NEW_NOTIFICATION` - New notification for user
- `NOTIFICATION_READ` - Notification marked as read

## Usage Examples

### Backend: Emitting Events

```typescript
import { emitScriptSubmitted, emitBatchCreated } from '../utils/realtimeEmitters';

// Emit script submitted event
emitScriptSubmitted({
  scriptId: 123,
  batchId: 456,
  studentId: 789,
  studentName: 'John Doe',
  courseCode: 'CS101',
  courseName: 'Introduction to Computer Science',
  submittedAt: new Date().toISOString(),
  institutionId: 1,
});

// Emit batch created event
emitBatchCreated({
  batchId: 456,
  batchNumber: 'BATCH-001',
  examId: 100,
  examName: 'Final Exam',
  courseCode: 'CS101',
  totalSlots: 50,
  createdBy: 10,
  createdByName: 'Admin User',
  institutionId: 1,
});
```

### Frontend: Subscribing to Events

#### Method 1: Using Pre-configured Hooks

```typescript
import { useScriptSubmittedEvent, useBatchCreatedEvent } from '@/hooks/useRealtimeSubscription';
import { toast } from 'sonner';

function ScriptSubmissionPage() {
  // Subscribe to script submitted events
  useScriptSubmittedEvent((event) => {
    const payload = event.payload;
    toast.success(`New script submitted by ${payload.studentName}`);
  });

  // Subscribe to batch created events
  useBatchCreatedEvent((event) => {
    const payload = event.payload;
    toast.info(`New batch created: ${payload.batchNumber}`);
  });

  return <div>...</div>;
}
```

#### Method 2: Using Generic Subscription Hook

```typescript
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { RealtimeChannel, ScriptSubmissionEvent } from '@/types/realtime';

function BatchDetailsPage({ batchId }: { batchId: number }) {
  // Subscribe to all script submission events for this batch
  useRealtimeSubscription({
    channel: RealtimeChannel.SCRIPT_SUBMISSION,
    enabled: true,
    room: `batch:${batchId}`, // Join batch-specific room
    onEvent: (event) => {
      console.log('Script submission event:', event);
    },
    invalidateQueries: ['batch-scripts', 'script-submissions'], // Auto-invalidate queries
  });

  return <div>...</div>;
}
```

#### Method 3: Multiple Events in One Component

```typescript
function ScriptManagementDashboard() {
  // Subscribe to all script submission events
  useScriptSubmissionEvents({
    onEvent: (event) => {
      // Handle any script submission event
      console.log('Script event:', event.event, event.payload);
    },
    invalidateQueries: ['dashboard-stats', 'script-submissions'],
  });

  // Subscribe to all batch update events
  useBatchUpdateEvents({
    onEvent: (event) => {
      // Handle any batch update event
      console.log('Batch event:', event.event, event.payload);
    },
    invalidateQueries: ['batch-list', 'batch-stats'],
  });

  return <div>Dashboard Content</div>;
}
```

## Room Management

### Backend Room Routing

The backend automatically routes events to appropriate rooms:

- **Institution Rooms**: `institution:${institutionId}` - All users in an institution
- **User Rooms**: `user:${userId}` - Specific user across all sessions
- **Entity Rooms**: `batch:${batchId}`, `exam:${examId}` - Specific entities

### Frontend Room Subscription

```typescript
import { useRealtime } from '@/hooks/useRealtime';

function BatchDetailsPage({ batchId }: { batchId: number }) {
  const { joinRoom, leaveRoom } = useRealtime();

  useEffect(() => {
    // Join batch-specific room
    joinRoom(`batch:${batchId}`);

    return () => {
      // Leave room on unmount
      leaveRoom(`batch:${batchId}`);
    };
  }, [batchId, joinRoom, leaveRoom]);

  return <div>...</div>;
}
```

## Integration with React Query

The real-time system integrates seamlessly with React Query to automatically refresh data:

```typescript
useRealtimeSubscription({
  channel: RealtimeChannel.SCRIPT_SUBMISSION,
  event: ScriptSubmissionEvent.SCRIPT_SUBMITTED,
  invalidateQueries: ['batch-scripts', 'script-submissions'],
});
```

When an event is received:
1. User callback is executed (if provided)
2. Specified query keys are automatically invalidated
3. React Query refetches the data
4. UI updates automatically

## Authentication

### Backend Authentication

WebSocket connections are authenticated on connection:

```typescript
socket.on('authenticate', (data) => {
  // Verify JWT token (if needed)
  // Store user connection info
  // Auto-subscribe to institution and user rooms
});
```

### Frontend Authentication

Authentication happens automatically when RealtimeProvider detects a logged-in user:

```typescript
// In RealtimeContext
socketInstance.emit('authenticate', {
  userId: user.id,
  institutionId: user.institutionId,
  role: user.role,
  token: localStorage.getItem('token'),
});
```

## Error Handling & Reconnection

### Automatic Reconnection

The system automatically reconnects on connection loss:

- **Reconnection Delay**: 1-5 seconds (exponential backoff)
- **Max Attempts**: 5
- **User Notifications**: Toast messages on connect/disconnect/reconnect

### Connection Status

Check connection status in your components:

```typescript
import { useRealtime } from '@/hooks/useRealtime';

function StatusIndicator() {
  const { isConnected } = useRealtime();

  return (
    <div>
      Status: {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
}
```

## Adding New Event Types

### Step 1: Add Backend Types

Edit `backend/src/types/realtime.ts`:

```typescript
export enum MyModuleEvent {
  MY_EVENT = 'my_event',
}

export interface MyEventPayload {
  myId: number;
  myData: string;
  institutionId: number;
}
```

### Step 2: Add Frontend Types

Edit `frontend/src/types/realtime.ts` (same as backend):

```typescript
export enum MyModuleEvent {
  MY_EVENT = 'my_event',
}

export interface MyEventPayload {
  myId: number;
  myData: string;
  institutionId: number;
}
```

### Step 3: Create Event Emitter

Edit `backend/src/utils/realtimeEmitters.ts`:

```typescript
export function emitMyEvent(payload: MyEventPayload, rooms?: string[]): void {
  const event: RealtimeEvent<MyEventPayload> = {
    channel: RealtimeChannel.MY_MODULE,
    event: MyModuleEvent.MY_EVENT,
    payload,
    timestamp: new Date().toISOString(),
  };
  emitEvent(event, rooms);
}
```

### Step 4: Emit from Service

In your backend service:

```typescript
import { emitMyEvent } from '../utils/realtimeEmitters';

async function myServiceMethod() {
  // ... your logic ...

  // Emit real-time event
  emitMyEvent({
    myId: 123,
    myData: 'test',
    institutionId: 1,
  });
}
```

### Step 5: Create Frontend Hook

Edit `frontend/src/hooks/useRealtimeSubscription.ts`:

```typescript
export const useMyEvent = (
  onEvent?: (event: RealtimeEvent) => void,
  enabled = true
): void => {
  useRealtimeSubscription({
    channel: RealtimeChannel.MY_MODULE,
    event: MyModuleEvent.MY_EVENT,
    enabled,
    onEvent,
    invalidateQueries: ['my-module-data'],
  });
};
```

### Step 6: Use in Component

```typescript
import { useMyEvent } from '@/hooks/useRealtimeSubscription';

function MyComponent() {
  useMyEvent((event) => {
    console.log('My event received:', event.payload);
  });

  return <div>...</div>;
}
```

## Best Practices

### 1. Always Specify Institution ID

Include `institutionId` in all event payloads for proper room routing.

### 2. Use Pre-configured Hooks

Prefer pre-configured hooks over generic `useRealtimeSubscription` for better type safety.

### 3. Invalidate Relevant Queries

Always specify `invalidateQueries` to keep React Query cache in sync.

### 4. Clean Up Subscriptions

React hooks handle cleanup automatically, but if using the context directly, always unsubscribe.

### 5. Handle Connection Status

Show connection status indicators for better UX.

### 6. Test Reconnection

Test your app with intermittent network to ensure reconnection works properly.

### 7. Use Type Guards

Use TypeScript type guards when handling multiple event types:

```typescript
useScriptSubmissionEvents({
  onEvent: (event) => {
    if (event.event === ScriptSubmissionEvent.SCRIPT_SUBMITTED) {
      const payload = event.payload as ScriptSubmittedPayload;
      // Handle submitted event
    } else if (event.event === ScriptSubmissionEvent.BATCH_SEALED) {
      const payload = event.payload as BatchSealedPayload;
      // Handle sealed event
    }
  },
});
```

## Performance Considerations

### 1. Room-Based Filtering

Use rooms to limit events to relevant users:

```typescript
// Emit to specific batch room
emitScriptSubmitted(payload, [`batch:${batchId}`]);
```

### 2. Event Batching

For high-frequency events, consider batching on backend before emitting.

### 3. Selective Subscriptions

Only subscribe to events needed by each component:

```typescript
// Bad: Subscribe to all events
useScriptSubmissionEvents();

// Good: Subscribe to specific event
useScriptSubmittedEvent();
```

### 4. Conditional Subscriptions

Use the `enabled` flag to conditionally subscribe:

```typescript
useScriptSubmittedEvent(
  (event) => console.log(event),
  user?.role === 'ADMIN' // Only subscribe if admin
);
```

## Monitoring & Debugging

### Backend Logs

The realtime service logs all connections and events:

```
✅ Real-time service initialized
🔌 New connection: xyz123
✅ User authenticated: 10 (ADMIN) - Socket: xyz123
📤 Emitted to room institution:1: script_submission SCRIPT_SUBMITTED
```

### Frontend Logs

The realtime context logs all events:

```
✅ WebSocket connected: abc456
✅ Authenticated with server: { userId: 10, ... }
🎧 Subscribed to: script_submission:script_submitted
📨 Received event: script_submission script_submitted {...}
🔄 Invalidated queries: ['batch-scripts', 'script-submissions']
```

### Connection Health

Use ping/pong to check connection health:

```typescript
// Backend automatically handles
socket.on('ping', () => {
  socket.emit('pong', { timestamp: new Date().toISOString() });
});
```

## Troubleshooting

### Issue: Events Not Received

**Check:**
1. User is authenticated (check WebSocket connection logs)
2. Correct room subscriptions (check `joinRoom` calls)
3. Backend is emitting to correct rooms
4. Event channel and event name match between backend and frontend

### Issue: UI Not Updating

**Check:**
1. Query invalidation is configured (`invalidateQueries` option)
2. React Query is properly configured in App
3. Component is using React Query hooks (`useQuery`)

### Issue: Connection Drops Frequently

**Check:**
1. Network stability
2. Server timeout settings
3. Firewall/proxy WebSocket support
4. CORS configuration

### Issue: Type Errors

**Check:**
1. Backend and frontend types are in sync
2. Event payload structure matches interface
3. TypeScript versions compatible

## Future Enhancements

- **Redis Adapter**: For multi-server scalability
- **Event Persistence**: Store events for offline clients
- **Rate Limiting**: Prevent event flooding
- **Compression**: Reduce payload size
- **Binary Protocol**: For high-performance scenarios
- **Event Replay**: Replay missed events on reconnect

## Support

For issues or questions about the real-time system:

1. Check this documentation
2. Review backend logs for event emission
3. Review frontend console for event reception
4. Verify type definitions match between backend and frontend
