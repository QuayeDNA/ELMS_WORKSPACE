// SuperAdmin Module Types
export interface Institution {
  id: string;
  name: string;
  code: string;
  type: 'university' | 'college' | 'institute' | 'technical';
  location: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  established: string;
  status: 'active' | 'inactive' | 'suspended';
  totalUsers: number;
  totalExams: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institutionId?: string;
  institution?: Institution;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  uptime: number; // seconds
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpu: number; // percentage
  disk: number; // percentage
  network: 'stable' | 'unstable' | 'down';
  timestamp: string;
}

export interface AnalyticsData {
  timeframe: string;
  totalUsers: number;
  totalInstitutions: number;
  totalExams: number;
  totalIncidents: number;
  activeUsers: number;
  userGrowth: Array<{ date: string; count: number }>;
  examStats: Array<{ status: string; count: number }>;
  institutionStats: Array<{ type: string; count: number }>;
  regionalDistribution: Array<{ region: string; count: number }>;
  revenue: number;
  serverLoad: number;
  storageUsed: number;
}

export interface SystemOverview {
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
  systemHealth: SystemHealth;
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  institutionStats: Array<{ name: string; value: number; color?: string }>;
  examStats: Array<{ name: string; value: number; color?: string }>;
  regionalDistribution: Array<{ name: string; value: number; color?: string }>;
}

export interface CreateInstitutionData {
  name: string;
  code: string;
  type: 'university' | 'college' | 'institute' | 'technical';
  location: string;
  contactEmail: string;
  contactPhone: string;
  website?: string;
  established: string;
}

export interface UpdateInstitutionData extends Partial<CreateInstitutionData> {
  status?: 'active' | 'inactive' | 'suspended';
}

export interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institutionId?: string;
  password?: string; // Optional for admin creation
}

export interface UpdateUserData extends Partial<CreateUserData> {
  isActive?: boolean;
}

export interface ConfigurationItem {
  key: string;
  value: unknown;
  description?: string;
  category: string;
}

export interface SuperAdminState {
  // Data
  institutions: Institution[];
  users: User[];
  auditLogs: AuditLog[];
  analytics: AnalyticsData | null;
  overview: SystemOverview | null;
  health: SystemHealth | null;

  // Loading states
  loading: {
    institutions: boolean;
    users: boolean;
    auditLogs: boolean;
    analytics: boolean;
    overview: boolean;
    health: boolean;
  };

  // Error states
  errors: {
    institutions: string | null;
    users: string | null;
    auditLogs: string | null;
    analytics: string | null;
    overview: string | null;
    health: string | null;
  };

  // Actions
  fetchInstitutions: () => Promise<void>;
  fetchUsers: (params?: Record<string, unknown>) => Promise<void>;
  fetchAuditLogs: (params?: Record<string, unknown>) => Promise<void>;
  fetchAnalytics: (timeframe?: string) => Promise<void>;
  fetchOverview: () => Promise<void>;
  fetchHealth: () => Promise<void>;

  createInstitution: (data: CreateInstitutionData) => Promise<Institution>;
  updateInstitution: (id: string, data: UpdateInstitutionData) => Promise<Institution>;
  deleteInstitution: (id: string) => Promise<void>;

  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (id: string, data: UpdateUserData) => Promise<User>;
  toggleUserStatus: (id: string, isActive: boolean) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;

  updateConfiguration: (configurations: ConfigurationItem[]) => Promise<void>;

  // Utility actions
  clearErrors: () => void;
  setLoading: (key: keyof SuperAdminState['loading'], loading: boolean) => void;
  setError: (key: keyof SuperAdminState['errors'], error: string | null) => void;
}

export interface UseSuperAdminOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export interface SuperAdminFilters {
  institutionId?: string;
  role?: string;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
