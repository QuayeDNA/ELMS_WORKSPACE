import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import {
  Shield,
  Users,
  Building2,
  Activity,
  Database,
  Settings,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Server,
  Eye,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Globe,
  FileText,
  Monitor,
  HardDrive,
  Cpu,
  Wifi,
  GraduationCap,
  DollarSign,
  RefreshCw,
  Download,
  MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import { DSButton, DSCard } from '../../design-system/primitives'
import Loader from '../ui/Loader'

// LoadingButton: small wrapper around DSButton that shows a spinner when loading
export const LoadingButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean; ariaLabel?: string }> = ({ loading = false, ariaLabel, children, className = '', ...rest }) => {
  const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>
  return (
    <DSButton
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
    </DSButton>
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

interface ActivityItemProps {
  activity: {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
  };
}

const ActivityItem: React.FC<ActivityItemProps> = ({ activity }) => {
  const severityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  return (
    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
      <Clock className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {activity.user}
          </p>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              severityColors[activity.severity]
            }`}
          >
            {activity.severity}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
          {activity.action}{" "}
          <span className="font-medium">{activity.target}</span>
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

interface ChartCardProps {
  title: string;
  data: Array<{ name: string; value: number; color?: string }>;
  type: "bar" | "pie";
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  data,
  type,
  className = "",
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {title}
      </h3>

      {type === "bar" && (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={item.name ?? index} className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-24 truncate">
                {item.name}
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    item.color || "bg-blue-600"
                  } transition-all duration-500`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {type === "pie" && (
        <div className="grid grid-cols-1 gap-2">
          {data.map((item, index) => (
            <div key={item.name ?? index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    item.color || "bg-blue-600"
                  }`}
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      )}
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

// Mock Data
const generateMockData = () => ({
  systemStats: {
    totalUsers: 15847,
    totalInstitutions: 324,
    totalExams: 2156,
    totalIncidents: 23,
    activeUsers: 8934,
    totalRevenue: 142850,
    serverLoad: 67,
    storageUsed: 73,
  },
  systemHealth: {
    database: "healthy" as const,
    uptime: 2592000, // 30 days
    memory: {
      heapUsed: 2147483648, // 2GB
      heapTotal: 4294967296, // 4GB
      external: 1073741824, // 1GB
    },
    cpu: 23,
    disk: 67,
    network: "stable" as const,
    timestamp: new Date().toISOString(),
  },
  recentActivity: [
    {
      id: "1",
      user: "admin@ug.edu.gh",
      action: "Created new institution",
      target: "University of Development Studies",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: "medium" as const,
    },
    {
      id: "2",
      user: "superadmin@system.gh",
      action: "Updated user permissions for",
      target: "john.doe@knust.edu.gh",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      severity: "high" as const,
    },
    {
      id: "3",
      user: "admin@ttu.edu.gh",
      action: "Scheduled maintenance for",
      target: "Database Server 2",
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      severity: "low" as const,
    },
    {
      id: "4",
      user: "system@automation.gh",
      action: "Backup completed for",
      target: "Exam Management System",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: "low" as const,
    },
    {
      id: "5",
      user: "security@system.gh",
      action: "Security alert resolved for",
      target: "Authentication Service",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: "high" as const,
    },
  ],
  institutionStats: [
    { name: "Universities", value: 45, color: "bg-blue-600" },
    { name: "Colleges", value: 128, color: "bg-green-600" },
    { name: "Institutes", value: 89, color: "bg-purple-600" },
    { name: "Technical", value: 62, color: "bg-orange-600" },
  ],
  examStats: [
    { name: "Completed", value: 68, color: "bg-green-500" },
    { name: "In Progress", value: 22, color: "bg-blue-500" },
    { name: "Scheduled", value: 10, color: "bg-yellow-500" },
  ],
  regionalDistribution: [
    { name: "Greater Accra", value: 89, color: "bg-blue-600" },
    { name: "Ashanti", value: 67, color: "bg-green-600" },
    { name: "Western", value: 45, color: "bg-purple-600" },
    { name: "Northern", value: 34, color: "bg-orange-600" },
    { name: "Others", value: 89, color: "bg-gray-600" },
  ],
});

export const SuperAdminDashboard: React.FC = () => {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [data, setData] = useState(generateMockData());
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [token]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatMemory = (bytes: number) => {
    return `${Math.round(bytes / 1024 / 1024)} MB`;
  };

  const handleRefresh = () => {
    setLoading(true);
    // Simulate refresh with new data
    setTimeout(() => {
      setData(generateMockData());
      setLoading(false);
    }, 1000);
  };

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

  // Utilities
  const downloadCSV = (
    filename: string,
    rows: Array<Record<string, string | number | boolean | null>>
  ) => {
    if (!rows || rows.length === 0) return
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map((r) =>
        headers
          .map((h) => {
            const val = r[h]
            if (val === null || val === undefined) return ''
            return `"${String(val).replace(/"/g, '""')}"`
          })
          .join(',')
      ),
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
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
                  Super Admin Dashboard
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
                loading={loading}
                ariaLabel={loading ? 'Refreshing data' : 'Refresh dashboard'}
                className="flex items-center gap-2"
              >
                <span className="flex items-center gap-2"><RefreshCw className="h-4 w-4" /> Refresh</span>
              </LoadingButton>

              <LoadingButton
                onClick={async () => {
                  setExporting(true)
                  try {
                    // simulate generation time for large CSVs
                    await new Promise((res) => setTimeout(res, 350))
                    downloadCSV(
                      'recent_activity.csv',
                      data.recentActivity.map((r) => ({
                        id: r.id,
                        user: r.user,
                        action: r.action,
                        target: r.target,
                        timestamp: r.timestamp,
                        severity: r.severity,
                      }))
                    )
                  } finally {
                    setExporting(false)
                  }
                }}
                loading={exporting}
                ariaLabel={exporting ? 'Exporting report' : 'Export recent activity'}
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
            value={data.systemStats.totalUsers}
            icon={<Users className="h-8 w-8 text-blue-600" />}
            trend={{ value: 12, isPositive: true, label: "from last month" }}
            onClick={() => console.log("Navigate to users")}
          />

          <StatCard
            title="Active Users"
            value={data.systemStats.activeUsers}
            icon={<UserCheck className="h-8 w-8 text-green-600" />}
            trend={{ value: 8, isPositive: true, label: "from last week" }}
            onClick={() => console.log("Navigate to active users")}
          />

          <StatCard
            title="Institutions"
            value={data.systemStats.totalInstitutions}
            icon={<Building2 className="h-8 w-8 text-purple-600" />}
            trend={{ value: 5, isPositive: true, label: "new this month" }}
            onClick={() => console.log("Navigate to institutions")}
          />

          <StatCard
            title="Total Exams"
            value={data.systemStats.totalExams}
            icon={<GraduationCap className="h-8 w-8 text-indigo-600" />}
            trend={{ value: 15, isPositive: true, label: "from last month" }}
            onClick={() => console.log("Navigate to exams")}
          />
        </div>

        {/* Secondary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="System Revenue"
            value={`₵${data.systemStats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-8 w-8 text-emerald-600" />}
            trend={{ value: 23, isPositive: true, label: "from last quarter" }}
          />

          <StatCard
            title="Security Incidents"
            value={data.systemStats.totalIncidents}
            icon={<AlertTriangle className="h-8 w-8 text-orange-600" />}
            trend={{ value: 12, isPositive: false, label: "from last week" }}
            className="border-orange-200 dark:border-orange-800"
          />

          <StatCard
            title="Server Load"
            value={`${data.systemStats.serverLoad}%`}
            icon={<Cpu className="h-8 w-8 text-blue-600" />}
            trend={{ value: 5, isPositive: false, label: "from last hour" }}
          />

          <StatCard
            title="Storage Used"
            value={`${data.systemStats.storageUsed}%`}
            icon={<HardDrive className="h-8 w-8 text-gray-600" />}
            trend={{ value: 3, isPositive: true, label: "from last month" }}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* System Health */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Server className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    System Health
                  </h2>
                </div>
                <DSButton variant="outline" className="p-2">
                  <Eye className="h-4 w-4" />
                </DSButton>
              </div>

              <div className="space-y-1">
                <HealthIndicator
                  label="Database"
                  value="Online"
                  status="healthy"
                  icon={<Database className="h-4 w-4" />}
                />
                <HealthIndicator
                  label="API Gateway"
                  value="Operational"
                  status="healthy"
                  icon={<Globe className="h-4 w-4" />}
                />
                <HealthIndicator
                  label="Authentication"
                  value="Active"
                  status="healthy"
                  icon={<Shield className="h-4 w-4" />}
                />
                <HealthIndicator
                  label="File Storage"
                  value={`${data.systemStats.storageUsed}% Used`}
                  status={
                    data.systemStats.storageUsed > 80 ? "warning" : "healthy"
                  }
                  icon={<HardDrive className="h-4 w-4" />}
                />
                <HealthIndicator
                  label="Memory Usage"
                  value={formatMemory(data.systemHealth.memory.heapUsed)}
                  status={
                    data.systemHealth.memory.heapUsed /
                      data.systemHealth.memory.heapTotal >
                    0.8
                      ? "warning"
                      : "healthy"
                  }
                  icon={<Monitor className="h-4 w-4" />}
                />
                <HealthIndicator
                  label="Network"
                  value="Stable"
                  status="healthy"
                  icon={<Wifi className="h-4 w-4" />}
                />
                <HealthIndicator
                  label="Uptime"
                  value={formatUptime(data.systemHealth.uptime)}
                  status="healthy"
                  icon={<Clock className="h-4 w-4" />}
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Activity className="h-6 w-6 text-green-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                  </h2>
                </div>
                <DSButton variant="outline" className="p-2">
                  <MoreHorizontal className="h-4 w-4" />
                </DSButton>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {data.recentActivity.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            </div>
          </div>

          {/* Institution Statistics */}
          <div className="xl:col-span-1">
            <ChartCard
              title="Institution Types"
              data={data.institutionStats}
              type="bar"
              className="h-full"
            />
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Exam Statistics */}
          <ChartCard
            title="Exam Status Distribution"
            data={data.examStats}
            type="pie"
          />

          {/* Regional Distribution */}
          <ChartCard
            title="Regional Institution Distribution"
            data={data.regionalDistribution}
            type="bar"
          />
        </div>

        {/* Supplemental Panels (responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <TopInstitutions items={data.institutionStats.map(i => ({ name: i.name, value: i.value }))} />
          <RecentIncidents incidents={data.recentActivity.map(a => ({ id: a.id, title: `${a.action} ${a.target}`, status: a.severity === 'high' ? 'open' : 'resolved', reportedAt: a.timestamp }))} />
          <AuditSummary logs={data.recentActivity.slice(0, 8).map(a => ({ id: a.id, actor: a.user, action: `${a.action} ${a.target}`, when: a.timestamp }))} />
        </div>

        {/* Quick Actions */}
          <DSCard className="">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <DSButton
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
            </DSButton>

            <DSButton
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
            </DSButton>

            <DSButton
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
            </DSButton>

            <DSButton
              variant="outline"
              className="flex items-center justify-start gap-3 h-auto py-4 px-4 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-600 transition-colors w-full"
              onClick={() => console.log("Navigate to settings")}
            >
              <Settings className="h-5 w-5 text-orange-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  Settings
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Manage system settings
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto text-gray-400" />
            </DSButton>

            <DSButton
              variant="outline"
              className="flex items-center justify-start gap-3 h-auto py-4 px-4 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 transition-colors w-full"
              onClick={() => console.log("Navigate to reports")}
            >
              <FileText className="h-5 w-5 text-red-600" />
              <div className="text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  Reports
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  View system reports
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 ml-auto text-gray-400" />
            </DSButton>


          </div>
        </DSCard>
      </div>
    </div>
  );
};
