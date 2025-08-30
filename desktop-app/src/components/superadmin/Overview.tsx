import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../../stores/authStore";
import {
  Shield,
  Users,
  Building2,
  Activity,
  Database,
  AlertTriangle,
  Clock,
  Server,
  Eye,
  UserCheck,
  CheckCircle,
  HardDrive,
  Cpu,
  Wifi,
  GraduationCap,
  RefreshCw,
  Download,
  MoreHorizontal,
  ArrowUpRight,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import Loader from '../ui/Loader'
import { realTimeService } from '../../services/realTimeService'

// API Response Types
interface SystemOverviewData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    recentActivity: number;
  };
  roleDistribution: Array<{
    role: string;
    count: number;
  }>;
  systemHealth: {
    database: { status: string; responseTime: string };
    redis: { status: string; responseTime: string };
    api: { status: string; uptime: string };
  };
  period: string;
}

interface SystemHealthData {
  success: boolean;
  data: {
    status: 'healthy' | 'warning' | 'critical';
    services: Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical';
      responseTime: number;
      uptime: number;
    }>;
    metrics: {
      cpuUsage: number;
      memoryUsage: number;
      diskUsage: number;
      uptime: number;
    };
  };
  message: string;
}

interface SystemMetricsData {
  success: boolean;
  data: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
    responseTime: number;
    errorRate: number;
    uptime: number;
  };
  message: string;
}

interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: Record<string, unknown>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface IncidentData {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  reportedBy: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface ExamData {
  id: string;
  name: string;
  courseCode: string;
  venue: string;
  date: string;
  time: string;
  duration: number;
  participants: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
}

interface InstitutionData {
  id: string;
  name: string;
  type: string;
  location: string;
  totalStudents: number;
  totalStaff: number;
  status: 'active' | 'inactive';
}

// LoadingButton: small wrapper around Button that shows a spinner when loading
export const LoadingButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; ariaLabel?: string }> = ({ loading = false, ariaLabel, children, className = '', ...rest }) => {
  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <Button
      {...buttonProps}
      className={className}
      aria-label={ariaLabel}
      disabled={loading || !!buttonProps.disabled}
    >
      {loading ? (
        <span className="flex items-center" aria-live="polite">
          <Loader size={16} className="text-current" />
          <span className="sr-only">{ariaLabel || 'Loading'}</span>
        </span>
      ) : (
        children
      )}
    </Button>
  )
}

// Reusable Components
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  className = "",
  onClick,
}) => {
  const baseClass = `bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 ${className}`;

  // Render a native button when interactive for proper accessibility, otherwise a static div.
  if (onClick) {
    return (
      <button
        type="button"
        className={`${baseClass} cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 focus:outline-none`}
        onClick={onClick}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          </div>
          <div className="text-primary">{icon}</div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            {trend.isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}% {trend.label}
            </span>
          </div>
        )}
      </button>
    );
  }

  return (
    <div className={baseClass}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          {trend.isPositive ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span
            className={
              trend.isPositive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
};

// Hoisted reusable panels
export const TopInstitutions: React.FC<{ items: { name: string; value: number }[] }> = ({ items }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Institutions</h3>
    <div className="space-y-3">
      {items.map((it, idx) => (
        <div key={it.name + idx} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">{String(idx + 1)}</div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{it.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{it.value} students</div>
            </div>
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">{it.value}</div>
        </div>
      ))}
    </div>
  </div>
)

export const RecentIncidents: React.FC<{ incidents: { id: string; title: string; status: string; reportedAt: string }[] }> = ({ incidents }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h3>
    <div className="space-y-3">
      {incidents.map(i => (
        <div key={i.id} className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-900 dark:text-white font-medium">{i.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(i.reportedAt).toLocaleString()}</div>
          </div>
          <div className={`px-2 py-1 rounded text-sm font-medium ${i.status === 'open' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>{i.status}</div>
        </div>
      ))}
    </div>
  </div>
)

export const AuditSummary: React.FC<{ logs: { id: string; actor: string; action: string; when: string }[] }> = ({ logs }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audit Summary</h3>
    <div className="space-y-2 max-h-56 overflow-y-auto">
      {logs.map(l => (
        <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
          <div className="min-w-0">
            <div className="text-sm text-gray-900 dark:text-white truncate">{l.actor} · <span className="font-medium">{l.action}</span></div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(l.when).toLocaleString()}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
)

interface HealthIndicatorProps {
  label: string;
  value: string | number;
  status: "healthy" | "warning" | "critical";
  icon?: React.ReactNode;
}

const HealthIndicator: React.FC<HealthIndicatorProps> = ({
  label,
  value,
  status,
  icon,
}) => {
  const statusColors = {
    healthy:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const statusIcons = {
    healthy: <CheckCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    critical: <XCircle className="h-4 w-4" />,
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex items-center gap-2">
        {icon || statusIcons[status]}
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-gray-900 dark:text-white font-medium">
          {value}
        </span>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
        >
          {status}
        </span>
      </div>
    </div>
  );
};







// Skeleton components
const StatCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
      </div>
      <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    <div className="mt-4 flex items-center">
      <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded mr-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
    </div>
  </div>
);



export const Overview: React.FC = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [exporting, setExporting] = useState(false);

  // State for real data from backend
  const [systemOverview, setSystemOverview] = useState<SystemOverviewData | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealthData | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetricsData | null>(null);
  const [recentAuditLogs, setRecentAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<IncidentData[]>([]);
  const [ongoingExams, setOngoingExams] = useState<ExamData[]>([]);
  const [topInstitutions, setTopInstitutions] = useState<InstitutionData[]>([]);

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  // Fetch system overview data
  const fetchSystemOverview = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/analytics/overview?period=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: SystemOverviewData = await response.json();
        setSystemOverview(data);
      }
    } catch (error) {
      console.error('Failed to fetch system overview:', error);
    }
  }, [token, selectedTimeRange, API_BASE_URL]);

  // Fetch system health data
  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/health`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: SystemHealthData = await response.json();
        setSystemHealth(data);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    }
  }, [token, API_BASE_URL]);

  // Fetch system metrics
  const fetchSystemMetrics = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/metrics`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: SystemMetricsData = await response.json();
        setSystemMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
    }
  }, [token, API_BASE_URL]);

  // Fetch recent audit logs
  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/audit/logs?limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRecentAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  }, [token, API_BASE_URL]);

  // Fetch active incidents
  const fetchActiveIncidents = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents?status=open&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveIncidents(data.incidents || []);
      }
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
    }
  }, [token, API_BASE_URL]);

  // Fetch ongoing exams
  const fetchOngoingExams = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/exams?status=ongoing&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setOngoingExams(data.exams || []);
      }
    } catch (error) {
      console.error('Failed to fetch exams:', error);
    }
  }, [token, API_BASE_URL]);

  // Fetch top institutions
  const fetchTopInstitutions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/institutions?sort=studentCount&limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTopInstitutions(data.institutions || []);
      }
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
    }
  }, [token, API_BASE_URL]);

  // Load all data
  const loadAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchSystemOverview(),
        fetchSystemHealth(),
        fetchSystemMetrics(),
        fetchAuditLogs(),
        fetchActiveIncidents(),
        fetchOngoingExams(),
        fetchTopInstitutions(),
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [
    fetchSystemOverview,
    fetchSystemHealth,
    fetchSystemMetrics,
    fetchAuditLogs,
    fetchActiveIncidents,
    fetchOngoingExams,
    fetchTopInstitutions,
  ]);

  // Initial data load
  useEffect(() => {
    if (token) {
      loadAllData().finally(() => setLoading(false));
    }
  }, [token, loadAllData]);

  // Set up real-time updates
  useEffect(() => {
    if (!token) return;

    // Subscribe to real-time events
    const unsubscribeMetrics = realTimeService.on('system:metrics_update', (event) => {
      console.log('Real-time metrics update:', event.data);
      // Update metrics in real-time
      if (event.data && typeof event.data === 'object' && !Array.isArray(event.data)) {
        setSystemMetrics(prev => prev ? { ...prev, data: { ...prev.data, ...(event.data as Record<string, unknown>) } } : null);
      }
    });

    const unsubscribeIncidents = realTimeService.on('incident:created', (event) => {
      console.log('New incident:', event.data);
      // Add new incident to the list
      if (event.data && typeof event.data === 'object') {
        setActiveIncidents(prev => [event.data as IncidentData, ...prev.slice(0, 4)]);
      }
    });

    const unsubscribeExams = realTimeService.on('exam:started', (event) => {
      console.log('Exam started:', event.data);
      // Update exam status
      if (event.data && typeof event.data === 'object') {
        setOngoingExams(prev => [event.data as ExamData, ...prev.slice(0, 4)]);
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeMetrics();
      unsubscribeIncidents();
      unsubscribeExams();
    };
  }, [token]);

  // Handle refresh
  const handleRefresh = () => {
    loadAllData();
  };

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      // Export current dashboard data as JSON
      const exportData = {
        systemOverview,
        systemHealth,
        systemMetrics,
        recentAuditLogs,
        activeIncidents,
        ongoingExams,
        topInstitutions,
        exportedAt: new Date().toISOString(),
      };

      const json = JSON.stringify(exportData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system-overview-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };



  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16" />
                  </div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 animate-pulse" />
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 8 }, (_, i) => (
              <StatCardSkeleton key={`stat-skeleton-${i}`} />
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={`content-skeleton-${i}`}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }, (_, j) => (
                    <div
                      key={j}
                      className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


    // panels are defined below as top-level components

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="h-8 w-8 text-red-600 dark:text-red-500" />
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  System Overview
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Complete system overview and administrative controls
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>

              <LoadingButton
                onClick={handleRefresh}
                loading={refreshing}
                ariaLabel={refreshing ? 'Refreshing data' : 'Refresh dashboard'}
                className="flex items-center gap-2"
              >
                <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Refresh</span>
              </LoadingButton>

              <LoadingButton
                onClick={handleExport}
                loading={exporting}
                ariaLabel={exporting ? 'Exporting data' : 'Export dashboard data'}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </LoadingButton>
            </div>
          </div>
        </div>

        {/* Primary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={systemOverview?.overview.totalUsers || 0}
            icon={<Users className="h-8 w-8 text-blue-600" />}
            trend={{ value: 12, isPositive: true, label: "from last month" }}
            onClick={() => console.log("Navigate to users")}
          />

          <StatCard
            title="Active Users"
            value={systemOverview?.overview.activeUsers || 0}
            icon={<UserCheck className="h-8 w-8 text-green-600" />}
            trend={{ value: 8, isPositive: true, label: "from last week" }}
            onClick={() => console.log("Navigate to active users")}
          />

          <StatCard
            title="Verified Users"
            value={systemOverview?.overview.verifiedUsers || 0}
            icon={<CheckCircle className="h-8 w-8 text-emerald-600" />}
            trend={{ value: 15, isPositive: true, label: "from last month" }}
            onClick={() => console.log("Navigate to verified users")}
          />

          <StatCard
            title="Recent Activity"
            value={systemOverview?.overview.recentActivity || 0}
            icon={<Activity className="h-8 w-8 text-purple-600" />}
            trend={{ value: 5, isPositive: true, label: "from last week" }}
            onClick={() => console.log("Navigate to activity logs")}
          />
        </div>

        {/* System Health & Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="System Status"
            value={systemHealth?.data.status === 'healthy' ? 'Healthy' : systemHealth?.data.status === 'warning' ? 'Warning' : 'Critical'}
            icon={<Server className="h-8 w-8 text-blue-600" />}
            className={systemHealth?.data.status === 'critical' ? 'border-red-200 dark:border-red-800' : systemHealth?.data.status === 'warning' ? 'border-yellow-200 dark:border-yellow-800' : ''}
          />

          <StatCard
            title="CPU Usage"
            value={systemMetrics ? `${systemMetrics.data.cpuUsage.toFixed(1)}%` : 'N/A'}
            icon={<Cpu className="h-8 w-8 text-orange-600" />}
            trend={{ value: 2, isPositive: false, label: "from last hour" }}
          />

          <StatCard
            title="Memory Usage"
            value={systemMetrics ? `${(systemMetrics.data.memoryUsage / 1024 / 1024 / 1024).toFixed(1)} GB` : 'N/A'}
            icon={<HardDrive className="h-8 w-8 text-green-600" />}
            trend={{ value: 5, isPositive: true, label: "from last hour" }}
          />

          <StatCard
            title="Active Connections"
            value={systemMetrics?.data.activeConnections || 0}
            icon={<Wifi className="h-8 w-8 text-indigo-600" />}
            trend={{ value: 8, isPositive: true, label: "from last hour" }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* System Health Details */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Server className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    System Health
                  </h2>
                </div>
                <Button variant="outline" className="p-2">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1">
                {systemHealth?.data.services.map((service) => (
                  <HealthIndicator
                    key={service.name}
                    label={service.name}
                    value={`${service.responseTime}ms`}
                    status={service.status}
                    icon={<Server className="h-4 w-4" />}
                  />
                ))}

                {systemMetrics && (
                  <>
                    <HealthIndicator
                      label="Uptime"
                      value={formatUptime(systemMetrics.data.uptime)}
                      status="healthy"
                      icon={<Clock className="h-4 w-4" />}
                    />
                    <HealthIndicator
                      label="Error Rate"
                      value={`${systemMetrics.data.errorRate.toFixed(2)}%`}
                      status={systemMetrics.data.errorRate > 5 ? 'warning' : 'healthy'}
                      icon={<AlertTriangle className="h-4 w-4" />}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Recent Audit Logs */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h2>
                </div>
                <Button variant="outline" className="p-2">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentAuditLogs.length > 0 ? recentAuditLogs.slice(0, 8).map((log) => (
                  <div key={log.id} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <Clock className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {log.user?.firstName} {log.user?.lastName}
                        </p>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                        {log.entityType}: {log.entityId}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No recent activity
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Roles</h3>
              <div className="space-y-3">
                {systemOverview?.roleDistribution.map((role, idx) => (
                  <div key={role.role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-green-600' : idx === 2 ? 'bg-purple-600' : 'bg-gray-600'
                      }`}>
                        {role.role.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {role.role.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {role.count} users
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                      {role.count}
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No role data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Active Incidents & Ongoing Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Incidents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Active Incidents
                </h2>
              </div>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-sm font-medium">
                {activeIncidents.length}
              </span>
            </div>

            <div className="space-y-3">
              {activeIncidents.length > 0 ? activeIncidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {incident.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Reported by {incident.reportedBy} • {new Date(incident.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    incident.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                    incident.severity === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {incident.severity}
                  </span>
                </div>
              )) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No active incidents
                </div>
              )}
            </div>
          </div>

          {/* Ongoing Exams */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Ongoing Exams
                </h2>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-sm font-medium">
                {ongoingExams.length}
              </span>
            </div>

            <div className="space-y-3">
              {ongoingExams.length > 0 ? ongoingExams.slice(0, 5).map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {exam.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {exam.venue} • {exam.participants} participants
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-xs font-medium">
                    {exam.duration}min
                  </span>
                </div>
              )) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No ongoing exams
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Institutions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Institutions</h3>
            <div className="space-y-3">
              {topInstitutions.length > 0 ? topInstitutions.slice(0, 5).map((institution, idx) => (
                <div key={institution.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">
                      {idx + 1}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {institution.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {institution.totalStudents} students • {institution.totalStaff} staff
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {institution.totalStudents}
                  </div>
                </div>
              )) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No institution data available
                </div>
              )}
            </div>
          </div>

          {/* System Metrics Chart Placeholder */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Performance</h3>
            <div className="space-y-4">
              {systemMetrics && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Response Time</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {systemMetrics.data.responseTime}ms
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(systemMetrics.data.responseTime / 10, 100)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Connections</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {systemMetrics.data.activeConnections}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${Math.min(systemMetrics.data.activeConnections / 10, 100)}%` }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-start gap-3 h-auto py-4 px-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-colors w-full"
                onClick={() => console.log("Navigate to users")}
              >
                <Users className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Manage Users
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Create, edit, delete users
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-gray-400" />
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-start gap-3 h-auto py-4 px-4 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-300 dark:hover:border-green-600 transition-colors w-full"
                onClick={() => console.log("Navigate to institutions")}
              >
                <Building2 className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Institutions
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Manage institutions
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-gray-400" />
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-start gap-3 h-auto py-4 px-4 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-600 transition-colors w-full"
                onClick={() => console.log("Navigate to audit")}
              >
                <Database className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Audit Logs
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    View system logs
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-gray-400" />
              </Button>

              <Button
                variant="outline"
                className="flex items-center justify-start gap-3 h-auto py-4 px-4 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-colors w-full"
                onClick={() => console.log("Navigate to monitoring")}
              >
                <Activity className="h-5 w-5 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    System Health
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Monitor system status
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 ml-auto text-gray-400" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
