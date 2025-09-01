# 🔐 ELMS Authentication & Role-Based Access Control Documentation

## 📋 Table of Contents
- [Overview](#overview)
- [User Roles & Hierarchy](#user-roles--hierarchy)
- [Role Permissions](#role-permissions)
- [Authentication System](#authentication-system)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Security Features](#security-features)

---

## 🎯 Overview

The ELMS authentication system implements a sophisticated role-based access control (RBAC) system designed specifically for examination logistics management. The system supports 8 distinct user roles with hierarchical permissions and scope-based access control.

### Key Features:
- **8 User Roles**: From Super Admin to Student, each with specific responsibilities
- **Hierarchical Access**: Higher roles can manage lower roles in the hierarchy
- **Scope-Based Control**: Institution, Faculty, and Department level access restrictions
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Permission-Based Access**: Granular permissions for specific actions
- **Audit Logging**: Comprehensive activity tracking and logging

---

## 👥 User Roles & Hierarchy

### Role Hierarchy (Highest to Lowest Authority)

```
┌─────────────────┐
│   Super Admin   │ ← System-wide control
└─────────┬───────┘
          │
┌─────────▼───────┐
│      Admin      │ ← Institution-level control
└─────────┬───────┘
          │
┌─────────▼───────┐
│  Faculty Admin  │ ← Faculty-level control
└─────────┬───────┘
          │
┌─────────▼───────┐
│  Exams Officer  │ ← Exam logistics specialist
└─────┬───────────┘
      │
      ├─────────────────┐
      │                 │
┌─────▼───────┐  ┌──────▼─────┐
│Script Handler│  │Invigilator │ ← Operational roles
└─────┬───────┘  └──────┬─────┘
      │                 │
      └─────────┬───────┘
                │
        ┌───────▼───────┐
        │    Lecturer   │ ← Academic role
        └───────┬───────┘
                │
        ┌───────▼───────┐
        │    Student    │ ← End user
        └───────────────┘
```

### 1. 🔥 Super Admin
- **Scope**: System-wide
- **Description**: Ultimate system administrator with complete control over all institutions
- **Key Responsibilities**:
  - Manage all institutions and system settings
  - Create and manage institutional admins
  - System-wide monitoring and analytics
  - Handle critical escalations
  - Configure global system parameters

### 2. 🏛️ Admin (Institution Administrator)
- **Scope**: Institution-level
- **Description**: Institution-wide administrator managing all faculty operations
- **Key Responsibilities**:
  - Manage faculty admins within their institution
  - Oversee institution-wide exam operations
  - Configure institutional policies and settings
  - Handle institutional-level incidents
  - Monitor faculty performance

### 3. 🎓 Faculty Admin
- **Scope**: Faculty-level
- **Description**: Faculty administrator managing departments, courses, and faculty users
- **Key Responsibilities**:
  - Manage departments and courses within faculty
  - Create and manage exam officers, lecturers, and students
  - Oversee faculty-specific examination processes
  - Handle faculty-level academic policies
  - Coordinate with institution administration

### 4. 📅 Exams Officer
- **Scope**: Faculty/Department-level
- **Description**: Exam logistics specialist appointed by Faculty Admin
- **Key Responsibilities**:
  - Schedule and coordinate examination sessions
  - Manage exam venues and resources
  - Handle exam-related incidents and issues
  - Coordinate with invigilators and script handlers
  - Ensure compliance with exam procedures

### 5. 📦 Script Handler
- **Scope**: Department-level
- **Description**: Script security and transit specialist
- **Key Responsibilities**:
  - Receive and dispatch examination scripts
  - Scan QR codes and track script movements
  - Ensure script security during transport
  - Report script-related incidents
  - Maintain script custody chains

### 6. 👁️ Invigilator
- **Scope**: Course-level
- **Description**: Exam supervisor ensuring exam integrity
- **Key Responsibilities**:
  - Supervise examination sessions
  - Collect and verify examination scripts
  - Report examination incidents and irregularities
  - Ensure exam integrity and security
  - Manage student queries during exams

### 7. 👨‍🏫 Lecturer
- **Scope**: Course-level
- **Description**: Academic staff member responsible for course content
- **Key Responsibilities**:
  - Create and design examination papers
  - Grade and assess examination scripts
  - Manage course-specific exam requirements
  - Provide feedback on student performance
  - Report academic integrity issues

### 8. 🎒 Student
- **Scope**: Course-level
- **Description**: End user participating in examinations
- **Key Responsibilities**:
  - Attend scheduled examination sessions
  - Follow examination rules and procedures
  - Report exam-related issues or concerns
  - View personal exam schedules and results
  - Maintain academic integrity standards

---

## 🔑 Role Permissions

### Permission Categories

#### User Management
- `canManageUsers`: Create, update, and manage user accounts
- `canViewUsers`: View user information and listings
- `canCreateUsers`: Create new user accounts
- `canUpdateUsers`: Modify existing user accounts
- `canDeleteUsers`: Delete or suspend user accounts

#### Institution Management
- `canManageInstitutions`: Full institution management
- `canManageFaculties`: Faculty creation and management
- `canManageDepartments`: Department administration

#### Exam Management
- `canCreateExams`: Create new examinations
- `canScheduleExams`: Schedule exam sessions
- `canManageExams`: Full exam administration
- `canViewExams`: View exam information
- `canConductExams`: Supervise examinations

#### Script Management
- `canGenerateScripts`: Generate script batches
- `canTrackScripts`: Monitor script status and location
- `canHandleScripts`: Physical script handling
- `canScanQrCodes`: QR code scanning capabilities
- `canGradeScripts`: Grade and assess scripts

#### Incident Management
- `canReportIncidents`: Report exam incidents
- `canManageIncidents`: Investigate and manage incidents
- `canInvestigateIncidents`: Conduct incident investigations
- `canResolveIncidents`: Resolve incident cases

#### Venue Management
- `canManageVenues`: Venue and room administration
- `canViewVenues`: View venue information

#### Analytics & Reporting
- `canViewAnalytics`: Access system analytics
- `canExportData`: Export data and reports
- `canViewAuditLogs`: Access system audit logs

#### Administrative
- `canManageSettings`: System configuration
- `canViewSystemLogs`: System log access

### Permission Matrix

| Permission | Super Admin | Admin | Faculty Admin | Exams Officer | Script Handler | Invigilator | Lecturer | Student |
|------------|-------------|-------|---------------|---------------|----------------|-------------|----------|---------|
| User Management | ✅ Full | ✅ Institution | ✅ Faculty | ❌ | ❌ | ❌ | ❌ | ❌ |
| Exam Creation | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (Own) | ❌ |
| Script Handling | ✅ Oversight | ✅ Oversight | ✅ Oversight | ✅ Logistics | ✅ Core | ✅ Collection | ✅ Grading | ❌ |
| Incident Management | ✅ All | ✅ Institution | ✅ Faculty | ✅ Core | ✅ Report | ✅ Report | ✅ Report | ✅ Report |
| Analytics | ✅ System | ✅ Institution | ✅ Faculty | ✅ Exams | ❌ | ❌ | ✅ Courses | ❌ |

---

## 🔒 Authentication System

### JWT Token Structure

```typescript
interface JwtPayload {
  userId: number;
  email: string;
  role: UserRole;
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
  permissions: RolePermissions;
  iat?: number;  // Issued at
  exp?: number;  // Expires at
}
```

### Token Management
- **Access Token**: 24-hour expiration for API access
- **Refresh Token**: 7-day expiration for token renewal
- **Password Reset Token**: 1-hour expiration for password reset
- **Email Verification Token**: 24-hour expiration for email verification

### Security Features
- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Signing**: HS256 algorithm with secure secret
- **Rate Limiting**: API endpoint protection
- **Session Management**: Multi-device session tracking
- **Audit Logging**: Comprehensive activity tracking

---

## 🌐 API Endpoints

### Public Endpoints (No Authentication)

#### POST /api/auth/register
Register a new user account
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT",
  "institutionId": 1,
  "facultyId": 1
}
```

#### POST /api/auth/login
Authenticate user and receive tokens
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "institutionId": 1
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /api/auth/forgot-password
Request password reset
```json
{
  "email": "user@example.com"
}
```

#### POST /api/auth/reset-password
Reset password using reset token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "newPassword": "NewSecurePass123!"
}
```

### Protected Endpoints (Authentication Required)

#### GET /api/auth/profile
Get current user profile
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/auth/profile
```

#### POST /api/auth/change-password
Change user password
```json
{
  "currentPassword": "CurrentPass123!",
  "newPassword": "NewPass123!"
}
```

#### POST /api/auth/logout
Logout and invalidate tokens
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/auth/logout
```

### Admin Endpoints (Role-Based Access)

#### POST /api/auth/admin/create-faculty-admin
Create Faculty Admin (Admin+ only)
```json
{
  "email": "fadmin@university.edu",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "FACULTY_ADMIN",
  "institutionId": 1,
  "facultyId": 2
}
```

#### POST /api/auth/admin/create-exam-officer
Create Exam Officer (Faculty Admin+ only)
```json
{
  "email": "eofficer@university.edu",
  "password": "SecurePass123!",
  "firstName": "Mike",
  "lastName": "Johnson",
  "role": "EXAMS_OFFICER",
  "institutionId": 1,
  "facultyId": 2,
  "departmentId": 3
}
```

#### GET /api/auth/roles
Get available roles and descriptions (Admin+ only)

#### GET /api/auth/my-permissions
Get current user's permissions

---

## 💡 Usage Examples

### 1. Student Registration and Login

```typescript
// Register as student
const studentData = {
  email: "student@university.edu",
  password: "SecurePass123!",
  firstName: "Alice",
  lastName: "Student",
  role: "STUDENT",
  institutionId: 1,
  facultyId: 2,
  studentId: "STU2024001"
};

const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(studentData)
});

// Login
const loginData = {
  email: "student@university.edu",
  password: "SecurePass123!",
  institutionId: 1
};

const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(loginData)
});

const { token, refreshToken, user } = await loginResponse.json();
```

### 2. Faculty Admin Creating Exam Officer

```typescript
// Faculty Admin creating an Exam Officer
const examOfficerData = {
  email: "eofficer@university.edu",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Officer",
  role: "EXAMS_OFFICER",
  institutionId: 1,
  facultyId: 2,
  departmentId: 3
};

const response = await fetch('/api/auth/admin/create-exam-officer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${facultyAdminToken}`
  },
  body: JSON.stringify(examOfficerData)
});
```

### 3. Role Permission Check

```typescript
// Check if user can create exams
const userPermissions = user.permissions;
if (userPermissions.canCreateExams) {
  // Show exam creation UI
  console.log("User can create exams");
} else {
  // Hide exam creation features
  console.log("User cannot create exams");
}

// Check hierarchical access
if (user.role === 'FACULTY_ADMIN') {
  // Can manage EXAMS_OFFICER, SCRIPT_HANDLER, INVIGILATOR, LECTURER, STUDENT
  console.log("Can manage faculty users");
}
```

### 4. Scope-Based Access

```typescript
// Check if user can access specific faculty data
const requestedFacultyId = 2;
const userFacultyId = user.facultyId;

if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
  // Can access any faculty
  allowAccess = true;
} else if (userFacultyId === requestedFacultyId) {
  // Can access own faculty
  allowAccess = true;
} else {
  // Access denied
  allowAccess = false;
}
```

---

## 🛡️ Security Features

### Password Security
- **Minimum Length**: 8 characters
- **Complexity Requirements**: Uppercase, lowercase, number, and special character
- **Hashing**: bcrypt with 12 salt rounds
- **Reset Tokens**: Secure, time-limited password reset

### Token Security
- **JWT Algorithm**: HS256 with secure secret
- **Token Expiration**: Short-lived access tokens with refresh mechanism
- **Secure Headers**: HTTP-only cookies for sensitive tokens
- **Token Validation**: Comprehensive token verification

### Access Control
- **Role-Based Access**: Hierarchical role system
- **Permission-Based**: Granular permission checking
- **Scope-Based**: Institution/Faculty/Department level restrictions
- **Resource Ownership**: Users can only access their own resources

### Audit & Monitoring
- **Activity Logging**: All user actions logged
- **Security Events**: Failed login attempts, permission violations
- **Session Tracking**: Multi-device session management
- **Anomaly Detection**: Unusual access pattern alerts

### Input Validation
- **Server-Side Validation**: express-validator for all inputs
- **SQL Injection Prevention**: Prisma ORM parameterized queries
- **XSS Protection**: Input sanitization and output encoding
- **CSRF Protection**: Token-based CSRF prevention

---

## 📚 Best Practices

### For Developers
1. **Always check permissions** before performing actions
2. **Use appropriate middleware** for route protection
3. **Validate all inputs** on both client and server
4. **Handle errors gracefully** with meaningful messages
5. **Log security events** for monitoring

### For Administrators
1. **Follow principle of least privilege** when assigning roles
2. **Regularly review user permissions** and access logs
3. **Use strong passwords** and enable 2FA when available
4. **Monitor for suspicious activities** in audit logs
5. **Keep user accounts updated** and remove unused accounts

### For Users
1. **Use strong, unique passwords** for your account
2. **Log out properly** when finished with session
3. **Report suspicious activities** to administrators
4. **Keep personal information updated** in your profile
5. **Follow security guidelines** provided by your institution

---

## 🔧 Configuration

### Environment Variables
```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/elms

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Run migrations (production)
npm run db:migrate
```

---

This authentication system provides a robust foundation for the ELMS application with comprehensive role-based access control, security features, and scalable architecture designed specifically for examination logistics management.
