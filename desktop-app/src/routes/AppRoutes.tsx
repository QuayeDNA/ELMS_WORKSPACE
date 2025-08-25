import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import { LoginForm } from '../components/auth/LoginForm'
import { Layout } from '../components/Layout'
import { DashboardContent } from '../components/DashboardContent'
import { ExamManagement } from '../components/exams/ExamManagement'
import { UserManagement as OldUserManagement, UserManagement } from '../components/users/UserManagement'
import { Analytics } from '../components/analytics/Analytics'
import { IncidentManagement } from '../components/incidents/IncidentManagement'
import { ScriptManagement } from '../components/scripts/ScriptManagement'

// Super Admin components
import { SuperAdminDashboard } from '../components/superadmin/SuperAdminDashboard'
import { InstitutionsList } from '../components/superadmin/InstitutionsList'
import { AuditLogsList } from '../components/superadmin/AuditLogsList'
import { Analytics as SuperAdminAnalytics } from '../components/superadmin/Analytics'
import Overview from '../components/superadmin/Overview'
import Health from '../components/superadmin/Health'
import Configuration from '../components/superadmin/Configuration'

// Placeholder components for other roles (will be implemented later)
const InstitutionAdminDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Institution Admin Dashboard</h1><p>Coming soon...</p></div>
const DepartmentDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Department Head Dashboard</h1><p>Coming soon...</p></div>
const RegistryDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Registry Staff Dashboard</h1><p>Coming soon...</p></div>
const AcademicDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Academic Staff Dashboard</h1><p>Coming soon...</p></div>
const ITDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">IT Support Dashboard</h1><p>Coming soon...</p></div>
const ExamOfficerDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Exam Officer Dashboard</h1><p>Coming soon...</p></div>
const InvigilatorDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Invigilator Dashboard</h1><p>Coming soon...</p></div>
const StudentDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Student Dashboard</h1><p>Coming soon...</p></div>
const ExternalExaminerDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">External Examiner Dashboard</h1><p>Coming soon...</p></div>
const VCDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Vice Chancellor Dashboard</h1><p>Coming soon...</p></div>
const RegistrarDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Registrar Dashboard</h1><p>Coming soon...</p></div>
const FinanceDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Finance Staff Dashboard</h1><p>Coming soon...</p></div>
const AuditorDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Auditor Dashboard</h1><p>Coming soon...</p></div>
const SecurityDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Security Staff Dashboard</h1><p>Coming soon...</p></div>
const MaintenanceDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Maintenance Staff Dashboard</h1><p>Coming soon...</p></div>
const GuestDashboard = () => <div className="p-6"><h1 className="text-2xl font-bold">Guest Dashboard</h1><p>Limited access view...</p></div>

// Common components
const Profile = () => <div className="p-6"><h1 className="text-2xl font-bold">User Profile</h1><p>Profile management...</p></div>
const Settings = () => <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>System configuration...</p></div>
const Help = () => <div className="p-6"><h1 className="text-2xl font-bold">Help & Support</h1><p>Documentation and support...</p></div>

interface PublicRouteProps {
  children: React.ReactNode
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/dashboard" replace />
}

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Get the appropriate dashboard component based on user role
  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />
      case 'INSTITUTION_ADMIN':
        return <InstitutionAdminDashboard />
      case 'DEPARTMENT_HEAD':
        return <DepartmentDashboard />
      case 'REGISTRY_STAFF':
        return <RegistryDashboard />
      case 'ACADEMIC_STAFF':
        return <AcademicDashboard />
      case 'IT_SUPPORT':
        return <ITDashboard />
      case 'EXAM_OFFICER':
        return <ExamOfficerDashboard />
      case 'INVIGILATOR':
        return <InvigilatorDashboard />
      case 'STUDENT':
        return <StudentDashboard />
      case 'EXTERNAL_EXAMINER':
        return <ExternalExaminerDashboard />
      case 'VICE_CHANCELLOR':
        return <VCDashboard />
      case 'REGISTRAR':
        return <RegistrarDashboard />
      case 'FINANCE_STAFF':
        return <FinanceDashboard />
      case 'AUDITOR':
        return <AuditorDashboard />
      case 'SECURITY_STAFF':
        return <SecurityDashboard />
      case 'MAINTENANCE_STAFF':
        return <MaintenanceDashboard />
      case 'GUEST':
        return <GuestDashboard />
      default:
        return <DashboardContent />
    }
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={<Layout />}
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        
        {/* Dashboard - role-based */}
        <Route path="dashboard" element={getDashboardComponent()} />

        {/* Super Admin Routes */}
        <Route 
          path="superadmin/*" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN']}>
              <Routes>
                <Route path="dashboard" element={<SuperAdminDashboard />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="institutions" element={<InstitutionsList />} />
                <Route path="audit" element={<AuditLogsList />} />
                <Route path="analytics" element={<SuperAdminAnalytics />} />
                <Route path="overview" element={<Overview />} />
                <Route path="health" element={<Health />} />
                <Route path="configuration" element={<Configuration />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Institution Admin Routes */}
        <Route 
          path="institution/*" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'INSTITUTION_ADMIN']}>
              <Routes>
                <Route path="dashboard" element={<InstitutionAdminDashboard />} />
                <Route path="departments" element={<div>Department Management</div>} />
                <Route path="staff" element={<OldUserManagement />} />
                <Route path="students" element={<div>Student Management</div>} />
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Department Head Routes */}
        <Route 
          path="department/*" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'DEPARTMENT_HEAD']}>
              <Routes>
                <Route path="dashboard" element={<DepartmentDashboard />} />
                <Route path="staff" element={<div>Staff Management</div>} />
                <Route path="courses" element={<div>Course Management</div>} />
                <Route path="students" element={<div>Student Management</div>} />
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Exam Management Routes */}
        <Route 
          path="exams/*" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'EXAM_OFFICER', 'ACADEMIC_STAFF']}>
              <Routes>
                <Route path="" element={<ExamManagement />} />
                <Route path="scheduling" element={<div>Exam Scheduling</div>} />
                <Route path="supervision" element={<div>Exam Supervision</div>} />
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="student/*" 
          element={
            <ProtectedRoute requiredRoles={['STUDENT']}>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="exams" element={<div>Exam Registration</div>} />
                <Route path="results" element={<div>Exam Results</div>} />
              </Routes>
            </ProtectedRoute>
          } 
        />

        {/* Legacy routes - backward compatibility */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'IT_SUPPORT']}>
              <OldUserManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="scripts" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'IT_SUPPORT', 'ACADEMIC_STAFF']}>
              <ScriptManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="incidents" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'IT_SUPPORT', 'SECURITY_STAFF']}>
              <IncidentManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'VICE_CHANCELLOR', 'REGISTRAR']}>
              <Analytics />
            </ProtectedRoute>
          } 
        />

        {/* Common routes */}
        <Route path="profile" element={<Profile />} />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute requiredRoles={['SUPER_ADMIN', 'INSTITUTION_ADMIN']}>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route path="help" element={<Help />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
