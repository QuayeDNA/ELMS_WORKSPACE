# Postman Collection Update - Exam Timetable Endpoints

## Overview
Successfully added **15 new endpoints** to the ELMS Complete API Collection for comprehensive exam timetable management with conflict detection and approval workflows.

## New Section: 14.1. Exam Timetables

### Collection Variables Added
- `timetableId` - Stores the current timetable ID
- `entryId` - Stores the current timetable entry ID
- `conflictId` - Stores the current conflict ID

### Endpoint Groups

#### 1. Timetables (10 endpoints)

1. **GET /api/timetables** - Get All Timetables
   - Pagination support (page, limit)
   - Filtering by: institutionId, facultyId, academicYearId, semesterId, status, isPublished
   - Search in title and description
   - Access: Admin, Faculty Admin, Exams Officer

2. **GET /api/timetables/:id** - Get Timetable by ID
   - Full details including entries and conflicts
   - Access: Admin, Faculty Admin, Exams Officer, Lecturer, Student (if published)

3. **POST /api/timetables** - Create Timetable
   - Auto-saves timetableId in collection variables
   - Validates academic period consistency, institution-faculty relationships, date ranges
   - Fields: title, description, institutionId, facultyId, academicYearId, semesterId, academicPeriodId, startDate, endDate, allowOverlaps, autoResolveConflicts, defaultExamDuration, createdBy
   - Access: Admin, Faculty Admin, Exams Officer

4. **PUT /api/timetables/:id** - Update Timetable
   - Cannot update if already published
   - Access: Admin, Faculty Admin, Exams Officer

5. **DELETE /api/timetables/:id** - Delete Timetable
   - Only allowed if in DRAFT status and has no entries
   - Access: Admin, Faculty Admin, Exams Officer

6. **POST /api/timetables/:id/submit-for-approval** - Submit for Approval
   - Timetable must have entries
   - Access: Exams Officer, Faculty Admin

7. **POST /api/timetables/:id/approve** - Approve Timetable
   - Requires approvedBy user ID
   - Access: Admin, Faculty Admin

8. **POST /api/timetables/:id/reject** - Reject Timetable
   - Requires rejection reason
   - Returns timetable to DRAFT status
   - Access: Admin, Faculty Admin

9. **POST /api/timetables/:id/publish** - Publish Timetable
   - Must be approved and have no critical unresolved conflicts
   - Makes timetable visible to students
   - Requires publishedBy user ID
   - Access: Admin, Faculty Admin, Exams Officer

10. **GET /api/timetables/:id/statistics** - Get Timetable Statistics
    - Comprehensive stats: exam counts, venue utilization, conflict summary, status breakdown
    - Access: Admin, Faculty Admin, Exams Officer

#### 2. Timetable Entries (5 endpoints)

1. **GET /api/timetables/:timetableId/entries** - Get Timetable Entries
   - Pagination support (default limit: 50)
   - Filtering by: courseId, programId, venueId, examDate, hasConflicts, status
   - Access: Admin, Faculty Admin, Exams Officer, Lecturer, Student (if published)

2. **GET /api/timetable-entries/:id** - Get Entry by ID
   - Full details including programs, rooms, and invigilators
   - Access: Admin, Faculty Admin, Exams Officer, Lecturer, Student (if published)

3. **POST /api/timetables/:timetableId/entries** - Create Timetable Entry
   - Auto-saves entryId in collection variables
   - Validates: course, programs, venue, rooms
   - Automatically detects conflicts
   - Calculates seating capacity from rooms
   - Fields: timetableId, courseId, programIds[], level, examDate, startTime, endTime, duration, venueId, roomIds[], invigilatorIds[], chiefInvigilatorId, notes, specialRequirements
   - Access: Admin, Faculty Admin, Exams Officer

4. **PUT /api/timetable-entries/:id** - Update Timetable Entry
   - Re-checks for conflicts after update
   - Cannot update if timetable is published
   - Access: Admin, Faculty Admin, Exams Officer

5. **DELETE /api/timetable-entries/:id** - Delete Timetable Entry
   - Cannot delete if timetable is published
   - Access: Admin, Faculty Admin, Exams Officer

#### 3. Conflict Management (3 endpoints)

1. **POST /api/timetables/:id/detect-conflicts** - Detect Conflicts
   - Manually trigger conflict detection
   - Checks for:
     - Student overlaps (same students taking multiple exams at same time)
     - Venue/room overlaps (same room booked for multiple exams)
     - Invigilator overlaps (invigilator assigned to multiple exams)
     - Capacity issues (student count exceeds seating capacity)
     - Time violations
     - Date violations
   - Access: Admin, Faculty Admin, Exams Officer

2. **GET /api/timetables/:id/conflicts** - Get Timetable Conflicts
   - Returns all conflicts with summary
   - Grouped by severity: CRITICAL, HIGH, MEDIUM, LOW
   - Grouped by type: STUDENT_OVERLAP, VENUE_OVERLAP, INVIGILATOR_OVERLAP, CAPACITY_EXCEEDED, etc.
   - Shows resolved vs unresolved conflicts
   - Access: Admin, Faculty Admin, Exams Officer

3. **POST /api/timetable-conflicts/:conflictId/resolve** - Resolve Conflict
   - Mark a conflict as resolved
   - Requires resolvedBy user ID
   - Access: Admin, Faculty Admin, Exams Officer

## Status Enums

### ExamTimetableStatus
- `DRAFT` - Initial state, can be edited
- `PENDING_APPROVAL` - Submitted for approval
- `APPROVED` - Approved, ready to publish
- `PUBLISHED` - Published and visible to students
- `COMPLETED` - All exams completed
- `ARCHIVED` - Archived for historical reference

### TimetableApprovalStatus
- `NOT_SUBMITTED` - Not yet submitted
- `PENDING` - Awaiting approval
- `APPROVED` - Approved
- `REJECTED` - Rejected with reason

### ExamTimetableEntryStatus
- `DRAFT` - Entry being created
- `SCHEDULED` - Scheduled for exam
- `CONFIRMED` - Confirmed with all details
- `IN_PROGRESS` - Exam in progress
- `COMPLETED` - Exam completed
- `CANCELLED` - Entry cancelled

### ConflictSeverity
- `CRITICAL` - Must be resolved before publishing (e.g., student overlap)
- `HIGH` - Should be resolved (e.g., venue overlap)
- `MEDIUM` - Recommended to resolve (e.g., invigilator overlap)
- `LOW` - Optional to resolve

## Validation Features

### Automatic Validations
1. **Course Validation** - Course must exist
2. **Program Validation** - All programs must exist
3. **Venue Validation** - Venue must exist
4. **Room Validation** - All rooms must exist within the specified venue
5. **Date Range Validation** - Exam date must be within timetable date range
6. **Time Validation** - End time must be after start time
7. **Institution Consistency** - Faculty must belong to institution
8. **Academic Period Consistency** - Semester must belong to academic year
9. **Seating Capacity Calculation** - Automatically calculates total capacity from rooms

### Conflict Detection
- **Student Overlap** - Detects when students from same program have multiple exams at same time
- **Venue Overlap** - Detects when same room is booked for multiple exams simultaneously
- **Invigilator Overlap** - Detects when invigilator is assigned to multiple exams at same time
- **Capacity Exceeded** - Detects when student count exceeds available seating
- **Time Violations** - Validates time slot consistency
- **Date Violations** - Validates date consistency with timetable range

## Workflow

### Creation Workflow
1. Create Timetable (DRAFT status)
2. Add Timetable Entries
3. Detect Conflicts (automatic or manual)
4. Resolve Conflicts
5. Submit for Approval (→ PENDING_APPROVAL)
6. Approve or Reject
   - If Approved: → APPROVED status
   - If Rejected: → DRAFT status (with reason)
7. Publish (→ PUBLISHED status)

### Publishing Requirements
- ✅ Timetable must be APPROVED
- ✅ No critical unresolved conflicts
- ✅ At least one entry exists

## Example Request Bodies

### Create Timetable
```json
{
  "title": "Final Exams - Semester 1, 2024/2025",
  "description": "Final examination timetable for all programs in Faculty of Science",
  "institutionId": 1,
  "facultyId": 1,
  "academicYearId": 1,
  "semesterId": 1,
  "academicPeriodId": 1,
  "startDate": "2025-01-20",
  "endDate": "2025-02-10",
  "allowOverlaps": false,
  "autoResolveConflicts": true,
  "defaultExamDuration": 180,
  "createdBy": 1
}
```

### Create Timetable Entry
```json
{
  "timetableId": 1,
  "courseId": 1,
  "programIds": [1],
  "level": 300,
  "examDate": "2025-01-22T00:00:00.000Z",
  "startTime": "2025-01-22T09:00:00.000Z",
  "endTime": "2025-01-22T12:00:00.000Z",
  "duration": 180,
  "venueId": 1,
  "roomIds": [1, 2],
  "invigilatorIds": [5],
  "chiefInvigilatorId": 5,
  "notes": "Bring student ID cards",
  "specialRequirements": "Extra time for students with accommodations"
}
```

## Testing Workflow

### Step 1: Create Test Data
1. Ensure you have valid: institutionId, facultyId, academicYearId, semesterId, academicPeriodId
2. Ensure you have valid: courseId, programId, venueId, roomIds, userId (for approval)

### Step 2: Create Timetable
1. POST Create Timetable → saves timetableId
2. GET Timetable by ID → verify creation

### Step 3: Add Entries
1. POST Create Entry → saves entryId
2. POST Create another Entry (same time, same venue) → should detect conflict
3. GET Timetable Entries → view all entries

### Step 4: Manage Conflicts
1. POST Detect Conflicts → manual trigger
2. GET Timetable Conflicts → view conflict summary
3. Update conflicting entry (change time/venue)
4. POST Resolve Conflict → mark as resolved

### Step 5: Approval Workflow
1. POST Submit for Approval
2. POST Approve Timetable
3. GET Timetable Statistics → view stats
4. POST Publish Timetable

## Integration with Existing Endpoints

The timetable system integrates with:
- **Courses** (`/api/courses`) - Course information for entries
- **Programs** (`/api/programs`) - Program filtering and validation
- **Venues & Rooms** (`/api/venues`, `/api/rooms`) - Venue/room booking
- **Users** (`/api/users`) - Creator, approver, publisher tracking
- **Academic Years** (`/api/academic-years`) - Academic year context
- **Semesters** (`/api/semesters`) - Semester context
- **Academic Periods** (`/api/academic-periods`) - Exam period context

## Notes

1. **Auto-save Variables**: Create endpoints automatically save IDs to collection variables for easy chaining
2. **Test Scripts**: Included test scripts extract and save entity IDs from responses
3. **Access Control**: All endpoints respect role-based access control
4. **Conflict Detection**: Automatic conflict detection runs on entry create/update
5. **Published State Protection**: Cannot edit/delete entries in published timetables
6. **Comprehensive Validation**: All relationships validated before saving

## Next Steps

1. ✅ Import collection into Postman
2. ✅ Set environment variables (baseUrl, authToken, etc.)
3. ✅ Test authentication endpoints first
4. ✅ Create test academic structures (institution, faculty, courses, programs, venues)
5. ✅ Test timetable creation workflow
6. ✅ Test conflict detection
7. ✅ Test approval workflow
8. ⏳ Build import/export utilities
9. ⏳ Create frontend components
