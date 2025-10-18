# ELMS Missing Endpoints - Implementation TODO

## 📊 Overview

**Current Status**: 155 endpoints implemented
**Missing Critical Endpoints**: 36 recommended
**Priority**: Complete Course Offerings and Enrollments first

---

## 🔴 HIGH PRIORITY - Course Offerings Module

### Why Critical?
Without Course Offerings, students cannot register for specific course instances in a semester. This connects Courses → Semesters → Instructors → Enrollments.

### Endpoints Needed (8)

#### 1. Create Course Offering
```
POST /api/course-offerings
Body: {
  courseId: number,
  semesterId: number,
  instructorId: number,
  maxCapacity: number,
  section: string,
  schedule: { day, startTime, endTime, roomId }[]
}
Roles: Admin, Faculty Admin
```

#### 2. Get All Course Offerings
```
GET /api/course-offerings?semesterId=1&departmentId=1
Roles: Admin+, Lecturer, Student
```

#### 3. Get Course Offering by ID
```
GET /api/course-offerings/:id
Roles: Admin+, Lecturer, Student
```

#### 4. Update Course Offering
```
PUT /api/course-offerings/:id
Roles: Admin, Faculty Admin
```

#### 5. Delete Course Offering
```
DELETE /api/course-offerings/:id
Roles: Super Admin, Admin
```

#### 6. Get Offerings by Semester
```
GET /api/course-offerings/semester/:semesterId
Roles: Admin+, Lecturer, Student
```

#### 7. Get Offerings by Instructor
```
GET /api/course-offerings/instructor/:instructorId
Roles: Admin+, Lecturer (own)
```

#### 8. Assign Instructor to Offering
```
POST /api/course-offerings/:id/assign-instructor
Body: { instructorId: number }
Roles: Admin, Faculty Admin
```

### Database Schema Additions Needed
```prisma
model CourseOffering {
  id              Int       @id @default(autoincrement())
  courseId        Int
  semesterId      Int
  instructorId    Int?
  section         String?   // e.g., "A", "B", "Morning"
  maxCapacity     Int       @default(50)
  enrolledCount   Int       @default(0)
  status          OfferingStatus @default(ACTIVE)

  course          Course    @relation(fields: [courseId], references: [id])
  semester        Semester  @relation(fields: [semesterId], references: [id])
  instructor      Instructor? @relation(fields: [instructorId], references: [id])

  enrollments     Enrollment[]
  schedules       CourseSchedule[]

  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum OfferingStatus {
  ACTIVE
  FULL
  CANCELLED
  CLOSED
}

model CourseSchedule {
  id                Int       @id @default(autoincrement())
  courseOfferingId  Int
  dayOfWeek         Int       // 0-6 (Sunday-Saturday)
  startTime         String    // "08:00"
  endTime           String    // "10:00"
  roomId            Int?

  courseOffering    CourseOffering @relation(fields: [courseOfferingId], references: [id])
  room              Room?     @relation(fields: [roomId], references: [id])

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

### Implementation Files Needed
1. `backend/src/services/courseOfferingService.ts` - Business logic
2. `backend/src/controllers/courseOfferingController.ts` - HTTP handlers
3. `backend/src/routes/courseOfferingRoutes.ts` - Route definitions
4. `backend/src/types/courseOffering.ts` - TypeScript types

---

## 🔴 HIGH PRIORITY - Enrollments Module

### Why Critical?
Enrollments track which students are actually taking which courses. This is where grades are stored and attendance is tracked.

### Endpoints Needed (8)

#### 1. Get All Enrollments
```
GET /api/enrollments?studentId=1&semesterId=1
Roles: Admin+, Lecturer (own courses)
```

#### 2. Get Enrollment by ID
```
GET /api/enrollments/:id
Roles: Admin+, Lecturer (own course), Student (own)
```

#### 3. Get Student Enrollments
```
GET /api/enrollments/student/:studentId?semesterId=1
Roles: Admin+, Lecturer, Student (own)
```

#### 4. Get Enrollments for Course Offering
```
GET /api/enrollments/course-offering/:courseOfferingId
Roles: Admin+, Lecturer (own course)
```

#### 5. Update Enrollment Grade
```
PUT /api/enrollments/:id/grade
Body: {
  midtermGrade: string,
  finalGrade: string,
  overallGrade: string
}
Roles: Lecturer (own course), Faculty Admin, Admin
```

#### 6. Drop Enrollment
```
POST /api/enrollments/:id/drop
Roles: Student (own, during add/drop), Admin+
```

#### 7. Get Attendance Records
```
GET /api/enrollments/:id/attendance
Roles: Admin+, Lecturer (own course), Student (own)
```

#### 8. Bulk Update Grades
```
POST /api/enrollments/bulk-grade
Body: {
  courseOfferingId: number,
  grades: [{ enrollmentId, midterm, final, overall }]
}
Roles: Lecturer (own course), Faculty Admin, Admin
```

### Notes
- The `Enrollment` model already exists in your Prisma schema
- Just need to add controllers and routes
- Connect with existing StudentSemesterRecord for GPA calculation

### Implementation Files Needed
1. `backend/src/services/enrollmentService.ts` - Business logic
2. `backend/src/controllers/enrollmentController.ts` - HTTP handlers
3. `backend/src/routes/enrollmentRoutes.ts` - Route definitions

---

## 🟡 MEDIUM PRIORITY - Grades & Assessments Module

### Endpoints Needed (6)

#### 1. Submit Grades
```
POST /api/grades
Body: {
  enrollmentId: number,
  assessmentType: "MIDTERM" | "FINAL" | "QUIZ" | "ASSIGNMENT",
  score: number,
  maxScore: number,
  remarks: string
}
Roles: Lecturer (own course), Faculty Admin, Admin
```

#### 2. Update Grade
```
PUT /api/grades/:id
Roles: Lecturer (own course), Faculty Admin, Admin
```

#### 3. Get Student Grades
```
GET /api/grades/student/:studentId?semesterId=1
Roles: Admin+, Lecturer, Student (own)
```

#### 4. Get Grades for Course Offering
```
GET /api/grades/course-offering/:courseOfferingId
Roles: Admin+, Lecturer (own course)
```

#### 5. Bulk Submit Grades
```
POST /api/grades/bulk-submit
Body: {
  courseOfferingId: number,
  assessmentType: string,
  grades: [{ studentId, score, maxScore }]
}
Roles: Lecturer (own course), Faculty Admin, Admin
```

#### 6. Export Grades
```
GET /api/grades/export/:courseOfferingId?format=csv
Roles: Admin+, Lecturer (own course)
```

### Database Schema Addition
```prisma
model Assessment {
  id                Int       @id @default(autoincrement())
  enrollmentId      Int
  assessmentType    AssessmentType
  score             Float
  maxScore          Float
  percentage        Float?    // Calculated
  weight            Float?    // Weight in overall grade
  remarks           String?
  submittedAt       DateTime  @default(now())
  submittedById     Int

  enrollment        Enrollment @relation(fields: [enrollmentId], references: [id])
  submittedBy       User      @relation(fields: [submittedById], references: [id])

  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum AssessmentType {
  QUIZ
  ASSIGNMENT
  MIDTERM
  FINAL
  PROJECT
  PRESENTATION
}
```

---

## 🟡 MEDIUM PRIORITY - Attendance Module

### Endpoints Needed (5)

#### 1. Mark Attendance
```
POST /api/attendance
Body: {
  courseOfferingId: number,
  sessionDate: date,
  studentAttendance: [{ studentId, status: "PRESENT"|"ABSENT"|"LATE"|"EXCUSED" }]
}
Roles: Lecturer (own course), Invigilator
```

#### 2. Get Student Attendance
```
GET /api/attendance/student/:studentId?courseOfferingId=1
Roles: Admin+, Lecturer, Student (own)
```

#### 3. Get Attendance for Course Offering
```
GET /api/attendance/course-offering/:courseOfferingId?date=2024-10-18
Roles: Admin+, Lecturer (own course)
```

#### 4. Update Attendance Record
```
PUT /api/attendance/:id
Body: { status: "PRESENT"|"ABSENT"|"LATE"|"EXCUSED", remarks: string }
Roles: Lecturer (own course), Admin+
```

#### 5. Attendance Report
```
GET /api/attendance/report/:courseOfferingId?format=pdf
Roles: Admin+, Lecturer (own course)
```

---

## 🟡 MEDIUM PRIORITY - Timetable Module

### Endpoints Needed (7)

#### 1. Create Timetable Entry
```
POST /api/timetable
Body: {
  courseOfferingId: number,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  roomId: number
}
Roles: Admin, Faculty Admin
```

#### 2. Get All Timetables
```
GET /api/timetable?semesterId=1&facultyId=1
Roles: Admin+
```

#### 3. Get Student Timetable
```
GET /api/timetable/student/:studentId?semesterId=1
Roles: Admin+, Student (own)
```

#### 4. Get Instructor Timetable
```
GET /api/timetable/instructor/:instructorId?semesterId=1
Roles: Admin+, Lecturer (own)
```

#### 5. Get Room Timetable
```
GET /api/timetable/room/:roomId?semesterId=1
Roles: Admin+, Lecturer
```

#### 6. Update Timetable Entry
```
PUT /api/timetable/:id
Roles: Admin, Faculty Admin
```

#### 7. Delete Timetable Entry
```
DELETE /api/timetable/:id
Roles: Admin, Faculty Admin
```

---

## 🟢 LOW PRIORITY - Notifications Module

### Endpoints Needed (5)

#### 1. Create Notification
```
POST /api/notifications
Body: {
  title: string,
  message: string,
  targetUserIds: number[],
  type: "INFO"|"WARNING"|"URGENT",
  expiresAt: datetime
}
Roles: Admin+, Lecturer
```

#### 2. Get All Notifications (Admin)
```
GET /api/notifications
Roles: Admin+
```

#### 3. Get User Notifications
```
GET /api/notifications/user/:userId?unreadOnly=true
Roles: All authenticated (own)
```

#### 4. Mark Notification as Read
```
PATCH /api/notifications/:id/read
Roles: All authenticated (own)
```

#### 5. Delete Notification
```
DELETE /api/notifications/:id
Roles: Admin+ (any), User (own)
```

---

## 🟢 LOW PRIORITY - Reports Module

### Endpoints Needed (4)

#### 1. Enrollment Statistics
```
GET /api/reports/enrollment-stats?semesterId=1&facultyId=1
Roles: Admin+
```

#### 2. Grade Distribution
```
GET /api/reports/grade-distribution/:courseOfferingId
Roles: Admin+, Lecturer (own course)
```

#### 3. Attendance Summary
```
GET /api/reports/attendance-summary?semesterId=1&departmentId=1
Roles: Admin+
```

#### 4. Graduation Forecast
```
GET /api/reports/graduation-forecast?year=2025
Roles: Admin+
```

---

## 📋 Implementation Checklist

### Phase 1: Core Registration (Week 1-2)
- [ ] Add CourseOffering model to Prisma schema
- [ ] Add CourseSchedule model to Prisma schema
- [ ] Migrate database
- [ ] Implement CourseOfferingService (8 methods)
- [ ] Implement CourseOfferingController (8 endpoints)
- [ ] Create CourseOfferingRoutes with RBAC
- [ ] Register routes in server.ts
- [ ] Test all 8 course offering endpoints
- [ ] Implement EnrollmentService (8 methods)
- [ ] Implement EnrollmentController (8 endpoints)
- [ ] Create EnrollmentRoutes with RBAC
- [ ] Register routes in server.ts
- [ ] Test all 8 enrollment endpoints
- [ ] Update existing RegistrationService to create enrollments on approval

### Phase 2: Grades & Assessment (Week 3)
- [ ] Add Assessment model to Prisma schema
- [ ] Migrate database
- [ ] Implement GradeService (6 methods)
- [ ] Implement GradeController (6 endpoints)
- [ ] Create GradeRoutes with RBAC
- [ ] Register routes in server.ts
- [ ] Test all 6 grade endpoints
- [ ] Integrate with StudentSemesterRecordService for GPA calculation

### Phase 3: Attendance (Week 4)
- [ ] Add Attendance model to Prisma schema
- [ ] Migrate database
- [ ] Implement AttendanceService (5 methods)
- [ ] Implement AttendanceController (5 endpoints)
- [ ] Create AttendanceRoutes with RBAC
- [ ] Register routes in server.ts
- [ ] Test all 5 attendance endpoints

### Phase 4: Timetable (Week 5)
- [ ] Use existing CourseSchedule model (from Phase 1)
- [ ] Implement TimetableService (7 methods)
- [ ] Implement TimetableController (7 endpoints)
- [ ] Create TimetableRoutes with RBAC
- [ ] Register routes in server.ts
- [ ] Test all 7 timetable endpoints
- [ ] Add conflict detection logic

### Phase 5: Notifications & Reports (Week 6)
- [ ] Add Notification model to Prisma schema
- [ ] Migrate database
- [ ] Implement NotificationService (5 methods)
- [ ] Implement NotificationController (5 endpoints)
- [ ] Create NotificationRoutes with RBAC
- [ ] Implement ReportService (4 methods)
- [ ] Implement ReportController (4 endpoints)
- [ ] Create ReportRoutes with RBAC
- [ ] Register both routes in server.ts
- [ ] Test all endpoints

---

## 🔗 Dependencies & Integration

### Course Offerings depends on:
- ✅ Courses (already exists)
- ✅ Semesters (already exists)
- ✅ Instructors (already exists)
- ✅ Rooms (already exists)

### Enrollments depends on:
- ⏳ Course Offerings (Phase 1)
- ✅ Students (already exists)
- ✅ StudentSemesterRecord (already exists)

### Grades depends on:
- ⏳ Enrollments (Phase 1)

### Attendance depends on:
- ⏳ Course Offerings (Phase 1)
- ⏳ Enrollments (Phase 1)

### Timetable depends on:
- ⏳ Course Offerings (Phase 1)
- ✅ Rooms (already exists)

---

## 🎯 Success Criteria

### Phase 1 Complete When:
- [ ] Students can view available course offerings for a semester
- [ ] Instructors are assigned to course offerings
- [ ] Course capacity is tracked
- [ ] Registration creates enrollments automatically
- [ ] Enrollments can be viewed by student/course
- [ ] Grades can be entered on enrollments

### Full System Complete When:
- [ ] All 191 endpoints (155 + 36) are implemented
- [ ] All endpoints tested with Postman
- [ ] Integration tests pass
- [ ] Frontend can consume all endpoints
- [ ] Documentation updated

---

## 📞 Support

**Database Schema Updates**: Update `backend/prisma/schema.prisma` then run:
```bash
npx prisma migrate dev --name add_course_offerings
npx prisma generate
```

**Testing**: Use existing Postman collection pattern
**RBAC**: Follow existing role patterns in other modules

---

*Priority Order*: Course Offerings → Enrollments → Grades → Attendance → Timetable → Notifications → Reports

*Est. Timeline*: 6 weeks for complete implementation

*Last Updated*: 2024-10-18
