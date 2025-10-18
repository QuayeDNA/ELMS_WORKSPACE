# Academic System Implementation Roadmap

## 🎯 Executive Summary

Your ELMS system needs a **comprehensive academic management layer** to properly connect:
- Students → Programs → Courses
- Semesters → Registrations → Enrollments
- Academic Periods → Examinations
- GPA Tracking → Level Progression → Graduation

## 📊 Current System Assessment

### ✅ Strong Foundation
- Hierarchical institutional structure (Institution → Faculty → Department → Program)
- User role management with permissions
- Basic course and enrollment models
- Examination management system

### ❌ Critical Missing Components
- **No course registration workflow**
- **No academic calendar with exam periods**
- **No GPA calculation system**
- **No student progression tracking**
- **No prerequisite validation**
- **No registration approval workflow**

## 🏗️ Proposed Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     INSTITUTION                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              ACADEMIC YEAR (2024/2025)              │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │     SEMESTER 1 (Aug - Dec)                   │  │   │
│  │  │  ┌────────────────────────────────────────┐  │  │   │
│  │  │  │   ACADEMIC PERIOD                      │  │  │   │
│  │  │  │  • Registration: Aug 1-15              │  │  │   │
│  │  │  │  • Add/Drop: Aug 16-22                 │  │  │   │
│  │  │  │  • Lectures: Aug 23 - Dec 10           │  │  │   │
│  │  │  │  • Exams: Dec 11-20 ←────────────────┐ │  │  │   │
│  │  │  └────────────────────────────────────────┘  │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    PROGRAM CURRICULUM                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  BSc Computer Science (4 Years)                     │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Level 100 - Year 1                          │  │   │
│  │  │  ├─ Semester 1 (15 credits)                  │  │   │
│  │  │  │  ├─ CS 101 (Core, 3cr)                    │  │   │
│  │  │  │  ├─ MATH 101 (Core, 3cr)                  │  │   │
│  │  │  │  └─ ...                                    │  │   │
│  │  │  └─ Semester 2 (15 credits)                  │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │  Level 200 - Year 2 (Prerequisites apply)   │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              STUDENT REGISTRATION WORKFLOW                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  STEP 1: Check Registration Period                  │   │
│  │         ↓ (Aug 1-15 is open)                        │   │
│  │  STEP 2: View Eligible Courses                      │   │
│  │         ↓ (Filtered by level, prerequisites)        │   │
│  │  STEP 3: Add Courses (DRAFT)                        │   │
│  │         ↓ (System validates rules)                  │   │
│  │  STEP 4: Submit Registration (SUBMITTED)            │   │
│  │         ↓                                            │   │
│  │  STEP 5: Approval (APPROVED)                        │   │
│  │         ↓ (Auto or Manual)                          │   │
│  │  STEP 6: Create Enrollments (COMPLETED)             │   │
│  │         ↓                                            │   │
│  │  STEP 7: Semester Progress Tracking                 │   │
│  │         ↓                                            │   │
│  │  STEP 8: GPA Calculation & Level Progression        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🗄️ New Database Models (7 Tables)

### 1. `academic_periods`
**Purpose**: Define registration, teaching, and exam periods within a semester

```typescript
{
  id, semesterId,
  registrationStartDate, registrationEndDate,
  addDropStartDate, addDropEndDate,
  lectureStartDate, lectureEndDate,
  examStartDate, examEndDate,  // ← Your exam period requirement
  resultsReleaseDate,
  isActive
}
```

### 2. `course_registrations`
**Purpose**: Track student registration per semester (workflow)

```typescript
{
  id, studentId, semesterId,
  status: DRAFT | SUBMITTED | APPROVED | REJECTED,
  totalCredits,
  approvedBy, advisorId,
  submittedAt, approvedAt
}
```

### 3. `registered_courses`
**Purpose**: Individual courses within a registration

```typescript
{
  id, registrationId, courseOfferingId,
  registrationType: REGULAR | RETAKE | CARRYOVER,
  prerequisitesMet,
  isLocked, droppedAt
}
```

### 4. `student_semester_records`
**Purpose**: Track GPA and performance per semester

```typescript
{
  id, studentId, semesterId,
  coursesRegistered, coursesCompleted,
  semesterGPA, cumulativeGPA,
  totalCreditsEarned, totalGradePoints,
  academicStatus
}
```

### 5. `student_academic_history`
**Purpose**: Overall student academic journey

```typescript
{
  id, studentId,
  admissionYear, currentLevel,
  totalSemestersCompleted,
  cumulativeGPA, currentStatus,
  expectedGraduationDate, hasGraduated,
  levelProgressionHistory
}
```

### 6. `academic_calendar_imports`
**Purpose**: Track calendar imports from CSV/Excel

```typescript
{
  id, institutionId,
  fileName, fileUrl, fileType,
  status, recordsImported, errorLog
}
```

### 7. Enhanced `program_courses`
**Purpose**: Better curriculum management with offering patterns

```typescript
{
  id, programId, courseId,
  level, semester, yearInProgram,
  isRequired, isCore,
  prerequisiteCourseIds,
  offeredInSemester1, offeredInSemester2
}
```

## 🔄 Complete Academic Flow

### Semester Setup Flow
```
1. Admin creates Academic Year (2024/2025)
   ↓
2. Admin creates Semesters (Semester 1, Semester 2)
   ↓
3. Admin creates Academic Period for each semester
   • Sets registration period
   • Sets exam period ← YOUR REQUIREMENT
   • Sets lecture period
   ↓
4. (Optional) Import calendar from CSV/Excel
   ↓
5. Create Course Offerings for the semester
   • Assign courses to lecturers
   • Set capacity and schedules
```

### Student Registration Flow
```
Student logs in during registration period
   ↓
System shows courses for student's level & program
   ↓
Student adds courses (validates prerequisites, capacity, conflicts)
   ↓
Student submits registration
   ↓
System/Advisor approves
   ↓
Enrollments created automatically
   ↓
Student can add/drop during add/drop period
   ↓
After deadline, courses are locked
```

### Semester End Flow
```
Lecturers enter grades
   ↓
System calculates:
  • Semester GPA
  • Cumulative GPA
  • Credits earned
   ↓
Updates Student Semester Record
   ↓
Checks academic standing (Probation if GPA < 2.0)
   ↓
Checks level progression eligibility
   ↓
Checks graduation eligibility
```

## 🎯 Implementation Phases

### ✅ Phase 1: Academic Calendar (Week 1-2)
- [ ] Create `academic_periods` table
- [ ] Add exam period dates
- [ ] Implement CRUD endpoints
- [ ] Add calendar import/export
- [ ] Create admin UI for period management

### ✅ Phase 2: Course Registration (Week 3-4)
- [ ] Create `course_registrations` table
- [ ] Create `registered_courses` table
- [ ] Implement registration workflow
- [ ] Add prerequisite validation
- [ ] Create student registration UI
- [ ] Add approval workflow

### ✅ Phase 3: GPA & Progress (Week 5-6)
- [ ] Create `student_semester_records` table
- [ ] Create `student_academic_history` table
- [ ] Implement GPA calculation service
- [ ] Add level progression logic
- [ ] Create transcript generation
- [ ] Add student dashboard with progress

### ✅ Phase 4: Enhancement (Week 7-8)
- [ ] Academic advisor assignment
- [ ] Graduation eligibility checker
- [ ] Academic calendar templates
- [ ] Bulk registration operations
- [ ] Advanced reporting & analytics

## 📋 Business Rules Summary

### Registration Rules
1. ✅ Students register only during registration period
2. ✅ Max 24 credits per semester (configurable)
3. ✅ Prerequisites must be met
4. ✅ Course capacity limits enforced
5. ✅ No time conflicts allowed
6. ✅ Students register for their current level

### GPA Rules
1. ✅ Grade scale: A=4.0, B+=3.5, B=3.0, C+=2.5, C=2.0, D+=1.5, D=1.0, F=0.0
2. ✅ Semester GPA = Grade Points / Credits Attempted
3. ✅ Cumulative GPA = Total Grade Points / Total Credits
4. ✅ Failed courses count in GPA, credits not earned

### Progression Rules
1. ✅ 100→200: Min 24 credits
2. ✅ 200→300: Min 60 credits
3. ✅ 300→400: Min 96 credits
4. ✅ Probation if GPA < 2.0
5. ✅ Review for dismissal after 2 consecutive probations

## 🔐 Access Control Matrix

| Role | Register Courses | Approve Registration | Override Prerequisites | Manage Calendar | View All Records |
|------|------------------|----------------------|------------------------|-----------------|------------------|
| STUDENT | Own only | ❌ | ❌ | ❌ | Own only |
| LECTURER | ❌ | Advisees | ❌ | ❌ | Advisees |
| HOD | ❌ | Department | ✅ | Department | Department |
| FACULTY_ADMIN | ❌ | Faculty | ✅ | Faculty | Faculty |
| ADMIN | ❌ | Institution | ✅ | ✅ | Institution |
| SUPER_ADMIN | ✅ | All | ✅ | ✅ | All |

## 📡 New API Endpoints (30+)

### Academic Calendar
```
POST   /api/academic-periods
GET    /api/academic-periods
GET    /api/academic-periods/:id
PUT    /api/academic-periods/:id
DELETE /api/academic-periods/:id
POST   /api/academic-periods/import
GET    /api/academic-periods/current
```

### Course Registration
```
POST   /api/course-registrations
GET    /api/course-registrations
GET    /api/course-registrations/:id
PUT    /api/course-registrations/:id
POST   /api/course-registrations/:id/submit
POST   /api/course-registrations/:id/approve
POST   /api/course-registrations/:id/reject
POST   /api/course-registrations/:id/courses
DELETE /api/course-registrations/:id/courses/:courseId
```

### Student Records
```
GET    /api/students/:id/eligible-courses
GET    /api/students/:id/semester-records
GET    /api/students/:id/transcript
GET    /api/students/:id/academic-history
POST   /api/students/:id/calculate-gpa
POST   /api/students/:id/advance-level
```

## 🚀 Quick Start Implementation

1. **Review this document** with your team
2. **Approve the architecture** and approach
3. **I'll implement Phase 1** (Academic Calendar with exam periods)
4. **You test** the calendar and exam period functionality
5. **I'll implement Phase 2** (Course Registration)
6. **Iterate and refine** based on feedback

## 💡 Key Benefits

✅ **Students can self-register** for courses during registration periods
✅ **Automatic prerequisite validation** prevents invalid registrations
✅ **Exam periods clearly defined** in academic calendar
✅ **GPA automatically calculated** each semester
✅ **Level progression automated** based on credits earned
✅ **Academic standing tracked** (probation, good standing)
✅ **Transcript generation** available on-demand
✅ **Calendar import/export** for easy setup
✅ **Complete audit trail** of all academic activities
✅ **Scalable architecture** for future enhancements

---

## ❓ Decision Points

**Please confirm:**
1. ✅ Approve this architecture?
2. ✅ Start with Phase 1 (Academic Calendar)?
3. ✅ Any modifications needed?
4. ✅ Additional requirements?

**Ready to implement when you give the go-ahead!** 🚀
