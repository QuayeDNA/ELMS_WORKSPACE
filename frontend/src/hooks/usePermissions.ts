import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { UserRole } from '@/types/auth';

// Define role hierarchies and permissions
const ROLE_HIERARCHY = {
  [UserRole.SUPER_ADMIN]: 10,
  [UserRole.ADMIN]: 9,
  [UserRole.FACULTY_ADMIN]: 8,
  [UserRole.DEAN]: 7,
  [UserRole.HOD]: 6,
  [UserRole.EXAMS_OFFICER]: 5,
  [UserRole.SCRIPT_HANDLER]: 4,
  [UserRole.INVIGILATOR]: 3,
  [UserRole.LECTURER]: 2,
  [UserRole.STUDENT]: 1,
};

// Student management permissions
const STUDENT_PERMISSIONS = {
  // Can view students
  VIEW: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
    UserRole.HOD,
    UserRole.EXAMS_OFFICER,
    UserRole.LECTURER,
  ],
  // Can create students
  CREATE: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
  ],
  // Can update students
  UPDATE: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
    UserRole.HOD,
  ],
  // Can delete students
  DELETE: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
  ],
  // Can bulk import students
  BULK_IMPORT: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
  ],
  // Can export student data
  EXPORT: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
    UserRole.HOD,
  ],
  // Can view statistics
  STATS: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
    UserRole.HOD,
    UserRole.EXAMS_OFFICER,
  ],
};

// Instructor management permissions
const INSTRUCTOR_PERMISSIONS = {
  // Can view instructors
  VIEW: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
    UserRole.HOD,
  ],
  // Can create instructors
  CREATE: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
  ],
  // Can update instructors
  UPDATE: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
  ],
  // Can delete instructors
  DELETE: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
  ],
  // Can assign departments
  ASSIGN_DEPARTMENT: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
  ],
  // Can export instructor data
  EXPORT: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
  ],
  // Can view statistics
  STATS: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
  ],
  // Can view workload
  WORKLOAD: [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.DEAN,
    UserRole.HOD,
  ],
};

export interface PermissionCheck {
  canViewStudents: boolean;
  canCreateStudents: boolean;
  canUpdateStudents: boolean;
  canDeleteStudents: boolean;
  canBulkImportStudents: boolean;
  canExportStudents: boolean;
  canViewStudentStats: boolean;
  
  canViewInstructors: boolean;
  canCreateInstructors: boolean;
  canUpdateInstructors: boolean;
  canDeleteInstructors: boolean;
  canAssignInstructorDepartments: boolean;
  canExportInstructors: boolean;
  canViewInstructorStats: boolean;
  canViewInstructorWorkload: boolean;
  
  // Scope-based permissions
  canAccessInstitutionLevel: boolean;
  canAccessFacultyLevel: boolean;
  canAccessDepartmentLevel: boolean;
  
  // Helper functions
  hasMinimumRole: (role: UserRole) => boolean;
  canAccessResource: (resourceRole: UserRole[]) => boolean;
}

export const usePermissions = (): PermissionCheck => {
  const { user } = useAuth();

  const hasMinimumRole = useCallback((role: UserRole): boolean => {
    if (!user) return false;
    return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[role];
  }, [user]);

  const canAccessResource = useCallback((allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  }, [user]);

  const permissions = useMemo((): PermissionCheck => {
    if (!user) {
      return {
        canViewStudents: false,
        canCreateStudents: false,
        canUpdateStudents: false,
        canDeleteStudents: false,
        canBulkImportStudents: false,
        canExportStudents: false,
        canViewStudentStats: false,
        
        canViewInstructors: false,
        canCreateInstructors: false,
        canUpdateInstructors: false,
        canDeleteInstructors: false,
        canAssignInstructorDepartments: false,
        canExportInstructors: false,
        canViewInstructorStats: false,
        canViewInstructorWorkload: false,
        
        canAccessInstitutionLevel: false,
        canAccessFacultyLevel: false,
        canAccessDepartmentLevel: false,
        
        hasMinimumRole,
        canAccessResource,
      };
    }

    return {
      // Student permissions
      canViewStudents: canAccessResource(STUDENT_PERMISSIONS.VIEW),
      canCreateStudents: canAccessResource(STUDENT_PERMISSIONS.CREATE),
      canUpdateStudents: canAccessResource(STUDENT_PERMISSIONS.UPDATE),
      canDeleteStudents: canAccessResource(STUDENT_PERMISSIONS.DELETE),
      canBulkImportStudents: canAccessResource(STUDENT_PERMISSIONS.BULK_IMPORT),
      canExportStudents: canAccessResource(STUDENT_PERMISSIONS.EXPORT),
      canViewStudentStats: canAccessResource(STUDENT_PERMISSIONS.STATS),
      
      // Instructor permissions
      canViewInstructors: canAccessResource(INSTRUCTOR_PERMISSIONS.VIEW),
      canCreateInstructors: canAccessResource(INSTRUCTOR_PERMISSIONS.CREATE),
      canUpdateInstructors: canAccessResource(INSTRUCTOR_PERMISSIONS.UPDATE),
      canDeleteInstructors: canAccessResource(INSTRUCTOR_PERMISSIONS.DELETE),
      canAssignInstructorDepartments: canAccessResource(INSTRUCTOR_PERMISSIONS.ASSIGN_DEPARTMENT),
      canExportInstructors: canAccessResource(INSTRUCTOR_PERMISSIONS.EXPORT),
      canViewInstructorStats: canAccessResource(INSTRUCTOR_PERMISSIONS.STATS),
      canViewInstructorWorkload: canAccessResource(INSTRUCTOR_PERMISSIONS.WORKLOAD),
      
      // Scope-based permissions
      canAccessInstitutionLevel: hasMinimumRole(UserRole.ADMIN),
      canAccessFacultyLevel: hasMinimumRole(UserRole.FACULTY_ADMIN),
      canAccessDepartmentLevel: hasMinimumRole(UserRole.HOD),
      
      hasMinimumRole,
      canAccessResource,
    };
  }, [user, hasMinimumRole, canAccessResource]);

  return permissions;
};

// Hook for scoped data access based on user role and department/faculty
export const useDataScope = () => {
  const { user } = useAuth();
  const permissions = usePermissions();

  const getDataFilters = useCallback(() => {
    if (!user) return {};

    const filters: Record<string, number> = {};

    // Apply scope-based filtering
    if (!permissions.canAccessInstitutionLevel) {
      if (user.institutionId) {
        filters.institutionId = user.institutionId;
      }
    }

    if (!permissions.canAccessFacultyLevel) {
      if (user.facultyId) {
        filters.facultyId = user.facultyId;
      }
    }

    if (!permissions.canAccessDepartmentLevel) {
      if (user.departmentId) {
        filters.departmentId = user.departmentId;
      }
    }

    return filters;
  }, [user, permissions]);

  return {
    getDataFilters,
    userScope: {
      institutionId: user?.institutionId,
      facultyId: user?.facultyId,
      departmentId: user?.departmentId,
    },
  };
};
