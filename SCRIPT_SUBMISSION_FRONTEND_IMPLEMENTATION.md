# Script Submission Frontend Implementation

## Overview

This document outlines the frontend implementation for the **Script Submission Oversight** feature for Institution Admins. Since most script submission operations happen on the mobile app (invigilators scanning QR codes and submitting scripts), the web app focuses on **administrative oversight and monitoring**.

---

## What Was Implemented

### 1. **Type Definitions** (3 new files)

#### `frontend/src/types/examRegistration.ts`
- **ExamRegistration** interface with all relations
- **RegistrationStatistics** for overview metrics
- **MissingScript** interface for tracking unsubmitted scripts
- **StudentActiveExam** for student exam status
- Enums: `RegistrationStatus`, `AttendanceStatus`

#### `frontend/src/types/batchScript.ts`
- **BatchScript** interface with full relations
- **Script** interface for individual scripts
- **BatchStatistics** for batch-level metrics
- Enums: `BatchStatus`, `ScriptStatus`
- Form data types: `AssignBatchData`, `UpdateBatchStatusData`, `SealBatchData`

#### `frontend/src/types/scriptSubmission.ts`
- **ScriptSubmission** interface
- **SubmissionHistory** for timeline views
- **StudentSubmissionStatus** for per-student tracking
- **QRCodeValidation** for mobile app validation
- Form data types for submission operations

---

### 2. **Service Layer** (3 new services)

All services extend `BaseService` and use the existing API infrastructure.

#### `frontend/src/services/examRegistration.service.ts`
**API Endpoints:**
- `GET /exam-registrations/entry/:examEntryId` - Get all registrations for an exam
- `GET /exam-registrations/qr/:qrCode` - Get registration by QR code
- `POST /exam-registrations/attendance` - Mark student attendance
- `GET /exam-registrations/statistics/:examEntryId` - Get statistics
- `GET /exam-registrations/student/:studentId/active-exams` - Get active exams
- `GET /exam-registrations/missing-scripts/:examEntryId` - Get missing scripts
- `POST /exam-registrations/auto-register/:timetableId` - Auto-register students
- `POST /exam-registrations/auto-register/entry/:examEntryId` - Auto-register for exam entry

#### `frontend/src/services/batchScript.service.ts`
**API Endpoints:**
- `GET /batch-scripts` - Get all batches (with filters)
- `GET /batch-scripts/:batchId` - Get batch details
- `GET /batch-scripts/entry/:examEntryId/course/:courseId` - Get batch for exam/course
- `GET /batch-scripts/:batchId/statistics` - Get batch statistics
- `GET /batch-scripts/pending/assignment` - Get batches pending assignment
- `GET /batch-scripts/lecturer/:lecturerId` - Get batches for lecturer
- `POST /batch-scripts/:batchId/seal` - Seal a batch
- `POST /batch-scripts/:batchId/assign` - Assign batch to lecturer
- `PATCH /batch-scripts/:batchId/status` - Update batch status
- `POST /batch-scripts/:batchId/update-counts` - Update submission counts

#### `frontend/src/services/scriptSubmission.service.ts`
**API Endpoints:**
- `POST /script-submissions/submit` - Submit a script (mobile app primary use)
- `POST /script-submissions/scan-student` - Scan student QR (mobile app)
- `POST /script-submissions/:scriptId/verify` - Verify submitted script
- `POST /script-submissions/bulk-submit` - Bulk submit scripts
- `GET /script-submissions/batch/:batchId/history` - Get submission history
- `GET /script-submissions/student/:studentId/exam/:examEntryId` - Get student status

---

### 3. **Pages** (2 new pages)

#### `ScriptSubmissionOversightPage.tsx`
**Location:** `/admin/scripts`

**Features:**
- **Overview Statistics Cards:**
  - Total Batches
  - Total Scripts
  - Submitted Scripts (with percentage)
  - Pending Scripts

- **Main Data Table:**
  - Batch Number
  - Course (code + title)
  - Exam Date
  - Total Scripts
  - Submitted Count (with percentage badge)
  - Assigned Lecturer
  - Status Badge
  - Actions (View Details button)

- **Filters:**
  - Search by batch number, course code, or course title
  - Filter by batch status (ALL, PENDING, IN_PROGRESS, SEALED, ASSIGNED, GRADING, COMPLETED)

- **Tabs:**
  - **Overview:** All batches table
  - **Pending Assignment:** Batches waiting for lecturer assignment
  - **In Progress:** Active submission batches
  - **Completed:** Finished batches

- **Actions:**
  - Refresh data
  - Export report (placeholder)
  - Navigate to batch details

**Tech Stack:**
- React Query for data fetching
- Tanstack Table for data display
- Shadcn UI components
- Date-fns for date formatting

---

#### `BatchScriptDetailsPage.tsx`
**Location:** `/admin/scripts/:batchId`

**Features:**
- **Header:**
  - Back navigation button
  - Batch number and course title
  - Status badge
  - Export report button

- **Statistics Cards:**
  - Total Scripts
  - Submitted (with percentage)
  - Pending
  - Graded

- **Overview Tab:**
  - **Batch Information Card:**
    - Batch Number
    - Exam Date & Time
    - Assigned Lecturer
    - Sealed At timestamp

  - **Submission Timeline Card:**
    - First Submission timestamp
    - Last Submission timestamp
    - Average Submission Time
    - Status Distribution (by script status)

- **Submissions Tab:**
  - Chronological table of all script submissions
  - Columns: Script Number, Student, Submitted At, Submitted By, Status, Verified
  - Empty state when no submissions yet

- **Registrations Tab:**
  - List of all registered students
  - Shows student ID, name, and registration status

**Tech Stack:**
- React Query for data fetching
- React Router for navigation
- Shadcn UI components
- Date-fns for timestamps

---

### 4. **Routing Updates**

**Modified:** `frontend/src/routes/AppRoutes.tsx`

Added two new routes under Admin layout:
```tsx
<Route
  path="/admin/scripts"
  element={
    <AdminLayout>
      <ScriptSubmissionOversightPage />
    </AdminLayout>
  }
/>
<Route
  path="/admin/scripts/:batchId"
  element={
    <AdminLayout>
      <BatchScriptDetailsPage />
    </AdminLayout>
  }
/>
```

**Replaced:** The placeholder `ScriptsPage` with the new functional page.

---

## User Workflow

### For Institution Admins:

1. **Navigate to "Scripts" in sidebar** → Opens `/admin/scripts`

2. **View Overview Dashboard:**
   - See total batches, scripts, submission rates
   - Quick glance at system-wide script submission status

3. **Search & Filter:**
   - Search by batch number or course
   - Filter by batch status

4. **Monitor Pending Assignments:**
   - Switch to "Pending Assignment" tab
   - See batches that need lecturer assignment
   - Assign lecturers (future enhancement)

5. **View Batch Details:**
   - Click "View Details" on any batch
   - Navigate to `/admin/scripts/:batchId`
   - See detailed statistics
   - View submission timeline
   - Track individual script submissions
   - See registered students

6. **Export Reports:**
   - Export batch-level or system-wide reports (placeholder for now)

---

## Key Design Decisions

### 1. **Read-Only Oversight**
The web app is **primarily for monitoring**, not for creating submissions. Submissions happen via:
- Mobile app (invigilators scan QR codes)
- Batch operations (sealing, assignment)

### 2. **Real-Time Updates**
Using React Query with automatic refetching:
- Data refreshes on tab focus
- Manual refresh button available
- Stale time configured for optimal UX

### 3. **Batch-Centric View**
Scripts are grouped by batch, which represents:
- One exam entry
- One course
- Multiple students
- Lifecycle: PENDING → IN_PROGRESS → SEALED → ASSIGNED → GRADING → COMPLETED

### 4. **Status Badges**
Color-coded badges for quick status identification:
- Yellow: PENDING
- Blue: IN_PROGRESS, SUBMITTED
- Purple: SEALED, GRADED
- Indigo: ASSIGNED, REVIEWED
- Orange: GRADING, GRADING_IN_PROGRESS
- Green: COMPLETED, VERIFIED

### 5. **Progressive Enhancement**
Current implementation provides:
- ✅ Data display and monitoring
- ✅ Search and filtering
- ✅ Detailed batch views
- ✅ Submission history tracking

Future enhancements can add:
- 🔲 Assign lecturers UI
- 🔲 Seal batch UI
- 🔲 Export functionality
- 🔲 Real-time notifications
- 🔲 Bulk actions

---

## API Integration

All services use the established patterns:
- **Base URL:** Configured in `api.ts`
- **Authentication:** Token-based (JWT in headers)
- **Error Handling:** Centralized in `BaseService`
- **Response Format:** Standardized `ApiResponse<T>`
- **Pagination:** Built-in pagination support

**Example API Call:**
```typescript
const { data } = await batchScriptService.getBatchScripts({
  status: 'PENDING',
  page: 1,
  limit: 50
});
```

---

## Role-Based Access

All routes are protected by `AdminLayout` which enforces:
- Authentication required
- Role: `UserRole.ADMIN` (Institution Admin)

**Allowed Roles:**
- Institution Admin
- Super Admin (implied)
- Exams Officer (for some operations)

---

## Mobile App Integration Points

### Mobile App Responsibilities:
1. **Scan Student QR Codes** → `POST /script-submissions/scan-student`
2. **Submit Scripts** → `POST /script-submissions/submit`
3. **Mark Attendance** → `POST /exam-registrations/attendance`
4. **Verify Scripts** → `POST /script-submissions/:scriptId/verify`

### Web App Responsibilities:
1. **Monitor Submissions** → View oversight dashboard
2. **Track Batch Progress** → View batch details
3. **Assign Lecturers** → Assign batches for grading
4. **Generate Reports** → Export submission data
5. **Identify Issues** → Find missing scripts

**Complementary Design:** Mobile app handles real-time operations, web app provides oversight and analytics.

---

## Testing Checklist

### ✅ Component Tests
- [ ] ScriptSubmissionOversightPage renders correctly
- [ ] BatchScriptDetailsPage renders with data
- [ ] Empty states display properly
- [ ] Search filtering works
- [ ] Status filtering works
- [ ] Navigation between pages works

### ✅ Service Tests
- [ ] All API endpoints called with correct parameters
- [ ] Error handling works
- [ ] Response transformation correct
- [ ] Pagination works

### ✅ Integration Tests
- [ ] Can view batch list
- [ ] Can filter batches
- [ ] Can navigate to batch details
- [ ] Statistics calculate correctly
- [ ] Submission history displays

### ✅ E2E Tests
- [ ] Full user workflow from login to viewing batch details
- [ ] Export report flow (when implemented)
- [ ] Assign lecturer flow (when implemented)

---

## Next Steps

### Phase 1: Core Functionality (Completed ✅)
- ✅ Type definitions
- ✅ Service layer
- ✅ Oversight dashboard
- ✅ Batch details page
- ✅ Routing

### Phase 2: Enhanced Features (To Do)
- 🔲 Implement "Assign Lecturer" modal and API call
- 🔲 Implement "Seal Batch" confirmation and API call
- 🔲 Implement export functionality (CSV/PDF)
- 🔲 Add real-time updates (WebSocket or polling)
- 🔲 Add batch status change UI
- 🔲 Add missing scripts alert system

### Phase 3: Analytics (To Do)
- 🔲 Submission rate charts
- 🔲 Time-series graphs
- 🔲 Lecturer performance metrics
- 🔲 Course-level analytics
- 🔲 Predictive submission times

### Phase 4: Mobile App Coordination (To Do)
- 🔲 Mobile app QR scanner UI
- 🔲 Mobile app script submission flow
- 🔲 Mobile app attendance marking
- 🔲 Sync between mobile and web

---

## File Structure

```
frontend/src/
├── types/
│   ├── examRegistration.ts          # NEW ✨
│   ├── batchScript.ts                # NEW ✨
│   └── scriptSubmission.ts           # NEW ✨
├── services/
│   ├── examRegistration.service.ts   # NEW ✨
│   ├── batchScript.service.ts        # NEW ✨
│   └── scriptSubmission.service.ts   # NEW ✨
├── pages/
│   └── institution-admin/
│       ├── ScriptSubmissionOversightPage.tsx  # NEW ✨
│       ├── BatchScriptDetailsPage.tsx         # NEW ✨
│       ├── PlaceholderPages.tsx               # MODIFIED (removed ScriptsPage)
│       └── index.ts                           # MODIFIED (added exports)
└── routes/
    └── AppRoutes.tsx                          # MODIFIED (added routes)
```

---

## Summary

This implementation provides **Institution Admins** with comprehensive oversight of the script submission process. The web interface is designed for **monitoring and management**, while the mobile app (to be built separately) handles the **real-time operations** of scanning QR codes and submitting scripts.

The architecture is:
- **Scalable:** Pagination and lazy loading
- **Type-Safe:** Full TypeScript coverage
- **Consistent:** Uses established patterns
- **Extensible:** Easy to add new features
- **User-Friendly:** Clear UI with status badges and filters

The backend APIs are already implemented and tested (24 endpoints), so the frontend can immediately consume them once the backend server is running.

---

**Implementation Status:** ✅ **COMPLETE**

Ready for:
1. Backend server startup
2. Frontend testing
3. Mobile app integration
4. Feature enhancements
