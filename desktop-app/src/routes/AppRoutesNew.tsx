import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { Layout } from "../components/Layout";
import { AuthPage } from "../components/auth/AuthPage";
import { NotFoundPage } from "../components/NotFoundPage";
import { DashboardComponents } from "./RouteConfig";

// Import components
import { Overview } from '../components/superadmin/Overview'
import { InstitutionsList } from "../components/superadmin/InstitutionsList";
import { UserManagement } from "../components/users/UserManagement";
import { Profile } from "../components/common/Profile";
import { Help } from "../components/common/Help";

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
);

// Wrapper component for lazy-loaded components
const LazyWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

export const AppRouter: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  // If not authenticated, show auth routes
  if (!isAuthenticated) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Helper functions for route rendering
  const renderDashboardRoute = () => {
    const component = getDashboardComponent();
    return component;
  };

  const render404Route = () => {
    return <NotFoundPage />;
  };

  // Get the appropriate dashboard component based on user role
  const getDashboardComponent = () => {
    if (!user?.role) {
      return DashboardComponents.GUEST();
    }

    switch (user.role) {
      case 'SUPER_ADMIN':
        return <Overview />;
      case 'INSTITUTION_ADMIN':
        return DashboardComponents.INSTITUTION_ADMIN();
      case 'DEPARTMENT_HEAD':
        return DashboardComponents.DEPARTMENT_HEAD();
      case 'REGISTRY_STAFF':
        return DashboardComponents.REGISTRY_STAFF();
      case 'ACADEMIC_STAFF':
        return DashboardComponents.ACADEMIC_STAFF();
      case 'IT_SUPPORT':
        return DashboardComponents.IT_SUPPORT();
      case 'EXAM_OFFICER':
        return DashboardComponents.EXAM_OFFICER();
      case 'INVIGILATOR':
        return DashboardComponents.INVIGILATOR();
      case 'STUDENT':
        return DashboardComponents.STUDENT();
      case 'EXTERNAL_EXAMINER':
        return DashboardComponents.EXTERNAL_EXAMINER();
      case 'VICE_CHANCELLOR':
        return DashboardComponents.VICE_CHANCELLOR();
      case 'REGISTRAR':
        return DashboardComponents.REGISTRAR();
      case 'FINANCE_STAFF':
        return DashboardComponents.FINANCE_STAFF();
      case 'AUDITOR':
        return DashboardComponents.AUDITOR();
      case 'SECURITY_STAFF':
        return DashboardComponents.SECURITY_STAFF();
      case 'MAINTENANCE_STAFF':
        return DashboardComponents.MAINTENANCE_STAFF();
      default:
        return DashboardComponents.GUEST();
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Auth routes - when not authenticated */}
        {!isAuthenticated ? (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <>
            {/* Layout wrapper for ALL authenticated routes */}
            <Route path="/" element={<Layout />}>
              {/* Dashboard - role-based */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={
                <LazyWrapper>
                  {renderDashboardRoute()}
                </LazyWrapper>
              } />

              {/* Super Admin Routes */}
              <Route
                path="superadmin/overview"
                element={
                  <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                    <LazyWrapper>
                      <Overview />
                    </LazyWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="superadmin/users"
                element={
                  <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                    <LazyWrapper>
                      <UserManagement />
                    </LazyWrapper>
                  </ProtectedRoute>
                }
              />
              <Route
                path="superadmin/institutions"
                element={
                  <ProtectedRoute requiredRoles={["SUPER_ADMIN"]}>
                    <LazyWrapper>
                      <InstitutionsList />
                    </LazyWrapper>
                  </ProtectedRoute>
                }
              />

              {/* Common Routes */}
              <Route path="profile" element={<LazyWrapper><Profile /></LazyWrapper>} />
              <Route path="help" element={<LazyWrapper><Help /></LazyWrapper>} />

              {/* 404 Route - inside Layout for authenticated users */}
              <Route path="404" element={
                <LazyWrapper>
                  {render404Route()}
                </LazyWrapper>
              } />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
          </>
        )}
      </Routes>
    </Suspense>
  );
};
