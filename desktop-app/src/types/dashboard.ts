// API Response Types
export interface SystemOverviewData {
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

export type SystemHealthStatus = 'healthy' | 'warning' | 'critical';

export interface SystemHealthData {
  success: boolean;
  data: {
    status: SystemHealthStatus;
    services: Array<{
      name: string;
      status: SystemHealthStatus;
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

export interface SystemMetricsData {
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

export interface AuditLogEntry {
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

export interface IncidentData {
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

export interface ExamData {
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

export interface InstitutionData {
  id: string;
  name: string;
  type: string;
  location: string;
  totalStudents: number;
  totalStaff: number;
  status: 'active' | 'inactive';
}

// Component Props Types
export interface StatCardProps {
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

export interface HealthIndicatorProps {
  label: string;
  value: string | number;
  status: "healthy" | "warning" | "critical";
  icon?: React.ReactNode;
}

export interface ActivityItemProps {
  activity: {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
    severity: "low" | "medium" | "high";
  };
}

export interface ChartCardProps {
  title: string;
  data: Array<{ name: string; value: number; color?: string }>;
  type: "bar" | "pie";
  className?: string;
}

// Time Range Options
export type TimeRange = '1d' | '7d' | '30d' | '90d';

// Dashboard State Types
export interface DashboardState {
  loading: boolean;
  refreshing: boolean;
  selectedTimeRange: TimeRange;
  exporting: boolean;
}

// Mock Data Types
export interface MockDashboardData {
  systemStats: {
    totalUsers: number;
    totalInstitutions: number;
    totalExams: number;
    totalIncidents: number;
    activeUsers: number;
    totalRevenue: number;
    serverLoad: number;
    storageUsed: number;
  };
  systemHealth: {
    database: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    cpu: number;
    disk: number;
    network: 'stable' | 'unstable';
    timestamp: string;
  };
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  institutionStats: Array<{ name: string; value: number; color: string }>;
  examStats: Array<{ name: string; value: number; color: string }>;
  regionalDistribution: Array<{ name: string; value: number; color: string }>;
}
