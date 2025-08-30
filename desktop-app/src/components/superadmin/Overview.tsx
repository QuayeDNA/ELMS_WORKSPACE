import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/Skeleton';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { StatCard } from '@/components/dashboard/StatCard';
import { HealthIndicator } from '@/components/dashboard/HealthIndicator';
import { DashboardService } from '@/services/superadmin/dashboardService';
import { dashboardUtils } from '@/services/superadmin/dashboardUtils';
import { useAuthStore } from '@/stores/authStore';
import {
  MockDashboardData,
  SystemHealthData,
  HealthIndicatorProps
} from '@/types/dashboard';

// Define types for the component
interface DashboardStats {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: string;
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error';
}

export const Overview: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<MockDashboardData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuthStore();
  // const realtimeService = realTimeService;

  const fetchDashboardData = useCallback(async () => {
    if (!token) return;

    try {
      setError(null);
      const service = DashboardService.getInstance();
      service.setToken(token);

      const [overview, health] = await Promise.all([
        service.fetchSystemOverview(),
        service.fetchSystemHealth()
      ]);

      // Transform the data to match our component's expected format
      const mockData: MockDashboardData = {
        systemStats: {
          totalUsers: overview.overview.totalUsers,
          totalInstitutions: 0, // We'll need to fetch this separately
          totalExams: 0,
          totalIncidents: 0,
          activeUsers: overview.overview.activeUsers,
          totalRevenue: 0,
          serverLoad: 0,
          storageUsed: 0
        },
        systemHealth: {
          database: health.data.status,
          uptime: health.data.metrics.uptime,
          memory: {
            heapUsed: health.data.metrics.memoryUsage,
            heapTotal: 100,
            external: 0
          },
          cpu: health.data.metrics.cpuUsage,
          disk: health.data.metrics.diskUsage,
          network: 'stable',
          timestamp: new Date().toISOString()
        },
        recentActivity: [],
        institutionStats: [],
        examStats: [],
        regionalDistribution: []
      };

      setDashboardData(mockData);
      setSystemHealth(health);

      // Mock recent activities
      setRecentActivities([
        {
          id: '1',
          user: 'System',
          action: 'Health check completed',
          timestamp: new Date().toISOString(),
          type: 'success'
        }
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  }, [fetchDashboardData]);

  const handleExportData = useCallback(async () => {
    if (!dashboardData || !token) return;

    try {
      const csvData = dashboardUtils.exportToCSV(dashboardData);
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to export data');
    }
  }, [dashboardData, token]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Realtime functionality removed for now

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">System Overview</h1>
          <Button onClick={handleRefresh} variant="outline">
            Retry
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p className="text-lg font-medium mb-2">Error Loading Dashboard</p>
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dashboardData || !systemHealth) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">System Overview</h1>
          <Button onClick={handleRefresh} variant="outline">
            Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-600">
              <p className="text-lg font-medium">No Data Available</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats: DashboardStats[] = [
    {
      title: 'Total Users',
      value: dashboardData.systemStats.totalUsers.toString(),
      change: 5.2, // Mock change data
      changeType: 'increase',
      icon: 'users'
    },
    {
      title: 'Active Users',
      value: dashboardData.systemStats.activeUsers.toString(),
      change: 2.1,
      changeType: 'increase',
      icon: 'activity'
    },
    {
      title: 'Server Load',
      value: `${dashboardData.systemHealth.cpu}%`,
      change: -1.5,
      changeType: 'decrease',
      icon: 'cpu'
    },
    {
      title: 'System Uptime',
      value: `${dashboardData.systemHealth.uptime}%`,
      change: 0.1,
      changeType: 'increase',
      icon: 'clock'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Overview</h1>
          <p className="text-muted-foreground">
            Monitor your system's performance and health
          </p>
        </div>
        <div className="flex gap-2">
          <LoadingButton
            onClick={handleRefresh}
            loading={isRefreshing}
          >
            Refresh
          </LoadingButton>
          <Button onClick={handleExportData} variant="outline">
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <HealthIndicator
                label="Database"
                value={dashboardData.systemHealth.database}
                status={dashboardData.systemHealth.database as HealthIndicatorProps['status']}
              />
              <HealthIndicator
                label="CPU Usage"
                value={`${dashboardData.systemHealth.cpu}%`}
                status={dashboardData.systemHealth.cpu > 80 ? 'critical' : dashboardData.systemHealth.cpu > 60 ? 'warning' : 'healthy'}
              />
              <HealthIndicator
                label="Memory Usage"
                value={`${dashboardData.systemHealth.memory.heapUsed}%`}
                status={dashboardData.systemHealth.memory.heapUsed > 80 ? 'critical' : dashboardData.systemHealth.memory.heapUsed > 60 ? 'warning' : 'healthy'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.user} • {dashboardUtils.formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    activity.type === 'success' ? 'bg-green-100 text-green-800' :
                    activity.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {activity.type}
                  </div>
                </div>
              ))}
              {recentActivities.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
