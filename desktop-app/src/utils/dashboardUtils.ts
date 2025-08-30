import { TimeRange, MockDashboardData } from '../types/dashboard';

// Format uptime from seconds to human readable format
export const formatUptime = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

// Format file size from bytes to human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format number with commas
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

// Get status color classes for different statuses
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'healthy':
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'warning':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'critical':
    case 'error':
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'inactive':
    case 'pending':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  }
};

// Get severity color classes
export const getSeverityColor = (severity: string): string => {
  switch (severity.toLowerCase()) {
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'high':
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

// Generate mock data for development
export const generateMockData = (): MockDashboardData => ({
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
    database: 'healthy' as const,
    uptime: 2592000, // 30 days
    memory: {
      heapUsed: 2147483648, // 2GB
      heapTotal: 4294967296, // 4GB
      external: 1073741824, // 1GB
    },
    cpu: 23,
    disk: 67,
    network: 'stable' as const,
    timestamp: new Date().toISOString(),
  },
  recentActivity: [
    {
      id: '1',
      user: 'admin@ug.edu.gh',
      action: 'Created new institution',
      target: 'University of Development Studies',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      severity: 'medium' as const,
    },
    {
      id: '2',
      user: 'superadmin@system.gh',
      action: 'Updated user permissions for',
      target: 'john.doe@knust.edu.gh',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      severity: 'high' as const,
    },
    {
      id: '3',
      user: 'admin@ttu.edu.gh',
      action: 'Scheduled maintenance for',
      target: 'Database Server 2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      severity: 'low' as const,
    },
    {
      id: '4',
      user: 'system@automation.gh',
      action: 'Backup completed for',
      target: 'Exam Management System',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'low' as const,
    },
    {
      id: '5',
      user: 'security@system.gh',
      action: 'Security alert resolved for',
      target: 'Authentication Service',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      severity: 'high' as const,
    },
  ],
  institutionStats: [
    { name: 'Universities', value: 45, color: 'bg-blue-600' },
    { name: 'Colleges', value: 128, color: 'bg-green-600' },
    { name: 'Institutes', value: 89, color: 'bg-purple-600' },
    { name: 'Technical', value: 62, color: 'bg-orange-600' },
  ],
  examStats: [
    { name: 'Completed', value: 68, color: 'bg-green-500' },
    { name: 'In Progress', value: 22, color: 'bg-blue-500' },
    { name: 'Scheduled', value: 10, color: 'bg-yellow-500' },
  ],
  regionalDistribution: [
    { name: 'Greater Accra', value: 89, color: 'bg-blue-600' },
    { name: 'Ashanti', value: 67, color: 'bg-green-600' },
    { name: 'Western', value: 45, color: 'bg-purple-600' },
    { name: 'Northern', value: 34, color: 'bg-orange-600' },
    { name: 'Others', value: 89, color: 'bg-gray-600' },
  ],
});

// Time range options for the dashboard
export const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: '1d', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
];

// Export data as JSON
export const exportDashboardData = (data: unknown): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `system-overview-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Calculate percentage from value and total
export const calculatePercentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Get trend indicator
export const getTrendIndicator = (current: number, previous: number) => {
  const difference = current - previous;
  const percentage = previous !== 0 ? Math.abs((difference / previous) * 100) : 0;

  return {
    value: Math.round(percentage),
    isPositive: difference >= 0,
    label: 'from last period'
  };
};
