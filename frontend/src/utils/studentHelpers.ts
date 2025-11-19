// ========================================
// STUDENT HELPER UTILITIES
// ========================================
// Utilities for extracting student data from User roleProfiles

import { User } from '@/types/user';
import { RoleProfile, UserRole } from '@/types/auth';
import { Student, EnrollmentStatus, AcademicStatus } from '@/types/student';

/**
 * Check if a user has the STUDENT role
 */
export function isStudent(user: User | null | undefined): boolean {
  if (!user) return false;

  // Check primary role
  if (user.role === 'STUDENT') return true;

  // Check roleProfiles array
  if (user.roleProfiles && user.roleProfiles.length > 0) {
    return user.roleProfiles.some(rp => rp.role === 'STUDENT' && rp.isActive);
  }

  return false;
}

/**
 * Get the student roleProfile from a user
 */
export function getStudentRoleProfile(user: User | null | undefined): RoleProfile | null {
  if (!user) return null;

  // Check roleProfiles array
  if (user.roleProfiles && user.roleProfiles.length > 0) {
    const studentProfile = user.roleProfiles.find(rp => rp.role === 'STUDENT' && rp.isActive);
    if (studentProfile) return studentProfile;
  }

  // Fallback: if primary role is STUDENT, return a constructed roleProfile
  if (user.role === UserRole.STUDENT) {
    return {
      id: user.id,
      userId: user.id,
      role: UserRole.STUDENT,
      permissions: {},
      isActive: true,
      isPrimary: true,
      metadata: {},
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString()
    };
  }

  return null;
}

/**
 * Extract student metadata from roleProfile
 */
export interface StudentMetadata {
  studentId?: string;
  indexNumber?: string;
  programId?: number;
  level?: number;
  semester?: number;
  admissionDate?: string;
  expectedGraduation?: string;
  enrollmentStatus?: EnrollmentStatus;
  academicStatus?: AcademicStatus;
  guardianName?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  emergencyContact?: string;
  academicYear?: string;
  section?: string;
  credits?: number;
  cgpa?: number;
}

export function getStudentMetadata(user: User | null | undefined): StudentMetadata {
  const roleProfile = getStudentRoleProfile(user);
  if (!roleProfile || !roleProfile.metadata) {
    return {};
  }

  return roleProfile.metadata as StudentMetadata;
}

/**
 * Transform a User with STUDENT roleProfile into a Student object
 * This maintains compatibility with existing components that expect a Student object
 */
export function transformUserToStudent(user: User): Student | null {
  if (!isStudent(user)) return null;

  const metadata = getStudentMetadata(user);
  const roleProfile = getStudentRoleProfile(user);

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    middleName: user.middleName,
    phone: user.phone,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    nationality: user.nationality,
    address: user.address,
    status: user.status,

    // Student-specific data from metadata
    studentId: metadata.studentId || '',
    indexNumber: metadata.indexNumber,
    level: metadata.level || 1,
    semester: metadata.semester || 1,
    academicYear: metadata.academicYear,
    programId: metadata.programId,
    admissionDate: metadata.admissionDate,
    expectedGraduation: metadata.expectedGraduation,
    enrollmentStatus: metadata.enrollmentStatus || EnrollmentStatus.ACTIVE,
    academicStatus: metadata.academicStatus || AcademicStatus.GOOD_STANDING,

    // Guardian/Emergency info
    guardianName: metadata.guardianName,
    guardianPhone: metadata.guardianPhone,
    guardianEmail: metadata.guardianEmail,
    emergencyContact: metadata.emergencyContact,

    // Computed properties
    section: metadata.section,
    credits: metadata.credits,
    cgpa: metadata.cgpa,

    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),

    // Optional roleProfile for advanced use
    roleProfile: roleProfile || undefined
  };
}

/**
 * Transform backend User response to frontend Student object
 * Handles both single user and arrays of users
 */
export function transformBackendStudent(data: unknown): Student | null {
  if (!data) return null;
  return transformUserToStudent(data as User);
}

export function transformBackendStudents(data: unknown[]): Student[] {
  if (!Array.isArray(data)) return [];
  return data
    .map(transformBackendStudent)
    .filter((s): s is Student => s !== null);
}

/**
 * Get student display name
 */
export function getStudentDisplayName(student: Student | User | null | undefined): string {
  if (!student) return 'Unknown Student';

  const firstName = student.firstName || '';
  const middleName = student.middleName || '';
  const lastName = student.lastName || '';

  return `${firstName} ${middleName} ${lastName}`.trim() || 'Unknown Student';
}

/**
 * Get student ID from user
 */
export function getStudentId(user: User | null | undefined): string | null {
  const metadata = getStudentMetadata(user);
  return metadata.studentId || null;
}

/**
 * Check if student is newly registered (within last 24 hours)
 */
export function isNewlyRegistered(student: Student | null | undefined): boolean {
  if (!student || !student.createdAt) return false;

  const createdAt = new Date(student.createdAt);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

  return hoursSinceCreation < 24;
}
