/**
 * Dashboard Service for Super Admin
 * 
 * Handles all business logic for dashboard functionality including
 * system metrics, alerts, and real-time data aggregation
 */

import { PrismaClient } from '@prisma/client';
import { Redis } from 'ioredis';
import { 
  SystemOverview, 
  RealTimeMetrics, 
  Alert, 
  AlertFilters, 
  PaginatedAlerts, 
  HealthStatus,
  QuickAction,
  SystemLoad,
  ErrorRates,
  CACHE_KEYS,
  CACHE_TTL,
  AlertSeverity
} from '../../../types/superadmin/dashboard/dashboard.types';
import { logger } from '../../../utils/logger';

export class DashboardService {
  private prisma: PrismaClient;
  private redis: Redis;

  constructor(prisma: PrismaClient, redis: Redis) {
    this.prisma = prisma;
    this.redis = redis;
  }

  /**
   * Get comprehensive system overview
   */
  async getSystemOverview(): Promise<SystemOverview> {
    try {
      // Check cache first
      const cached = await this.redis.get(CACHE_KEYS.SYSTEM_OVERVIEW);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get fresh data
      const [institutionStats, userStats, criticalAlerts, systemHealth] = await Promise.all([
        this.getInstitutionStats(),
        this.getUserStats(),
        this.getCriticalAlerts(),
        this.getSystemHealth()
      ]);

      const overview: SystemOverview = {
        totalInstitutions: institutionStats.total,
        activeInstitutions: institutionStats.active,
        totalUsers: userStats.total,
        activeUsers: userStats.active,
        systemHealth,
        uptime: this.calculateUptime(),
        criticalAlerts,
        lastUpdated: new Date()
      };

      // Cache the result
      await this.redis.setex(
        CACHE_KEYS.SYSTEM_OVERVIEW,
        CACHE_TTL.OVERVIEW,
        JSON.stringify(overview)
      );

      return overview;
    } catch (error) {
      logger.error('Error getting system overview:', error);
      throw new Error('Failed to retrieve system overview');
    }
  }

  /**
   * Get real-time system metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    try {
      // Check cache first
      const cached = await this.redis.get(CACHE_KEYS.REAL_TIME_METRICS);
      if (cached) {
        return JSON.parse(cached);
      }

      const [systemLoad, errorRates, apiMetrics] = await Promise.all([
        this.getSystemLoad(),
        this.getErrorRates(),
        this.getApiMetrics()
      ]);

      const metrics: RealTimeMetrics = {
        concurrentUsers: await this.getConcurrentUsers(),
        apiRequestRate: apiMetrics.requestRate,
        averageResponseTime: apiMetrics.averageResponseTime,
        systemLoad,
        errorRates,
        timestamp: new Date()
      };

      // Cache for short duration
      await this.redis.setex(
        CACHE_KEYS.REAL_TIME_METRICS,
        CACHE_TTL.METRICS,
        JSON.stringify(metrics)
      );

      return metrics;
    } catch (error) {
      logger.error('Error getting real-time metrics:', error);
      throw new Error('Failed to retrieve real-time metrics');
    }
  }

  /**
   * Get system alerts with filtering and pagination
   */
  async getActiveAlerts(filters: AlertFilters = {}): Promise<PaginatedAlerts> {
    try {
      const cacheKey = `${CACHE_KEYS.ACTIVE_ALERTS}:${JSON.stringify(filters)}`;
      const cached = await this.redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const where: any = {};

      // Apply filters
      if (filters.severity) {
        where.severity = { in: filters.severity };
      }
      if (filters.source) {
        where.source = { in: filters.source };
      }
      if (filters.resolved !== undefined) {
        where.resolved = filters.resolved;
      }
      if (filters.dateRange) {
        where.createdAt = {
          gte: filters.dateRange.start,
          lte: filters.dateRange.end
        };
      }

      const limit = filters.limit || 10;
      const offset = filters.offset || 0;

      const [alerts, total] = await Promise.all([
        this.prisma.systemAlert.findMany({
          where,
          orderBy: [
            { severity: 'desc' },
            { createdAt: 'desc' }
          ],
          take: limit,
          skip: offset
        }),
        this.prisma.systemAlert.count({ where })
      ]);

      const result: PaginatedAlerts = {
        alerts: alerts.map(this.mapAlertFromDB),
        total,
        hasMore: offset + limit < total,
        filters
      };

      // Cache the result
      await this.redis.setex(cacheKey, CACHE_TTL.ALERTS, JSON.stringify(result));

      return result;
    } catch (error) {
      logger.error('Error getting alerts:', error);
      throw new Error('Failed to retrieve alerts');
    }
  }

  /**
   * Get quick actions available to super admin
   */
  async getQuickActions(): Promise<QuickAction[]> {
    try {
      const cached = await this.redis.get(CACHE_KEYS.QUICK_ACTIONS);
      if (cached) {
        return JSON.parse(cached);
      }

      const quickActions: QuickAction[] = [
        {
          id: 'create-institution',
          title: 'Create Institution',
          description: 'Add a new educational institution to the system',
          icon: 'plus-circle',
          action: '/superadmin/institutions/create',
          permissions: ['institution.create'],
          enabled: true
        },
        {
          id: 'system-health',
          title: 'System Health Check',
          description: 'Run comprehensive system diagnostics',
          icon: 'activity',
          action: '/superadmin/system/health-check',
          permissions: ['system.monitor'],
          enabled: true
        },
        {
          id: 'backup-system',
          title: 'Backup System',
          description: 'Initiate system-wide backup',
          icon: 'download',
          action: '/superadmin/system/backup',
          permissions: ['system.backup'],
          enabled: true
        },
        {
          id: 'user-management',
          title: 'User Management',
          description: 'Manage users across all institutions',
          icon: 'users',
          action: '/superadmin/users',
          permissions: ['user.manage'],
          enabled: true
        },
        {
          id: 'generate-report',
          title: 'Generate Report',
          description: 'Create custom system reports',
          icon: 'file-text',
          action: '/superadmin/reports/generate',
          permissions: ['report.generate'],
          enabled: true
        },
        {
          id: 'maintenance-mode',
          title: 'Maintenance Mode',
          description: 'Toggle system maintenance mode',
          icon: 'settings',
          action: '/superadmin/system/maintenance',
          permissions: ['system.maintenance'],
          enabled: true
        }
      ];

      // Cache quick actions
      await this.redis.setex(
        CACHE_KEYS.QUICK_ACTIONS,
        CACHE_TTL.QUICK_ACTIONS,
        JSON.stringify(quickActions)
      );

      return quickActions;
    } catch (error) {
      logger.error('Error getting quick actions:', error);
      throw new Error('Failed to retrieve quick actions');
    }
  }

  /**
   * Create a new system alert
   */
  async createAlert(alertData: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    try {
      const alert = await this.prisma.systemAlert.create({
        data: {
          severity: alertData.severity,
          title: alertData.title,
          description: alertData.description,
          source: alertData.source,
          metadata: alertData.metadata,
          resolved: alertData.resolved
        }
      });

      // Clear alerts cache
      await this.clearAlertsCache();

      return this.mapAlertFromDB(alert);
    } catch (error) {
      logger.error('Error creating alert:', error);
      throw new Error('Failed to create alert');
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId: string): Promise<Alert> {
    try {
      const alert = await this.prisma.systemAlert.update({
        where: { id: alertId },
        data: {
          resolved: true,
          resolvedAt: new Date()
        }
      });

      // Clear alerts cache
      await this.clearAlertsCache();

      return this.mapAlertFromDB(alert);
    } catch (error) {
      logger.error('Error resolving alert:', error);
      throw new Error('Failed to resolve alert');
    }
  }

  // Private helper methods

  private async getInstitutionStats() {
    const [total, active] = await Promise.all([
      this.prisma.institution.count(),
      this.prisma.institution.count({
        where: { status: 'ACTIVE' }
      })
    ]);
    return { total, active };
  }

  private async getUserStats() {
    const [total, active] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          lastLogin: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);
    return { total, active };
  }

  private async getCriticalAlerts(): Promise<Alert[]> {
    const alerts = await this.prisma.systemAlert.findMany({
      where: {
        severity: AlertSeverity.CRITICAL,
        resolved: false
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return alerts.map(this.mapAlertFromDB);
  }

  private async getSystemHealth(): Promise<HealthStatus> {
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      // Check for critical alerts
      const criticalAlerts = await this.prisma.systemAlert.count({
        where: {
          severity: AlertSeverity.CRITICAL,
          resolved: false
        }
      });

      if (criticalAlerts > 0) {
        return HealthStatus.CRITICAL;
      }

      // Check system load (simplified)
      const systemLoad = await this.getSystemLoad();
      if (systemLoad.cpu > 90 || systemLoad.memory > 90) {
        return HealthStatus.WARNING;
      }

      return HealthStatus.HEALTHY;
    } catch (error) {
      logger.error('Health check failed:', error);
      return HealthStatus.CRITICAL;
    }
  }

  private calculateUptime(): number {
    // This would typically come from system monitoring
    // For now, return a mock value
    return 99.9;
  }

  private async getConcurrentUsers(): Promise<number> {
    // This would typically come from active session tracking
    // For now, return active users in last hour
    const activeUsers = await this.prisma.user.count({
      where: {
        lastLogin: {
          gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
        }
      }
    });
    return activeUsers;
  }

  private async getSystemLoad(): Promise<SystemLoad> {
    // This would typically come from system monitoring tools
    // For now, return mock data
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      database: Math.random() * 100,
      storage: Math.random() * 100
    };
  }

  private async getErrorRates(): Promise<ErrorRates> {
    // This would typically come from API monitoring
    // For now, return mock data
    return {
      rate5xx: Math.random() * 5,
      rate4xx: Math.random() * 10,
      totalErrors: Math.floor(Math.random() * 100),
      errorTrend: 'stable'
    };
  }

  private async getApiMetrics() {
    // This would typically come from API monitoring
    // For now, return mock data
    return {
      requestRate: Math.floor(Math.random() * 1000),
      averageResponseTime: Math.random() * 500
    };
  }

  private mapAlertFromDB(alert: any): Alert {
    return {
      id: alert.id,
      severity: alert.severity,
      title: alert.title,
      description: alert.description,
      source: alert.source,
      metadata: alert.metadata,
      resolved: alert.resolved,
      resolvedAt: alert.resolvedAt,
      createdAt: alert.createdAt,
      updatedAt: alert.updatedAt
    };
  }

  private async clearAlertsCache(): Promise<void> {
    const keys = await this.redis.keys(`${CACHE_KEYS.ACTIVE_ALERTS}*`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
