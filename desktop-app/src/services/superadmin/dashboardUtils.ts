import { MockDashboardData } from '../../types/dashboard';

export class DashboardUtils {
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatRelativeTime(timestamp: string): string {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }

  static exportToCSV(data: MockDashboardData): string {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Total Users', data.systemStats.totalUsers],
      ['Active Users', data.systemStats.activeUsers],
      ['Total Institutions', data.systemStats.totalInstitutions],
      ['Total Exams', data.systemStats.totalExams],
      ['Server Load', `${data.systemStats.serverLoad}%`],
      ['Storage Used', this.formatBytes(data.systemStats.storageUsed)],
      ['Database Status', data.systemHealth.database],
      ['Uptime', `${data.systemHealth.uptime}%`],
      ['CPU Usage', `${data.systemHealth.cpu}%`],
      ['Memory Usage', `${data.systemHealth.memory.heapUsed / data.systemHealth.memory.heapTotal * 100}%`],
      ['Disk Usage', `${data.systemHealth.disk}%`]
    ];

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  static calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  static getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'active':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
}

export const dashboardUtils = DashboardUtils;
