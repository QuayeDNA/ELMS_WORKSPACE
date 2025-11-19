import { DashboardStats } from "@/components/super-admin/DashboardStats";
import { QuickActions } from "@/components/super-admin/QuickActions";
import { SystemStatus } from "@/components/super-admin/SystemStatus";
import { RecentActivity } from "@/components/super-admin/RecentActivity";
import { AnalyticsBentoGrid } from "@/components/shared/AnalyticsBentoGrid";
import { useAuthStore } from "@/stores/auth.store";

export function SuperAdminDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Super Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Welcome back, {user?.firstName} {user?.lastName}. Here's an overview
          of your system.
        </p>
      </div>

      {/* Dashboard Statistics */}
      <DashboardStats />

      {/* Quick Actions */}
      <QuickActions />

      {/* System Status & Alerts */}
      <SystemStatus />

      {/* Analytics Bento Grid */}
      <AnalyticsBentoGrid />

      {/* Recent Activity */}
      <RecentActivity />
    </div>
  );
}
