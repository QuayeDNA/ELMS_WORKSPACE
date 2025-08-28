import type {
  Institution,
  User,
  AuditLog,
  AnalyticsData,
  SystemOverview,
  SystemHealth,
  ConfigurationItem,
  CreateInstitutionData,
  UpdateInstitutionData,
  CreateUserData,
  UpdateUserData,
  PaginatedResponse
} from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class SuperAdminApiClient {
  private static instance: SuperAdminApiClient;
  private baseUrl: string;
  private token: string | null = null;

  private constructor() {
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
  }

  static getInstance(): SuperAdminApiClient {
    if (!SuperAdminApiClient.instance) {
      SuperAdminApiClient.instance = new SuperAdminApiClient();
    }
    return SuperAdminApiClient.instance;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/superadmin${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  // Institution Management
  async getInstitutions(): Promise<Institution[]> {
    return this.request<Institution[]>('/institutions');
  }

  async getInstitution(id: string): Promise<Institution> {
    return this.request<Institution>(`/institutions/${id}`);
  }

  async createInstitution(data: CreateInstitutionData): Promise<Institution> {
    return this.request<Institution>('/institutions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInstitution(id: string, data: UpdateInstitutionData): Promise<Institution> {
    return this.request<Institution>(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInstitution(id: string): Promise<void> {
    return this.request<void>(`/institutions/${id}`, {
      method: 'DELETE',
    });
  }

  // User Management
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    institutionId?: string;
    isActive?: boolean;
  } = {}): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/users?${queryString}` : '/users';
    return this.request<PaginatedResponse<User>>(endpoint);
  }

  async getUser(id: string): Promise<User> {
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: CreateUserData): Promise<User> {
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return this.request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async toggleUserStatus(id: string, isActive: boolean): Promise<User> {
    return this.request<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.request<void>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Audit Logs
  async getAuditLogs(params: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: string;
    endDate?: string;
  } = {}): Promise<PaginatedResponse<AuditLog>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/audit-logs?${queryString}` : '/audit-logs';
    return this.request<PaginatedResponse<AuditLog>>(endpoint);
  }

  // Analytics
  async getAnalytics(timeframe: string = '7d'): Promise<AnalyticsData> {
    return this.request<AnalyticsData>(`/analytics?timeframe=${timeframe}`);
  }

  // System Overview
  async getOverview(): Promise<SystemOverview> {
    return this.request<SystemOverview>('/overview');
  }

  // System Health
  async getHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/health');
  }

  // Configuration
  async getConfiguration(): Promise<ConfigurationItem[]> {
    return this.request<ConfigurationItem[]>('/configuration');
  }

  async updateConfiguration(configurations: ConfigurationItem[]): Promise<void> {
    return this.request<void>('/configuration', {
      method: 'PUT',
      body: JSON.stringify({ configurations }),
    });
  }

  // Bulk Operations
  async bulkCreateUsers(data: CreateUserData[]): Promise<User[]> {
    return this.request<User[]>('/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ users: data }),
    });
  }

  async bulkUpdateUsers(updates: Array<{ id: string; data: UpdateUserData }>): Promise<User[]> {
    return this.request<User[]>('/users/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async bulkDeleteUsers(ids: string[]): Promise<void> {
    return this.request<void>('/users/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    });
  }

  // Export Operations
  async exportUsers(params: {
    format: 'csv' | 'xlsx';
    institutionId?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/superadmin/users/export?${queryParams.toString()}`, {
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
    });

    if (!response.ok) {
      throw new ApiError(`Export failed: ${response.statusText}`, response.status);
    }

    return response.blob();
  }

  async exportAuditLogs(params: {
    format: 'csv' | 'xlsx';
    startDate?: string;
    endDate?: string;
    userId?: string;
    action?: string;
  }): Promise<Blob> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}/superadmin/audit-logs/export?${queryParams.toString()}`, {
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : '',
      },
    });

    if (!response.ok) {
      throw new ApiError(`Export failed: ${response.statusText}`, response.status);
    }

    return response.blob();
  }
}

// Export singleton instance
export const superAdminApi = SuperAdminApiClient.getInstance();
