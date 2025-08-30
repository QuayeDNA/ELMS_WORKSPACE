# Socket.IO Integration for User Management

## Overview

Real-time socket integration has been added to the user management module to provide live updates for super admin dashboard operations.

## Socket Events

### Institution Events

- `institution:created` - Emitted when a new institution is created
- `institution:updated` - Emitted when an institution is updated
- `institution:deleted` - Emitted when an institution is deleted

### User Events

- `user:status:updated` - Emitted when a user's status is changed
- `users:bulk:updated` - Emitted when multiple users are updated in bulk
- `user:activity:updated` - Emitted when user activity is updated

### System Events

- `user-management:error` - Emitted when an error occurs
- `user-management:notification` - Emitted for general notifications

## Socket Rooms

- `superadmin:dashboard` - Main room for super admin dashboard updates
- `institution:{institutionId}` - Institution-specific room
- `system:notifications` - System-wide notifications

## Implementation Details

### Files Modified

1. **user-management-service.ts** - Added socket emissions to all CRUD operations
2. **user-management-controller.ts** - Updated to pass triggeredBy user ID to service
3. **user-management-routes.ts** - Modified to accept socket service parameter
4. **server.ts** - Updated initialization order and route configuration
5. **socket-events.ts** - New file defining event types and room constants

### Key Features

- **Real-time Updates**: All user management operations emit socket events
- **Authentication**: Events include the user ID who triggered the action
- **Error Handling**: Proper error handling with meaningful messages
- **Type Safety**: Full TypeScript support with proper event typing

### Usage Example

```typescript
// Frontend can listen for events like:
socket.on('institution:created', (data) => {
  console.log('New institution created:', data.institution);
  // Update UI in real-time
});

socket.on('user:status:updated', (data) => {
  console.log('User status updated:', data);
  // Update user list in real-time
});
```

## Event Data Structure

Each event includes:

- **timestamp**: ISO string of when the event occurred
- **triggeredBy**: User ID who performed the action
- **event-specific data**: Relevant data for the operation

## Next Steps

1. Test the socket integration with frontend
2. Add more granular event filtering if needed
3. Implement event persistence for missed events
4. Add socket authentication middleware
5. Create frontend socket listeners for real-time UI updates
