import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { useAuthStore } from '@/stores/auth.store';
import { UserRole } from '@/types/auth';
import './App.css';

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
          <Route path="/auth/login" element={<LoginPage />} />
          
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
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.ADMIN]}>
                  <Layout>
                    <div className="p-6">
                      <h1>Admin Panel - Coming Soon</h1>
                    </div>
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          
          {/* Faculty Routes */}
          <Route
            path="/faculty/*"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.FACULTY_ADMIN, UserRole.DEAN]}>
                  <Layout>
                    <div className="p-6">
                      <h1>Faculty Management - Coming Soon</h1>
                    </div>
                  </Layout>
                </RoleGuard>
              </AuthGuard>
            }
          />
          
          {/* Lecturer Routes */}
          <Route
            path="/lecturer/*"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.LECTURER]}>
                  <div className="p-6">
                    <h1>Lecturer Dashboard - Coming Soon</h1>
                  </div>
                </RoleGuard>
              </AuthGuard>
            }
          />
          
          {/* Student Routes */}
          <Route
            path="/student/*"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[UserRole.STUDENT]}>
                  <div className="p-6">
                    <h1>Student Dashboard - Coming Soon</h1>
                  </div>
                </RoleGuard>
              </AuthGuard>
            }
          />
          
          {/* Default Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
