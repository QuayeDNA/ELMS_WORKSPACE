import { UserRole, RolePermissions, RoleHierarchy } from '../types/auth';

// ========================================
// ROLE PERMISSION DEFINITIONS
// ========================================

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SUPER_ADMIN]: {
    all: { all: true },
    users: { create: true, read: true, update: true, delete: true, manage: true },
    institutions: { create: true, read: true, update: true, delete: true, manage: true },
    faculties: { create: true, read: true, update: true, delete: true, manage: true },
    departments: { create: true, read: true, update: true, delete: true, manage: true },
    programs: { create: true, read: true, update: true, delete: true, manage: true },
    courses: { create: true, read: true, update: true, delete: true, manage: true },
    exams: { create: true, read: true, update: true, delete: true, schedule: true, manage: true, conduct: true },
    scripts: { create: true, read: true, update: true, delete: true, generate: true, track: true, handle: true, scan: true, grade: true },
    incidents: { create: true, read: true, update: true, delete: true, report: true, manage: true, investigate: true, resolve: true },
    venues: { create: true, read: true, update: true, delete: true, manage: true },
    analytics: { view: true, export: true },
    reports: { view: true, create: true, export: true },
    students: { create: true, read: true, update: true, delete: true, manage: true },
    lecturers: { create: true, read: true, update: true, delete: true, manage: true },
  },

  [UserRole.ADMIN]: {
    users: { create: true, read: true, update: true, manage: true },
    faculties: { create: true, read: true, update: true, manage: true },
    departments: { create: true, read: true, update: true, manage: true },
    programs: { create: true, read: true, update: true, manage: true },
    courses: { read: true, update: true },
    exams: { create: true, read: true, update: true, schedule: true, manage: true },
    scripts: { read: true, generate: true, track: true },
    incidents: { create: true, read: true, update: true, report: true, manage: true, investigate: true, resolve: true },
    venues: { create: true, read: true, update: true, manage: true },
    analytics: { view: true, export: true },
    reports: { view: true, create: true, export: true },
    students: { create: true, read: true, update: true, manage: true },
    lecturers: { read: true, update: true },
  },

  [UserRole.FACULTY_ADMIN]: {
    users: { create: true, read: true, update: true },
    departments: { create: true, read: true, update: true, manage: true },
    programs: { create: true, read: true, update: true },
    courses: { read: true },
    exams: { create: true, read: true, update: true, schedule: true, manage: true },
    scripts: { read: true, generate: true, track: true },
    incidents: { create: true, read: true, report: true, manage: true },
    venues: { read: true, update: true, manage: true },
    analytics: { view: true, export: true },
    reports: { view: true, export: true },
    students: { read: true, update: true },
    lecturers: { read: true },
  },

  [UserRole.DEAN]: {
    departments: { read: true, update: true, manage: true },
    programs: { read: true, update: true, manage: true },
    courses: { read: true },
    exams: { create: true, read: true, schedule: true, manage: true },
    scripts: { read: true, track: true },
    incidents: { create: true, read: true, report: true },
    venues: { read: true },
    analytics: { view: true },
    students: { read: true },
    lecturers: { read: true },
  },

  [UserRole.HOD]: {
    departments: { read: true, update: true },
    courses: { read: true, update: true, manage: true },
    exams: { create: true, read: true, schedule: true },
    scripts: { read: true, track: true },
    incidents: { create: true, read: true, report: true, manage: true },
    venues: { read: true },
    analytics: { view: true },
    students: { read: true },
    lecturers: { read: true },
  },

  [UserRole.EXAMS_OFFICER]: {
    exams: { create: true, read: true, update: true, schedule: true, manage: true, conduct: true },
    scripts: { read: true, generate: true, track: true, handle: true, scan: true },
    incidents: { create: true, read: true, update: true, report: true, manage: true },
    venues: { read: true, update: true, manage: true },
    students: { read: true },
    lecturers: { read: true },
  },

  [UserRole.SCRIPT_HANDLER]: {
    scripts: { read: true, handle: true, scan: true, track: true },
    incidents: { create: true, read: true, report: true },
    exams: { read: true },
  },

  [UserRole.INVIGILATOR]: {
    exams: { read: true, conduct: true },
    scripts: { read: true, handle: true },
    incidents: { create: true, read: true, report: true },
    students: { read: true },
  },

  [UserRole.LECTURER]: {
    courses: { read: true },
    exams: { read: true },
    scripts: { read: true, grade: true },
    students: { read: true },
  },

  [UserRole.STUDENT]: {
    exams: { read: true },
    courses: { read: true },
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

export function hasPermission(role: UserRole, resource: string, action: string): boolean {
  const permissions = ROLE_PERMISSIONS[role];

  // Check if role has all permissions
  if (permissions.all?.all) {
    return true;
  }

  // Check specific resource permission
  const resourcePermissions = permissions[resource];
  if (!resourcePermissions) {
    return false;
  }

  // Check specific action or 'all' action
  return resourcePermissions[action] === true || resourcePermissions.all === true;
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
