import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { InstitutionService } from '../../../../src/services/superadmin/institutions/institution.service';
import { InstitutionController } from '../../../../src/controllers/superadmin/institutions/institution.controller';
import { PrismaClient } from '@prisma/client';
import RedisService from '../../../../src/services/redis.service';
import { LoggerService } from '../../../../src/services/logger/logger.service';
import { Request, Response } from 'express';

// Mock the dependencies
const mockPrisma = {
  institution: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    aggregate: vi.fn(),
    count: vi.fn()
  },
  user: {
    aggregate: vi.fn(),
    count: vi.fn()
  }
} as unknown as PrismaClient;

const mockRedis = {
  client: {
    get: vi.fn().mockResolvedValue(null),
    setEx: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    keys: vi.fn().mockResolvedValue([])
  }
} as unknown as RedisService;

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
} as unknown as LoggerService;

describe('Institution Management - New Features', () => {
  let institutionService: InstitutionService;
  let institutionController: InstitutionController;

  beforeEach(() => {
    vi.clearAllMocks();
    institutionService = new InstitutionService(mockPrisma, mockRedis, mockLogger);
    institutionController = new InstitutionController(institutionService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Institution Analytics', () => {
    it('should get institution analytics successfully', async () => {
      const mockInstitution = {
        id: 'test-id',
        name: 'Test Institution',
        subscriptionPlan: 'professional',
        isActive: true,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: {
          faculties: 5,
          campuses: 3
        }
      };

      const mockUserStats = { _count: { id: 150 } };
      const mockActiveUserStats = { _count: { id: 120 } };
      const mockNewUsersThisMonth = { _count: { id: 15 } };

      mockPrisma.institution.findUnique = vi.fn().mockResolvedValue(mockInstitution);
      mockPrisma.user.aggregate = vi.fn()
        .mockResolvedValueOnce(mockUserStats)
        .mockResolvedValueOnce(mockActiveUserStats)
        .mockResolvedValueOnce(mockNewUsersThisMonth);

      const analytics = await institutionService.getInstitutionAnalytics('test-id');

      expect(analytics).toEqual({
        userMetrics: {
          total: 150,
          active: 120,
          inactive: 30,
          newThisMonth: 15
        },
        structureMetrics: {
          faculties: 5,
          campuses: 3
        },
        subscriptionInfo: {
          plan: 'professional',
          isActive: true,
          status: 'active'
        },
        activityMetrics: {
          lastUpdated: mockInstitution.updatedAt,
          createdAt: mockInstitution.createdAt
        },
        timestamp: expect.any(String)
      });
    });

    it('should handle institution not found', async () => {
      mockPrisma.institution.findUnique = vi.fn().mockResolvedValue(null);

      await expect(institutionService.getInstitutionAnalytics('non-existent')).rejects.toThrow('Institution not found');
    });
  });

  describe('Institution Usage Statistics', () => {
    it('should get usage statistics successfully', async () => {
      const mockInstitution = {
        id: 'test-id',
        name: 'Test Institution',
        subscriptionPlan: 'professional',
        configuration: {
          limits: {
            maxUsers: 500,
            maxExams: 100,
            storageQuota: 50
          }
        },
        _count: {
          users: 300,
          faculties: 8,
          campuses: 4
        }
      };

      mockPrisma.institution.findUnique = vi.fn().mockResolvedValue(mockInstitution);

      const usageStats = await institutionService.getInstitutionUsageStats('test-id');

      expect(usageStats).toEqual({
        institution: {
          id: 'test-id',
          name: 'Test Institution',
          plan: 'professional'
        },
        limits: {
          maxUsers: 500,
          maxExams: 100,
          storageQuota: 50
        },
        current: {
          users: 300,
          faculties: 8,
          campuses: 4,
          storageUsed: 0,
          apiRequestsThisMonth: 0
        },
        utilization: {
          users: 60, // 300/500 * 100
          storage: 0,
          apiRequests: 0
        },
        timestamp: expect.any(String)
      });
    });
  });

  describe('Billing Report Generation', () => {
    it('should generate billing report successfully', async () => {
      const mockInstitution = {
        id: 'test-id',
        name: 'Test Institution',
        subscriptionPlan: 'professional',
        _count: {
          users: 250
        }
      };

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');

      mockPrisma.institution.findUnique = vi.fn().mockResolvedValue(mockInstitution);
      mockPrisma.user.count = vi.fn()
        .mockResolvedValueOnce(25) // new users in period
        .mockResolvedValueOnce(180); // active users in period

      const report = await institutionService.generateBillingReport('test-id', startDate, endDate);

      expect(report).toEqual({
        institution: {
          id: 'test-id',
          name: 'Test Institution',
          plan: 'professional'
        },
        period: {
          start: startDate,
          end: endDate
        },
        usage: {
          totalUsers: 250,
          newUsers: 25,
          activeUsers: 180
        },
        charges: {
          baseSubscription: 299, // professional plan price
          additionalUsers: 0, // within limits
          storage: 0,
          total: 299
        },
        generatedAt: expect.any(Date)
      });
    });
  });

  describe('Integration Management', () => {
    it('should update institution integrations successfully', async () => {
      const mockInstitution = {
        id: 'test-id',
        configuration: {
          integrations: {
            sso: { enabled: false },
            lms: { enabled: false },
            studentInfoSystem: { enabled: false }
          }
        }
      };

      const mockUpdatedInstitution = {
        ...mockInstitution,
        configuration: {
          integrations: {
            sso: { enabled: true, provider: 'SAML' },
            lms: { enabled: false },
            studentInfoSystem: { enabled: false }
          }
        },
        settings: null,
        createdByUser: null,
        lastModifiedByUser: null,
        _count: {
          users: 100,
          faculties: 5,
          campuses: 2
        }
      };

      mockPrisma.institution.findUnique = vi.fn().mockResolvedValue(mockInstitution);
      mockPrisma.institution.update = vi.fn().mockResolvedValue(mockUpdatedInstitution);

      const integrations = {
        sso: { enabled: true, provider: 'SAML' }
      };

      const result = await institutionService.updateInstitutionIntegrations('test-id', integrations, 'admin-user');

      expect(mockPrisma.institution.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: {
          configuration: expect.objectContaining({
            integrations: expect.objectContaining({
              sso: { enabled: true, provider: 'SAML' }
            })
          }),
          lastModifiedBy: 'admin-user',
          updatedAt: expect.any(Date)
        },
        include: expect.any(Object)
      });
    });
  });
});
