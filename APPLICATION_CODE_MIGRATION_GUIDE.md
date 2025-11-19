# 🔄 Application Code Migration Guide - Phase 1

**Status:** Database migrated ✅ | Prisma Client generated ✅
**Next Step:** Update application code to work with new schema

---

## 📋 Overview

Your database has been successfully migrated with Phase 1 refactoring. Now you need to update your application code to use the new schema structure. This guide provides a systematic approach to update all affected code.

---

## 🎯 Quick Action Plan

### Immediate Tasks (Required)
1. ✅ ~~Database migrated~~ - DONE
2. ✅ ~~Prisma Client generated~~ - DONE
3. 🔄 Update profile-related code (services, controllers)
4. 🔄 Update enrollment/registration queries
5. 🔄 Update timetable entry queries (junction tables)
6. 🔄 Update permission checking logic
7. 🔄 Run tests and fix issues
8. 🔄 Update frontend API calls (if needed)

---

## 📂 Files Requiring Updates

Based on code analysis, these files need updates:

### Critical Updates (Breaking Changes)
```
backend/src/services/
├── instructorService.ts          ❗ HIGH PRIORITY (22 references)
├── prerequisiteService.ts        ❗ HIGH PRIORITY
└── authService.ts               ❗ HIGH PRIORITY (if exists)

backend/src/controllers/
├── qrCodeController.ts           ❗ HIGH PRIORITY (2 references)
├── studentController.ts          ❗ MEDIUM
├── lecturerController.ts         ❗ MEDIUM
└── enrollmentController.ts       ❗ MEDIUM

backend/src/types/
└── student.ts                    ℹ️ Update interfaces
```

---

## 🔧 Code Update Patterns

### 1. Profile Access Pattern (CRITICAL)

#### ❌ OLD CODE (Will Break)
```typescript
// Lecturer Profile
const lecturer = await prisma.lecturerProfile.findUnique({
  where: { userId: userId },
  include: { user: true }
});

const staffId = lecturer.staffId;
const academicRank = lecturer.academicRank;

// Student Profile
const student = await prisma.studentProfile.findUnique({
  where: { userId: userId },
  include: { user: true }
});

const indexNumber = student.indexNumber;
const level = student.level;

// Admin Profile
const admin = await prisma.adminProfile.findUnique({
  where: { userId: userId }
});

if (admin.canManageFaculties) {
  // Do something
}
```

#### ✅ NEW CODE (Phase 1)
```typescript
// Get any role profile
const profile = await prisma.roleProfile.findFirst({
  where: {
    userId: userId,
    role: 'LECTURER', // or 'STUDENT', 'ADMIN', etc.
    isActive: true
  },
  include: { user: true }
});

if (!profile) {
  throw new Error('Profile not found');
}

// Access role-specific data from metadata
const metadata = profile.metadata as any;
const staffId = metadata.staffId;
const academicRank = metadata.academicRank;
const indexNumber = metadata.indexNumber;
const level = metadata.level;

// Check permissions
const permissions = profile.permissions as any;
if (permissions.faculties?.manage) {
  // Do something
}

// Helper function (recommended)
async function getRoleProfile(
  userId: number,
  role: UserRole,
  tx: PrismaClient | PrismaTransaction = prisma
) {
  const profile = await tx.roleProfile.findFirst({
    where: { userId, role, isActive: true },
    include: { user: true }
  });

  if (!profile) {
    throw new Error(`${role} profile not found for user ${userId}`);
  }

  return profile;
}
```

---

### 2. Create Profile Pattern

#### ❌ OLD CODE
```typescript
// Create lecturer
await prisma.lecturerProfile.create({
  data: {
    userId: user.id,
    staffId: "STF001",
    academicRank: "LECTURER",
    employmentType: "FULL_TIME",
    permissions: {},
    canCreateExams: true,
    canGradeScripts: true
  }
});

// Create student
await prisma.studentProfile.create({
  data: {
    userId: user.id,
    studentId: "STD001",
    indexNumber: "0721000001",
    level: 100,
    semester: 1,
    programId: 5
  }
});
```

#### ✅ NEW CODE
```typescript
// Create lecturer profile
await prisma.roleProfile.create({
  data: {
    userId: user.id,
    role: 'LECTURER',
    isPrimary: true,
    isActive: true,
    permissions: {
      exams: { create: true, grade: true },
      scripts: { grade: true },
      courses: { teach: true }
    },
    metadata: {
      staffId: "STF001",
      academicRank: "LECTURER",
      employmentType: "FULL_TIME",
      employmentStatus: "ACTIVE",
      hireDate: new Date(),
      officeLocation: "Room 101"
    }
  }
});

// Create student profile
await prisma.roleProfile.create({
  data: {
    userId: user.id,
    role: 'STUDENT',
    isPrimary: true,
    isActive: true,
    permissions: {
      courses: { view: true, register: true },
      exams: { view: true, take: true }
    },
    metadata: {
      studentId: "STD001",
      indexNumber: "0721000001",
      level: 100,
      semester: 1,
      programId: 5,
      academicYear: "2024/2025",
      enrollmentStatus: "ACTIVE",
      academicStatus: "GOOD_STANDING"
    }
  }
});
```

---

### 3. Update Profile Pattern

#### ❌ OLD CODE
```typescript
await prisma.lecturerProfile.update({
  where: { userId: userId },
  data: {
    academicRank: "SENIOR_LECTURER",
    officeLocation: "Room 203"
  }
});
```

#### ✅ NEW CODE
```typescript
const profile = await prisma.roleProfile.findFirst({
  where: { userId, role: 'LECTURER', isActive: true }
});

if (profile) {
  const currentMetadata = profile.metadata as any;

  await prisma.roleProfile.update({
    where: { id: profile.id },
    data: {
      metadata: {
        ...currentMetadata,
        academicRank: "SENIOR_LECTURER",
        officeLocation: "Room 203"
      }
    }
  });
}
```

---

### 4. Enrollment Queries (CRITICAL)

#### ❌ OLD CODE
```typescript
// Old Enrollment
const enrollment = await prisma.enrollment.findFirst({
  where: {
    studentId: studentId,
    courseOfferingId: courseOfferingId
  }
});

// Old Registration
const registration = await prisma.courseRegistration.findFirst({
  where: { studentId, semesterId }
});

const items = await prisma.courseRegistrationItem.findMany({
  where: { registrationId: registration.id }
});
```

#### ✅ NEW CODE
```typescript
// New unified CourseEnrollment
const enrollment = await prisma.courseEnrollment.findFirst({
  where: {
    studentId: studentId,
    courseOfferingId: courseOfferingId
  },
  include: {
    courseOffering: {
      include: { course: true }
    },
    advisor: true,
    approver: true,
    semester: true
  }
});

// Get all enrollments for a semester
const enrollments = await prisma.courseEnrollment.findMany({
  where: {
    studentId: studentId,
    semesterId: semesterId,
    status: 'ACTIVE'
  },
  include: {
    courseOffering: {
      include: { course: true }
    }
  }
});

// Check approval status
if (enrollment.advisorApprovedAt && enrollment.approverApprovedAt) {
  // Fully approved
}

// Note: CourseRegistration still exists for semester-level tracking
// Use it for overall registration status, totalCredits, etc.
const registration = await prisma.courseRegistration.findFirst({
  where: { studentId, semesterId }
});
```

---

### 5. Timetable Entry with Junction Tables (CRITICAL)

#### ❌ OLD CODE
```typescript
// Create timetable entry with string arrays
const entry = await prisma.examTimetableEntry.create({
  data: {
    timetableId: timetableId,
    courseId: courseId,
    programIds: "1,2,5,8",  // ❌ Won't work anymore
    roomIds: "3,7,12",      // ❌ Won't work anymore
    invigilatorIds: "101,102,103", // ❌ Won't work anymore
    // ... other fields
  }
});

// Read programs
const programIds = entry.programIds.split(',').map(Number);
```

#### ✅ NEW CODE
```typescript
// Create timetable entry with junction tables
const entry = await prisma.examTimetableEntry.create({
  data: {
    timetableId: timetableId,
    courseId: courseId,
    venueId: venueId,
    examDate: examDate,
    startTime: startTime,
    endTime: endTime,
    duration: duration,
    status: 'DRAFT',
    // Create related programs
    programs: {
      create: [
        { programId: 1 },
        { programId: 2 },
        { programId: 5 },
        { programId: 8 }
      ]
    },
    // Create related rooms
    rooms: {
      create: [
        { roomId: 3, capacity: 50 },
        { roomId: 7, capacity: 40 },
        { roomId: 12, capacity: 60 }
      ]
    },
    // Create invigilator assignments
    invigilators: {
      create: [
        { invigilatorId: 101, role: 'CHIEF_INVIGILATOR' },
        { invigilatorId: 102, role: 'INVIGILATOR' },
        { invigilatorId: 103, role: 'INVIGILATOR' }
      ]
    }
  }
});

// Query with programs, rooms, and invigilators
const entryWithRelations = await prisma.examTimetableEntry.findUnique({
  where: { id: entryId },
  include: {
    programs: {
      include: { program: true }
    },
    rooms: {
      include: { room: true }
    },
    invigilators: {
      include: { invigilator: true }
    },
    course: true,
    venue: true
  }
});

// Access the data
const programs = entryWithRelations.programs.map(p => p.program);
const rooms = entryWithRelations.rooms.map(r => r.room);
const invigilators = entryWithRelations.invigilators.map(i => ({
  ...i.invigilator,
  role: i.role,
  assignedAt: i.assignedAt
}));

// Calculate total capacity
const totalCapacity = entryWithRelations.rooms.reduce(
  (sum, r) => sum + (r.capacity || r.room.capacity),
  0
);
```

---

### 6. Permission Checking (CRITICAL)

#### ❌ OLD CODE
```typescript
const admin = await prisma.adminProfile.findUnique({
  where: { userId }
});

if (admin?.canManageFaculties) {
  // Allow action
}

const lecturer = await prisma.lecturerProfile.findUnique({
  where: { userId }
});

if (lecturer?.canCreateExams && lecturer?.canGradeScripts) {
  // Allow action
}
```

#### ✅ NEW CODE
```typescript
// Helper function for permission checking
async function hasPermission(
  userId: number,
  resource: string,
  action: string
): Promise<boolean> {
  const profiles = await prisma.roleProfile.findMany({
    where: { userId, isActive: true }
  });

  for (const profile of profiles) {
    const permissions = profile.permissions as any;
    if (permissions[resource]?.[action] === true) {
      return true;
    }
  }

  return false;
}

// Usage
if (await hasPermission(userId, 'faculties', 'manage')) {
  // Allow action
}

if (await hasPermission(userId, 'exams', 'create') &&
    await hasPermission(userId, 'scripts', 'grade')) {
  // Allow action
}

// Or get all profiles and check
const profiles = await prisma.roleProfile.findMany({
  where: { userId, isActive: true }
});

const canManageFaculties = profiles.some(p => {
  const perms = p.permissions as any;
  return perms.faculties?.manage === true;
});
```

---

### 7. Multi-Role User Support (NEW FEATURE)

```typescript
// Create a user with multiple roles (now possible!)
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({
    data: {
      email: "john.doe@university.edu",
      firstName: "John",
      lastName: "Doe",
      role: "LECTURER", // Primary role
      // ... other fields
    }
  });

  // Lecturer profile (primary)
  await tx.roleProfile.create({
    data: {
      userId: user.id,
      role: 'LECTURER',
      isPrimary: true,
      isActive: true,
      permissions: { /* lecturer permissions */ },
      metadata: { /* lecturer data */ }
    }
  });

  // Exam Officer role (secondary)
  await tx.roleProfile.create({
    data: {
      userId: user.id,
      role: 'EXAMS_OFFICER',
      isPrimary: false,
      isActive: true,
      permissions: { /* exam officer permissions */ },
      metadata: { /* exam officer data */ }
    }
  });

  return user;
});

// Get all roles for a user
const userRoles = await prisma.roleProfile.findMany({
  where: { userId, isActive: true },
  include: { user: true }
});

console.log(`User has ${userRoles.length} active roles`);
```

---

## 🛠️ Utility Functions (Recommended)

Create these helper functions to simplify your code:

```typescript
// utils/profileHelpers.ts

import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface RoleMetadata {
  // Student fields
  studentId?: string;
  indexNumber?: string;
  level?: number;
  semester?: number;
  programId?: number;
  academicYear?: string;

  // Lecturer fields
  staffId?: string;
  academicRank?: string;
  employmentType?: string;
  employmentStatus?: string;
  officeLocation?: string;

  // Add other role-specific fields as needed
  [key: string]: any;
}

export interface RolePermissions {
  [resource: string]: {
    [action: string]: boolean;
  };
}

/**
 * Get active profile for a user and role
 */
export async function getRoleProfile(
  userId: number,
  role: UserRole,
  tx: any = prisma
) {
  const profile = await tx.roleProfile.findFirst({
    where: { userId, role, isActive: true },
    include: { user: true }
  });

  if (!profile) {
    throw new Error(`${role} profile not found for user ${userId}`);
  }

  return {
    ...profile,
    metadata: profile.metadata as RoleMetadata,
    permissions: profile.permissions as RolePermissions
  };
}

/**
 * Get all active profiles for a user
 */
export async function getAllUserProfiles(userId: number, tx: any = prisma) {
  return await tx.roleProfile.findMany({
    where: { userId, isActive: true },
    include: { user: true }
  });
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: number,
  resource: string,
  action: string,
  tx: any = prisma
): Promise<boolean> {
  const profiles = await tx.roleProfile.findMany({
    where: { userId, isActive: true },
    select: { permissions: true }
  });

  return profiles.some(profile => {
    const perms = profile.permissions as RolePermissions;
    return perms[resource]?.[action] === true;
  });
}

/**
 * Update profile metadata
 */
export async function updateProfileMetadata(
  userId: number,
  role: UserRole,
  updates: Partial<RoleMetadata>,
  tx: any = prisma
) {
  const profile = await getRoleProfile(userId, role, tx);
  const currentMetadata = profile.metadata;

  return await tx.roleProfile.update({
    where: { id: profile.id },
    data: {
      metadata: {
        ...currentMetadata,
        ...updates
      }
    }
  });
}

/**
 * Create or update profile
 */
export async function upsertRoleProfile(
  userId: number,
  role: UserRole,
  permissions: RolePermissions,
  metadata: RoleMetadata,
  isPrimary: boolean = false,
  tx: any = prisma
) {
  const existing = await tx.roleProfile.findFirst({
    where: { userId, role }
  });

  if (existing) {
    return await tx.roleProfile.update({
      where: { id: existing.id },
      data: {
        permissions,
        metadata,
        isPrimary,
        isActive: true
      }
    });
  }

  return await tx.roleProfile.create({
    data: {
      userId,
      role,
      permissions,
      metadata,
      isPrimary,
      isActive: true
    }
  });
}
```

---

## 📝 Example Service Updates

### instructorService.ts Updates

```typescript
// Before
export async function getInstructor(instructorId: number) {
  return await prisma.lecturerProfile.findUnique({
    where: { id: instructorId },
    include: { user: true }
  });
}

// After
export async function getInstructor(userId: number) {
  return await getRoleProfile(userId, 'LECTURER');
}

// Before
export async function createInstructor(data: CreateInstructorDTO) {
  return await prisma.lecturerProfile.create({
    data: {
      userId: data.userId,
      staffId: data.staffId,
      academicRank: data.academicRank,
      // ... other fields
    }
  });
}

// After
export async function createInstructor(data: CreateInstructorDTO) {
  return await upsertRoleProfile(
    data.userId,
    'LECTURER',
    {
      exams: { create: true, grade: true },
      scripts: { grade: true },
      courses: { teach: true, manage: true }
    },
    {
      staffId: data.staffId,
      academicRank: data.academicRank,
      employmentType: data.employmentType,
      officeLocation: data.officeLocation,
      // ... other metadata
    },
    true // isPrimary
  );
}
```

---

## 🧪 Testing Strategy

### 1. Unit Tests
Update unit tests to use new patterns:

```typescript
describe('Profile Service', () => {
  it('should create lecturer profile', async () => {
    const profile = await upsertRoleProfile(
      userId,
      'LECTURER',
      { exams: { create: true } },
      { staffId: 'TEST001' }
    );

    expect(profile.role).toBe('LECTURER');
    expect(profile.metadata.staffId).toBe('TEST001');
  });

  it('should support multi-role users', async () => {
    await upsertRoleProfile(userId, 'LECTURER', {}, {});
    await upsertRoleProfile(userId, 'EXAMS_OFFICER', {}, {});

    const profiles = await getAllUserProfiles(userId);
    expect(profiles).toHaveLength(2);
  });
});
```

### 2. Integration Tests
Test complete workflows:

```typescript
describe('Enrollment Flow', () => {
  it('should enroll student in course', async () => {
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId,
        courseOfferingId,
        semesterId,
        status: 'ACTIVE',
        itemStatus: 'REGISTERED'
      }
    });

    expect(enrollment.status).toBe('ACTIVE');
  });
});
```

---

## ⚠️ Common Pitfalls & Solutions

### Pitfall 1: Forgetting to check isActive
```typescript
// ❌ Wrong - might get inactive profiles
const profile = await prisma.roleProfile.findFirst({
  where: { userId, role: 'LECTURER' }
});

// ✅ Correct - only active profiles
const profile = await prisma.roleProfile.findFirst({
  where: { userId, role: 'LECTURER', isActive: true }
});
```

### Pitfall 2: Not handling JSON metadata types
```typescript
// ❌ Wrong - TypeScript errors
const staffId = profile.metadata.staffId; // Error

// ✅ Correct - Cast to your interface
const metadata = profile.metadata as RoleMetadata;
const staffId = metadata.staffId;
```

### Pitfall 3: Forgetting to include relations
```typescript
// ❌ Wrong - missing related data
const entry = await prisma.examTimetableEntry.findUnique({
  where: { id }
});
// entry.programs is undefined!

// ✅ Correct - include junction tables
const entry = await prisma.examTimetableEntry.findUnique({
  where: { id },
  include: {
    programs: { include: { program: true } },
    rooms: { include: { room: true } }
  }
});
```

---

## 📊 Progress Tracking

Track your migration progress:

- [ ] Create utility helper functions
- [ ] Update instructorService.ts
- [ ] Update studentService.ts (if exists)
- [ ] Update authService.ts
- [ ] Update qrCodeController.ts
- [ ] Update enrollmentController.ts
- [ ] Update timetable services
- [ ] Update permission middleware
- [ ] Update all unit tests
- [ ] Update integration tests
- [ ] Test in development environment
- [ ] Update frontend API calls
- [ ] Deploy to staging
- [ ] Final production deployment

---

## 🚀 Next Steps

1. **Start with utility functions** - Create the helper functions first
2. **Update services one by one** - Start with most critical (auth, profiles)
3. **Run tests frequently** - Catch issues early
4. **Update gradually** - Don't try to update everything at once
5. **Keep old code commented** - For reference during migration

---

## 📞 Need Help?

If you encounter issues:
1. Check Prisma Client types (autocomplete helps!)
2. Review the patterns in this guide
3. Test queries in Prisma Studio
4. Check database directly if needed

**Your Phase 1 migration is complete! Now it's time to update the application code.** 🎉
