# Exam Check-In & Invigilator Assignment Implementation Plan

**Last Updated:** November 23, 2025
**Status:** Planning Phase

---

## 📋 Executive Summary

### Refined Requirements

Based on the schema analysis and existing implementation, here's the refined implementation plan:

1. **Create Active Timetable** - Seed/update database with an active exam timetable for testing
2. **Invigilator Assignment Flow** - Exams officer assigns invigilators to specific exam sessions/rooms
3. **Public Student Check-In Page** - Secure public-facing page for students to check in via QR code
4. **Data Flow & Real-time Updates** - Handle check-in data and broadcast updates to officer dashboard

### What Already Exists ✅

**Database Schema:**
- ✅ `ExamTimetable` - Timetable structure with status (DRAFT, PUBLISHED, etc.)
- ✅ `ExamTimetableEntry` - Individual exam sessions with venue, time, course
- ✅ `InvigilatorAssignment` - Junction table linking invigilators to exam entries with status tracking
- ✅ `StudentVerification` - Table for tracking student check-ins with QR/biometric support
- ✅ `ExamRegistration` - Links students to exam entries with attendance tracking
- ✅ `ExamSessionLog` - Comprehensive audit log for all exam actions
- ✅ `ExamLogistics` - Aggregated metrics per exam entry

**Backend Services:**
- ✅ `checkInStudent()` - Student check-in logic (line 321 in examLogisticsService)
- ✅ Dashboard endpoints for officers
- ✅ Venue officer assignment system

**What Needs Implementation:**

1. **Active Timetable Setup** (Phase 1)
2. **Invigilator Assignment UI & API** (Phase 2)
3. **Public Check-In Page** (Phase 3)
4. **Mobile App Integration** (Phase 4 - Future)

---

## 🎯 Implementation Phases

### Phase 1: Active Timetable Setup (1-2 hours)

**Objective:** Create a published, active exam timetable with realistic data for testing

**Tasks:**

1. **Create Seed Script: `seedActiveTimetable.ts`**
   - Create timetable for current/upcoming week
   - Status: `PUBLISHED`, `isPublished: true`
   - Add 10-15 exam entries across different days/times
   - Include various venues and courses
   - Link to existing students via ExamRegistration

2. **Database Updates:**
   ```typescript
   // Timetable Structure
   {
     title: "End of Semester Exams - November 2025",
     academicYearId: existing,
     semesterId: existing,
     startDate: today + 1 day,
     endDate: today + 7 days,
     status: "PUBLISHED",
     isPublished: true,
     facultyId: Computer Science
   }

   // Exam Entries (10-15 sessions)
   {
     courseId: CS201, CS301, etc.,
     examDate: distributed across week,
     startTime: 8:00 AM, 12:00 PM, 3:00 PM,
     duration: 180 minutes,
     venueId: Main Hall, ICT Block,
     status: "SCHEDULED",
     studentCount: 20-50 per exam
   }

   // Exam Registrations
   - Link all students (11 total) to various exams
   - Generate unique QR codes per student per exam
   - Status: isPresent = false initially
   ```

3. **Verification Script:**
   - Query published timetables
   - Verify exam entries have valid venues
   - Check exam registrations exist
   - Confirm dates are active/upcoming

**Files to Create:**
- `backend/scripts/seedActiveTimetable.ts`
- `backend/scripts/verifyTimetableData.ts`

**Expected Output:**
- 1 published exam timetable
- 10-15 exam entries with realistic scheduling
- 50-100 exam registrations (students × exams)
- All entries have QR codes generated

---

### Phase 2: Invigilator Assignment System (3-4 hours)

**Objective:** Enable exams officers to assign invigilators to exam sessions and rooms

#### 2.1 Backend API Endpoints

**New Controller Methods (`examLogisticsController.ts`):**

```typescript
// 1. GET /api/exam-logistics/timetable/:timetableId/sessions
//    - Get all exam sessions in a timetable
//    - Include venue, room, course, student count
//    - Show current invigilator assignments

async getTimetableSessionsForAssignment(req: Request, res: Response) {
  const { timetableId } = req.params;
  // Return sessions with assignment status
}

// 2. POST /api/exam-logistics/assign-invigilator
//    - Assign invigilator to exam entry
//    - Support role selection (CHIEF, INVIGILATOR, RELIEF)
//    - Validate conflicts (same time assignments)

async assignInvigilatorToSession(req: Request, res: Response) {
  const { examEntryId, invigilatorId, role, venueId } = req.body;
  // Create InvigilatorAssignment
  // Check for time conflicts
  // Log action in ExamSessionLog
  // Emit real-time update
}

// 3. GET /api/exam-logistics/available-invigilators
//    - Get lecturers available for invigilation
//    - Filter by date/time availability
//    - Show existing assignments for conflict detection

async getAvailableInvigilators(req: Request, res: Response) {
  const { examDate, startTime, endTime } = req.query;
  // Return lecturers not assigned at that time
}

// 4. DELETE /api/exam-logistics/invigilator-assignment/:id
//    - Remove invigilator assignment
//    - Update exam logistics metrics

async removeInvigilatorAssignment(req: Request, res: Response) {
  const { id } = req.params;
  // Delete assignment
  // Update ExamLogistics counts
}

// 5. PUT /api/exam-logistics/invigilator-assignment/:id
//    - Update assignment (change role, reassign)
//    - Track reassignment history

async updateInvigilatorAssignment(req: Request, res: Response) {
  const { id } = req.params;
  const { role, invigilatorId } = req.body;
  // Update or reassign
}
```

**Service Layer Methods (`examLogisticsService.ts`):**

```typescript
class ExamLogisticsService {

  async getSessionsForAssignment(timetableId: number) {
    // Fetch exam entries with:
    // - Course info
    // - Venue/room details
    // - Current invigilator assignments
    // - Student count
    // - Session time/date
  }

  async assignInvigilator(data: InvigilatorAssignmentData) {
    // Validate no conflicts
    // Create InvigilatorAssignment
    // Update ExamLogistics.invigilatorsAssigned count
    // Create ExamSessionLog entry
    // Return assignment with details
  }

  async getAvailableInvigilators(examDate: Date, startTime: Date, endTime: Date) {
    // Query users with role LECTURER or INVIGILATOR
    // Exclude those with assignments at same time
    // Return with department info
  }

  async removeAssignment(assignmentId: number) {
    // Delete InvigilatorAssignment
    // Update ExamLogistics count
    // Log action
  }

  async checkInvigilatorConflicts(invigilatorId: number, examDate: Date, startTime: Date, endTime: Date) {
    // Check for existing assignments
    // Return conflict details if any
  }
}
```

**TypeScript Types:**

```typescript
interface InvigilatorAssignmentData {
  examEntryId: number;
  invigilatorId: number;
  role: 'CHIEF_INVIGILATOR' | 'INVIGILATOR' | 'RELIEF_INVIGILATOR';
  venueId: number;
  assignedBy: number;
  duties?: string;
}

interface SessionForAssignment {
  id: number;
  courseCode: string;
  courseName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  venue: {
    id: number;
    name: string;
    capacity: number;
  };
  studentCount: number;
  assignments: Array<{
    id: number;
    invigilator: {
      id: number;
      firstName: string;
      lastName: string;
    };
    role: string;
    status: string;
  }>;
}
```

#### 2.2 Frontend Implementation

**New Component: `InvigilatorAssignmentPanel.tsx`**

Located: `frontend/src/components/exams-officer/InvigilatorAssignmentPanel.tsx`

**Features:**
- List view of all exam sessions in selected timetable
- Each session card shows:
  - Course name and code
  - Date, time, duration
  - Venue and capacity
  - Student count
  - Current invigilator assignments
- "Assign Invigilator" button per session
- Modal/drawer for assignment:
  - Search/select available invigilators
  - Choose role (Chief/Regular/Relief)
  - Conflict warning if invigilator busy
  - Save assignment
- Real-time updates when assignments change

**UI Flow:**
```
1. Officer opens Invigilator Assignment page
2. Selects active timetable from dropdown
3. Sees list of all exam sessions
4. Clicks "Assign" on a session
5. Modal opens showing:
   - Session details
   - Available invigilators list
   - Current assignments
6. Officer selects invigilator and role
7. System checks conflicts
8. Assignment saved
9. Real-time update to dashboard
```

**Service Methods (`frontend/src/services/examLogistics.service.ts`):**

```typescript
async getSessionsForAssignment(timetableId: number) {
  return this.get(`/exam-logistics/timetable/${timetableId}/sessions`);
}

async assignInvigilator(data: InvigilatorAssignmentData) {
  return this.post('/exam-logistics/assign-invigilator', data);
}

async getAvailableInvigilators(params: { examDate: string; startTime: string; endTime: string }) {
  return this.get('/exam-logistics/available-invigilators', { params });
}

async removeInvigilatorAssignment(assignmentId: number) {
  return this.delete(`/exam-logistics/invigilator-assignment/${assignmentId}`);
}
```

**Files to Create/Modify:**
- `frontend/src/components/exams-officer/InvigilatorAssignmentPanel.tsx` (NEW)
- `frontend/src/services/examLogistics.service.ts` (ADD methods)
- `frontend/src/routes/AppRoutes.tsx` (ADD route)
- `backend/src/controllers/examLogisticsController.ts` (ADD methods)
- `backend/src/services/examLogisticsService.ts` (ADD methods)
- `backend/src/routes/examLogistics.ts` (ADD routes)

---

### Phase 3: Public Student Check-In System (4-5 hours)

**Objective:** Create secure public page for students to check in via QR code

#### 3.1 Security & Architecture

**Public Access Strategy:**
- No authentication required initially
- QR code contains encrypted token with:
  - Student ID
  - Exam Entry ID
  - Timestamp
  - Signature (HMAC)
- Server validates token before check-in
- Rate limiting to prevent abuse
- IP tracking for security

**QR Code Format:**
```
https://elms.tughana.edu.gh/public/exam-checkin?token=<encrypted>

Encrypted token contains:
{
  studentId: 123,
  examEntryId: 456,
  registrationId: 789,
  issuedAt: "2025-11-23T08:00:00Z",
  expiresAt: "2025-11-23T11:00:00Z"
}
```

#### 3.2 Backend Implementation

**New Public Controller: `publicExamController.ts`**

```typescript
// Public routes (no auth required)

// 1. POST /api/public/exam/check-in
//    - Validate QR token
//    - Verify exam is active
//    - Check student not already checked in
//    - Create StudentVerification record
//    - Update ExamRegistration (isPresent = true)
//    - Update ExamLogistics metrics
//    - Emit real-time event to officer dashboard

async checkInStudent(req: Request, res: Response) {
  const { token, method } = req.body;

  // Decode and validate token
  // Check exam is currently active (within time window)
  // Prevent duplicate check-ins
  // Record verification
  // Update metrics
  // Broadcast to WebSocket
}

// 2. GET /api/public/exam/verify-token
//    - Validate token without check-in
//    - Return exam details for display
//    - Used for QR scan preview

async verifyToken(req: Request, res: Response) {
  const { token } = req.query;

  // Decode token
  // Return exam session details
  // Don't perform check-in yet
}

// 3. GET /api/public/exam/session-status/:examEntryId
//    - Get current session status
//    - Show if check-in is open
//    - Public info only (no sensitive data)

async getSessionStatus(req: Request, res: Response) {
  const { examEntryId } = req.params;

  // Return session time, venue, status
  // Check if check-in window is open
}
```

**Service Layer:**

```typescript
class PublicExamService {

  async validateCheckInToken(token: string) {
    // Decrypt and verify HMAC
    // Check expiration
    // Validate student and exam exist
    // Return decoded data or throw error
  }

  async performCheckIn(data: StudentCheckInData, ipAddress: string) {
    // Verify exam is active now
    // Check not already checked in
    // Create StudentVerification
    // Update ExamRegistration.isPresent
    // Increment ExamLogistics.totalPresent
    // Create ExamSessionLog
    // Emit WebSocket event
  }

  async getExamSessionForCheckIn(examEntryId: number) {
    // Return public-safe exam info
    // Include venue, time, course name
    // Don't include sensitive data
  }
}
```

**Token Generation Utility:**

```typescript
// backend/src/utils/examTokens.ts

export class ExamTokenService {
  private static SECRET = process.env.EXAM_QR_SECRET || 'default-secret';

  static generateCheckInToken(data: {
    studentId: number;
    examEntryId: number;
    registrationId: number;
  }): string {
    const payload = {
      ...data,
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    const token = jwt.sign(payload, this.SECRET, { expiresIn: '24h' });
    return token;
  }

  static verifyCheckInToken(token: string): any {
    try {
      const decoded = jwt.verify(token, this.SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}
```

#### 3.3 Frontend Implementation

**Public Check-In Page: `PublicExamCheckIn.tsx`**

Located: `frontend/src/pages/public/PublicExamCheckIn.tsx`

**Features:**
- Standalone page (no app layout/auth)
- QR code scanner component
- Manual token input fallback
- Display exam details after scan
- Confirm check-in button
- Success/error messages
- Simple, mobile-friendly UI

**UI Flow:**
```
1. Student scans QR code (or enters token manually)
2. Page displays:
   - Student name
   - Exam course and code
   - Venue and time
   - "Confirm Check-In" button
3. Student confirms
4. System validates and records check-in
5. Success message shown
6. Officer dashboard updates in real-time
```

**Component Structure:**

```typescript
export default function PublicExamCheckIn() {
  const [token, setToken] = useState<string>('');
  const [examData, setExamData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'scan' | 'confirm' | 'success'>('scan');

  const handleQRScan = async (scannedToken: string) => {
    // Verify token and load exam details
  };

  const handleCheckIn = async () => {
    // Perform check-in API call
    // Show success message
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {step === 'scan' && <QRScannerView />}
      {step === 'confirm' && <ConfirmCheckInView />}
      {step === 'success' && <SuccessView />}
    </div>
  );
}
```

**QR Scanner Component:**
- Use `html5-qrcode` or `react-qr-reader` library
- Camera permissions handling
- Fallback to manual entry
- Error handling for invalid codes

**Service Methods:**

```typescript
// frontend/src/services/publicExam.service.ts

class PublicExamService {
  private baseURL = '/api/public/exam';

  async verifyToken(token: string) {
    return axios.get(`${this.baseURL}/verify-token`, { params: { token } });
  }

  async checkIn(token: string) {
    return axios.post(`${this.baseURL}/check-in`, { token, method: 'QR_CODE' });
  }

  async getSessionStatus(examEntryId: number) {
    return axios.get(`${this.baseURL}/session-status/${examEntryId}`);
  }
}
```

**Files to Create:**
- `frontend/src/pages/public/PublicExamCheckIn.tsx` (NEW)
- `frontend/src/services/publicExam.service.ts` (NEW)
- `frontend/src/components/public/QRScanner.tsx` (NEW)
- `backend/src/controllers/publicExamController.ts` (NEW)
- `backend/src/services/publicExamService.ts` (NEW)
- `backend/src/routes/publicExamRoutes.ts` (NEW)
- `backend/src/utils/examTokens.ts` (NEW)

---

### Phase 4: Integration & Real-time Updates (2-3 hours)

**Objective:** Connect all pieces with real-time WebSocket updates

#### 4.1 WebSocket Events

**New Events to Emit:**

```typescript
// When invigilator assigned
socket.emit('invigilator:assigned', {
  examEntryId,
  invigilator: { id, name },
  role,
  venue
});

// When student checks in
socket.emit('student:checkin', {
  examEntryId,
  student: { id, name },
  timestamp,
  venue
});

// When invigilator checks in (future)
socket.emit('invigilator:checkin', {
  examEntryId,
  invigilator: { id, name },
  timestamp
});
```

#### 4.2 Dashboard Updates

**Update `ExamsOfficerDashboard.tsx`:**
- Listen for new WebSocket events
- Update venue statistics in real-time
- Show toast notifications for check-ins
- Refresh session data on assignment changes

**Update `useLogisticsDashboardRealtime.ts`:**
- Add handlers for new event types
- Update local state on events
- Trigger data refetch when needed

#### 4.3 Testing Checklist

**Phase 1 Testing:**
- [ ] Active timetable created with 10+ sessions
- [ ] Exam registrations generated with QR codes
- [ ] All sessions have valid venues and times
- [ ] Dashboard shows timetable data

**Phase 2 Testing:**
- [ ] Officer can view all exam sessions
- [ ] Invigilator assignment creates record
- [ ] Conflict detection works
- [ ] Assignment removal works
- [ ] Real-time updates on dashboard

**Phase 3 Testing:**
- [ ] QR code scan works on mobile
- [ ] Token validation prevents duplicates
- [ ] Check-in updates ExamRegistration
- [ ] Metrics update correctly
- [ ] Real-time notification to dashboard
- [ ] Invalid tokens rejected
- [ ] Expired tokens rejected

**Phase 4 Testing:**
- [ ] End-to-end flow works
- [ ] Multiple officers see same updates
- [ ] Performance acceptable with 50+ students
- [ ] Error handling works correctly

---

## 📁 File Structure Summary

### New Files

```
backend/
  scripts/
    seedActiveTimetable.ts          # Phase 1
    verifyTimetableData.ts          # Phase 1
  src/
    controllers/
      publicExamController.ts       # Phase 3
    services/
      publicExamService.ts          # Phase 3
    routes/
      publicExamRoutes.ts           # Phase 3
    utils/
      examTokens.ts                 # Phase 3

frontend/
  src/
    components/
      exams-officer/
        InvigilatorAssignmentPanel.tsx  # Phase 2
      public/
        QRScanner.tsx                   # Phase 3
    pages/
      public/
        PublicExamCheckIn.tsx           # Phase 3
    services/
      publicExam.service.ts             # Phase 3
```

### Modified Files

```
backend/
  src/
    controllers/
      examLogisticsController.ts    # Phase 2 - add assignment methods
    services/
      examLogisticsService.ts       # Phase 2 - add assignment logic
    routes/
      examLogistics.ts              # Phase 2 - add routes
    server.ts                       # Phase 3 - add public routes

frontend/
  src/
    services/
      examLogistics.service.ts      # Phase 2 - add assignment methods
    routes/
      AppRoutes.tsx                 # Phases 2 & 3 - add routes
    hooks/
      useLogisticsDashboardRealtime.ts  # Phase 4 - add event handlers
    components/
      exams-officer/
        ExamsOfficerDashboard.tsx   # Phase 4 - listen for events
```

---

## 🔐 Security Considerations

### Public Check-In Page

1. **Rate Limiting:**
   - Max 5 check-in attempts per IP per minute
   - Prevent brute force attacks

2. **Token Security:**
   - JWT with HMAC-SHA256 signature
   - 24-hour expiration
   - Cannot be reused after successful check-in

3. **Validation:**
   - Check exam is currently active (within time window)
   - Verify student is registered for exam
   - Prevent duplicate check-ins
   - Log all attempts (success and failure)

4. **Data Exposure:**
   - Only show necessary info (course, venue, time)
   - Don't expose other students' data
   - Don't expose invigilator details

### Invigilator Assignment

1. **Authorization:**
   - Only EXAMS_OFFICER, ADMIN, SUPER_ADMIN can assign
   - Verify officer has access to venue
   - Log all assignments for audit

2. **Conflict Prevention:**
   - Check invigilator availability
   - Warn about time conflicts
   - Prevent double-booking

---

## 📊 Database Migrations Needed

**None required** - All necessary tables already exist in schema:
- ✅ InvigilatorAssignment
- ✅ StudentVerification
- ✅ ExamRegistration
- ✅ ExamSessionLog
- ✅ ExamLogistics
- ✅ VenueOfficerAssignment

---

## 🚀 Implementation Timeline

**Total Estimated Time: 10-14 hours**

| Phase | Tasks | Duration | Priority |
|-------|-------|----------|----------|
| Phase 1 | Active timetable setup | 1-2 hours | High |
| Phase 2 | Invigilator assignment system | 3-4 hours | High |
| Phase 3 | Public check-in page | 4-5 hours | High |
| Phase 4 | Integration & testing | 2-3 hours | High |

**Recommended Order:**
1. ✅ Phase 1 first (foundation)
2. ✅ Phase 2 second (officer tools)
3. ✅ Phase 3 third (student check-in)
4. ✅ Phase 4 last (polish & test)

---

## 🎯 Success Criteria

### Phase 1 Success
- [ ] 1 published exam timetable exists
- [ ] 10+ exam sessions scheduled
- [ ] All students registered for exams
- [ ] QR codes generated

### Phase 2 Success
- [ ] Officer can view exam sessions
- [ ] Officer can assign invigilators
- [ ] Conflicts detected and warned
- [ ] Assignments persist correctly
- [ ] Dashboard shows assignments

### Phase 3 Success
- [ ] Public page accessible
- [ ] QR scan works on mobile
- [ ] Check-in recorded correctly
- [ ] Real-time update works
- [ ] Security validations pass

### Phase 4 Success
- [ ] End-to-end flow works
- [ ] Real-time updates reliable
- [ ] Performance acceptable
- [ ] Error handling robust
- [ ] Ready for mobile app integration

---

## 🔄 Future Enhancements (Post-Mobile)

1. **Student Check-Out:**
   - Record when student leaves exam
   - Track exam duration per student
   - Alert if student leaves early

2. **Invigilator Check-In/Out:**
   - Track invigilator attendance
   - Alert if invigilator late/absent
   - Relief invigilator notifications

3. **Advanced Analytics:**
   - Attendance patterns
   - Invigilator performance
   - Venue utilization reports
   - Late arrival trends

4. **Notifications:**
   - Email/SMS to assigned invigilators
   - Push notifications for check-ins
   - Alert for incidents

5. **Biometric Verification:**
   - Fingerprint check-in
   - Facial recognition
   - Photo capture on check-in

---

## 📝 Notes

- **Check-out flow** will be implemented after mobile app (Phase 5)
- **QR code generation** for exam registrations should happen in Phase 1 seed
- **Real-time updates** are critical - test with multiple concurrent users
- **Mobile responsiveness** essential for public check-in page
- **Error messages** should be user-friendly for students

---

**Generated by:** GitHub Copilot
**Project:** ELMS (Education & Learning Management System)
**Document Type:** Implementation Plan
**Status:** Ready for Review & Implementation
