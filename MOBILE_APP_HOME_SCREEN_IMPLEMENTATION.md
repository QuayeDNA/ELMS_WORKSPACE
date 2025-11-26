# Mobile App Home Screen Implementation Plan

## Overview
This document outlines the implementation plan for the ELMS mobile app home screen, specifically designed for invigilators handling script submission and incident management during examinations.

## Current State Analysis

### Existing Implementation
- **File**: `app/(tabs)/index.tsx`
- **Framework**: React Native with Expo Router
- **UI Components**: Custom design system with Tailwind CSS integration
- **State Management**: Redux Toolkit with RTK Query
- **Current Features**:
  - Basic welcome header with user greeting
  - Static action cards (Scan Scripts, Manage Batches)
  - Dummy session data display
  - Basic stats overview
  - Recent activity section

### Current Limitations
- Uses dummy data instead of real backend integration
- No real-time updates or live metrics
- Missing incident reporting functionality
- No connection to actual exam logistics data
- Static UI without dynamic state management

## Target Architecture

### User Roles & Permissions
- **INVIGILATOR**: Primary role for exam supervision and script collection
- **SCRIPT_HANDLER**: Secondary role for batch transfer (future implementation)

### Core Workflows
1. **Script Submission**: Student verification → Script collection → Batch creation → Batch sealing
2. **Incident Management**: Incident detection → Reporting → Assignment → Resolution
3. **Session Management**: Check-in/check-out → Real-time monitoring → Status updates

## Data Requirements

### Home Screen Data Structure

```typescript
interface InvigilatorDashboard {
  // User Information
  user: {
    id: number;
    firstName: string;
    lastName: string;
    role: 'INVIGILATOR';
    department?: string;
    faculty?: string;
  };

  // Active Exam Sessions
  activeSessions: Array<{
    id: number;
    examEntryId: number;
    courseName: string;
    courseCode: string;
    venueName: string;
    roomName?: string;
    startTime: string;
    endTime: string;
    expectedStudents: number;
    presentStudents: number;
    submittedScripts: number;
    status: 'not_started' | 'in_progress' | 'completed';
    isCheckedIn: boolean;
    lastActivity?: string;
  }>;

  // Today's Statistics
  todayStats: {
    sessionsAssigned: number;
    sessionsCompleted: number;
    scriptsCollected: number;
    studentsVerified: number;
    incidentsReported: number;
    batchesSealed: number;
  };

  // Active Incidents
  activeIncidents: Array<{
    id: number;
    type: ExamIncidentType;
    severity: IncidentSeverity;
    title: string;
    venueName: string;
    reportedAt: string;
    status: 'reported' | 'investigating' | 'resolved';
  }>;

  // Pending Tasks
  pendingTasks: {
    unsealedBatches: number;
    unverifiedStudents: number;
    unresolvedIncidents: number;
    uncheckedSessions: number;
  };

  // Recent Activity (Last 24 hours)
  recentActivity: Array<{
    id: string;
    type: 'script_submitted' | 'student_verified' | 'incident_reported' | 'batch_sealed' | 'session_checked_in';
    description: string;
    timestamp: string;
    sessionId?: number;
    venueName?: string;
  }>;
}
```

### Required API Endpoints

#### Session Management
```typescript
GET  /api/exam-logistics/my-assigned-sessions
PUT  /api/exam-logistics/invigilator-presence
GET  /api/exam-logistics/session-details/:examEntryId
```

#### Script Submission
```typescript
POST /api/script-submission/submit
POST /api/script-submission/bulk-submit
POST /api/script-submission/scan-student
GET  /api/script-submission/student/:studentId/exam/:examEntryId
```

#### Batch Management
```typescript
GET  /api/batch-scripts/entry/:examEntryId/course/:courseId
POST /api/batch-scripts/:batchId/seal
POST /api/batch-scripts/:batchId/update-counts
```

#### Incident Management
```typescript
POST /api/exam-logistics/report-incident
GET  /api/exam-logistics/incidents/:examEntryId
GET  /api/incidents/?status=unresolved&assignee=current_user
```

#### Dashboard Data
```typescript
GET  /api/exam-logistics/invigilator-dashboard
GET  /api/exam-logistics/session-logs/:examEntryId
```

## UI/UX Design Specifications

### Screen Layout Structure

```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │ Welcome back, John Doe          │ │
│ │ (Invigilator)                   │ │
│ │ ⚡ 2 active sessions today      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ WHAT WOULD YOU LIKE TO DO?      │ │
│ ├─────────────────────────────────┤ │
│ │ [📱] Scan Scripts               │ │
│ │ Collect and verify exam scripts │ │
│ │                                 │ │
│ │ [🚨] Report Incident            │ │
│ │ Log exam irregularities         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ACTIVE SESSIONS          ⚡ 2   │ │
│ ├─────────────────────────────────┤ │
│ │ 📚 Data Structures (CE201)      │ │
│ │ Hall A, Room 101               │ │
│ │ 09:00-11:00 • 42/45 students   │ │
│ │ 38/42 scripts • 🔄 In Progress │ │
│ │                                 │ │
│ │ 📐 Calculus I (MA101)           │ │
│ │ Hall B, Room 205               │ │
│ │ 14:00-16:00 • 58/60 students   │ │
│ │ 0/58 scripts • ⏳ Not Started   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ TODAY'S OVERVIEW                │ │
│ ├─────────────────────────────────┤ │
│ │ ✅ 1 Completed    🔄 2 Active   │ │
│ │ 📄 38 Scripts     🚨 0 Incidents│ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ RECENT ACTIVITY                 │ │
│ ├─────────────────────────────────┤ │
│ │ ✓ Verified student CE001       │ │
│ │ 2 mins ago                      │ │
│ │                                 │ │
│ │ 📦 Sealed Data Structures batch │ │
│ │ 15 mins ago                     │ │
│ │                                 │ │
│ │ 🚨 Reported missing script      │ │
│ │ 1 hour ago                      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Component Hierarchy

```
HomeScreen
├── ScreenContainer (edges: ['bottom', 'left', 'right'])
│   └── ScrollView (with RefreshControl)
│       ├── WelcomeHeader
│       │   ├── Typography (headlineMedium)
│       │   └── Typography (bodyLarge)
│       │
│       ├── QuickActionsGrid
│       │   ├── ActionCard (Scan Scripts)
│       │   │   ├── Icon + Title + Description
│       │   │   └── Button (Start Scanning)
│       │   └── ActionCard (Report Incident)
│       │       ├── Icon + Title + Description
│       │       └── Button (Report Incident)
│       │
│       ├── ActiveSessionsSection
│       │   ├── SectionHeader (with badge)
│       │   └── Card
│       │       └── ListItem[] (session details)
│       │
│       ├── TodayStatsSection
│       │   ├── Typography (titleLarge)
│       │   └── StatsGrid (4 cards)
│       │
│       └── RecentActivitySection
│           ├── SectionHeader (with View All button)
│           └── Card
│               └── ActivityItem[] (recent actions)
│
└── FAB (Scan Scripts - bottom right)
```

### Color Scheme & Theming

```typescript
const theme = {
  primary: '#2563eb',      // Blue - main actions
  success: '#16a34a',      // Green - completed/verified
  warning: '#ca8a04',      // Yellow - pending/in progress
  error: '#dc2626',        // Red - incidents/errors
  secondary: '#6b7280',    // Gray - secondary text
  background: '#f3f4f6',   // Light gray - main background
  surface: '#ffffff',      // White - cards/surfaces
};
```

### Responsive Design Considerations

- **Mobile First**: Optimized for 375px-428px width
- **Safe Areas**: Proper handling of notches and home indicators
- **Touch Targets**: Minimum 44px touch targets
- **Typography Scale**: Consistent text sizing across devices
- **Icon Sizing**: 24px standard, 20px small, 32px large

## Implementation Phases

### Phase 1: Backend Integration (Current Focus)
1. **Auth Connection**: Connect mobile auth to backend APIs
2. **Basic Dashboard API**: Implement invigilator dashboard endpoint
3. **Session Data**: Connect to exam logistics data
4. **Real-time Updates**: Basic polling for live data

### Phase 2: Core Functionality
1. **Script Scanner**: QR code scanning integration
2. **Incident Reporting**: Incident creation and management
3. **Batch Operations**: Batch sealing and transfer
4. **Session Check-in/out**: Invigilator presence tracking

### Phase 3: Advanced Features
1. **Offline Mode**: Cache critical data for offline operation
2. **Push Notifications**: Real-time alerts for incidents/sessions
3. **Location Services**: GPS tracking for incident reporting
4. **Bulk Operations**: Multi-student verification

### Phase 4: Optimization & Polish
1. **Performance**: Optimize API calls and caching
2. **Error Handling**: Comprehensive error states and recovery
3. **Accessibility**: Screen reader support and keyboard navigation
4. **Analytics**: Usage tracking and performance metrics

## Technical Implementation Details

### State Management

```typescript
// Redux slices needed
- authSlice: User authentication and profile
- dashboardSlice: Home screen data and caching
- sessionsSlice: Exam session management
- incidentsSlice: Incident reporting and tracking

// RTK Query APIs
- invigilatorApi: Dashboard and session data
- scriptSubmissionApi: Script collection endpoints
- incidentApi: Incident management
- batchApi: Batch operations
```

### Navigation Structure

```typescript
// Tab Navigation
- Home (index.tsx) - Dashboard
- Sessions (sessions.tsx) - Session management
- Scanner (scanner.tsx) - QR code scanning
- Profile (profile.tsx) - User settings

// Modal/Navigation Routes
- session-details/:sessionId
- incident-report
- batch-details/:batchId
- student-verification/:studentId
```

### Error Handling Strategy

```typescript
// Error Types
- NetworkError: API connectivity issues
- AuthError: Authentication failures
- ValidationError: Input validation errors
- PermissionError: Insufficient permissions
- OfflineError: Offline mode limitations

// Error UI States
- Loading spinners for async operations
- Retry buttons for failed requests
- Offline indicators and cached data warnings
- Graceful degradation for missing data
```

### Performance Optimizations

```typescript
// Caching Strategy
- RTK Query automatic caching
- Local storage for offline data
- Background sync for pending operations
- Image prefetching for venue maps

// API Optimization
- Request deduplication
- Pagination for large datasets
- Selective data fetching
- WebSocket for real-time updates
```

## Testing Strategy

### Unit Tests
- Component rendering and interactions
- Redux state updates
- API call mocking and responses
- Error handling scenarios

### Integration Tests
- End-to-end user flows
- API integration testing
- Offline/online mode switching
- Network failure recovery

### User Acceptance Testing
- Invigilator workflow validation
- Performance under load
- Device compatibility testing
- Accessibility compliance

## Deployment & Maintenance

### Build Configuration
- Development, staging, and production environments
- Code signing and security hardening
- App store deployment automation
- Crash reporting and monitoring

### Monitoring & Analytics
- Usage analytics and user behavior tracking
- Performance monitoring and optimization
- Error tracking and alerting
- Feature usage and adoption metrics

## Future Enhancements

### Planned Features
- **Biometric Verification**: Fingerprint/face ID integration
- **Voice Commands**: Hands-free operation during exams
- **AR Overlays**: Augmented reality for venue navigation
- **Collaborative Features**: Multi-invigilator coordination
- **Advanced Analytics**: Performance insights and reporting

### Scalability Considerations
- Modular architecture for feature additions
- API versioning strategy
- Database optimization for large-scale deployments
- Internationalization support

---

## Implementation Status

- [x] UI Design and Component Structure
- [x] Basic Navigation and Routing
- [ ] Backend API Integration
- [ ] Real-time Data Updates
- [ ] Script Scanning Functionality
- [ ] Incident Reporting System
- [ ] Batch Management Workflows
- [ ] Offline Mode Support
- [ ] Push Notifications
- [ ] Performance Optimization
- [ ] Testing and QA
- [ ] Production Deployment

**Next Steps**: Begin with Phase 1 - Backend Integration, starting with authentication connection.
