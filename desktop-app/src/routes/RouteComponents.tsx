import { lazy } from 'react';

// Lazy load components for better performance
const AuthPage = lazy(() => import('../components/auth/AuthPage').then(module => ({ default: module.AuthPage })));
const NotFoundPage = lazy(() => import('../components/NotFoundPage').then(module => ({ default: module.NotFoundPage })));

// Dashboard components
const SuperAdminDashboard = lazy(() => import('../components/superadmin/SuperAdminDashboard').then(module => ({ default: module.SuperAdminDashboard })));
const InstitutionsList = lazy(() => import('../components/superadmin/InstitutionsList').then(module => ({ default: module.InstitutionsList })));
const SuperAdminAnalytics = lazy(() => import('../components/superadmin/Analytics').then(module => ({ default: module.Analytics })));
const Health = lazy(() => import('../components/superadmin/Health').then(module => ({ default: module.default })));
const Configuration = lazy(() => import('../components/superadmin/Configuration').then(module => ({ default: module.default })));
const AuditLogs = lazy(() => import('../components/superadmin/AuditLogs').then(module => ({ default: module.default })));

// User Management
const UserManagement = lazy(() => import('../components/users/UserManagement').then(module => ({ default: module.UserManagement })));

// Analytics
const Analytics = lazy(() => import('../components/analytics/Analytics').then(module => ({ default: module.Analytics })));

// Exam Management
const ExamManagement = lazy(() => import('../components/exams/ExamManagement').then(module => ({ default: module.ExamManagement })));

// Incident Management
const IncidentManagement = lazy(() => import('../components/incidents/IncidentManagement').then(module => ({ default: module.IncidentManagement })));

// Script Management
const ScriptManagement = lazy(() => import('../components/scripts/ScriptManagement').then(module => ({ default: module.ScriptManagement })));

// Common components
const Profile = lazy(() => import('../components/common/Profile').then(module => ({ default: module.Profile })));
const Settings = lazy(() => import('../components/common/Settings').then(module => ({ default: module.Settings })));
const Help = lazy(() => import('../components/common/Help').then(module => ({ default: module.Help })));

// Role-based dashboard components (placeholder for now)
const createPlaceholderDashboard = (title: string, description: string) => () =>
  (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mt-2">{description}</p>
    </div>
  );

export const DashboardComponents = {
  SUPER_ADMIN: SuperAdminDashboard,
  INSTITUTION_ADMIN: createPlaceholderDashboard('Institution Admin Dashboard', 'Coming soon...'),
  DEPARTMENT_HEAD: createPlaceholderDashboard('Department Head Dashboard', 'Coming soon...'),
  REGISTRY_STAFF: createPlaceholderDashboard('Registry Staff Dashboard', 'Coming soon...'),
  ACADEMIC_STAFF: createPlaceholderDashboard('Academic Staff Dashboard', 'Coming soon...'),
  IT_SUPPORT: createPlaceholderDashboard('IT Support Dashboard', 'Coming soon...'),
  EXAM_OFFICER: createPlaceholderDashboard('Exam Officer Dashboard', 'Coming soon...'),
  INVIGILATOR: createPlaceholderDashboard('Invigilator Dashboard', 'Coming soon...'),
  STUDENT: createPlaceholderDashboard('Student Dashboard', 'Coming soon...'),
  EXTERNAL_EXAMINER: createPlaceholderDashboard('External Examiner Dashboard', 'Coming soon...'),
  VICE_CHANCELLOR: createPlaceholderDashboard('Vice Chancellor Dashboard', 'Coming soon...'),
  REGISTRAR: createPlaceholderDashboard('Registrar Dashboard', 'Coming soon...'),
  FINANCE_STAFF: createPlaceholderDashboard('Finance Staff Dashboard', 'Coming soon...'),
  AUDITOR: createPlaceholderDashboard('Auditor Dashboard', 'Coming soon...'),
  SECURITY_STAFF: createPlaceholderDashboard('Security Staff Dashboard', 'Coming soon...'),
  MAINTENANCE_STAFF: createPlaceholderDashboard('Maintenance Staff Dashboard', 'Coming soon...'),
  GUEST: createPlaceholderDashboard('Guest Dashboard', 'Limited access view...'),
};

export const RouteComponents = {
  AuthPage,
  NotFoundPage,
  SuperAdminDashboard,
  InstitutionsList,
  SuperAdminAnalytics,
  Health,
  Configuration,
  AuditLogs,
  UserManagement,
  Analytics,
  ExamManagement,
  IncidentManagement,
  ScriptManagement,
  Profile,
  Settings,
  Help,
};
