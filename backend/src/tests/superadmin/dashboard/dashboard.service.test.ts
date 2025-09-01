/**
 * Dashboard Service Tests
 * 
 * Unit tests for the Dashboard service to ensure proper functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DashboardService } from '../../../services/superadmin/dashboard/dashboard.service';
import { HealthStatus, AlertSeverity } from '../../../types/superadmin/dashboard/dashboard.types';

// Mock Prisma Client
const mockPrisma = {
  institution: {
    count: vi.fn()
  },
  user: {
    count: vi.fn()
  },
  systemAlert: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  $queryRaw: vi.fn()
};

// Mock Redis
const mockRedis = {
  get: vi.fn(),
  setex: vi.fn(),
  del: vi.fn(),
  keys: vi.fn()
};

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService(mockPrisma as any, mockRedis as any);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getSystemOverview', () => {
    it('should return system overview with correct structure', async () => {
      // Mock database responses
      mockPrisma.institution.count
        .mockResolvedValueOnce(10) // total institutions
        .mockResolvedValueOnce(8);  // active institutions

      mockPrisma.user.count
        .mockResolvedValueOnce(1000) // total users
        .mockResolvedValueOnce(150); // active users

      mockPrisma.systemAlert.findMany.mockResolvedValue([]);
      mockPrisma.systemAlert.count.mockResolvedValue(0);
      mockPrisma.$queryRaw.mockResolvedValue([{}]); // database health check

      // Mock cache miss
      mockRedis.get.mockResolvedValue(null);

      const overview = await dashboardService.getSystemOverview();

      expect(overview).toHaveProperty('totalInstitutions', 10);
      expect(overview).toHaveProperty('activeInstitutions', 8);
      expect(overview).toHaveProperty('totalUsers', 1000);
      expect(overview).toHaveProperty('activeUsers', 150);
      expect(overview).toHaveProperty('systemHealth');
      expect(overview).toHaveProperty('uptime');
      expect(overview).toHaveProperty('criticalAlerts');
      expect(overview).toHaveProperty('lastUpdated');

      // Verify cache was set
      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should return cached data when available', async () => {
      const cachedData = {
        totalInstitutions: 5,
        activeInstitutions: 4,
        totalUsers: 500,
        activeUsers: 75,
        systemHealth: HealthStatus.HEALTHY,
        uptime: 99.9,
        criticalAlerts: [],
        lastUpdated: new Date()
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedData));

      const overview = await dashboardService.getSystemOverview();

      expect(overview.totalInstitutions).toBe(5);
      expect(mockPrisma.institution.count).not.toHaveBeenCalled();
    });
  });

  describe('getRealTimeMetrics', () => {
    it('should return real-time metrics with correct structure', async () => {
      mockPrisma.user.count.mockResolvedValue(50); // concurrent users
      mockRedis.get.mockResolvedValue(null); // cache miss

      const metrics = await dashboardService.getRealTimeMetrics();

      expect(metrics).toHaveProperty('concurrentUsers', 50);
      expect(metrics).toHaveProperty('apiRequestRate');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('systemLoad');
      expect(metrics).toHaveProperty('errorRates');
      expect(metrics).toHaveProperty('timestamp');

      expect(metrics.systemLoad).toHaveProperty('cpu');
      expect(metrics.systemLoad).toHaveProperty('memory');
      expect(metrics.systemLoad).toHaveProperty('database');
      expect(metrics.systemLoad).toHaveProperty('storage');

      expect(metrics.errorRates).toHaveProperty('rate5xx');
      expect(metrics.errorRates).toHaveProperty('rate4xx');
      expect(metrics.errorRates).toHaveProperty('totalErrors');
      expect(metrics.errorRates).toHaveProperty('errorTrend');
    });
  });

  describe('getActiveAlerts', () => {
    it('should return paginated alerts with filters', async () => {
      const mockAlerts = [
        {
          id: 'alert1',
          severity: AlertSeverity.HIGH,
          title: 'Test Alert',
          description: 'Test Description',
          source: 'SYSTEM',
          metadata: {},
          resolved: false,
          resolvedAt: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockPrisma.systemAlert.findMany.mockResolvedValue(mockAlerts);
      mockPrisma.systemAlert.count.mockResolvedValue(1);
      mockRedis.get.mockResolvedValue(null);

      const filters = { severity: [AlertSeverity.HIGH] };
      const result = await dashboardService.getActiveAlerts(filters);

      expect(result).toHaveProperty('alerts');
      expect(result).toHaveProperty('total', 1);
      expect(result).toHaveProperty('hasMore', false);
      expect(result).toHaveProperty('filters');
      expect(result.alerts).toHaveLength(1);
      expect(result.alerts[0].id).toBe('alert1');
    });
  });

  describe('createAlert', () => {
    it('should create a new alert', async () => {
      const alertData = {
        severity: AlertSeverity.CRITICAL,
        title: 'Critical System Error',
        description: 'System is experiencing critical issues',
        source: 'SYSTEM',
        metadata: { error: 'Database connection failed' },
        resolved: false,
        resolvedAt: undefined
      };

      const mockCreatedAlert = {
        id: 'new-alert-id',
        ...alertData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.systemAlert.create.mockResolvedValue(mockCreatedAlert);
      mockRedis.keys.mockResolvedValue([]);

      const result = await dashboardService.createAlert(alertData);

      expect(result.id).toBe('new-alert-id');
      expect(result.severity).toBe(AlertSeverity.CRITICAL);
      expect(result.title).toBe('Critical System Error');
      expect(mockPrisma.systemAlert.create).toHaveBeenCalledWith({
        data: {
          severity: alertData.severity,
          title: alertData.title,
          description: alertData.description,
          source: alertData.source,
          metadata: alertData.metadata,
          resolved: alertData.resolved
        }
      });
    });
  });

  describe('resolveAlert', () => {
    it('should resolve an existing alert', async () => {
      const alertId = 'alert-to-resolve';
      const mockResolvedAlert = {
        id: alertId,
        severity: AlertSeverity.HIGH,
        title: 'Resolved Alert',
        description: 'This alert has been resolved',
        source: 'SYSTEM',
        metadata: {},
        resolved: true,
        resolvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockPrisma.systemAlert.update.mockResolvedValue(mockResolvedAlert);
      mockRedis.keys.mockResolvedValue([]);

      const result = await dashboardService.resolveAlert(alertId);

      expect(result.id).toBe(alertId);
      expect(result.resolved).toBe(true);
      expect(result.resolvedAt).toBeDefined();
      expect(mockPrisma.systemAlert.update).toHaveBeenCalledWith({
        where: { id: alertId },
        data: {
          resolved: true,
          resolvedAt: expect.any(Date)
        }
      });
    });
  });

  describe('getQuickActions', () => {
    it('should return available quick actions', async () => {
      mockRedis.get.mockResolvedValue(null);

      const quickActions = await dashboardService.getQuickActions();

      expect(Array.isArray(quickActions)).toBe(true);
      expect(quickActions.length).toBeGreaterThan(0);
      
      const firstAction = quickActions[0];
      expect(firstAction).toHaveProperty('id');
      expect(firstAction).toHaveProperty('title');
      expect(firstAction).toHaveProperty('description');
      expect(firstAction).toHaveProperty('icon');
      expect(firstAction).toHaveProperty('action');
      expect(firstAction).toHaveProperty('permissions');
      expect(firstAction).toHaveProperty('enabled');
    });
  });
});
