/**
 * Dashboard Types for Super Admin
 * 
 * Defines all TypeScript interfaces and types for the Super Admin Dashboard functionality
 */

export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  MAINTENANCE = 'maintenance'
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum AlertSource {
  SYSTEM = 'system',
  DATABASE = 'database',
  API = 'api',
  INSTITUTION = 'institution',
  USER = 'user',
  SECURITY = 'security'
}

export interface SystemOverview {
  totalInstitutions: number;
  activeInstitutions: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: HealthStatus;
  uptime: number;
  criticalAlerts: Alert[];
  lastUpdated: Date;
}

export interface RealTimeMetrics {
  concurrentUsers: number;
  apiRequestRate: number;
  averageResponseTime: number;
  systemLoad: SystemLoad;
  errorRates: ErrorRates;
  timestamp: Date;
}

export interface SystemLoad {
  cpu: number;
  memory: number;
  database: number;
  storage: number;
}

export interface ErrorRates {
  rate5xx: number;
  rate4xx: number;
  totalErrors: number;
  errorTrend: 'increasing' | 'decreasing' | 'stable';
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: AlertSource;
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  permissions: string[];
  enabled: boolean;
}

export interface AlertFilters {
  severity?: AlertSeverity[];
  source?: AlertSource[];
  resolved?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  limit?: number;
  offset?: number;
}

export interface PaginatedAlerts {
  alerts: Alert[];
  total: number;
  hasMore: boolean;
  filters: AlertFilters;
}

export interface DashboardSocketEvents {
  'metrics:update': RealTimeMetrics;
  'alert:new': Alert;
  'alert:resolved': { alertId: string };
  'system:health': HealthStatus;
}

// Request/Response interfaces
export interface GetOverviewResponse {
  data: SystemOverview;
  success: boolean;
  timestamp: string;
}

export interface GetMetricsResponse {
  data: RealTimeMetrics;
  success: boolean;
  timestamp: string;
}

export interface GetAlertsResponse {
  data: PaginatedAlerts;
  success: boolean;
  timestamp: string;
}

export interface GetQuickActionsResponse {
  data: QuickAction[];
  success: boolean;
  timestamp: string;
}

// Cache keys and TTL
export const CACHE_KEYS = {
  SYSTEM_OVERVIEW: 'superadmin:dashboard:overview',
  REAL_TIME_METRICS: 'superadmin:dashboard:metrics',
  ACTIVE_ALERTS: 'superadmin:dashboard:alerts',
  SYSTEM_HEALTH: 'superadmin:dashboard:health',
  QUICK_ACTIONS: 'superadmin:dashboard:quick-actions'
} as const;

export const CACHE_TTL = {
  OVERVIEW: 300, // 5 minutes
  METRICS: 30,   // 30 seconds
  ALERTS: 60,    // 1 minute
  HEALTH: 120,   // 2 minutes
  QUICK_ACTIONS: 3600 // 1 hour
} as const;

// Database models
export interface SystemMetricRecord {
  id: number;
  metricType: string;
  metricValue: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

export interface SystemAlertRecord {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  source: AlertSource;
  metadata: Record<string, any>;
  resolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
