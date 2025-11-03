import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RootRedirect } from "@/components/auth/RedirectMiddleware";
import { Layout } from "@/components/layout/Layout";
import { UserRole } from "@/types/auth";
import { LoadingSpinner } from "@/components/ui/Loading";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import {
  NotFound,
  Unauthorized,
  Forbidden,
  ServerError,
} from "@/components/shared";

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
const SettingsPage = lazy(() =>
  import("@/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  }))
);

// Component Showcase (Development Only)
const ComponentShowcase = lazy(() =>
  import("@/pages/ComponentShowcase").then((module) => ({
    default: module.ComponentShowcase,
  }))
);

// Super Admin Pages
const InstitutionsPage = lazy(() =>
  import("@/pages/super-admin/InstitutionsPage").then((module) => ({
    default: module.InstitutionsPage,
  }))
);
const InstitutionDetailsPage = lazy(() =>
  import("@/pages/super-admin/InstitutionDetailsPage").then((module) => ({
    default: module.InstitutionDetailsPage,
  }))
);
const UsersPage = lazy(() =>
  import("@/pages/super-admin/UsersPage").then((module) => ({ default: module.UsersPage }))
);

// Institution Admin Pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

// Dean Pages
const DeanDashboard = lazy(() =>
  import("@/pages/dean").then((module) => ({
    default: module.DeanDashboard,
  }))
);

// HOD Pages
const HodDashboard = lazy(() =>
  import("@/pages/hod").then((module) => ({
    default: module.HodDashboard,
  }))
);

// Exams Officer Pages
const ExamsOfficerDashboard = lazy(() =>
  import("@/pages/exams-officer").then((module) => ({
    default: module.ExamsOfficerDashboard,
  }))
);

// Lecturer Pages
const LecturerDashboard = lazy(() =>
  import("@/pages/lecturer").then((module) => ({
    default: module.LecturerDashboard,
  }))
);

// Student Pages
const StudentDashboard = lazy(() =>
  import("@/pages/student").then((module) => ({
    default: module.StudentDashboard,
  }))
);

const StudentsPage = lazy(() =>
  import("@/pages/institution-admin/StudentsPage").then((module) => ({
    default: module.default,
  }))
);
const InstructorsPage = lazy(() => import("@/pages/institution-admin/InstructorsPage"));
const InstructorDetailPage = lazy(
  () => import("@/pages/institution-admin/InstructorDetailPage")
);
const InstructorCreatePage = lazy(
  () => import("@/pages/institution-admin/InstructorCreatePage")
);
const InstructorEditPage = lazy(
  () => import("@/pages/institution-admin/InstructorEditPage")
);
const AdminUsersPage = lazy(() =>
  import("@/pages/institution-admin/UsersPage").then((module) => ({
    default: module.UsersPage,
  }))
);
const FacultyPage = lazy(() =>
  import("@/pages/institution-admin/FacultyPage").then((module) => ({
    default: module.FacultyPage,
  }))
);
const DepartmentsPage = lazy(() => import("@/pages/institution-admin/DepartmentsPage"));
const DepartmentDetailsPage = lazy(
  () => import("@/pages/institution-admin/DepartmentDetailsPage")
);
const CoursesPage = lazy(() => import("@/pages/institution-admin/CoursesPage"));
const CourseDetailsPage = lazy(() => import("@/pages/institution-admin/CourseDetailsPage"));

// Academic Pages
const AcademicCalendarPage = lazy(() =>
  import("@/pages/institution-admin/AcademicCalendarPage")
);

const ExamTimetableListPage = lazy(() =>
  import("@/pages/admin/ExamTimetableListPage")
);
const ExamTimetableDetailPage = lazy(() =>
  import("@/pages/admin/ExamTimetableDetailPage")
);
const VenuesPage = lazy(() =>
  import("@/pages/admin/VenuesPage")
);

// Placeholder Pages
const IncidentsPage = lazy(() =>
  import("@/pages/institution-admin/PlaceholderPages").then((module) => ({
    default: module.IncidentsPage,
  }))
);
const ScriptsPage = lazy(() =>
  import("@/pages/institution-admin/PlaceholderPages").then((module) => ({
    default: module.ScriptsPage,
  }))
);
const ReportsPage = lazy(() =>
  import("@/pages/institution-admin/PlaceholderPages").then((module) => ({
    default: module.ReportsPage,
  }))
);
const AdminSettingsPage = lazy(() =>
  import("@/pages/institution-admin/PlaceholderPages").then((module) => ({
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

const DeanLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <RoleGuard allowedRoles={[UserRole.DEAN]}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

const HodLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <RoleGuard allowedRoles={[UserRole.HOD]}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

const ExamsOfficerLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <RoleGuard allowedRoles={[UserRole.EXAMS_OFFICER]}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

const LecturerLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <RoleGuard allowedRoles={[UserRole.LECTURER]}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

const StudentLayout = ({ children }: { children: React.ReactNode }) => (
  <AuthGuard>
    <RoleGuard allowedRoles={[UserRole.STUDENT]}>
      <Layout>
        <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
      </Layout>
    </RoleGuard>
  </AuthGuard>
);

export function AppRoutes() {
  return (
    <ErrorBoundary>
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

      {/* Academic Calendar Route - Unified */}
      <Route
        path="/admin/academic-calendar"
        element={
          <AdminLayout>
            <AcademicCalendarPage />
          </AdminLayout>
        }
      />

      {/* Examination Routes */}
      <Route
        path="/admin/exams"
        element={
          <AdminLayout>
            <ExamTimetableListPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/exams/:id"
        element={
          <AdminLayout>
            <ExamTimetableDetailPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/venues"
        element={
          <AdminLayout>
            <VenuesPage />
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

      {/* Dean Routes */}
      <Route
        path="/dean"
        element={
          <DeanLayout>
            <DeanDashboard />
          </DeanLayout>
        }
      />

      {/* HOD Routes */}
      <Route
        path="/hod"
        element={
          <HodLayout>
            <HodDashboard />
          </HodLayout>
        }
      />

      {/* Exams Officer Routes */}
      <Route
        path="/exams-officer"
        element={
          <ExamsOfficerLayout>
            <ExamsOfficerDashboard />
          </ExamsOfficerLayout>
        }
      />

      {/* Lecturer Routes */}
      <Route
        path="/lecturer"
        element={
          <LecturerLayout>
            <LecturerDashboard />
          </LecturerLayout>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
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

      {/* Component Showcase - Development Only */}
      <Route
        path="/showcase"
        element={
          <PublicLayout>
            <ComponentShowcase />
          </PublicLayout>
        }
      />

      {/* Error Pages */}
      <Route
        path="/unauthorized"
        element={
          <PublicLayout>
            <Unauthorized />
          </PublicLayout>
        }
      />
      <Route
        path="/forbidden"
        element={
          <PublicLayout>
            <Forbidden />
          </PublicLayout>
        }
      />
      <Route
        path="/server-error"
        element={
          <PublicLayout>
            <ServerError />
          </PublicLayout>
        }
      />

      {/* 404 Page - Must be last */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <NotFound />
          </PublicLayout>
        }
      />
      </Routes>
    </ErrorBoundary>
  );
}
