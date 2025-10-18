# ELMS Complete API Endpoints Inventory

## 📊 Summary Statistics

Total Endpoints: **155+**

### By Module:
- **Authentication**: 22 endpoints
- **Users**: 7 endpoints
- **Institutions**: 8 endpoints
- **Faculties**: 9 endpoints
- **Departments**: 7 endpoints
- **Programs**: 6 endpoints
- **Program Prefixes**: 4 endpoints
- **Courses**: 7 endpoints
- **Students**: 12 endpoints
- **Instructors**: 14 endpoints
- **Academic Periods**: 30 endpoints (Years: 8, Semesters: 8, Periods: 14)
- **Registrations**: 12 endpoints
- **Prerequisites**: 6 endpoints
- **Semester Records**: 8 endpoints
- **Academic History**: 10 endpoints
- **Exams**: 8 endpoints
- **Venues**: 12 endpoints (Venues: 6, Rooms: 6)
- **Incidents**: 13 endpoints

---

## 🔐 0. Health & System (3 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | None |
| GET | `/api` | API information | None |
| GET | `/api/database/status` | Database status | None |

---

## 🔑 1. Authentication (22 endpoints)

### Public Routes (8)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/verify-email/:token` | Verify email |
| POST | `/api/auth/resend-verification` | Resend verification |
| GET | `/api/auth/health` | Auth health check |

### Protected Routes (3)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/auth/profile` | Get user profile | All authenticated |
| POST | `/api/auth/logout` | Logout user | All authenticated |
| POST | `/api/auth/change-password` | Change password | All authenticated |

### Admin User Creation (7)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/auth/admin/create-user` | Create any user | Admin+ |
| POST | `/api/auth/admin/create-faculty-admin` | Create faculty admin | Super Admin, Admin |
| POST | `/api/auth/admin/create-exam-officer` | Create exam officer | Admin+ |
| POST | `/api/auth/admin/create-script-handler` | Create script handler | Exam Officer+ |
| POST | `/api/auth/admin/create-invigilator` | Create invigilator | Exam Officer+ |
| POST | `/api/auth/admin/create-lecturer` | Create lecturer | Admin+ |
| POST | `/api/auth/admin/create-student` | Create student | Admin+ |

### Role Information (2)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/auth/roles` | Get available roles | Admin+ |
| GET | `/api/auth/my-permissions` | Get my permissions | All authenticated |

---

## 👥 2. Users (7 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/users` | Get all users | Admin+ |
| GET | `/api/users/:id` | Get user by ID | Admin+ |
| POST | `/api/users` | Create user | Admin+ |
| PUT | `/api/users/:id` | Update user | Admin+ |
| DELETE | `/api/users/:id` | Delete user | Super Admin |
| GET | `/api/users/institutions/:institutionId/users` | Get users by institution | Admin+ |
| GET | `/api/users/faculties/:facultyId/users` | Get users by faculty | Admin+ |

---

## 🏛️ 3. Institutions (8 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/institutions` | Get all institutions | Admin+ |
| GET | `/api/institutions/:id` | Get institution by ID | Admin+ |
| POST | `/api/institutions` | Create institution | Super Admin |
| PUT | `/api/institutions/:id` | Update institution | Super Admin, Admin |
| DELETE | `/api/institutions/:id` | Delete institution | Super Admin |
| POST | `/api/institutions/with-admin` | Create institution with admin | Super Admin |
| GET | `/api/institutions/:id/analytics` | Get institution analytics | Super Admin, Admin |
| GET | `/api/institutions/analytics/overview` | Get overall analytics | Super Admin |

---

## 🎓 4. Faculties (9 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/faculties` | Get all faculties | Admin+ |
| GET | `/api/faculties/analytics` | Get faculty analytics | Admin+ |
| GET | `/api/faculties/:id` | Get faculty by ID | Admin+ |
| POST | `/api/faculties` | Create faculty | Super Admin, Admin |
| PUT | `/api/faculties/:id` | Update faculty | Super Admin, Admin |
| DELETE | `/api/faculties/:id` | Delete faculty | Super Admin |
| GET | `/api/faculties/institutions/:institutionId/faculties` | Get faculties by institution | Admin+ |
| PUT | `/api/faculties/:id/dean` | Assign dean to faculty | Super Admin, Admin |
| DELETE | `/api/faculties/:id/dean` | Remove dean from faculty | Super Admin, Admin |

---

## 🏢 5. Departments (7 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/departments` | Get all departments | Admin+ |
| GET | `/api/departments/:id` | Get department by ID | Admin+ |
| POST | `/api/departments` | Create department | Super Admin, Admin |
| PUT | `/api/departments/:id` | Update department | Super Admin, Admin |
| DELETE | `/api/departments/:id` | Delete department | Super Admin |
| GET | `/api/departments/faculties/:facultyId/departments` | Get departments by faculty | Admin+ |
| GET | `/api/departments/analytics` | Get department analytics | Admin+ |

---

## 📚 6. Programs (6 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/programs` | Get all programs | Admin+ |
| GET | `/api/programs/:id` | Get program by ID | Admin+ |
| POST | `/api/programs` | Create program | Super Admin, Admin |
| PUT | `/api/programs/:id` | Update program | Super Admin, Admin |
| DELETE | `/api/programs/:id` | Delete program | Super Admin |
| GET | `/api/programs/departments/:departmentId/programs` | Get programs by department | Admin+ |

---

## 🏷️ 7. Program Prefixes (4 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/program-prefixes` | Get all program prefixes | Super Admin, Admin |
| GET | `/api/program-prefixes/:programType` | Get prefix by program type | Super Admin, Admin |
| PUT | `/api/program-prefixes/:programType` | Update program prefix | Super Admin, Admin |
| PUT | `/api/program-prefixes/bulk/update` | Bulk update prefixes | Super Admin, Admin |

---

## 📖 8. Courses (7 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/courses` | Get all courses | Admin+, Lecturer |
| GET | `/api/courses/:id` | Get course by ID | Admin+, Lecturer, Student |
| POST | `/api/courses` | Create course | Admin+ |
| PUT | `/api/courses/:id` | Update course | Admin+ |
| DELETE | `/api/courses/:id` | Delete course | Super Admin, Admin |
| GET | `/api/courses/department/:departmentId` | Get courses by department | Admin+, Lecturer |
| GET | `/api/courses/program/:programId` | Get courses by program | Admin+, Lecturer, Student |

---

## 🎒 9. Students (12 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/students/stats` | Get student statistics | All authenticated |
| GET | `/api/students` | Get all students | Admin+ |
| GET | `/api/students/department/:departmentId` | Get students by department | Admin+ |
| GET | `/api/students/export` | Export students | Admin+ |
| GET | `/api/students/import-template` | Download import template | Admin+ |
| GET | `/api/students/:id` | Get student by ID | Admin+ |
| GET | `/api/students/by-student-id/:studentId` | Get student by student ID | Admin+ |
| POST | `/api/students` | Create student | Admin+ |
| PUT | `/api/students/:id` | Update student | Admin+ |
| DELETE | `/api/students/:id` | Delete student | Super Admin, Admin |
| PATCH | `/api/students/:id/status` | Update student status | Admin+ |
| POST | `/api/students/bulk-import` | Bulk import students | Super Admin, Admin |

---

## 👨‍🏫 10. Instructors (14 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/instructors/stats` | Get instructor statistics | All authenticated |
| GET | `/api/instructors` | Get all instructors | Admin+ |
| GET | `/api/instructors/:id` | Get instructor by ID | Admin+ |
| GET | `/api/instructors/by-staff-id/:staffId` | Get instructor by staff ID | Admin+ |
| POST | `/api/instructors` | Create instructor | Admin+ |
| PUT | `/api/instructors/:id` | Update instructor | Admin+ |
| DELETE | `/api/instructors/:id` | Delete instructor | Super Admin, Admin |
| PATCH | `/api/instructors/:id/status` | Update instructor status | Admin+ |
| POST | `/api/instructors/:id/departments` | Assign to department | Admin+ |
| DELETE | `/api/instructors/:id/departments/:departmentId` | Remove from department | Admin+ |
| POST | `/api/instructors/bulk-import` | Bulk import instructors | Super Admin, Admin |
| GET | `/api/instructors/department/:departmentId` | Get instructors by department | Admin+ |
| GET | `/api/instructors/export` | Export instructors | Admin+ |

---

## 📅 11. Academic Periods (30 endpoints)

### Academic Years (8)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/academic-periods/academic-years/current` | Get current academic year | All authenticated |
| GET | `/api/academic-periods/academic-years/stats` | Get academic period stats | All authenticated |
| GET | `/api/academic-periods/academic-years` | Get all academic years | Admin+ |
| GET | `/api/academic-periods/academic-years/:id` | Get academic year by ID | Admin+ |
| POST | `/api/academic-periods/academic-years` | Create academic year | Super Admin, Admin |
| PUT | `/api/academic-periods/academic-years/:id` | Update academic year | Super Admin, Admin |
| DELETE | `/api/academic-periods/academic-years/:id` | Delete academic year | Super Admin, Admin |
| PATCH | `/api/academic-periods/academic-years/:id/set-current` | Set current academic year | Super Admin, Admin |

### Semesters (8)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/academic-periods/semesters/current` | Get current semester | All authenticated |
| GET | `/api/academic-periods/semesters` | Get all semesters | Admin+ |
| GET | `/api/academic-periods/semesters/:id` | Get semester by ID | Admin+ |
| POST | `/api/academic-periods/semesters` | Create semester | Super Admin, Admin |
| PUT | `/api/academic-periods/semesters/:id` | Update semester | Super Admin, Admin |
| DELETE | `/api/academic-periods/semesters/:id` | Delete semester | Super Admin, Admin |
| PATCH | `/api/academic-periods/semesters/:id/set-current` | Set current semester | Super Admin, Admin |

### Academic Periods (14)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/academic-periods/periods/current` | Get current period | All authenticated |
| GET | `/api/academic-periods/periods/:id/status` | Get period status | All authenticated |
| GET | `/api/academic-periods/periods` | Get all periods | Admin+ |
| GET | `/api/academic-periods/periods/:id` | Get period by ID | Admin+ |
| GET | `/api/academic-periods/periods/semester/:semesterId` | Get period by semester | Admin+ |
| POST | `/api/academic-periods/periods` | Create period | Super Admin, Admin |
| PUT | `/api/academic-periods/periods/:id` | Update period | Super Admin, Admin |
| DELETE | `/api/academic-periods/periods/:id` | Delete period | Super Admin, Admin |
| PATCH | `/api/academic-periods/periods/:id/open-registration` | Open registration | Super Admin, Admin |
| PATCH | `/api/academic-periods/periods/:id/close-registration` | Close registration | Super Admin, Admin |
| PATCH | `/api/academic-periods/periods/:id/open-add-drop` | Open add/drop | Super Admin, Admin |
| PATCH | `/api/academic-periods/periods/:id/close-add-drop` | Close add/drop | Super Admin, Admin |

---

## 📝 12. Course Registration (12 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/registrations` | Create registration | Student, Lecturer, Admin+ |
| GET | `/api/registrations/:id` | Get registration by ID | Student (own), Lecturer, Admin+ |
| GET | `/api/registrations/student/:studentId` | Get student registrations | Student (own), Lecturer, Admin+ |
| POST | `/api/registrations/:id/courses` | Add course to registration | Student (own), Lecturer, Admin+ |
| DELETE | `/api/registrations/courses/:courseId` | Remove course from registration | Student (own), Lecturer, Admin+ |
| POST | `/api/registrations/:id/submit` | Submit registration | Student |
| POST | `/api/registrations/:id/approve` | Approve registration | Lecturer, Admin+ |
| POST | `/api/registrations/:id/reject` | Reject registration | Lecturer, Admin+ |
| GET | `/api/registrations/:id/validate` | Validate registration | Student (own), Lecturer, Admin+ |
| GET | `/api/registrations/eligibility/:studentId/:courseOfferingId` | Check course eligibility | Student (own), Lecturer, Admin+ |
| GET | `/api/registrations/eligible-courses/:studentId/:semesterId` | Get eligible courses | Student (own), Lecturer, Admin+ |
| GET | `/api/registrations/summary/:studentId/:semesterId` | Get registration summary | Student (own), Lecturer, Admin+ |

---

## ✅ 13. Prerequisites (6 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/prerequisites/check/:studentId/:courseId` | Check prerequisites | Student (own), Lecturer, Admin+ |
| GET | `/api/prerequisites/missing/:studentId/:courseId` | Get missing prerequisites | Student (own), Lecturer, Admin+ |
| GET | `/api/prerequisites/course/:courseId/:programId` | Get course prerequisites | All authenticated |
| POST | `/api/prerequisites/batch-check` | Batch check prerequisites | Student (own), Lecturer, Admin+ |
| GET | `/api/prerequisites/dependent/:courseId/:programId` | Get dependent courses | All authenticated |
| GET | `/api/prerequisites/validate-chain/:studentId/:courseId` | Validate prerequisite chain | Student (own), Lecturer, Admin+ |

---

## 📊 14. Semester Records (8 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/semester-records` | Create semester record | Faculty Admin, Admin |
| GET | `/api/semester-records/:studentId/:semesterId` | Get semester record | Student (own), Lecturer, Admin+ |
| GET | `/api/semester-records/student/:studentId` | Get all student records | Student (own), Lecturer, Admin+ |
| PUT | `/api/semester-records/:studentId/:semesterId` | Update semester record | Faculty Admin, Admin |
| POST | `/api/semester-records/:studentId/:semesterId/calculate-gpa` | Calculate semester GPA | Faculty Admin, Admin |
| POST | `/api/semester-records/:studentId/:semesterId/update-standing` | Update academic standing | Faculty Admin, Admin |
| POST | `/api/semester-records/:studentId/:semesterId/finalize` | Finalize semester record | Faculty Admin, Admin |
| GET | `/api/semester-records/:studentId/:semesterId/statistics` | Get semester statistics | Student (own), Lecturer, Admin+ |

---

## 🎓 15. Academic History (10 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/api/academic-history` | Create academic history | Faculty Admin, Admin |
| GET | `/api/academic-history/:studentId` | Get academic history | Student (own), Lecturer, Admin+ |
| POST | `/api/academic-history/:studentId/update-gpa` | Update cumulative GPA | Faculty Admin, Admin |
| GET | `/api/academic-history/:studentId/level-progression` | Check level progression | Student (own), Lecturer, Admin+ |
| POST | `/api/academic-history/:studentId/update-standing` | Update academic standing | Faculty Admin, Admin |
| PUT | `/api/academic-history/:studentId/current-semester` | Update current semester | Faculty Admin, Admin |
| GET | `/api/academic-history/:studentId/graduation-eligibility` | Check graduation eligibility | Student (own), Lecturer, Admin+ |
| POST | `/api/academic-history/:studentId/graduate` | Mark as graduated | Faculty Admin, Admin |
| GET | `/api/academic-history/:studentId/summary` | Get academic summary | Student (own), Lecturer, Admin+ |
| GET | `/api/academic-history/:studentId/transcript` | Get transcript | Student (own), Lecturer, Admin+ |

---

## 📝 16. Exams (8 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/exams` | Get all exams | Admin+, Exam Officer, Lecturer |
| GET | `/api/exams/:id` | Get exam by ID | Admin+, Exam Officer, Lecturer, Student |
| POST | `/api/exams` | Create exam | Admin+, Exam Officer |
| PUT | `/api/exams/:id` | Update exam | Admin+, Exam Officer |
| PATCH | `/api/exams/:id/status` | Update exam status | Admin+, Exam Officer |
| DELETE | `/api/exams/:id` | Delete exam | Super Admin, Admin |
| GET | `/api/exams/faculty/:facultyId` | Get exams by faculty | Admin+, Exam Officer, Lecturer |
| GET | `/api/exams/course/:courseId` | Get exams by course | Admin+, Exam Officer, Lecturer |

---

## 🏢 17. Venues & Rooms (12 endpoints)

### Venues (6)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/venues` | Get all venues | Admin+, Exam Officer, Lecturer |
| GET | `/api/venues/:id` | Get venue by ID | Admin+, Exam Officer, Lecturer |
| POST | `/api/venues` | Create venue | Super Admin, Admin |
| PUT | `/api/venues/:id` | Update venue | Super Admin, Admin |
| DELETE | `/api/venues/:id` | Delete venue | Super Admin, Admin |
| GET | `/api/venues/institution/:institutionId` | Get venues by institution | Admin+, Exam Officer, Lecturer |

### Rooms (6)
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/venues/rooms/all` | Get all rooms | Admin+, Exam Officer, Lecturer |
| GET | `/api/venues/rooms/:id` | Get room by ID | Admin+, Exam Officer, Lecturer |
| POST | `/api/venues/:venueId/rooms` | Create room | Super Admin, Admin |
| PUT | `/api/venues/rooms/:id` | Update room | Super Admin, Admin |
| DELETE | `/api/venues/rooms/:id` | Delete room | Super Admin, Admin |
| GET | `/api/venues/:venueId/rooms` | Get rooms by venue | Admin+, Exam Officer, Lecturer |

---

## 🚨 18. Incidents (13 endpoints)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/incidents` | Get all incidents | Admin+, Exam Officer, Invigilator |
| GET | `/api/incidents/:id` | Get incident by ID | Admin+, Exam Officer, Invigilator, Lecturer |
| POST | `/api/incidents` | Create incident | Admin+, Exam Officer, Invigilator, Lecturer, Student |
| PUT | `/api/incidents/:id` | Update incident | Admin+, Exam Officer |
| PATCH | `/api/incidents/:id/assign` | Assign incident | Admin+, Exam Officer |
| PATCH | `/api/incidents/:id/resolve` | Resolve incident | Admin+, Exam Officer |
| DELETE | `/api/incidents/:id` | Delete incident | Super Admin, Admin |
| GET | `/api/incidents/exam/:examId` | Get incidents by exam | Admin+, Exam Officer, Invigilator, Lecturer |
| GET | `/api/incidents/script/:scriptId` | Get incidents by script | Admin+, Exam Officer, Script Handler, Lecturer |
| GET | `/api/incidents/reporter/:userId` | Get incidents by reporter | Admin+, Exam Officer |
| GET | `/api/incidents/assignee/:userId` | Get incidents by assignee | Admin+, Exam Officer |
| GET | `/api/incidents/stats/overview` | Get incident statistics | Admin+, Exam Officer |

---

## ⚠️ Missing/Recommended Endpoints

Based on typical ELMS requirements, the following endpoints should be considered:

### 🔴 HIGH PRIORITY

#### Course Offerings (New Module)
- `POST /api/course-offerings` - Create course offering for semester
- `GET /api/course-offerings` - Get all course offerings
- `GET /api/course-offerings/:id` - Get course offering by ID
- `PUT /api/course-offerings/:id` - Update course offering
- `DELETE /api/course-offerings/:id` - Delete course offering
- `GET /api/course-offerings/semester/:semesterId` - Get offerings by semester
- `GET /api/course-offerings/instructor/:instructorId` - Get offerings by instructor
- `POST /api/course-offerings/:id/assign-instructor` - Assign instructor to offering

#### Enrollments (New Module)
- `GET /api/enrollments` - Get all enrollments
- `GET /api/enrollments/:id` - Get enrollment by ID
- `GET /api/enrollments/student/:studentId` - Get student enrollments
- `GET /api/enrollments/course-offering/:courseOfferingId` - Get enrollments for course offering
- `PUT /api/enrollments/:id/grade` - Update enrollment grade
- `POST /api/enrollments/:id/drop` - Drop enrollment
- `GET /api/enrollments/:id/attendance` - Get attendance records

#### Grades & Assessments (New Module)
- `POST /api/grades` - Submit grades
- `PUT /api/grades/:id` - Update grade
- `GET /api/grades/student/:studentId` - Get student grades
- `GET /api/grades/course-offering/:courseOfferingId` - Get all grades for offering
- `POST /api/grades/bulk-submit` - Bulk submit grades
- `GET /api/grades/export/:courseOfferingId` - Export grades

### 🟡 MEDIUM PRIORITY

#### Attendance (New Module)
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/student/:studentId` - Get student attendance
- `GET /api/attendance/course-offering/:courseOfferingId` - Get attendance for offering
- `PUT /api/attendance/:id` - Update attendance record
- `GET /api/attendance/report/:courseOfferingId` - Attendance report

#### Timetable (New Module)
- `POST /api/timetable` - Create timetable entry
- `GET /api/timetable` - Get timetables
- `GET /api/timetable/student/:studentId` - Get student timetable
- `GET /api/timetable/instructor/:instructorId` - Get instructor timetable
- `GET /api/timetable/room/:roomId` - Get room timetable
- `PUT /api/timetable/:id` - Update timetable entry
- `DELETE /api/timetable/:id` - Delete timetable entry

#### Notifications (New Module)
- `POST /api/notifications` - Create notification
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/user/:userId` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

### 🟢 LOW PRIORITY

#### File Uploads (New Module)
- `POST /api/uploads` - Upload file
- `GET /api/uploads/:id` - Download file
- `DELETE /api/uploads/:id` - Delete file

#### Reports (New Module)
- `GET /api/reports/enrollment-stats` - Enrollment statistics
- `GET /api/reports/grade-distribution` - Grade distribution
- `GET /api/reports/attendance-summary` - Attendance summary
- `GET /api/reports/graduation-forecast` - Graduation forecast

---

## 📝 Notes

1. **Current Implementation**: 155 endpoints fully implemented
2. **Missing Critical**: Course Offerings & Enrollments (16 endpoints recommended)
3. **Missing Important**: Grades & Assessments (6 endpoints recommended)
4. **Total Recommended**: 155 + 36 additional = **191 endpoints**

---

## 🔑 Access Control Summary

### Role Hierarchy
1. **SUPER_ADMIN** - System-wide access
2. **ADMIN** - Institution-level admin
3. **FACULTY_ADMIN** - Faculty/Dean level
4. **EXAMS_OFFICER** - Exam operations
5. **SCRIPT_HANDLER** - Script management
6. **INVIGILATOR** - Exam supervision
7. **LECTURER** - Course instructor
8. **STUDENT** - Student access

### Common Access Patterns
- **Public**: Health checks, API info
- **All Authenticated**: Profile, stats, current periods
- **Admin+ (Super Admin, Admin, Faculty Admin)**: Most management operations
- **Student (Own)**: View own records, create registrations
- **Lecturer**: View students, approve registrations, manage courses

---

## ✅ Testing Priority

1. **Critical Path**: Auth → Institutions → Faculties → Departments → Programs → Courses
2. **Student Management**: Students → Programs → Registration
3. **Academic Operations**: Academic Periods → Registration → Enrollments → Grades
4. **Exam Management**: Exams → Venues → Incidents

---

*Last Updated: 2024-10-18*
*Version: 2.0*
