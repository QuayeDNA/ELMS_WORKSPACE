# 📝 SCRIPT SUBMISSION & TRACKING FLOW

## 🎯 **SYSTEM OBJECTIVE**
Enable real-time tracking of exam script submissions from students through invigilators, organizing scripts into course-based batches with complete audit trails.

---

## 🔄 **CORE WORKFLOW**

### **Phase 1: Pre-Exam Setup (Current Implementation)**
```
1. Student enrolls in Program
   └─> Student registers for Courses (via Course Registration)
       └─> Exam Timetable is created
           └─> Exam Entries added (Course + Date + Time + Venue)
               └─> System AUTO-GENERATES:
                   ├─> ExamRegistration (links Student → Exam Entry)
                   ├─> Student QR Code (embedded with Student ID)
                   └─> Batch Script (one per Course/Exam Entry)
                       └─> Batch QR Code (embedded with Course Code + Exam Entry ID)
```

### **Phase 2: Exam Day - Script Submission**
```
1. Student arrives at exam venue
   ├─> Invigilator verifies student identity (manual check)
   └─> Student writes exam

2. Student completes exam
   └─> Student submits script to invigilator

3. Invigilator scans Student QR Code
   └─> Mobile app reads QR data:
       {
         "studentId": 456,
         "indexNumber": "CS/2023/001",
         "studentName": "John Doe",
         "programId": 12
       }

4. System AUTO-IDENTIFIES:
   ├─> Current active exam for this student (based on time + program)
   ├─> Finds ExamRegistration record
   ├─> Links submission to correct Batch Script
   └─> Records submission timestamp

5. System creates ScriptMovement record:
   ├─> Type: COLLECTED_FROM_STUDENT
   ├─> From: Student
   ├─> To: Invigilator
   ├─> Location: Exam Venue
   └─> Timestamp: Now

6. Updates:
   ├─> ExamRegistration.scriptSubmitted = true
   ├─> ExamRegistration.submittedAt = now
   ├─> BatchScript.submittedScriptsCount++
   └─> Script.status = COLLECTED
```

### **Phase 3: Batch Script Tracking (Future)**
```
1. Invigilator collects all scripts
2. Scans Batch Script QR Code
3. Confirms total count matches
4. Hands batch to Script Handler
5. Script Handler scans Batch QR → transfers custody
6. Batch dispatched to Lecturer for grading
```

---

## 📊 **DATA MODELS**

### **1. ExamRegistration** (Student ↔ Exam Entry Linkage)
```typescript
model ExamRegistration {
  id              Int      @id @default(autoincrement())

  // Student Link
  studentId       Int
  student         User     @relation(fields: [studentId], references: [id])

  // Exam Link
  examEntryId     Int
  examEntry       ExamTimetableEntry @relation(fields: [examEntryId], references: [id])

  // Course Link (denormalized for quick access)
  courseId        Int
  course          Course   @relation(fields: [courseId], references: [id])

  // Attendance Tracking
  isPresent       Boolean  @default(false)
  arrivedAt       DateTime?
  seatNumber      String?

  // Script Submission Tracking
  scriptSubmitted Boolean  @default(false)
  submittedAt     DateTime?
  submittedTo     Int?     // Invigilator ID
  submittedBy     User?    @relation("SubmittedTo", fields: [submittedTo], references: [id])

  // Batch Script Link
  batchScriptId   Int?
  batchScript     BatchScript? @relation(fields: [batchScriptId], references: [id])

  // Individual Script Link (Optional - for detailed tracking)
  scriptId        Int?     @unique
  script          Script?  @relation(fields: [scriptId], references: [id])

  // QR Code Data
  studentQRCode   String   @unique // Generated on registration

  // Metadata
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@unique([studentId, examEntryId])
  @@index([examEntryId, scriptSubmitted])
  @@index([studentQRCode])
  @@map("exam_registrations")
}
```

### **2. BatchScript** (Course-Level Script Container)
```typescript
model BatchScript {
  id                    Int      @id @default(autoincrement())

  // Exam Context
  examEntryId           Int      @unique
  examEntry             ExamTimetableEntry @relation(fields: [examEntryId], references: [id])

  // Course Context (denormalized)
  courseId              Int
  course                Course   @relation(fields: [courseId], references: [id])
  courseCode            String
  courseName            String

  // Batch Identification
  batchCode             String   @unique // e.g., "CS101-2024-SEM1-EXAM1"
  batchQRCode           String   @unique // QR with exam metadata

  // Script Counts
  totalRegistered       Int      @default(0)
  totalSubmitted        Int      @default(0)
  totalNotSubmitted     Int      @default(0)
  totalPresent          Int      @default(0)

  // Lecturer Assignment
  assignedLecturerId    Int?
  assignedLecturer      User?    @relation("BatchLecturerAssignment", fields: [assignedLecturerId], references: [id])

  // Invigilator Info
  chiefInvigilatorId    Int?
  chiefInvigilator      User?    @relation("BatchChiefInvigilator", fields: [chiefInvigilatorId], references: [id])

  // Venue Info (denormalized for quick access)
  venueId               Int
  venue                 Venue    @relation(fields: [venueId], references: [id])
  venueName             String

  // Program Info (JSON array)
  programIds            String   // JSON array of program IDs

  // Status Tracking
  status                BatchScriptStatus @default(PENDING)

  // Timestamps
  createdAt             DateTime @default(now())
  collectedAt           DateTime? // When all scripts collected
  dispatchedAt          DateTime? // When sent to lecturer
  receivedByLecturerAt  DateTime? // When lecturer confirms receipt

  // Relations
  examRegistrations     ExamRegistration[]
  scriptMovements       ScriptMovement[]   @relation("BatchMovements")

  @@index([examEntryId])
  @@index([courseId])
  @@index([status])
  @@index([batchQRCode])
  @@map("batch_scripts")
}

enum BatchScriptStatus {
  PENDING           // Not yet collected
  COLLECTING        // Collection in progress
  COLLECTED         // All collected at venue
  IN_TRANSIT        // Being transported
  WITH_LECTURER     // Received by lecturer
  GRADING           // Being graded
  GRADED            // Grading complete
  RETURNED          // Returned to registry
}
```

### **3. Script** (Individual Script - Optional Enhanced Tracking)
```typescript
model Script {
  id                Int          @id @default(autoincrement())

  // Unique Identifier
  qrCode            String       @unique
  scriptCode        String       @unique // e.g., "CS101-CS2023001-001"

  // Student & Exam Links
  studentId         Int
  student           User         @relation("StudentScripts", fields: [studentId], references: [id])
  examEntryId       Int
  examEntry         ExamTimetableEntry @relation(fields: [examEntryId], references: [id])
  courseId          Int
  course            Course       @relation(fields: [courseId], references: [id])

  // Batch Link
  batchScriptId     Int?
  batchScript       BatchScript? @relation(fields: [batchScriptId], references: [id])

  // Status Tracking
  status            ScriptStatus @default(GENERATED)

  // Physical Tracking
  currentLocation   String?
  currentHolderId   Int?        // User currently holding script
  currentHolder     User?       @relation("ScriptHolder", fields: [currentHolderId], references: [id])

  // Grading Info
  grade             String?
  gradedById        Int?
  gradedBy          User?       @relation("ScriptGrader", fields: [gradedById], references: [id])
  gradedAt          DateTime?

  // Metadata
  notes             String?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  // Relations
  movements         ScriptMovement[]
  examRegistration  ExamRegistration?

  @@index([studentId, examEntryId])
  @@index([batchScriptId])
  @@index([status])
  @@index([qrCode])
  @@map("scripts")
}

enum ScriptStatus {
  GENERATED         // QR code generated
  DISTRIBUTED       // Given to student
  COLLECTED         // Collected from student
  VERIFIED          // Count verified
  IN_BATCH          // Added to batch
  IN_TRANSIT        // Being transported
  WITH_LECTURER     // With lecturer for grading
  GRADED            // Grading complete
  RETURNED          // Returned to registry
  MISSING           // Cannot be located
  DAMAGED           // Physically damaged
}
```

### **4. ScriptMovement** (Enhanced Audit Trail)
```typescript
model ScriptMovement {
  id                Int          @id @default(autoincrement())

  // Movement Type
  type              MovementType

  // Individual Script (Optional)
  scriptId          Int?
  script            Script?      @relation(fields: [scriptId], references: [id])

  // Batch Script (for batch movements)
  batchScriptId     Int?
  batchScript       BatchScript? @relation("BatchMovements", fields: [batchScriptId], references: [id])

  // Custody Chain
  fromUserId        Int?
  fromUser          User?        @relation("MovementFrom", fields: [fromUserId], references: [id])
  toUserId          Int?
  toUser            User?        @relation("MovementTo", fields: [toUserId], references: [id])
  handledBy         Int?         // Person who performed the action
  handler           User?        @relation("MovementHandler", fields: [handledBy], references: [id])

  // Location Data
  fromLocation      String?
  toLocation        String?
  currentLocation   String?

  // Verification
  verificationCode  String?      // Security code for handover
  verified          Boolean      @default(false)
  verifiedAt        DateTime?

  // Context
  notes             String?
  timestamp         DateTime     @default(now())

  @@index([scriptId, timestamp])
  @@index([batchScriptId, timestamp])
  @@index([type])
  @@map("script_movements")
}

enum MovementType {
  GENERATED                 // Script QR generated
  DISTRIBUTED_TO_VENUE      // Sent to exam venue
  COLLECTED_FROM_STUDENT    // Collected from student
  VERIFIED_BY_INVIGILATOR   // Count verified
  ADDED_TO_BATCH            // Added to batch
  BATCH_SEALED              // Batch sealed and ready
  DISPATCHED_TO_HANDLER     // Given to script handler
  RECEIVED_BY_HANDLER       // Handler confirms receipt
  DISPATCHED_TO_LECTURER    // Sent to lecturer
  RECEIVED_BY_LECTURER      // Lecturer confirms receipt
  GRADING_STARTED           // Lecturer starts grading
  GRADING_COMPLETED         // Grading done
  RETURNED_TO_REGISTRY      // Returned to exam registry
}
```

---

## 🔐 **QR CODE STRUCTURE**

### **Student QR Code**
```json
{
  "type": "STUDENT",
  "studentId": 456,
  "indexNumber": "CS/2023/001",
  "firstName": "John",
  "lastName": "Doe",
  "programId": 12,
  "level": 200,
  "generatedAt": "2025-01-10T10:00:00Z",
  "securityHash": "sha256_of_student_data_with_secret"
}
```

### **Batch Script QR Code**
```json
{
  "type": "BATCH",
  "batchId": 789,
  "batchCode": "CS101-2024-SEM1-EXAM1",
  "examEntryId": 123,
  "courseId": 101,
  "courseCode": "CS101",
  "examDate": "2025-01-15",
  "venueId": 5,
  "totalRegistered": 150,
  "generatedAt": "2025-01-10T10:00:00Z",
  "securityHash": "sha256_of_batch_data_with_secret"
}
```

---

## 🎯 **API ENDPOINTS**

### **Exam Registration APIs**
```typescript
POST   /api/exam-entries/:entryId/register-students
  → Auto-register all students from course registrations
  → Generate student QR codes
  → Create ExamRegistration records

GET    /api/exam-entries/:entryId/registered-students
  → Get all students registered for exam
  → Include submission status

GET    /api/students/:studentId/exam-schedule
  → Get all exams for student
  → Show submission status
```

### **Batch Script APIs**
```typescript
POST   /api/exam-entries/:entryId/batch-script
  → Create batch script container
  → Generate batch QR code
  → Set initial counts

GET    /api/batch-scripts/:batchId
  → Get batch details
  → Show submission statistics

GET    /api/batch-scripts/:batchId/students
  → Get all students in batch
  → Filter by submitted/not-submitted

PATCH  /api/batch-scripts/:batchId/seal
  → Mark batch as sealed/collected
  → Record final counts
```

### **Script Submission APIs (Mobile App)**
```typescript
POST   /api/scripts/scan-student
  Body: { qrCode: "student_qr_data" }
  Returns: {
    studentInfo: { ... },
    activeExams: [ ... ], // Exams happening now
    canSubmit: boolean,
    examEntryId: number
  }

POST   /api/scripts/submit
  Body: {
    studentQRCode: "...",
    invigilatorId: 123,
    examEntryId: 456,  // Auto-detected or manually selected
    location: "Main Hall - Room 101"
  }
  Returns: {
    success: true,
    submission: { ... },
    batchScript: { ... }
  }

POST   /api/scripts/bulk-submit
  Body: {
    submissions: [
      { studentQRCode: "...", examEntryId: 123 },
      { studentQRCode: "...", examEntryId: 123 }
    ],
    invigilatorId: 456,
    location: "..."
  }
  → For offline collection and batch sync
```

### **Script Tracking APIs**
```typescript
GET    /api/batch-scripts/:batchId/movements
  → Get movement history

POST   /api/batch-scripts/:batchId/transfer
  Body: {
    fromUserId: 123,
    toUserId: 456,
    location: "...",
    verificationCode: "1234"
  }
  → Transfer batch custody

POST   /api/batch-scripts/:batchId/verify
  Body: {
    actualCount: 148,
    verifiedBy: 123
  }
  → Verify script count matches
```

---

## 📱 **MOBILE APP WORKFLOW**

### **Invigilator View - Script Collection**
```
┌─────────────────────────────────────┐
│  📱 SCRIPT COLLECTION               │
├─────────────────────────────────────┤
│                                     │
│  Exam: CS101 - Data Structures     │
│  Time: 10:00 AM - 1:00 PM          │
│  Venue: Main Hall - Room 101       │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  📷 SCAN STUDENT QR CODE    │   │
│  └─────────────────────────────┘   │
│                                     │
│  Stats:                             │
│  ✓ Submitted: 125 / 150            │
│  ⏳ Not Submitted: 25              │
│  👥 Present: 145                   │
│                                     │
│  [View Details] [Sync Now]         │
└─────────────────────────────────────┘

After Scan:
┌─────────────────────────────────────┐
│  ✅ Script Collected                │
├─────────────────────────────────────┤
│                                     │
│  Student: John Doe                  │
│  ID: CS/2023/001                    │
│  Course: CS101                      │
│  Time: 12:45 PM                     │
│                                     │
│  Submission recorded successfully! │
│                                     │
│  [Next Student] [View Batch]       │
└─────────────────────────────────────┘
```

---

## 🎨 **FRONTEND COMPONENTS**

### **For Exams Officer / Admin**
```typescript
// frontend/src/pages/exams-officer/ScriptManagementPage.tsx
- View all batch scripts
- See submission statistics
- Track batch locations
- Assign to lecturers
- Generate reports

// frontend/src/components/exams/BatchScriptCard.tsx
- Display batch summary
- Show submission progress bar
- Quick actions (seal, transfer)

// frontend/src/components/exams/RegisteredStudentsList.tsx
- List all students for an exam
- Show submission status
- Filter by submitted/not-submitted
- Export attendance sheet
```

### **For Students**
```typescript
// frontend/src/pages/student/MyExamSchedule.tsx
- View upcoming exams
- See submission status
- Download exam timetable
- View QR code for identification
```

---

## ⚡ **SMART AUTO-DETECTION LOGIC**

```typescript
// When invigilator scans student QR:

1. Extract studentId from QR code
2. Get current date/time
3. Query active exams:
   - WHERE examDate = today
   - WHERE startTime <= now <= endTime + buffer (30 mins)
   - WHERE student is registered (ExamRegistration exists)
4. If single exam found → Auto-select
5. If multiple exams → Show selection dialog
6. If no exam found → Show error

// This eliminates need to scan batch QR!
```

---

## 🔮 **FUTURE ENHANCEMENTS**

### **Phase 3: Time-Conscious Submissions**
- Enforce submission deadlines
- Auto-lock after exam end time
- Grace period for latecomers
- Incident logging for late submissions

### **Phase 4: Advanced Tracking**
- GPS location verification
- Photo capture of scripts
- Biometric verification
- Blockchain audit trail
- Real-time dashboards

### **Phase 5: AI Features**
- Predict missing scripts
- Anomaly detection
- Automated reconciliation
- Smart batch optimization

---

## 📊 **IMPLEMENTATION PRIORITY**

### **Week 1: Database & Backend**
- ✅ Add ExamRegistration model
- ✅ Add BatchScript model
- ✅ Extend Script model
- ✅ Add ScriptMovement enhancements
- ✅ Run migrations
- ✅ Create services (examRegistration, batchScript, scriptSubmission)
- ✅ Create API endpoints
- ✅ Add QR code generation logic

### **Week 2: Mobile App**
- ✅ Build QR scanner screen
- ✅ Implement scan & submit flow
- ✅ Add offline support
- ✅ Build batch sync feature
- ✅ Add submission confirmation UI

### **Week 3: Frontend Dashboard**
- ✅ Build script management pages
- ✅ Add batch tracking components
- ✅ Create student exam schedule view
- ✅ Add submission reports
- ✅ Build lecturer grading interface

### **Week 4: Testing & Refinement**
- ✅ End-to-end testing
- ✅ Performance optimization
- ✅ Security hardening
- ✅ Documentation
- ✅ Training materials

---

## 🎯 **SUCCESS METRICS**

1. **Submission Accuracy**: 99.9% correct student-script linkage
2. **Speed**: < 3 seconds per script submission
3. **Audit Trail**: 100% of movements tracked
4. **User Satisfaction**: Invigilators find it easier than manual
5. **Error Rate**: < 0.1% incorrect assignments

---

## 📝 **NOTES**

- **No Batch QR Scanning**: Smart auto-detection eliminates this step
- **Offline Support**: Mobile app caches data for poor connectivity
- **Security**: All QR codes have tamper-proof hashes
- **Scalability**: System handles 10,000+ concurrent submissions
- **Audit Trail**: Every action logged with timestamp & user

---

**Last Updated**: November 10, 2025
**Status**: Ready for Implementation
**Version**: 1.0
