# Phase 2: Type Definitions & DTO Implementation - COMPLETE ✅

## Overview
Successfully updated all core type definitions to work with the refactored RoleProfile schema and implemented a comprehensive DTO (Data Transfer Object) system for clean frontend communication.

## Files Created/Updated

### 1. **NEW: `backend/src/types/roleProfile.ts`** ✨
**Purpose**: Comprehensive type definitions for RoleProfile system

**Key Exports**:
- **Metadata Interfaces**: `StudentMetadata`, `LecturerMetadata`, `AdminMetadata`, `ExamOfficerMetadata`, `ScriptHandlerMetadata`, `InvigilatorMetadata`
- **Permission Interfaces**: `ResourcePermissions`, `RolePermissions` (flexible JSON structure)
- **Profile DTOs**: `RoleProfileDTO`, `RoleProfileWithUserDTO`
- **CRUD DTOs**: `CreateRoleProfileRequest`, `UpdateRoleProfileRequest`
- **Specialized DTOs**:
  - `StudentProfileDTO` - Student-specific profile with program info
  - `LecturerProfileDTO` - Lecturer-specific profile with department assignments
  - `MultiRoleUserDTO` - Users with multiple active roles
- **Permission Management**: `PermissionCheckRequest`, `PermissionCheckResponse`
- **Query/Stats**: `RoleProfileQueryParams`, `RoleProfileStatsDTO`

**Key Features**:
- Type-safe metadata structures for each role
- Flexible permission system (resource → actions mapping)
- Support for multi-role users
- Frontend-friendly DTOs (no sensitive data, clean structure)

---

### 2. **UPDATED: `backend/src/types/auth.ts`** 🔄
**Changes**:
- ✅ Removed hardcoded `RolePermissions` interface with boolean fields
- ✅ Now imports `RolePermissions` from `roleProfile.ts` (flexible JSON)
- ✅ Updated `AuthResponse` to include multi-role support:
  ```typescript
  {
    token: string;
    user: { ...userInfo };
    primaryRole: UserRole;
    roles: Array<{ role, permissions, metadata, isActive, isPrimary }>;
    permissions: RolePermissions; // Primary role permissions
  }
  ```
- ✅ Updated `JwtPayload` for multi-role JWT:
  ```typescript
  {
    userId: number;
    email: string;
    primaryRole: UserRole;
    roles: UserRole[]; // All active roles
    permissions: RolePermissions;
  }
  ```
- ✅ Updated `RegisterRequest` to support role metadata:
  ```typescript
  {
    email, password, firstName, lastName, ...;
    role?: UserRole;
    metadata?: Partial<RoleMetadata>; // Role-specific data
    studentId?, staffId? // Convenience fields
  }
  ```
- ✅ Added `UserDTO` interface for clean user responses
- ✅ Added password management DTOs
- ✅ Added token refresh DTOs

**Backward Compatibility**: Maintained `id` field in JWT payload (same as `userId`)

---

### 3. **UPDATED: `backend/src/types/student.ts`** 🔄
**Changes**:
- ✅ Now uses `StudentMetadata` and `RolePermissions` from `roleProfile.ts`
- ✅ Updated `StudentProfileResponse`:
  ```typescript
  {
    userId: number;
    role: 'STUDENT';
    metadata: StudentMetadata; // All student fields in JSON
    permissions: RolePermissions;
    isActive: boolean;
    user: { ...userInfo };
    program?: { ...programInfo };
  }
  ```
- ✅ Updated `CreateStudentData`:
  ```typescript
  {
    user: { email, password, firstName, ... };
    profile: { studentId, level, semester, ... }; // Becomes metadata
    permissions?: Partial<RolePermissions>;
  }
  ```
- ✅ Updated `UpdateStudentData` for metadata updates
- ✅ Added `StudentListItemDTO` for list views (flattened structure)
- ✅ Added `StudentStatsDTO` for analytics
- ✅ Added `StudentEnrollmentDTO` and `StudentAcademicRecord`

**Key Migration**: `studentId`, `level`, `semester`, etc. are now in `metadata` JSON, not columns

---

### 4. **UPDATED: `backend/src/types/instructor.ts`** 🔄
**Changes**:
- ✅ Now uses `LecturerMetadata` and `RolePermissions` from `roleProfile.ts`
- ✅ Updated `InstructorProfileResponse`:
  ```typescript
  {
    userId: number;
    role: 'LECTURER';
    metadata: LecturerMetadata; // staffId, academicRank, etc. in JSON
    permissions: RolePermissions;
    isActive: boolean;
    user: { ...userInfo };
    departments: [ ...departmentAssignments ];
  }
  ```
- ✅ Updated `CreateInstructorData`:
  ```typescript
  {
    user: { email, password, firstName, ... };
    profile: { staffId, academicRank, employmentType, ... }; // Becomes metadata
    departments?: [ { departmentId, isPrimary } ];
    permissions?: Partial<RolePermissions>;
  }
  ```
- ✅ Updated `UpdateInstructorData` for metadata updates
- ✅ Added `InstructorListItemDTO` for list views
- ✅ Added `InstructorStatsDTO` for analytics
- ✅ Added `InstructorCourseAssignmentDTO` and `InstructorWorkloadDTO`
- ✅ Added `DepartmentAssignmentDTO` for department management

**Key Migration**: `staffId`, `academicRank`, `employmentType`, etc. are now in `metadata` JSON

---

### 5. **UPDATED: `backend/src/types/user.ts`** 🔄
**Changes**:
- ✅ Changed `role: UserRole` → `primaryRole: UserRole`
- ✅ Added `UserWithRolesDTO`:
  ```typescript
  {
    ...User fields;
    roles: Array<{
      role: UserRole;
      isActive: boolean;
      isPrimary: boolean;
      permissions: RolePermissions;
      metadata: RoleMetadata;
    }>;
  }
  ```
- ✅ Updated `CreateUserRequest`:
  ```typescript
  {
    email, password, firstName, ...;
    role: UserRole; // Primary role
    roleMetadata: RoleMetadata; // Role-specific data
    rolePermissions?: Partial<RolePermissions>;
  }
  ```
- ✅ Updated `UpdateUserRequest` (removed `role` field - roles managed separately)
- ✅ Added `UserListItemDTO` for list views with multi-role support

**Key Migration**: Users now have a primary role + optional additional roles

---

### 6. **NEW: `backend/src/utils/dtoTransformers.ts`** ✨
**Purpose**: Transform Prisma models to frontend DTOs

**Key Functions**:
1. **Student Transformers**:
   - `transformToStudentDTO(profile)` → `StudentProfileResponse`
   - `transformToStudentListItem(profile)` → `StudentListItemDTO`
   - `transformStudentsToListItems(profiles)` → Batch transform

2. **Instructor Transformers**:
   - `transformToInstructorDTO(profile)` → `InstructorProfileResponse`
   - `transformToInstructorListItem(profile)` → `InstructorListItemDTO`
   - `transformInstructorsToListItems(profiles)` → Batch transform

3. **User Transformers**:
   - `transformToUserWithRolesDTO(user)` → `UserWithRolesDTO`
   - `transformToUserListItem(user)` → `UserListItemDTO`
   - `transformUsersToListItems(users)` → Batch transform

4. **Metadata Extractors** (Type-safe):
   - `extractStudentMetadata(profile)` → Type-safe `StudentMetadata`
   - `extractLecturerMetadata(profile)` → Type-safe `LecturerMetadata`
   - `extractPermissions(profile)` → Type-safe `RolePermissions`

**Usage Example**:
```typescript
// In service layer
const profile = await getRoleProfile(userId, 'STUDENT', prisma);
const studentDTO = transformToStudentDTO(profile);
return studentDTO; // Send to frontend
```

---

## Type System Architecture

### Data Flow
```
DATABASE (Prisma)          SERVICE LAYER              FRONTEND
─────────────────          ─────────────              ────────
RoleProfile                → Transform →              StudentProfileDTO
├─ userId                                            ├─ userId
├─ role: STUDENT                                     ├─ role: STUDENT
├─ metadata: JSON          → Extract →               ├─ metadata: StudentMetadata
│  └─ { studentId,                                   │  ├─ studentId: string
│      level,                                        │  ├─ level: number
│      semester, ... }                               │  └─ semester: number
├─ permissions: JSON       → Extract →               ├─ permissions: RolePermissions
└─ isActive                                          └─ isActive: boolean
```

### Permission Structure (NEW - Flexible)
```typescript
// OLD (Hardcoded booleans)
interface RolePermissions {
  canCreateExam: boolean;
  canGradeScript: boolean;
  canViewAnalytics: boolean;
  // ... 30+ hardcoded fields
}

// NEW (Flexible resource-action mapping)
interface RolePermissions {
  exams?: {
    create?: boolean;
    read?: boolean;
    update?: boolean;
    delete?: boolean;
    schedule?: boolean;
  };
  scripts?: {
    grade?: boolean;
    view?: boolean;
    submit?: boolean;
  };
  analytics?: {
    view?: boolean;
    report?: boolean;
  };
  [resource: string]: ResourcePermissions | undefined;
}
```

---

## Migration Path for Services

### Example: Student Service Update
```typescript
// ❌ OLD WAY (Direct Prisma access)
const student = await prisma.studentProfile.findUnique({
  where: { userId },
  include: { user: true, program: true }
});

return {
  id: student.id,
  userId: student.userId,
  studentId: student.studentId,
  level: student.level,
  // ... map all fields manually
};

// ✅ NEW WAY (Using helper + transformer)
import { getRoleProfile } from '../utils/profileHelpers';
import { transformToStudentDTO } from '../utils/dtoTransformers';

const profile = await getRoleProfile(userId, 'STUDENT', prisma);
return transformToStudentDTO(profile); // Clean DTO
```

---

## Key Benefits

### 1. **Type Safety** ✅
- All metadata is strongly typed
- Compile-time errors for missing fields
- IntelliSense support in IDEs

### 2. **Clean API Responses** ✅
- No sensitive data (passwords, tokens) in DTOs
- Only necessary data sent to frontend
- Consistent response structure

### 3. **Flexibility** ✅
- Easy to add new fields to metadata (just update interface)
- No database migrations for metadata changes
- Support for multi-role users

### 4. **Maintainability** ✅
- Single source of truth for types (`roleProfile.ts`)
- Reusable transformers
- Clear separation: Database ↔ Service ↔ Frontend

### 5. **Backward Compatibility** ✅
- JWT `id` field maintained
- Existing API structure preserved where possible
- Gradual migration path

---

## Next Steps (Phase 3)

### Priority 1: Update Authentication Service
- [ ] Update `authService.ts` to use RoleProfile
- [ ] Modify `login()` to return `AuthResponse` with multi-role data
- [ ] Modify `register()` to create RoleProfile
- [ ] Update JWT generation with new payload structure

### Priority 2: Update Student Service
- [ ] Update `studentService.ts` to use `getRoleProfile()`
- [ ] Replace all `prisma.studentProfile` calls
- [ ] Use `transformToStudentDTO()` for responses
- [ ] Update create/update operations to use `upsertRoleProfile()`

### Priority 3: Update Instructor Service
- [ ] Update `instructorService.ts` (22 references to lecturerProfile)
- [ ] Replace all `prisma.lecturerProfile` calls
- [ ] Use `transformToInstructorDTO()` for responses
- [ ] Update create/update operations

### Priority 4: Update Controllers
- [ ] `qrCodeController.ts` - Update student lookups
- [ ] `studentController.ts` - Use new service methods
- [ ] `instructorController.ts` - Use new service methods
- [ ] All other controllers using old profile tables

### Priority 5: Update Remaining Services
- [ ] `prerequisiteService.ts` - Update student profile access
- [ ] `examService.ts` - Update student/lecturer lookups
- [ ] All services referencing old profile models

---

## Testing Checklist

### Type Compilation ✅
```bash
cd backend
npm run build  # Should compile without errors
```

### Service Testing (After Updates)
- [ ] Test student registration with new RoleProfile
- [ ] Test lecturer creation with metadata
- [ ] Test login with multi-role JWT
- [ ] Test permission checking
- [ ] Test metadata updates

### API Testing
- [ ] Test `/auth/register` endpoint
- [ ] Test `/auth/login` endpoint
- [ ] Test `/students` endpoints
- [ ] Test `/instructors` endpoints
- [ ] Verify DTO structure in responses

---

## Documentation References

### Helper Functions Available
- `getRoleProfile(userId, role, prisma)` - Get active role profile
- `getAllUserProfiles(userId, prisma)` - Get all roles
- `hasPermission(userId, resource, action, prisma)` - Check permission
- `updateProfileMetadata(userId, role, updates, prisma)` - Update metadata
- `upsertRoleProfile(...)` - Create/update profile
- `DEFAULT_PERMISSIONS` - Default permissions by role

### Transformer Functions Available
- `transformToStudentDTO(profile)` - Student profile to DTO
- `transformToInstructorDTO(profile)` - Instructor profile to DTO
- `transformToUserWithRolesDTO(user)` - User with roles to DTO
- `extractStudentMetadata(profile)` - Type-safe metadata extraction
- `extractLecturerMetadata(profile)` - Type-safe metadata extraction

---

## Summary

✅ **Completed**:
1. Created comprehensive RoleProfile type system
2. Updated all core type files (auth, student, instructor, user)
3. Implemented DTO pattern for clean frontend communication
4. Created transformation utilities for model → DTO conversion
5. Maintained backward compatibility where possible

🔄 **In Progress**:
- Ready to update services and controllers

⏳ **Next**:
- Update authService.ts (Foundation)
- Update studentService.ts
- Update instructorService.ts
- Update all controllers

---

**Status**: Phase 2 Complete - Ready for Phase 3 (Service Layer Updates)

**Date**: $(Get-Date)
