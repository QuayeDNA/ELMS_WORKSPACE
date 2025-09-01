import { PrismaClient, InstitutionType, InstitutionCategory } from '@prisma/client';
import RedisService from '../../redis.service';
import { LoggerService } from '../../logger/logger.service';
import {
  InstitutionOverview,
  InstitutionDetails,
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionFilters,
  GetInstitutionsResponse,
  InstitutionStats,
  InstitutionConfiguration,
  Address,
  ContactInfo,
  InstitutionStatus
} from '../../../types/superadmin/institutions/institution.types';

const loggerService = LoggerService.getInstance();

export class InstitutionService {
  private readonly prisma: PrismaClient;
  private readonly redis: RedisService;

  constructor() {
    this.prisma = new PrismaClient();
    this.redis = RedisService.getInstance();
  }

  /**
   * Get all institutions with pagination and filters
   */
  async getAllInstitutions(
    page: number = 1,
    limit: number = 10,
    filters: InstitutionFilters = {}
  ): Promise<GetInstitutionsResponse> {
    try {
      const offset = (page - 1) * limit;
      const cacheKey = `institutions:list:${page}:${limit}:${JSON.stringify(filters)}`;

      // Try to get from cache
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Build where clause
      const where: any = {
        isActive: true
      };

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { shortName: { contains: filters.search, mode: 'insensitive' } },
          { code: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      // Get institutions with basic relations
      const [institutions, total] = await Promise.all([
        this.prisma.institution.findMany({
          where,
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
          skip: offset,
          take: limit,
          orderBy: { name: 'asc' }
        }),
        this.prisma.institution.count({ where })
      ]);

      // Transform to response format
      const institutionOverviews: InstitutionOverview[] = institutions.map(institution => ({
        id: institution.id,
        name: institution.name,
        shortName: institution.shortName || '',
        code: institution.code,
        type: institution.type,
        category: institution.category,
        totalUsers: institution._count?.users || 0,
        totalFaculties: institution._count?.faculties || 0,
        totalCampuses: institution._count?.campuses || 0,
        subscriptionPlan: institution.subscriptionPlan,
        isActive: institution.isActive,
        createdAt: institution.createdAt
      }));

      // Calculate aggregations for summary
      const aggregations = {
        byType: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        bySubscriptionPlan: {} as Record<string, number>,
        byRegion: {} as Record<string, number>
      };

      // Count by each category
      institutions.forEach(institution => {
        // Type aggregation
        aggregations.byType[institution.type] = (aggregations.byType[institution.type] || 0) + 1;
        
        // Category aggregation
        aggregations.byCategory[institution.category] = (aggregations.byCategory[institution.category] || 0) + 1;
        
        // Subscription plan aggregation
        aggregations.bySubscriptionPlan[institution.subscriptionPlan] = 
          (aggregations.bySubscriptionPlan[institution.subscriptionPlan] || 0) + 1;

        // Extract region from address JSON
        try {
          const address = institution.address as any;
          if (address?.region) {
            aggregations.byRegion[address.region] = 
              (aggregations.byRegion[address.region] || 0) + 1;
          }
        } catch (e) {
          // Ignore address parsing errors
        }
      });

      const response: GetInstitutionsResponse = {
        institutions: institutionOverviews,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        aggregations
      };

      // Cache for 5 minutes
      await this.redis.client.setEx(cacheKey, 300, JSON.stringify(response));

      return response;
    } catch (error) {
      loggerService.error('Error getting institutions:', error);
      throw new Error('Failed to retrieve institutions');
    }
  }

  /**
   * Get institution by ID with full details
   */
  async getInstitutionById(id: string): Promise<InstitutionDetails> {
    try {
      const cacheKey = `institution:details:${id}`;

      // Try to get from cache
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const institution = await this.prisma.institution.findUnique({
        where: { id },
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

      if (!institution) {
        throw new Error('Institution not found');
      }

      const details: InstitutionDetails = {
        id: institution.id,
        name: institution.name,
        shortName: institution.shortName || '',
        code: institution.code,
        type: institution.type,
        category: institution.category,
        address: institution.address as unknown as Address,
        contactInfo: institution.contactInfo as unknown as ContactInfo,
        logo: institution.logo,
        motto: institution.motto,
        description: institution.description,
        establishedYear: institution.establishedYear,
        timezone: institution.timezone,
        language: institution.language,
        currencies: institution.currencies,
        academicCalendar: institution.academicCalendar,
        customFields: institution.customFields,
        configuration: institution.configuration as unknown as InstitutionConfiguration,
        subscriptionPlan: institution.subscriptionPlan,
        billingEmail: institution.billingEmail,
        subscriptionData: institution.subscriptionData,
        settings: institution.settings,
        isActive: institution.isActive,
        totalUsers: institution._count?.users || 0,
        totalFaculties: institution._count?.faculties || 0,
        totalCampuses: institution._count?.campuses || 0,
        createdAt: institution.createdAt,
        updatedAt: institution.updatedAt,
        createdBy: institution.createdByUser,
        lastModifiedBy: institution.lastModifiedByUser
      };

      // Cache for 15 minutes
      await this.redis.client.setEx(cacheKey, 900, JSON.stringify(details));

      return details;
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error getting institution by ID:', error);
      throw new Error('Failed to retrieve institution');
    }
  }

  /**
   * Create a new institution
   */
  async createInstitution(data: CreateInstitutionRequest, createdBy: string): Promise<InstitutionDetails> {
    try {
      // Check if code already exists
      const existingCode = await this.prisma.institution.findUnique({
        where: { code: data.code }
      });

      if (existingCode) {
        throw new Error('Institution code already exists');
      }

      // Generate default configuration
      const defaultConfig: InstitutionConfiguration = {
        branding: {
          primaryColor: '#1976d2',
          secondaryColor: '#424242'
        },
        features: {
          examManagement: true,
          courseManagement: true,
          reportGeneration: true,
          integrations: false,
          advancedAnalytics: false,
          customBranding: false,
          apiAccess: false,
          ssoIntegration: false,
          advancedSecurity: false
        },
        limits: {
          maxUsers: 1000,
          maxExams: 100,
          storageLimit: 1024,
          bandwidthLimit: 10240
        },
        integrations: {
          sso: { enabled: false },
          lms: { enabled: false },
          studentInfoSystem: { enabled: false }
        }
      };

      const institution = await this.prisma.institution.create({
        data: {
          name: data.name,
          shortName: data.shortName,
          code: data.code,
          type: data.type as InstitutionType,
          category: data.category as InstitutionCategory,
          address: data.address as any,
          contactInfo: data.contactInfo as any,
          logo: data.logo,
          motto: data.motto,
          description: data.description,
          establishedYear: data.establishedYear,
          timezone: 'Africa/Accra',
          language: 'en',
          currencies: ['GHS'],
          configuration: defaultConfig as any,
          subscriptionPlan: 'basic',
          createdBy,
          settings: {
            create: {
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
            }
          }
        },
        include: {
          settings: true,
          createdByUser: {
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

      // Clear related caches
      await this.clearInstitutionCaches();

      loggerService.info(`Institution created: ${institution.name} (${institution.code}) by ${createdBy}`);

      return this.transformToDetails(institution);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution code already exists') throw error;
      loggerService.error('Error creating institution:', error);
      throw new Error('Failed to create institution');
    }
  }

  /**
   * Update an institution
   */
  async updateInstitution(id: string, data: UpdateInstitutionRequest, updatedBy: string): Promise<InstitutionDetails> {
    try {
      // Check if institution exists
      const existingInstitution = await this.prisma.institution.findUnique({
        where: { id }
      });

      if (!existingInstitution) {
        throw new Error('Institution not found');
      }

      const institution = await this.prisma.institution.update({
        where: { id },
        data: {
          ...data,
          address: data.address ? (data.address as any) : undefined,
          contactInfo: data.contactInfo ? (data.contactInfo as any) : undefined,
          configuration: data.configuration ? (data.configuration as any) : undefined,
          lastModifiedBy: updatedBy,
          updatedAt: new Date()
        },
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

      // Clear caches
      await this.clearInstitutionCaches();
      await this.redis.client.del(`institution:details:${id}`);

      loggerService.info(`Institution updated: ${institution.name} (${institution.code}) by ${updatedBy}`);

      return this.transformToDetails(institution);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error updating institution:', error);
      throw new Error('Failed to update institution');
    }
  }

  /**
   * Update institution configuration
   */
  async updateInstitutionConfiguration(
    id: string,
    configUpdate: Partial<InstitutionConfiguration>,
    updatedBy: string
  ): Promise<InstitutionDetails> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id },
        select: { configuration: true }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      const currentConfig = institution.configuration as unknown as InstitutionConfiguration;
      const updatedConfig = {
        ...currentConfig,
        ...configUpdate,
        branding: { ...currentConfig.branding, ...configUpdate.branding },
        features: { ...currentConfig.features, ...configUpdate.features },
        limits: { ...currentConfig.limits, ...configUpdate.limits },
        integrations: { ...currentConfig.integrations, ...configUpdate.integrations }
      };

      const updatedInstitution = await this.prisma.institution.update({
        where: { id },
        data: {
          configuration: updatedConfig as any,
          lastModifiedBy: updatedBy,
          updatedAt: new Date(),
          settings: {
            update: {
              customBranding: updatedConfig.branding
            }
          }
        },
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

      // Clear caches
      await this.clearInstitutionCaches();
      await this.redis.client.del(`institution:details:${id}`);

      loggerService.info(`Institution configuration updated: ${updatedInstitution.name} by ${updatedBy}`);

      return this.transformToDetails(updatedInstitution);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error updating institution configuration:', error);
      throw new Error('Failed to update institution configuration');
    }
  }

  /**
   * Delete institution (soft delete)
   */
  async deleteInstitution(id: string, deletedBy: string): Promise<void> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      // Soft delete by setting isActive to false
      await this.prisma.institution.update({
        where: { id },
        data: {
          isActive: false,
          lastModifiedBy: deletedBy,
          updatedAt: new Date()
        }
      });

      // Clear caches
      await this.clearInstitutionCaches();
      await this.redis.client.del(`institution:details:${id}`);

      loggerService.info(`Institution soft deleted: ${institution.name} (${institution.code}) by ${deletedBy}`);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error deleting institution:', error);
      throw new Error('Failed to delete institution');
    }
  }

  /**
   * Get institution statistics
   */
  async getInstitutionStats(): Promise<InstitutionStats> {
    try {
      const cacheKey = 'institutions:stats';

      // Try to get from cache
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get basic counts
      const [total, active] = await Promise.all([
        this.prisma.institution.count(),
        this.prisma.institution.count({ where: { isActive: true } })
      ]);

      // Get aggregations
      const [typeAgg, categoryAgg] = await Promise.all([
        this.prisma.institution.groupBy({
          by: ['type'],
          _count: true
        }),
        this.prisma.institution.groupBy({
          by: ['category'],
          _count: true
        })
      ]);

      const stats: InstitutionStats = {
        total,
        active,
        inactive: total - active,
        byType: typeAgg.reduce((acc, item) => ({ ...acc, [item.type]: item._count }), {}),
        byCategory: categoryAgg.reduce((acc, item) => ({ ...acc, [item.category]: item._count }), {}),
        byRegion: {} // Will be calculated from address data if needed
      };

      // Cache for 30 minutes
      await this.redis.client.setEx(cacheKey, 1800, JSON.stringify(stats));

      return stats;
    } catch (error) {
      loggerService.error('Error getting institution stats:', error);
      throw new Error('Failed to retrieve institution statistics');
    }
  }

  /**
   * Get detailed analytics for an institution
   */
  async getInstitutionAnalytics(institutionId: string): Promise<any> {
    try {
      const cacheKey = `institution:analytics:${institutionId}`;

      // Try to get from cache
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Get user statistics for institutions
      const [userStats, activeUserStats] = await Promise.all([
        this.prisma.user.aggregate({
          where: { 
            institution: { id: institutionId }
          },
          _count: { id: true }
        }),
        this.prisma.user.aggregate({
          where: { 
            institution: { id: institutionId },
            isActive: true
          },
          _count: { id: true }
        })
      ]);

      const analytics = {
        institutionId,
        totalUsers: userStats._count?.id || 0,
        activeUsers: activeUserStats._count?.id || 0,
        lastUpdated: new Date()
      };

      // Cache for 1 hour
      await this.redis.client.setEx(cacheKey, 3600, JSON.stringify(analytics));

      return analytics;
    } catch (error) {
      loggerService.error('Error getting institution analytics:', error);
      throw new Error('Failed to retrieve institution analytics');
    }
  }

  /**
   * Helper method to transform database result to InstitutionDetails
   */
  private transformToDetails(institution: any): InstitutionDetails {
    return {
      id: institution.id,
      name: institution.name,
      shortName: institution.shortName || '',
      code: institution.code,
      type: institution.type,
      category: institution.category,
      address: institution.address,
      contactInfo: institution.contactInfo,
      logo: institution.logo,
      motto: institution.motto,
      description: institution.description,
      establishedYear: institution.establishedYear,
      timezone: institution.timezone,
      language: institution.language,
      currencies: institution.currencies,
      academicCalendar: institution.academicCalendar,
      customFields: institution.customFields,
      configuration: institution.configuration,
      subscriptionPlan: institution.subscriptionPlan,
      billingEmail: institution.billingEmail,
      subscriptionData: institution.subscriptionData,
      settings: institution.settings,
      isActive: institution.isActive,
      totalUsers: institution._count?.users || 0,
      totalFaculties: institution._count?.faculties || 0,
      totalCampuses: institution._count?.campuses || 0,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
      createdBy: institution.createdByUser,
      lastModifiedBy: institution.lastModifiedByUser
    };
  }

  /**
   * Clear institution-related caches
   */
  private async clearInstitutionCaches(): Promise<void> {
    try {
      const keys = await this.redis.client.keys('institutions:*');
      if (keys.length > 0) {
        await this.redis.client.del(keys);
      }
    } catch (error) {
      loggerService.warn('Error clearing institution caches:', error);
    }
  }
}
