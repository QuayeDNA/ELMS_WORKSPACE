import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { InstitutionsPage } from '@/pages/InstitutionsPage';
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

          {/* Settings */}
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Layout>
                  <div className="p-6">
                    <h1>Settings - Coming Soon</h1>
                  </div>
                </Layout>
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
