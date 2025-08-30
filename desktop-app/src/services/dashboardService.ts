import {
  SystemOverviewData,
  SystemHealthData,
  SystemMetricsData,
  AuditLogEntry,
  IncidentData,
  ExamData,
  InstitutionData,
  TimeRange
} from '../types/dashboard';

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Generic API response handler
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      error: 'Network error',
      statusCode: response.status
    }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  return response.json();
};

export class DashboardService {
  private static instance: DashboardService;
  private token: string | null = null;

  private constructor() {}

  static getInstance(): DashboardService {
    if (!DashboardService.instance) {
      DashboardService.instance = new DashboardService();
    }
    return DashboardService.instance;
  }

  setToken(token: string): void {
    this.token = token;
  }

  // Fetch system overview data
  async fetchSystemOverview(period: TimeRange = '7d'): Promise<SystemOverviewData> {
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/analytics/overview?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return handleApiResponse<SystemOverviewData>(response);
    } catch (error) {
      console.error('Failed to fetch system overview:', error);
      throw error;
    }
  }

  // Fetch system health data
  async fetchSystemHealth(): Promise<SystemHealthData> {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/health`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return handleApiResponse<SystemHealthData>(response);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  }

  // Fetch system metrics
  async fetchSystemMetrics(): Promise<SystemMetricsData> {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/metrics`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return handleApiResponse<SystemMetricsData>(response);
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      throw error;
    }
  }

  // Fetch recent audit logs
  async fetchAuditLogs(limit: number = 10): Promise<{ logs: AuditLogEntry[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/superadmin/audit/logs?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return handleApiResponse<{ logs: AuditLogEntry[] }>(response);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      throw error;
    }
  }

  // Fetch active incidents
  async fetchActiveIncidents(limit: number = 5): Promise<{ incidents: IncidentData[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/incidents?status=open&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return handleApiResponse<{ incidents: IncidentData[] }>(response);
    } catch (error) {
      console.error('Failed to fetch incidents:', error);
      throw error;
    }
  }

  // Fetch ongoing exams
  async fetchOngoingExams(limit: number = 5): Promise<{ exams: ExamData[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/exams?status=ongoing&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return handleApiResponse<{ exams: ExamData[] }>(response);
    } catch (error) {
      console.error('Failed to fetch exams:', error);
      throw error;
    }
  }

  // Fetch top institutions
  async fetchTopInstitutions(limit: number = 5): Promise<{ institutions: InstitutionData[] }> {
    try {
      const response = await fetch(`${API_BASE_URL}/institutions?sort=studentCount&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      return handleApiResponse<{ institutions: InstitutionData[] }>(response);
    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      throw error;
    }
  }

  // Fetch all dashboard data in parallel
  async fetchAllDashboardData(period: TimeRange = '7d'): Promise<{
    systemOverview: SystemOverviewData | null;
    systemHealth: SystemHealthData | null;
    systemMetrics: SystemMetricsData | null;
    auditLogs: AuditLogEntry[];
    activeIncidents: IncidentData[];
    ongoingExams: ExamData[];
    topInstitutions: InstitutionData[];
  }> {
    try {
      const [
        systemOverview,
        systemHealth,
        systemMetrics,
        auditLogs,
        activeIncidents,
        ongoingExams,
        topInstitutions,
      ] = await Promise.allSettled([
        this.fetchSystemOverview(period),
        this.fetchSystemHealth(),
        this.fetchSystemMetrics(),
        this.fetchAuditLogs().then(data => data.logs),
        this.fetchActiveIncidents().then(data => data.incidents),
        this.fetchOngoingExams().then(data => data.exams),
        this.fetchTopInstitutions().then(data => data.institutions),
      ]);

      return {
        systemOverview: systemOverview.status === 'fulfilled' ? systemOverview.value : null,
        systemHealth: systemHealth.status === 'fulfilled' ? systemHealth.value : null,
        systemMetrics: systemMetrics.status === 'fulfilled' ? systemMetrics.value : null,
        auditLogs: auditLogs.status === 'fulfilled' ? auditLogs.value : [],
        activeIncidents: activeIncidents.status === 'fulfilled' ? activeIncidents.value : [],
        ongoingExams: ongoingExams.status === 'fulfilled' ? ongoingExams.value : [],
        topInstitutions: topInstitutions.status === 'fulfilled' ? topInstitutions.value : [],
      };
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const dashboardService = DashboardService.getInstance();
