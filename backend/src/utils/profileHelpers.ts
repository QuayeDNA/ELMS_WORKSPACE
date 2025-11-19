// utils/profileHelpers.ts
// Utility functions for working with the new RoleProfile schema

import { PrismaClient, UserRole, Prisma } from '@prisma/client';
import { RolePermissions, ResourcePermissions } from '../types/roleProfile';

// Type for Prisma transaction
type PrismaTransaction = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

// Role-specific metadata interfaces
export interface StudentMetadata {
  studentId: string;
  indexNumber?: string;
  level: number;
  semester: number;
  programId?: number;
  academicYear?: string;
  admissionDate?: Date;
  expectedGraduation?: Date;
  enrollmentStatus?: string;
  academicStatus?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
}

export interface LecturerMetadata {
  staffId: string;
  academicRank?: string;
  employmentType?: string;
  employmentStatus?: string;
  hireDate?: Date;
  highestQualification?: string;
  specialization?: string;
  researchInterests?: string;
  officeLocation?: string;
  officeHours?: string;
  biography?: string;
  profileImageUrl?: string;
}

export interface AdminMetadata {
  [key: string]: any;
}

export type RoleMetadata =
  | StudentMetadata
  | LecturerMetadata
  | AdminMetadata
  | Record<string, any>;

// Default permissions by role (using imported RolePermissions type)
export const DEFAULT_PERMISSIONS: Record<UserRole, RolePermissions> = {
  SUPER_ADMIN: {
    all: { all: true }
  },
  ADMIN: {
    users: { create: true, read: true, update: true, delete: true },
    faculties: { manage: true },
    analytics: { view: true }
  },
  FACULTY_ADMIN: {
    departments: { manage: true },
    exams: { create: true, view: true },
    officers: { manage: true },
    facultyData: { view: true }
  },
  DEAN: {
    faculty: { manage: true },
    departments: { view: true, manage: true },
    programs: { view: true, manage: true }
  },
  HOD: {
    department: { manage: true },
    courses: { manage: true },
    lecturers: { view: true }
  },
  EXAMS_OFFICER: {
    exams: { schedule: true, manage: true },
    incidents: { manage: true },
    invigilators: { assign: true },
    venues: { manage: true }
  },
  SCRIPT_HANDLER: {
    scripts: { receive: true, dispatch: true, scan: true },
    incidents: { report: true }
  },
  INVIGILATOR: {
    exams: { conduct: true },
    incidents: { report: true },
    scripts: { manage: true }
  },
  LECTURER: {
    exams: { create: true, grade: true },
    scripts: { grade: true, view: true },
    results: { view: true, submit: true },
    courses: { teach: true, manage: true }
  },
  STUDENT: {
    courses: { view: true, register: true },
    exams: { view: true, take: true },
    results: { view: true }
  }
};

/**
 * Get active profile for a user and role
 */
export async function getRoleProfile(
  userId: number,
  role: UserRole,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const profile = await prismaClient.roleProfile.findFirst({
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
export async function getAllUserProfiles(
  userId: number,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const profiles = await prismaClient.roleProfile.findMany({
    where: { userId, isActive: true },
    include: { user: true }
  });

  return profiles.map(profile => ({
    ...profile,
    metadata: profile.metadata as RoleMetadata,
    permissions: profile.permissions as RolePermissions
  }));
}

/**
 * Get primary profile for a user
 */
export async function getPrimaryProfile(
  userId: number,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const profile = await prismaClient.roleProfile.findFirst({
    where: { userId, isPrimary: true, isActive: true },
    include: { user: true }
  });

  if (!profile) {
    throw new Error(`Primary profile not found for user ${userId}`);
  }

  return {
    ...profile,
    metadata: profile.metadata as RoleMetadata,
    permissions: profile.permissions as RolePermissions
  };
}

/**
 * Check if user has a specific permission
 */
export async function hasPermission(
  userId: number,
  resource: string,
  action: string,
  prismaClient: PrismaClient | PrismaTransaction
): Promise<boolean> {
  const profiles = await prismaClient.roleProfile.findMany({
    where: { userId, isActive: true },
    select: { permissions: true }
  });

  return profiles.some(profile => {
    const perms = profile.permissions as RolePermissions;
    // Check for specific permission or wildcard
    return (
      perms.all?.all === true ||
      perms[resource]?.all === true ||
      perms[resource]?.[action] === true
    );
  });
}

/**
 * Check if user has any of the specified roles
 */
export async function hasRole(
  userId: number,
  roles: UserRole | UserRole[],
  prismaClient: PrismaClient | PrismaTransaction
): Promise<boolean> {
  const roleArray = Array.isArray(roles) ? roles : [roles];

  const count = await prismaClient.roleProfile.count({
    where: {
      userId,
      role: { in: roleArray },
      isActive: true
    }
  });

  return count > 0;
}

/**
 * Update profile metadata
 */
export async function updateProfileMetadata(
  userId: number,
  role: UserRole,
  updates: Partial<RoleMetadata>,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const profile = await getRoleProfile(userId, role, prismaClient);
  const currentMetadata = profile.metadata as Record<string, any>;

  return await prismaClient.roleProfile.update({
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
 * Update profile permissions
 */
export async function updateProfilePermissions(
  userId: number,
  role: UserRole,
  updates: Partial<RolePermissions>,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const profile = await getRoleProfile(userId, role, prismaClient);
  const currentPermissions = profile.permissions as RolePermissions;

  return await prismaClient.roleProfile.update({
    where: { id: profile.id },
    data: {
      permissions: {
        ...currentPermissions,
        ...updates
      }
    }
  });
}

/**
 * Create or update profile (upsert)
 */
export async function upsertRoleProfile(
  userId: number,
  role: UserRole,
  permissions: RolePermissions,
  metadata: RoleMetadata,
  isPrimary: boolean = false,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const existing = await prismaClient.roleProfile.findFirst({
    where: { userId, role }
  });

  if (existing) {
    return await prismaClient.roleProfile.update({
      where: { id: existing.id },
      data: {
        permissions,
        metadata: metadata as any,
        isPrimary,
        isActive: true,
        updatedAt: new Date()
      }
    });
  }

  return await prismaClient.roleProfile.create({
    data: {
      userId,
      role,
      permissions,
      metadata: metadata as any,
      isPrimary,
      isActive: true
    }
  });
}

/**
 * Create profile with default permissions
 */
export async function createRoleProfileWithDefaults(
  userId: number,
  role: UserRole,
  metadata: RoleMetadata,
  prismaClient: PrismaClient | PrismaTransaction,
  isPrimary: boolean = false,
  customPermissions?: Partial<RolePermissions>
) {
  const defaultPerms = DEFAULT_PERMISSIONS[role];
  const permissions = customPermissions
    ? { ...defaultPerms, ...customPermissions }
    : defaultPerms;

  return await prismaClient.roleProfile.create({
    data: {
      userId,
      role,
      permissions,
      metadata: metadata as any,
      isPrimary,
      isActive: true
    }
  });
}

/**
 * Deactivate profile
 */
export async function deactivateProfile(
  userId: number,
  role: UserRole,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const profile = await prismaClient.roleProfile.findFirst({
    where: { userId, role, isActive: true }
  });

  if (!profile) {
    throw new Error(`Active ${role} profile not found for user ${userId}`);
  }

  return await prismaClient.roleProfile.update({
    where: { id: profile.id },
    data: { isActive: false }
  });
}

/**
 * Reactivate profile
 */
export async function reactivateProfile(
  userId: number,
  role: UserRole,
  prismaClient: PrismaClient | PrismaTransaction
) {
  const profile = await prismaClient.roleProfile.findFirst({
    where: { userId, role }
  });

  if (!profile) {
    throw new Error(`${role} profile not found for user ${userId}`);
  }

  return await prismaClient.roleProfile.update({
    where: { id: profile.id },
    data: { isActive: true }
  });
}

/**
 * Set primary profile
 */
export async function setPrimaryProfile(
  userId: number,
  role: UserRole,
  prismaClient: PrismaClient | PrismaTransaction
) {
  return await (prismaClient as any).$transaction(async (tx: any) => {
    // Remove isPrimary from all profiles
    await tx.roleProfile.updateMany({
      where: { userId },
      data: { isPrimary: false }
    });

    // Set new primary
    const profile = await tx.roleProfile.findFirst({
      where: { userId, role, isActive: true }
    });

    if (!profile) {
      throw new Error(`Active ${role} profile not found for user ${userId}`);
    }

    return await tx.roleProfile.update({
      where: { id: profile.id },
      data: { isPrimary: true }
    });
  });
}

/**
 * Helper to get student-specific data
 */
export async function getStudentMetadata(
  userId: number,
  prismaClient: PrismaClient | PrismaTransaction
): Promise<StudentMetadata> {
  const profile = await getRoleProfile(userId, 'STUDENT', prismaClient);
  return profile.metadata as StudentMetadata;
}

/**
 * Helper to get lecturer-specific data
 */
export async function getLecturerMetadata(
  userId: number,
  prismaClient: PrismaClient | PrismaTransaction
): Promise<LecturerMetadata> {
  const profile = await getRoleProfile(userId, 'LECTURER', prismaClient);
  return profile.metadata as LecturerMetadata;
}

/**
 * Update student-specific fields
 */
export async function updateStudentMetadata(
  userId: number,
  updates: Partial<StudentMetadata>,
  prismaClient: PrismaClient | PrismaTransaction
) {
  return await updateProfileMetadata(userId, 'STUDENT', updates, prismaClient);
}

/**
 * Update lecturer-specific fields
 */
export async function updateLecturerMetadata(
  userId: number,
  updates: Partial<LecturerMetadata>,
  prismaClient: PrismaClient | PrismaTransaction
) {
  return await updateProfileMetadata(userId, 'LECTURER', updates, prismaClient);
}

// Export type for use in other files
export type ProfileWithMetadata = Awaited<ReturnType<typeof getRoleProfile>>;
