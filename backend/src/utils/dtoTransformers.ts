// ========================================
// DTO TRANSFORMATION UTILITIES
// Transform Prisma models to frontend DTOs
// ========================================

import { User as PrismaUser, RoleProfile as PrismaRoleProfile, UserRole } from '@prisma/client';
import {
  StudentProfileResponse,
  StudentListItemDTO,
  StudentMetadata,
  LecturerMetadata,
  RolePermissions,
  InstructorProfileResponse,
  InstructorListItemDTO,
  UserWithRolesDTO,
  UserListItemDTO,
} from '../types';

// ========================================
// ROLE PROFILE TRANSFORMERS
// ========================================

/**
 * Transform Prisma RoleProfile to StudentProfileResponse DTO
 */
export function transformToStudentDTO(
  profile: PrismaRoleProfile & {
    user: PrismaUser & {
      institution?: { id: number; name: string; code: string } | null;
      faculty?: { id: number; name: string; code: string } | null;
      department?: { id: number; name: string; code: string } | null;
      program?: {
        id: number;
        name: string;
        code: string;
        level: string;
        type: string;
        duration: number;
        department: {
          id: number;
          name: string;
          code: string;
          faculty: {
            id: number;
            name: string;
            code: string;
            institution: { id: number; name: string; code: string };
          };
        };
      } | null;
    };
  }
): StudentProfileResponse {
  const metadata = profile.metadata as unknown as StudentMetadata;
  const permissions = profile.permissions as RolePermissions;

  return {
    userId: profile.userId,
    role: 'STUDENT',
    metadata,
    permissions,
    isActive: profile.isActive,
    user: {
      id: profile.user.id,
      email: profile.user.email,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      middleName: profile.user.middleName || undefined,
      phone: profile.user.phone || undefined,
      dateOfBirth: profile.user.dateOfBirth || undefined,
      gender: profile.user.gender || undefined,
      nationality: profile.user.nationality || undefined,
      address: profile.user.address || undefined,
      status: profile.user.status,
      createdAt: profile.user.createdAt,
      updatedAt: profile.user.updatedAt || undefined,
    },
    program: profile.user.program || undefined,
  };
}

/**
 * Transform Prisma RoleProfile to StudentListItemDTO
 */
export function transformToStudentListItem(
  profile: PrismaRoleProfile & {
    user: PrismaUser & {
      program?: { name: string; code: string; department?: { name: string } } | null;
    };
  }
): StudentListItemDTO {
  const metadata = profile.metadata as unknown as StudentMetadata;

  return {
    userId: profile.userId,
    studentId: metadata.studentId,
    indexNumber: metadata.indexNumber,
    firstName: profile.user.firstName,
    lastName: profile.user.lastName,
    middleName: profile.user.middleName || undefined,
    email: profile.user.email,
    phone: profile.user.phone || undefined,
    level: metadata.level,
    semester: metadata.semester,
    enrollmentStatus: metadata.enrollmentStatus,
    academicStatus: metadata.academicStatus,
    programName: profile.user.program?.name,
    programCode: profile.user.program?.code,
    departmentName: profile.user.program?.department?.name,
    isActive: profile.isActive,
  };
}

/**
 * Transform Prisma RoleProfile to InstructorProfileResponse DTO
 */
export function transformToInstructorDTO(
  profile: PrismaRoleProfile & {
    user: PrismaUser & {
      lecturerDepartments?: Array<{
        id: number;
        departmentId: number;
        isPrimary: boolean;
        department: {
          id: number;
          name: string;
          code: string;
          faculty: {
            id: number;
            name: string;
            code: string;
            institution: { id: number; name: string; code: string };
          };
        };
      }>;
      department?: {
        id: number;
        name: string;
        code: string;
        faculty: {
          id: number;
          name: string;
          code: string;
          institution: { id: number; name: string; code: string };
        };
      } | null;
    };
  }
): InstructorProfileResponse {
  const metadata = profile.metadata as unknown as LecturerMetadata;
  const permissions = profile.permissions as RolePermissions;

  return {
    userId: profile.userId,
    role: 'LECTURER',
    metadata,
    permissions,
    isActive: profile.isActive,
    user: {
      id: profile.user.id,
      email: profile.user.email,
      firstName: profile.user.firstName,
      lastName: profile.user.lastName,
      middleName: profile.user.middleName || undefined,
      title: profile.user.title || undefined,
      phone: profile.user.phone || undefined,
      dateOfBirth: profile.user.dateOfBirth || undefined,
      gender: profile.user.gender || undefined,
      nationality: profile.user.nationality || undefined,
      address: profile.user.address || undefined,
      status: profile.user.status,
      createdAt: profile.user.createdAt,
      updatedAt: profile.user.updatedAt || undefined,
    },
    departments: profile.user.lecturerDepartments || [],
  };
}

/**
 * Transform Prisma RoleProfile to InstructorListItemDTO
 */
export function transformToInstructorListItem(
  profile: PrismaRoleProfile & {
    user: PrismaUser & {
      lecturerDepartments?: Array<{
        department: { name: string };
      }>;
      department?: { name: string } | null;
    };
  }
): InstructorListItemDTO {
  const metadata = profile.metadata as unknown as LecturerMetadata;

  // Get department names from lecturerDepartments relation, fallback to direct department
  let departmentNames: string[] = [];
  if (profile.user.lecturerDepartments && profile.user.lecturerDepartments.length > 0) {
    departmentNames = profile.user.lecturerDepartments.map((d) => d.department.name);
  } else if (profile.user.department?.name) {
    departmentNames = [profile.user.department.name];
  }

  return {
    userId: profile.userId,
    staffId: metadata.staffId,
    firstName: profile.user.firstName,
    lastName: profile.user.lastName,
    middleName: profile.user.middleName || undefined,
    title: profile.user.title || undefined,
    email: profile.user.email,
    phone: profile.user.phone || undefined,
    academicRank: metadata.academicRank,
    employmentType: metadata.employmentType,
    employmentStatus: metadata.employmentStatus,
    specialization: metadata.specialization,
    departmentNames,
    isActive: profile.isActive,
  };
}

/**
 * Transform Prisma User with RoleProfiles to UserWithRolesDTO
 */
export function transformToUserWithRolesDTO(
  user: PrismaUser & {
    roleProfiles: PrismaRoleProfile[];
    institution?: { id: number; name: string; code: string } | null;
    faculty?: { id: number; name: string; code: string } | null;
    department?: { id: number; name: string; code: string } | null;
  }
): UserWithRolesDTO {
  const primaryProfile = user.roleProfiles.find((rp) => rp.isPrimary && rp.isActive);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName || undefined,
    title: user.title || undefined,
    phone: user.phone || undefined,
    dateOfBirth: user.dateOfBirth || undefined,
    gender: user.gender || undefined,
    nationality: user.nationality || undefined,
    address: user.address || undefined,
    status: user.status,
    primaryRole: (primaryProfile?.role || UserRole.STUDENT) as UserRole,
    institutionId: user.institutionId || undefined,
    facultyId: user.facultyId || undefined,
    departmentId: user.departmentId || undefined,
    emailVerified: user.emailVerified,
    twoFactorEnabled: user.twoFactorEnabled,
    lastLogin: user.lastLogin || undefined,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    institution: user.institution || undefined,
    faculty: user.faculty || undefined,
    department: user.department || undefined,
    roles: user.roleProfiles
      .filter((rp) => rp.isActive)
      .map((rp) => ({
        role: rp.role as UserRole,
        isActive: rp.isActive,
        isPrimary: rp.isPrimary,
        permissions: rp.permissions as RolePermissions,
        metadata: rp.metadata as any,
      })),
  };
}

/**
 * Transform Prisma User to UserListItemDTO
 */
export function transformToUserListItem(
  user: PrismaUser & {
    roleProfiles: PrismaRoleProfile[];
    institution?: { name: string } | null;
    faculty?: { name: string } | null;
    department?: { name: string } | null;
  }
): UserListItemDTO {
  const primaryProfile = user.roleProfiles.find((rp) => rp.isPrimary && rp.isActive);
  const activeRoles = user.roleProfiles
    .filter((rp) => rp.isActive)
    .map((rp) => rp.role as UserRole);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName || undefined,
    status: user.status,
    primaryRole: (primaryProfile?.role || UserRole.STUDENT) as UserRole,
    roles: activeRoles,
    institutionName: user.institution?.name,
    facultyName: user.faculty?.name,
    departmentName: user.department?.name,
    lastLogin: user.lastLogin || undefined,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

// ========================================
// METADATA EXTRACTORS
// ========================================

/**
 * Safely extract StudentMetadata from RoleProfile
 */
export function extractStudentMetadata(profile: PrismaRoleProfile): StudentMetadata {
  const metadata = profile.metadata as any;

  return {
    studentId: metadata.studentId || '',
    indexNumber: metadata.indexNumber,
    level: metadata.level || 1,
    semester: metadata.semester || 1,
    programId: metadata.programId,
    academicYear: metadata.academicYear,
    admissionDate: metadata.admissionDate,
    expectedGraduation: metadata.expectedGraduation,
    enrollmentStatus: metadata.enrollmentStatus || 'ACTIVE',
    academicStatus: metadata.academicStatus || 'GOOD_STANDING',
    guardianName: metadata.guardianName,
    guardianPhone: metadata.guardianPhone,
    guardianEmail: metadata.guardianEmail,
    emergencyContact: metadata.emergencyContact,
  };
}

/**
 * Safely extract LecturerMetadata from RoleProfile
 */
export function extractLecturerMetadata(profile: PrismaRoleProfile): LecturerMetadata {
  const metadata = profile.metadata as any;

  return {
    staffId: metadata.staffId || '',
    academicRank: metadata.academicRank,
    employmentType: metadata.employmentType || 'FULL_TIME',
    employmentStatus: metadata.employmentStatus || 'ACTIVE',
    hireDate: metadata.hireDate,
    highestQualification: metadata.highestQualification,
    specialization: metadata.specialization,
    researchInterests: metadata.researchInterests,
    officeLocation: metadata.officeLocation,
    officeHours: metadata.officeHours,
    biography: metadata.biography,
    profileImageUrl: metadata.profileImageUrl,
  };
}

/**
 * Safely extract permissions from RoleProfile
 */
export function extractPermissions(profile: PrismaRoleProfile): RolePermissions {
  return (profile.permissions as RolePermissions) || {};
}

// ========================================
// BATCH TRANSFORMERS
// ========================================

/**
 * Transform array of student profiles to list items
 */
export function transformStudentsToListItems(
  profiles: Array<
    PrismaRoleProfile & {
      user: PrismaUser & {
        program?: { name: string; code: string } | null;
      };
    }
  >
): StudentListItemDTO[] {
  return profiles.map(transformToStudentListItem);
}

/**
 * Transform array of instructor profiles to list items
 */
export function transformInstructorsToListItems(
  profiles: Array<
    PrismaRoleProfile & {
      user: PrismaUser & {
        lecturerDepartments?: Array<{
          department: { name: string };
        }>;
        department?: { name: string } | null;
      };
    }
  >
): InstructorListItemDTO[] {
  return profiles.map(transformToInstructorListItem);
}

/**
 * Transform array of users to list items
 */
export function transformUsersToListItems(
  users: Array<
    PrismaUser & {
      roleProfiles: PrismaRoleProfile[];
      institution?: { name: string } | null;
      faculty?: { name: string } | null;
      department?: { name: string } | null;
    }
  >
): UserListItemDTO[] {
  return users.map(transformToUserListItem);
}
