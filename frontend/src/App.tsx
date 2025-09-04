import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { RootRedirect } from '@/components/auth/RedirectMiddleware';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { InstitutionsPage } from '@/pages/InstitutionsPage';
import { InstitutionDetailsPage } from '@/pages/InstitutionDetailsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';
import './App.css';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';
import { InstitutionAdminDashboard } from './pages/admin/InstitutionAdminDashboard';
import { UsersPage as AdminUsersPage } from './pages/admin/UsersPage';
import { FacultyPage } from './pages/admin/FacultyPage';
import DepartmentsPage from './pages/admin/DepartmentsPage';
import CoursesPage from './pages/admin/CoursesPage';
import { ExamsPage, IncidentsPage, ScriptsPage, ReportsPage, SettingsPage as AdminSettingsPage } from './pages/admin/PlaceholderPages';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize auth early in the app lifecycle
    initializeAuth();
  }, [initializeAuth]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Layout>
                  <DashboardPage />
                </Layout>
              </AuthGuard>
            }
          />

          {/* Institution Management (Super Admin Only) */}
          <Route
            path="/institutions"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <Layout>
                    <InstitutionsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/institutions/:id"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <Layout>
                    <InstitutionDetailsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* User Management */}
          <Route
            path="/users"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <Layout>
                    <UsersPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Institution Admin Dashboard */}
          <Route
            path="/admin/institution"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <InstitutionAdminDashboard />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <AdminUsersPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/faculty"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <FacultyPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/departments"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <DepartmentsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <CoursesPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/exams"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <ExamsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/incidents"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <IncidentsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/scripts"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <ScriptsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <ReportsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.ADMIN]}>
                  <Layout>
                    <AdminSettingsPage />
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Layout>
                  <SettingsPage />
                </Layout>
              </AuthGuard>
            }
          />
          
          {/* Root and Default Redirects */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
