import { UserRole, RolePermissions, RoleHierarchy } from '../types/auth';

// ========================================
// ROLE PERMISSION DEFINITIONS
// ========================================

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    // User Management - Full control
    canManageUsers: true,
    canViewUsers: true,
    canCreateUsers: true,
    canUpdateUsers: true,
    canDeleteUsers: true,

    // Institution Management - Full control
    canManageInstitutions: true,
    canManageFaculties: true,
    canManageDepartments: true,

    // Exam Management - Full oversight
    canCreateExams: true,
    canScheduleExams: true,
    canManageExams: true,
    canViewExams: true,
    canConductExams: true,

    // Script Management - Full oversight
    canGenerateScripts: true,
    canTrackScripts: true,
    canHandleScripts: true,
    canScanQrCodes: true,
    canGradeScripts: true,

    // Incident Management - Full oversight
    canReportIncidents: true,
    canManageIncidents: true,
    canInvestigateIncidents: true,
    canResolveIncidents: true,

    // Venue Management - Full control
    canManageVenues: true,
    canViewVenues: true,

    // Analytics & Reporting - Full access
    canViewAnalytics: true,
    canExportData: true,
    canViewAuditLogs: true,

    // Administrative - Full control
    canManageSettings: true,
    canViewSystemLogs: true,
  },

  [UserRole.ADMIN]: {
    // User Management - Institution level
    canManageUsers: true,
    canViewUsers: true,
    canCreateUsers: true,
    canUpdateUsers: true,
    canDeleteUsers: false, // Can suspend but not delete

    // Institution Management - Limited to their institution
    canManageInstitutions: false,
    canManageFaculties: true,
    canManageDepartments: true,

    // Exam Management - Institution oversight
    canCreateExams: true,
    canScheduleExams: true,
    canManageExams: true,
    canViewExams: true,
    canConductExams: false, // Admins don't conduct exams

    // Script Management - Oversight
    canGenerateScripts: true,
    canTrackScripts: true,
    canHandleScripts: false,
    canScanQrCodes: false,
    canGradeScripts: false,

    // Incident Management - Institution level
    canReportIncidents: true,
    canManageIncidents: true,
    canInvestigateIncidents: true,
    canResolveIncidents: true,

    // Venue Management - Institution level
    canManageVenues: true,
    canViewVenues: true,

    // Analytics & Reporting - Institution level
    canViewAnalytics: true,
    canExportData: true,
    canViewAuditLogs: true,

    // Administrative - Limited
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.FACULTY_ADMIN]: {
    // User Management - Faculty level
    canManageUsers: true,
    canViewUsers: true,
    canCreateUsers: true,
    canUpdateUsers: true,
    canDeleteUsers: false,

    // Institution Management - Faculty only
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: true,

    // Exam Management - Faculty level
    canCreateExams: true,
    canScheduleExams: true,
    canManageExams: true,
    canViewExams: true,
    canConductExams: false,

    // Script Management - Faculty oversight
    canGenerateScripts: true,
    canTrackScripts: true,
    canHandleScripts: false,
    canScanQrCodes: false,
    canGradeScripts: false,

    // Incident Management - Faculty level
    canReportIncidents: true,
    canManageIncidents: true,
    canInvestigateIncidents: true,
    canResolveIncidents: true,

    // Venue Management - Faculty level
    canManageVenues: true,
    canViewVenues: true,

    // Analytics & Reporting - Faculty level
    canViewAnalytics: true,
    canExportData: true,
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.DEAN]: {
    // User Management - Faculty level
    canManageUsers: true,
    canViewUsers: true,
    canCreateUsers: true,
    canUpdateUsers: true,
    canDeleteUsers: false,

    // Institution Management - Faculty only
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: true,

    // Exam Management - Faculty level
    canCreateExams: true,
    canScheduleExams: true,
    canManageExams: true,
    canViewExams: true,
    canConductExams: false,

    // Script Management - Faculty oversight
    canGenerateScripts: true,
    canTrackScripts: true,
    canHandleScripts: false,
    canScanQrCodes: false,
    canGradeScripts: false,

    // Incident Management - Faculty level
    canReportIncidents: true,
    canManageIncidents: true,
    canInvestigateIncidents: true,
    canResolveIncidents: true,

    // Venue Management - Faculty level
    canManageVenues: true,
    canViewVenues: true,

    // Analytics & Reporting - Faculty level
    canViewAnalytics: true,
    canExportData: true,
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.HOD]: {
    // User Management - Department level
    canManageUsers: true,
    canViewUsers: true,
    canCreateUsers: false,
    canUpdateUsers: true,
    canDeleteUsers: false,

    // Institution Management - Department only
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: false,

    // Exam Management - Department level
    canCreateExams: true,
    canScheduleExams: true,
    canManageExams: true,
    canViewExams: true,
    canConductExams: false,

    // Script Management - Department oversight
    canGenerateScripts: true,
    canTrackScripts: true,
    canHandleScripts: false,
    canScanQrCodes: false,
    canGradeScripts: false,

    // Incident Management - Department level
    canReportIncidents: true,
    canManageIncidents: true,
    canInvestigateIncidents: true,
    canResolveIncidents: false,

    // Venue Management - View and suggest
    canManageVenues: false,
    canViewVenues: true,

    // Analytics & Reporting - Department level
    canViewAnalytics: true,
    canExportData: true,
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.EXAMS_OFFICER]: {
    // User Management - Limited
    canManageUsers: false,
    canViewUsers: true,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,

    // Institution Management - None
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: false,

    // Exam Management - Core functionality
    canCreateExams: true,
    canScheduleExams: true,
    canManageExams: true,
    canViewExams: true,
    canConductExams: false,

    // Script Management - Logistics
    canGenerateScripts: true,
    canTrackScripts: true,
    canHandleScripts: false,
    canScanQrCodes: false,
    canGradeScripts: false,

    // Incident Management - Core functionality
    canReportIncidents: true,
    canManageIncidents: true,
    canInvestigateIncidents: true,
    canResolveIncidents: true,

    // Venue Management - Scheduling
    canManageVenues: true,
    canViewVenues: true,

    // Analytics & Reporting - Exam focused
    canViewAnalytics: true,
    canExportData: true,
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.SCRIPT_HANDLER]: {
    // User Management - None
    canManageUsers: false,
    canViewUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,

    // Institution Management - None
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: false,

    // Exam Management - View only
    canCreateExams: false,
    canScheduleExams: false,
    canManageExams: false,
    canViewExams: true,
    canConductExams: false,

    // Script Management - Core functionality
    canGenerateScripts: false,
    canTrackScripts: true,
    canHandleScripts: true,
    canScanQrCodes: true,
    canGradeScripts: false,

    // Incident Management - Report only
    canReportIncidents: true,
    canManageIncidents: false,
    canInvestigateIncidents: false,
    canResolveIncidents: false,

    // Venue Management - View only
    canManageVenues: false,
    canViewVenues: true,

    // Analytics & Reporting - Script focused
    canViewAnalytics: false,
    canExportData: false,
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.INVIGILATOR]: {
    // User Management - None
    canManageUsers: false,
    canViewUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,

    // Institution Management - None
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: false,

    // Exam Management - Conduct only
    canCreateExams: false,
    canScheduleExams: false,
    canManageExams: false,
    canViewExams: true,
    canConductExams: true,

    // Script Management - Collection & basic handling
    canGenerateScripts: false,
    canTrackScripts: true,
    canHandleScripts: true,
    canScanQrCodes: true,
    canGradeScripts: false,

    // Incident Management - Report incidents
    canReportIncidents: true,
    canManageIncidents: false,
    canInvestigateIncidents: false,
    canResolveIncidents: false,

    // Venue Management - View only
    canManageVenues: false,
    canViewVenues: true,

    // Analytics & Reporting - None
    canViewAnalytics: false,
    canExportData: false,
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.LECTURER]: {
    // User Management - None
    canManageUsers: false,
    canViewUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,

    // Institution Management - None
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: false,

    // Exam Management - Create & view for their courses
    canCreateExams: true,
    canScheduleExams: false,
    canManageExams: true, // Only for their courses
    canViewExams: true,
    canConductExams: false,

    // Script Management - Grading
    canGenerateScripts: false,
    canTrackScripts: true,
    canHandleScripts: false,
    canScanQrCodes: false,
    canGradeScripts: true,

    // Incident Management - Report only
    canReportIncidents: true,
    canManageIncidents: false,
    canInvestigateIncidents: false,
    canResolveIncidents: false,

    // Venue Management - View only
    canManageVenues: false,
    canViewVenues: true,

    // Analytics & Reporting - Course specific
    canViewAnalytics: true, // Only for their courses
    canExportData: true, // Only for their courses
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },

  [UserRole.STUDENT]: {
    // User Management - None
    canManageUsers: false,
    canViewUsers: false,
    canCreateUsers: false,
    canUpdateUsers: false,
    canDeleteUsers: false,

    // Institution Management - None
    canManageInstitutions: false,
    canManageFaculties: false,
    canManageDepartments: false,

    // Exam Management - View only (their exams)
    canCreateExams: false,
    canScheduleExams: false,
    canManageExams: false,
    canViewExams: true, // Only their exams
    canConductExams: false,

    // Script Management - View only (their scripts)
    canGenerateScripts: false,
    canTrackScripts: true, // Only their scripts
    canHandleScripts: false,
    canScanQrCodes: false,
    canGradeScripts: false,

    // Incident Management - Report only
    canReportIncidents: true,
    canManageIncidents: false,
    canInvestigateIncidents: false,
    canResolveIncidents: false,

    // Venue Management - View only
    canManageVenues: false,
    canViewVenues: true,

    // Analytics & Reporting - Personal only
    canViewAnalytics: false,
    canExportData: false,
    canViewAuditLogs: false,

    // Administrative - None
    canManageSettings: false,
    canViewSystemLogs: false,
  },
};

// ========================================
// ROLE HIERARCHY DEFINITIONS
// ========================================

export const ROLE_HIERARCHY: Record<UserRole, RoleHierarchy> = {
  [UserRole.SUPER_ADMIN]: {
    role: UserRole.SUPER_ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.SUPER_ADMIN],
    scope: 'SYSTEM',
    description: 'System-wide administrator with full control over all institutions, users, and system settings.',
    managedRoles: [
      UserRole.ADMIN,
      UserRole.FACULTY_ADMIN,
      UserRole.EXAMS_OFFICER,
      UserRole.SCRIPT_HANDLER,
      UserRole.INVIGILATOR,
      UserRole.LECTURER,
      UserRole.STUDENT,
    ],
  },

  [UserRole.ADMIN]: {
    role: UserRole.ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.ADMIN],
    scope: 'INSTITUTION',
    description: 'Institution-level administrator who manages faculty admins, overall exam operations, and institutional settings.',
    managedRoles: [
      UserRole.FACULTY_ADMIN,
      UserRole.EXAMS_OFFICER,
      UserRole.SCRIPT_HANDLER,
      UserRole.INVIGILATOR,
      UserRole.LECTURER,
      UserRole.STUDENT,
    ],
  },

  [UserRole.FACULTY_ADMIN]: {
    role: UserRole.FACULTY_ADMIN,
    permissions: ROLE_PERMISSIONS[UserRole.FACULTY_ADMIN],
    scope: 'FACULTY',
    description: 'Faculty-level administrator who manages departments, faculty-specific exams, exam officers, and faculty users.',
    managedRoles: [
      UserRole.EXAMS_OFFICER,
      UserRole.SCRIPT_HANDLER,
      UserRole.INVIGILATOR,
      UserRole.LECTURER,
      UserRole.STUDENT,
    ],
  },

  [UserRole.DEAN]: {
    role: UserRole.DEAN,
    permissions: ROLE_PERMISSIONS[UserRole.DEAN],
    scope: 'FACULTY',
    description: 'Dean of faculty who oversees all academic and administrative matters within the faculty.',
    managedRoles: [
      UserRole.HOD,
      UserRole.EXAMS_OFFICER,
      UserRole.SCRIPT_HANDLER,
      UserRole.INVIGILATOR,
      UserRole.LECTURER,
      UserRole.STUDENT,
    ],
  },

  [UserRole.HOD]: {
    role: UserRole.HOD,
    permissions: ROLE_PERMISSIONS[UserRole.HOD],
    scope: 'DEPARTMENT',
    description: 'Head of Department who manages department-specific exams, courses, and academic staff.',
    managedRoles: [
      UserRole.LECTURER,
      UserRole.STUDENT,
    ],
  },

  [UserRole.EXAMS_OFFICER]: {
    role: UserRole.EXAMS_OFFICER,
    permissions: ROLE_PERMISSIONS[UserRole.EXAMS_OFFICER],
    scope: 'FACULTY',
    description: 'Appointed by faculty admin to handle exam logistics, scheduling, incident management, and venue coordination.',
    managedRoles: [
      UserRole.SCRIPT_HANDLER,
      UserRole.INVIGILATOR,
    ],
  },

  [UserRole.SCRIPT_HANDLER]: {
    role: UserRole.SCRIPT_HANDLER,
    permissions: ROLE_PERMISSIONS[UserRole.SCRIPT_HANDLER],
    scope: 'DEPARTMENT',
    description: 'Handles script transit, scanning QR codes, tracking script movements, and ensuring script security during transport.',
    managedRoles: [],
  },

  [UserRole.INVIGILATOR]: {
    role: UserRole.INVIGILATOR,
    permissions: ROLE_PERMISSIONS[UserRole.INVIGILATOR],
    scope: 'COURSE',
    description: 'Conducts exams, collects scripts, reports incidents, and ensures exam integrity during examination sessions.',
    managedRoles: [],
  },

  [UserRole.LECTURER]: {
    role: UserRole.LECTURER,
    permissions: ROLE_PERMISSIONS[UserRole.LECTURER],
    scope: 'COURSE',
    description: 'Creates exams for their courses, grades scripts, and manages course-specific examination content.',
    managedRoles: [],
  },

  [UserRole.STUDENT]: {
    role: UserRole.STUDENT,
    permissions: ROLE_PERMISSIONS[UserRole.STUDENT],
    scope: 'COURSE',
    description: 'Takes exams, views their exam schedules and script status, and can report exam-related incidents.',
    managedRoles: [],
  },
};

// ========================================
// HELPER FUNCTIONS
// ========================================

export function getRolePermissions(role: UserRole): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[managerRole].managedRoles.includes(targetRole);
}

export function getRoleHierarchy(role: UserRole): RoleHierarchy {
  return ROLE_HIERARCHY[role];
}

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role][permission];
}

export function getRolesByScope(scope: 'SYSTEM' | 'INSTITUTION' | 'FACULTY' | 'DEPARTMENT' | 'COURSE'): UserRole[] {
  return Object.values(ROLE_HIERARCHY)
    .filter(hierarchy => hierarchy.scope === scope)
    .map(hierarchy => hierarchy.role);
}

// ========================================
// ROLE DESCRIPTIONS
// ========================================

export const ROLE_DESCRIPTIONS = {
  [UserRole.SUPER_ADMIN]: {
    title: 'Super Administrator',
    summary: 'System-wide control and oversight',
    responsibilities: [
      'Manage all institutions and system settings',
      'Oversee all admins and system operations',
      'Configure global system parameters',
      'Monitor system performance and security',
      'Handle critical incidents and escalations',
    ],
  },

  [UserRole.ADMIN]: {
    title: 'Institution Administrator',
    summary: 'Institution-level management and oversight',
    responsibilities: [
      'Manage faculty admins and institutional users',
      'Oversee institution-wide exam operations',
      'Configure institutional settings and policies',
      'Handle institutional-level incidents',
      'Monitor faculty performance and operations',
    ],
  },

  [UserRole.FACULTY_ADMIN]: {
    title: 'Faculty Administrator',
    summary: 'Faculty-level academic and exam management',
    responsibilities: [
      'Manage departments, courses, and faculty users',
      'Oversee faculty-specific examination processes',
      'Appoint and manage exam officers',
      'Handle faculty-level academic policies',
      'Coordinate with institution administration',
    ],
  },

  [UserRole.DEAN]: {
    title: 'Dean',
    summary: 'Faculty leadership and academic oversight',
    responsibilities: [
      'Provide academic leadership for the faculty',
      'Oversee all departments within the faculty',
      'Manage faculty-wide policies and procedures',
      'Coordinate with HODs and faculty administration',
      'Ensure quality of academic programs',
    ],
  },

  [UserRole.HOD]: {
    title: 'Head of Department',
    summary: 'Department-level academic management',
    responsibilities: [
      'Manage department staff and lecturers',
      'Oversee department-specific courses and exams',
      'Coordinate with faculty administration',
      'Handle department-level academic matters',
      'Monitor departmental performance',
    ],
  },

  [UserRole.EXAMS_OFFICER]: {
    title: 'Examinations Officer',
    summary: 'Exam logistics and operational management',
    responsibilities: [
      'Schedule and coordinate examination sessions',
      'Manage exam venues and resources',
      'Handle exam-related incidents and issues',
      'Coordinate with invigilators and script handlers',
      'Ensure compliance with exam procedures',
    ],
  },

  [UserRole.SCRIPT_HANDLER]: {
    title: 'Script Handler',
    summary: 'Script transit and security management',
    responsibilities: [
      'Receive and dispatch examination scripts',
      'Scan QR codes and track script movements',
      'Ensure script security during transport',
      'Report script-related incidents',
      'Maintain script custody chains',
    ],
  },

  [UserRole.INVIGILATOR]: {
    title: 'Invigilator',
    summary: 'Exam supervision and script collection',
    responsibilities: [
      'Supervise examination sessions',
      'Collect and verify examination scripts',
      'Report examination incidents and irregularities',
      'Ensure exam integrity and security',
      'Manage student queries during exams',
    ],
  },

  [UserRole.LECTURER]: {
    title: 'Lecturer',
    summary: 'Course content and assessment management',
    responsibilities: [
      'Create and design examination papers',
      'Grade and assess examination scripts',
      'Manage course-specific exam requirements',
      'Provide feedback on student performance',
      'Report academic integrity issues',
    ],
  },

  [UserRole.STUDENT]: {
    title: 'Student',
    summary: 'Exam participation and information access',
    responsibilities: [
      'Attend scheduled examination sessions',
      'Follow examination rules and procedures',
      'Report exam-related issues or concerns',
      'View personal exam schedules and results',
      'Maintain academic integrity standards',
    ],
  },
};
