import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RootRedirect } from "@/components/auth/RedirectMiddleware";
import { Layout } from "@/components/layout/Layout";
import { UserRole } from "@/types/auth";
import { LoadingSpinner } from "@/components/ui/Loading";

// Lazy load pages for better performance
const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/DashboardPage").then((module) => ({
    default: module.DashboardPage,
  }))
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage").then((module) => ({
    default: module.NotFoundPage,
  }))
);
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  }))
);

// Super Admin Pages
const InstitutionsPage = lazy(() =>
  import("@/pages/InstitutionsPage").then((module) => ({
    default: module.InstitutionsPage,
  }))
);
const InstitutionDetailsPage = lazy(() =>
  import("@/pages/InstitutionDetailsPage").then((module) => ({
    default: module.InstitutionDetailsPage,
  }))
);
const UsersPage = lazy(() =>
  import("@/pages/UsersPage").then((module) => ({ default: module.UsersPage }))
);

// Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const StudentsPage = lazy(() =>
  import("@/pages/admin/StudentsPage").then((module) => ({
    default: module.default,
  }))
);
const InstructorsPage = lazy(() => import("@/pages/admin/InstructorsPage"));
const InstructorDetailPage = lazy(
  () => import("@/pages/admin/InstructorDetailPage")
);
const InstructorCreatePage = lazy(
  () => import("@/pages/admin/InstructorCreatePage")
);
const InstructorEditPage = lazy(
  () => import("@/pages/admin/InstructorEditPage")
);
const AdminUsersPage = lazy(() =>
  import("@/pages/admin/UsersPage").then((module) => ({
    default: module.UsersPage,
  }))
);
const FacultyPage = lazy(() =>
  import("@/pages/admin/FacultyPage").then((module) => ({
    default: module.FacultyPage,
  }))
);
const DepartmentsPage = lazy(() => import("@/pages/admin/DepartmentsPage"));
const DepartmentDetailsPage = lazy(
  () => import("@/pages/admin/DepartmentDetailsPage")
);
const CoursesPage = lazy(() => import("@/pages/admin/CoursesPage"));
const CourseDetailsPage = lazy(() => import("@/pages/admin/CourseDetailsPage"));

// Placeholder Pages
const ExamsPage = lazy(() =>
  import("@/pages/admin/PlaceholderPages").then((module) => ({
    default: module.ExamsPage,
  }))
);
const IncidentsPage = lazy(() =>
  import("@/pages/admin/PlaceholderPages").then((module) => ({
    default: module.IncidentsPage,
  }))
);
const ScriptsPage = lazy(() =>
  import("@/pages/admin/PlaceholderPages").then((module) => ({
    default: module.ScriptsPage,
  }))
);
const ReportsPage = lazy(() =>
  import("@/pages/admin/PlaceholderPages").then((module) => ({
    default: module.ReportsPage,
  }))
);
const AdminSettingsPage = lazy(() =>
  import("@/pages/admin/PlaceholderPages").then((module) => ({
    default: module.SettingsPage,
  }))
);

// Layout wrapper components for better organization
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-gray-50">
    <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
  </div>
);

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </Layout>
  </AuthGuard>
);

const SuperAdminLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN]}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

const AdminLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <RoleGuard allowedRoles={[UserRole.ADMIN]}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

const MultiRoleAdminLayout = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) => (
  <AuthGuard>
    <RoleGuard allowedRoles={allowedRoles}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicLayout>
            <LoginPage />
          </PublicLayout>
        }
      />

      {/* Root Redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Super Admin Routes */}
      <Route
        path="/dashboard"
        element={
          <SuperAdminLayout>
            <DashboardPage />
          </SuperAdminLayout>
        }
      />
      <Route
        path="/institutions"
        element={
          <SuperAdminLayout>
            <InstitutionsPage />
          </SuperAdminLayout>
        }
      />
      <Route
        path="/institutions/:id"
        element={
          <SuperAdminLayout>
            <InstitutionDetailsPage />
          </SuperAdminLayout>
        }
      />
      <Route
        path="/users"
        element={
          <SuperAdminLayout>
            <UsersPage />
          </SuperAdminLayout>
        }
      />

      {/* Institution Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/students"
        element={
          <MultiRoleAdminLayout
            allowedRoles={[
              UserRole.ADMIN,
              UserRole.FACULTY_ADMIN,
              UserRole.DEAN,
              UserRole.HOD,
            ]}
          >
            <StudentsPage mode={"list"} />
          </MultiRoleAdminLayout>
        }
      />
      <Route
        path="/admin/students/new"
        element={
          <MultiRoleAdminLayout
            allowedRoles={[
              UserRole.ADMIN,
              UserRole.FACULTY_ADMIN,
              UserRole.DEAN,
              UserRole.HOD,
            ]}
          >
            <StudentsPage mode={"create"} />
          </MultiRoleAdminLayout>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <MultiRoleAdminLayout
            allowedRoles={[
              UserRole.ADMIN,
              UserRole.FACULTY_ADMIN,
              UserRole.DEAN,
              UserRole.HOD,
            ]}
          >
            <StudentsPage mode={"view"} />
          </MultiRoleAdminLayout>
        }
      />
      <Route
        path="/admin/instructors"
        element={
          <MultiRoleAdminLayout
            allowedRoles={[
              UserRole.ADMIN,
              UserRole.FACULTY_ADMIN,
              UserRole.DEAN,
            ]}
          >
            <InstructorsPage />
          </MultiRoleAdminLayout>
        }
      />
      <Route
        path="/admin/instructors/create"
        element={
          <MultiRoleAdminLayout
            allowedRoles={[
              UserRole.ADMIN,
              UserRole.FACULTY_ADMIN,
              UserRole.DEAN,
            ]}
          >
            <InstructorCreatePage />
          </MultiRoleAdminLayout>
        }
      />
      <Route
        path="/admin/instructors/:id"
        element={
          <MultiRoleAdminLayout
            allowedRoles={[
              UserRole.ADMIN,
              UserRole.FACULTY_ADMIN,
              UserRole.DEAN,
            ]}
          >
            <InstructorDetailPage />
          </MultiRoleAdminLayout>
        }
      />
      <Route
        path="/admin/instructors/:id/edit"
        element={
          <MultiRoleAdminLayout
            allowedRoles={[
              UserRole.ADMIN,
              UserRole.FACULTY_ADMIN,
              UserRole.DEAN,
            ]}
          >
            <InstructorEditPage />
          </MultiRoleAdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <AdminUsersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/faculty"
        element={
          <AdminLayout>
            <FacultyPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/departments"
        element={
          <AdminLayout>
            <DepartmentsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/departments/:id"
        element={
          <AdminLayout>
            <DepartmentDetailsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <AdminLayout>
            <CoursesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/courses/:id"
        element={
          <AdminLayout>
            <CourseDetailsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/exams"
        element={
          <AdminLayout>
            <ExamsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/incidents"
        element={
          <AdminLayout>
            <IncidentsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/scripts"
        element={
          <AdminLayout>
            <ScriptsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <AdminLayout>
            <ReportsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminLayout>
            <AdminSettingsPage />
          </AdminLayout>
        }
      />

      {/* General Protected Routes - removed since we handle in role-specific dashboards */}
      <Route
        path="/settings"
        element={
          <ProtectedLayout>
            <SettingsPage />
          </ProtectedLayout>
        }
      />

      {/* 404 Page */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFoundPage />
          </PublicLayout>
        }
      />
    </Routes>
  );
}
