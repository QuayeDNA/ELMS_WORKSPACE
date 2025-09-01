import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { InstitutionService } from '../../../../services/superadmin/institutions/institution.service';
import RedisService from '../../../../services/redis.service';
import { LoggerService } from '../../../../services/logger/logger.service';
import {
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionFilters,
  InstitutionType,
  InstitutionCategory,
  SubscriptionPlan
} from '../../../../types/superadmin/institutions/institution.types';

// Mock dependencies
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn()
}));

vi.mock('../../../../services/redis.service');
vi.mock('../../../../services/logger/logger.service');

describe('InstitutionService', () => {
  let institutionService: InstitutionService;
  let mockPrisma: any;
  let mockRedis: any;
  let mockLoggerService: any;

  const mockInstitution = {
    id: 'inst-123',
    name: 'Test University',
    shortName: 'TU',
    code: 'TU001',
    type: InstitutionType.UNIVERSITY,
    category: InstitutionCategory.PUBLIC,
    address: {
      street: '123 University Ave',
      city: 'Test City',
      region: 'Test Region',
      country: 'Ghana',
      postalCode: '12345'
    },
    contactInfo: {
      primaryEmail: 'info@testuniversity.edu.gh',
      primaryPhone: '+233-123-456-789',
      website: 'https://www.testuniversity.edu.gh'
    },
    logo: 'https://example.com/logo.png',
    motto: 'Knowledge and Excellence',
    description: 'A leading institution in education',
    establishedYear: 1950,
    timezone: 'Africa/Accra',
    language: 'en',
    currencies: ['GHS'],
    configuration: {
      branding: { primaryColor: '#1976d2', secondaryColor: '#424242' },
      features: {
        examManagement: true,
        scriptTracking: true,
        analytics: true,
        mobileApp: true,
        desktopApp: true,
        apiAccess: false,
        webhooks: false,
        customReports: false,
        bulkOperations: false,
        advancedSecurity: false
      },
      limits: {
        maxUsers: 1000,
        maxExams: 100,
        maxConcurrentExams: 10,
        storageQuota: 10,
        apiRequestLimit: 1000,
        webhookLimit: 100,
        customReportLimit: 10
      },
      integrations: {
        sso: { enabled: false },
        lms: { enabled: false },
        studentInfoSystem: { enabled: false }
      }
    },
    subscriptionPlan: 'basic',
    billingEmail: null,
    subscriptionData: null,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    createdBy: 'user-123',
    lastModifiedBy: null,
    settings: {
      id: 'settings-123',
      allowSelfRegistration: false,
      requireEmailVerification: true,
      passwordPolicy: {
        minLength: 8,
        requireNumbers: true,
        requireSpecialChars: true,
        requireUppercase: true
      },
      sessionTimeout: 1800,
      maxConcurrentSessions: 3,
      enableMFA: false,
      allowedEmailDomains: [],
      gradingSystem: {
        scale: 'percentage',
        passingGrade: 50
      }
    },
    createdByUser: {
      id: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com'
    },
    lastModifiedByUser: null,
    _count: {
      users: 150,
      faculties: 5,
      campuses: 2
    }
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock Prisma
    mockPrisma = {
      institution: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        groupBy: vi.fn(),
        aggregate: vi.fn()
      },
      user: {
        aggregate: vi.fn()
      }
    };

    // Mock Redis
    mockRedis = {
      client: {
        get: vi.fn(),
        setEx: vi.fn(),
        del: vi.fn(),
        keys: vi.fn()
      }
    };

    // Mock Logger
    mockLoggerService = {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn()
    };

    // Setup constructor mocks
    (PrismaClient as unknown as Mock).mockImplementation(() => mockPrisma);
    (RedisService.getInstance as Mock).mockReturnValue(mockRedis);
    (LoggerService.getInstance as Mock).mockReturnValue(mockLoggerService);

    institutionService = new InstitutionService();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getAllInstitutions', () => {
    it('should return cached institutions if available', async () => {
      const cachedData = {
        institutions: [mockInstitution],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        aggregations: { byType: {}, byCategory: {}, bySubscriptionPlan: {}, byRegion: {} }
      };

      mockRedis.client.get.mockResolvedValue(JSON.stringify(cachedData));

      const result = await institutionService.getAllInstitutions(1, 10, {});

      expect(mockRedis.client.get).toHaveBeenCalledWith('institutions:list:1:10:{}');
      expect(result).toEqual(cachedData);
      expect(mockPrisma.institution.findMany).not.toHaveBeenCalled();
    });

    it('should fetch institutions from database when not cached', async () => {
      mockRedis.client.get.mockResolvedValue(null);
      mockPrisma.institution.findMany.mockResolvedValue([mockInstitution]);
      mockPrisma.institution.count.mockResolvedValue(1);

      const result = await institutionService.getAllInstitutions(1, 10, {});

      expect(mockPrisma.institution.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: {
          settings: true,
          _count: {
            select: {
              users: true,
              faculties: true,
              campuses: true
            }
          }
        },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' }
      });

      expect(result.institutions).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
      expect(mockRedis.client.setEx).toHaveBeenCalled();
    });

    it('should apply search filters correctly', async () => {
      mockRedis.client.get.mockResolvedValue(null);
      mockPrisma.institution.findMany.mockResolvedValue([]);
      mockPrisma.institution.count.mockResolvedValue(0);

      const filters: InstitutionFilters = {
        search: 'Test',
        type: [InstitutionType.UNIVERSITY],
        category: [InstitutionCategory.PUBLIC]
      };

      await institutionService.getAllInstitutions(1, 10, filters);

      expect(mockPrisma.institution.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          type: { in: ['public'] },
          category: { in: ['university'] },
          OR: [
            { name: { contains: 'Test', mode: 'insensitive' } },
            { shortName: { contains: 'Test', mode: 'insensitive' } },
            { code: { contains: 'Test', mode: 'insensitive' } }
          ]
        },
        include: {
          settings: true,
          _count: {
            select: {
              users: true,
              faculties: true,
              campuses: true
            }
          }
        },
        skip: 0,
        take: 10,
        orderBy: { name: 'asc' }
      });
    });

    it('should handle errors and throw descriptive message', async () => {
      mockRedis.client.get.mockResolvedValue(null);
      mockPrisma.institution.findMany.mockRejectedValue(new Error('Database error'));

      await expect(institutionService.getAllInstitutions(1, 10, {}))
        .rejects.toThrow('Failed to retrieve institutions');

      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Error getting institutions:',
        expect.any(Error)
      );
    });
  });

  describe('getInstitutionById', () => {
    it('should return cached institution if available', async () => {
      mockRedis.client.get.mockResolvedValue(JSON.stringify(mockInstitution));

      const result = await institutionService.getInstitutionById('inst-123');

      expect(mockRedis.client.get).toHaveBeenCalledWith('institution:details:inst-123');
      expect(result).toEqual(mockInstitution);
      expect(mockPrisma.institution.findUnique).not.toHaveBeenCalled();
    });

    it('should fetch institution from database when not cached', async () => {
      mockRedis.client.get.mockResolvedValue(null);
      mockPrisma.institution.findUnique.mockResolvedValue(mockInstitution);

      const result = await institutionService.getInstitutionById('inst-123');

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: 'inst-123' },
        include: {
          settings: true,
          createdByUser: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          lastModifiedByUser: {
            select: { id: true, firstName: true, lastName: true, email: true }
          },
          _count: {
            select: {
              users: true,
              faculties: true,
              campuses: true
            }
          }
        }
      });

      expect(result.id).toBe('inst-123');
      expect(mockRedis.client.setEx).toHaveBeenCalled();
    });

    it('should throw error when institution not found', async () => {
      mockRedis.client.get.mockResolvedValue(null);
      mockPrisma.institution.findUnique.mockResolvedValue(null);

      await expect(institutionService.getInstitutionById('non-existent'))
        .rejects.toThrow('Institution not found');
    });
  });

  describe('createInstitution', () => {
    it('should create institution successfully', async () => {
      const createData: CreateInstitutionRequest = {
        name: 'New University',
        shortName: 'NU',
        code: 'NU001',
        type: InstitutionType.UNIVERSITY,
        category: InstitutionCategory.PUBLIC,
        address: {
          street: '456 New Ave',
          city: 'New City',
          region: 'New Region',
          country: 'Ghana',
          postalCode: '54321'
        },
        contactInfo: {
          primaryEmail: 'info@newuniversity.edu.gh',
          primaryPhone: '+233-987-654-321',
          website: 'https://www.newuniversity.edu.gh'
        },
        subscriptionPlan: SubscriptionPlan.BASIC,
        billingInfo: {
          billingEmail: 'billing@newuniversity.edu.gh',
          billingAddress: {
            street: '456 New Ave',
            city: 'New City',
            region: 'New Region',
            country: 'Ghana',
            postalCode: '54321'
          },
          billingCycle: 'YEARLY' as const,
          currency: 'GHS'
        }
      };

      mockPrisma.institution.findUnique.mockResolvedValue(null); // Code doesn't exist
      mockPrisma.institution.create.mockResolvedValue({ ...mockInstitution, ...createData });

      const result = await institutionService.createInstitution(createData, 'user-123');

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { code: 'NU001' }
      });

      expect(mockPrisma.institution.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New University',
          code: 'NU001',
          type: 'public',
          category: 'university',
          createdBy: 'user-123',
          timezone: 'Africa/Accra',
          language: 'en',
          currencies: ['GHS'],
          subscriptionPlan: 'basic'
        }),
        include: expect.any(Object)
      });

      expect(result.name).toBe('New University');
      expect(mockLoggerService.info).toHaveBeenCalled();
    });

    it('should throw error if institution code already exists', async () => {
      const createData: CreateInstitutionRequest = {
        name: 'Duplicate University',
        code: 'EXISTING001',
        type: InstitutionType.UNIVERSITY,
        category: InstitutionCategory.PUBLIC,
        address: {
          street: '123 Test St',
          city: 'Test City',
          region: 'Test Region',
          country: 'Ghana',
          postalCode: '12345'
        },
        contactInfo: {
          primaryEmail: 'test@example.com',
          primaryPhone: '+233-123-456-789'
        },
        subscriptionPlan: SubscriptionPlan.BASIC,
        billingInfo: {
          billingEmail: 'billing@example.com',
          billingAddress: {
            street: '123 Test St',
            city: 'Test City',
            region: 'Test Region',
            country: 'Ghana',
            postalCode: '12345'
          },
          billingCycle: 'YEARLY' as const,
          currency: 'GHS'
        }
      };

      mockPrisma.institution.findUnique.mockResolvedValue(mockInstitution);

      await expect(institutionService.createInstitution(createData, 'user-123'))
        .rejects.toThrow('Institution code already exists');

      expect(mockPrisma.institution.create).not.toHaveBeenCalled();
    });
  });

  describe('updateInstitution', () => {
    it('should update institution successfully', async () => {
      const updateData: UpdateInstitutionRequest = {
        name: 'Updated University',
        description: 'Updated description'
      };

      mockPrisma.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrisma.institution.update.mockResolvedValue({
        ...mockInstitution,
        ...updateData,
        updatedAt: new Date()
      });

      const result = await institutionService.updateInstitution('inst-123', updateData, 'user-456');

      expect(mockPrisma.institution.findUnique).toHaveBeenCalledWith({
        where: { id: 'inst-123' }
      });

      expect(mockPrisma.institution.update).toHaveBeenCalledWith({
        where: { id: 'inst-123' },
        data: {
          ...updateData,
          lastModifiedBy: 'user-456',
          updatedAt: expect.any(Date)
        },
        include: expect.any(Object)
      });

      expect(result.name).toBe('Updated University');
      expect(mockLoggerService.info).toHaveBeenCalled();
    });

    it('should throw error if institution not found', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(null);

      await expect(institutionService.updateInstitution('non-existent', {}, 'user-456'))
        .rejects.toThrow('Institution not found');

      expect(mockPrisma.institution.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteInstitution', () => {
    it('should soft delete institution successfully', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(mockInstitution);
      mockPrisma.institution.update.mockResolvedValue({
        ...mockInstitution,
        isActive: false
      });

      await institutionService.deleteInstitution('inst-123', 'user-456');

      expect(mockPrisma.institution.update).toHaveBeenCalledWith({
        where: { id: 'inst-123' },
        data: {
          isActive: false,
          lastModifiedBy: 'user-456',
          updatedAt: expect.any(Date)
        }
      });

      expect(mockLoggerService.info).toHaveBeenCalled();
    });

    it('should throw error if institution not found', async () => {
      mockPrisma.institution.findUnique.mockResolvedValue(null);

      await expect(institutionService.deleteInstitution('non-existent', 'user-456'))
        .rejects.toThrow('Institution not found');

      expect(mockPrisma.institution.update).not.toHaveBeenCalled();
    });
  });

  describe('getInstitutionStats', () => {
    it('should return cached stats if available', async () => {
      const cachedStats = {
        total: 10,
        active: 8,
        inactive: 2,
        byType: { public: 5, private: 3 },
        byCategory: { university: 4, college: 4 },
        byRegion: {}
      };

      mockRedis.client.get.mockResolvedValue(JSON.stringify(cachedStats));

      const result = await institutionService.getInstitutionStats();

      expect(mockRedis.client.get).toHaveBeenCalledWith('institutions:stats');
      expect(result).toEqual(cachedStats);
    });

    it('should calculate stats from database when not cached', async () => {
      mockRedis.client.get.mockResolvedValue(null);
      mockPrisma.institution.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(8); // active

      mockPrisma.institution.groupBy
        .mockResolvedValueOnce([
          { type: 'public', _count: 5 },
          { type: 'private', _count: 3 }
        ])
        .mockResolvedValueOnce([
          { category: 'university', _count: 4 },
          { category: 'college', _count: 4 }
        ]);

      const result = await institutionService.getInstitutionStats();

      expect(result).toEqual({
        total: 10,
        active: 8,
        inactive: 2,
        byType: { public: 5, private: 3 },
        byCategory: { university: 4, college: 4 },
        byRegion: {}
      });

      expect(mockRedis.client.setEx).toHaveBeenCalled();
    });
  });

  describe('getInstitutionAnalytics', () => {
    it('should return cached analytics if available', async () => {
      const cachedAnalytics = {
        institutionId: 'inst-123',
        totalUsers: 150,
        activeUsers: 140,
        lastUpdated: new Date()
      };

      mockRedis.client.get.mockResolvedValue(JSON.stringify(cachedAnalytics));

      const result = await institutionService.getInstitutionAnalytics('inst-123');

      expect(mockRedis.client.get).toHaveBeenCalledWith('institution:analytics:inst-123');
      expect(result.institutionId).toBe('inst-123');
    });

    it('should calculate analytics from database when not cached', async () => {
      mockRedis.client.get.mockResolvedValue(null);
      mockPrisma.user.aggregate
        .mockResolvedValueOnce({ _count: { id: 150 } }) // total users
        .mockResolvedValueOnce({ _count: { id: 140 } }); // active users

      const result = await institutionService.getInstitutionAnalytics('inst-123');

      expect(result).toEqual({
        institutionId: 'inst-123',
        totalUsers: 150,
        activeUsers: 140,
        lastUpdated: expect.any(Date)
      });

      expect(mockRedis.client.setEx).toHaveBeenCalled();
    });
  });
});
