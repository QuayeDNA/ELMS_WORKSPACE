import {
  DashboardStats,
  QuickActions,
  RecentActivity,
  AcademicOverview,
} from "@/components/institution-admin";
import { InstitutionAnalyticsBentoGrid } from "@/components/institution-admin/InstitutionAnalyticsBentoGrid";
import { useAuthStore } from "@/stores/auth.store";

export function InstitutionAdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Institution Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.firstName} {user?.lastName}. Here's your
          institution overview.
        </p>
      </div>

      {/* Dashboard Statistics */}
      <DashboardStats />

      {/* Quick Actions */}
      <QuickActions />

      {/* Academic Overview & Upcoming Events */}
      <AcademicOverview />

      {/* Analytics Bento Grid */}
      <InstitutionAnalyticsBentoGrid />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
