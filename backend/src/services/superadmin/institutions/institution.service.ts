import { PrismaClient, InstitutionType as PrismaInstitutionType, InstitutionCategory as PrismaInstitutionCategory } from '@prisma/client';
import RedisService from '../../redis.service';
import { LoggerService } from '../../logger/logger.service';
import {
  InstitutionDetails,
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionFilters,
  GetInstitutionsResponse,
  InstitutionStats,
  InstitutionConfiguration,
  Address,
  ContactInfo,
  InstitutionType,
  InstitutionCategory,
  InstitutionStatus,
  FeatureConfig,
  IntegrationConfig
} from '../../../types/superadmin/institutions/institution.types';

const loggerService = LoggerService.getInstance();

// Helper functions to convert between Prisma enums and our custom enums
const convertPrismaTypeToCustom = (prismaType: PrismaInstitutionType): InstitutionType => {
  const mapping: Record<PrismaInstitutionType, InstitutionType> = {
    UNIVERSITY: InstitutionType.UNIVERSITY,
    COLLEGE: InstitutionType.COLLEGE,
    INSTITUTE: InstitutionType.TECHNICAL_INSTITUTE,
    SCHOOL: InstitutionType.HIGH_SCHOOL,
    ACADEMY: InstitutionType.HIGH_SCHOOL,
    POLYTECHNIC: InstitutionType.POLYTECHNIC,
    TECHNICAL_UNIVERSITY: InstitutionType.TECHNICAL_INSTITUTE,
    HIGH_SCHOOL: InstitutionType.HIGH_SCHOOL,
    TRAINING_CENTER: InstitutionType.TRAINING_CENTER
  };
  return mapping[prismaType] || InstitutionType.UNIVERSITY;
};

const convertCustomTypeToPrisma = (customType: InstitutionType): PrismaInstitutionType => {
  const mapping: Record<InstitutionType, PrismaInstitutionType> = {
    [InstitutionType.UNIVERSITY]: 'UNIVERSITY',
    [InstitutionType.COLLEGE]: 'COLLEGE',
    [InstitutionType.HIGH_SCHOOL]: 'HIGH_SCHOOL',
    [InstitutionType.TRAINING_CENTER]: 'TRAINING_CENTER',
    [InstitutionType.POLYTECHNIC]: 'POLYTECHNIC',
    [InstitutionType.TECHNICAL_INSTITUTE]: 'TECHNICAL_UNIVERSITY'
  };
  return mapping[customType] || 'UNIVERSITY';
};

const convertPrismaCategoryToCustom = (prismaCategory: PrismaInstitutionCategory): InstitutionCategory => {
  const mapping: Record<PrismaInstitutionCategory, InstitutionCategory> = {
    PUBLIC: InstitutionCategory.PUBLIC,
    PRIVATE: InstitutionCategory.PRIVATE,
    QUASI_GOVERNMENT: InstitutionCategory.GOVERNMENT,
    RELIGIOUS: InstitutionCategory.PRIVATE,
    INTERNATIONAL: InstitutionCategory.PRIVATE
  };
  return mapping[prismaCategory] || InstitutionCategory.PUBLIC;
};

const convertCustomCategoryToPrisma = (customCategory: InstitutionCategory): PrismaInstitutionCategory => {
  const mapping: Record<InstitutionCategory, PrismaInstitutionCategory> = {
    [InstitutionCategory.PUBLIC]: 'PUBLIC',
    [InstitutionCategory.PRIVATE]: 'PRIVATE',
    [InstitutionCategory.GOVERNMENT]: 'QUASI_GOVERNMENT',
    [InstitutionCategory.NON_PROFIT]: 'PRIVATE'
  };
  return mapping[customCategory] || 'PUBLIC';
};

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
      const institutionList = institutions.map(institution => ({
        id: institution.id,
        name: institution.name,
        shortName: institution.shortName || '',
        code: institution.code,
        type: convertPrismaTypeToCustom(institution.type),
        category: convertPrismaCategoryToCustom(institution.category),
        totalUsers: institution._count?.users || 0,
        totalFaculties: institution._count?.faculties || 0,
        totalCampuses: institution._count?.campuses || 0,
        subscriptionPlan: institution.subscriptionPlan,
        isActive: institution.isActive,
        createdAt: institution.createdAt
      }));

      // Calculate aggregations
      const aggregations = {
        byType: {} as Record<string, number>,
        byCategory: {} as Record<string, number>,
        byStatus: { ACTIVE: total } as Record<string, number>,
        bySubscriptionPlan: {} as Record<string, number>,
        byRegion: {} as Record<string, number>
      };

      // Count by each category
      institutions.forEach(institution => {
        const customType = convertPrismaTypeToCustom(institution.type);
        const customCategory = convertPrismaCategoryToCustom(institution.category);
        
        // Type aggregation
        aggregations.byType[customType] = (aggregations.byType[customType] || 0) + 1;
        
        // Category aggregation
        aggregations.byCategory[customCategory] = (aggregations.byCategory[customCategory] || 0) + 1;
        
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
        } catch (error) {
          // Log address parsing errors but continue processing
          loggerService.warn('Error parsing institution address:', error);
        }
      });

      const response: any = {
        institutions: institutionList,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        aggregations: aggregations as any
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
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          lastModifiedByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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
        type: convertPrismaTypeToCustom(institution.type),
        category: convertPrismaCategoryToCustom(institution.category),
        address: institution.address as unknown as Address,
        contactInfo: institution.contactInfo as unknown as ContactInfo,
        logo: institution.logo || undefined,
        motto: institution.motto || undefined,
        description: institution.description || undefined,
        establishedYear: institution.establishedYear || undefined,
        timezone: institution.timezone,
        language: institution.language,
        currencies: institution.currencies,
        academicCalendar: institution.academicCalendar,
        customFields: institution.customFields,
        configuration: institution.configuration as unknown as InstitutionConfiguration,
        subscriptionPlan: institution.subscriptionPlan,
        billingEmail: institution.billingEmail || undefined,
        subscriptionData: institution.subscriptionData,
        settings: institution.settings || undefined,
        isActive: institution.isActive,
        totalUsers: institution._count?.users || 0,
        totalFaculties: institution._count?.faculties || 0,
        totalCampuses: institution._count?.campuses || 0,
        createdAt: institution.createdAt,
        updatedAt: institution.updatedAt,
        createdBy: institution.createdByUser ? {
          id: institution.createdByUser.id,
          email: institution.createdByUser.email,
          firstName: institution.createdByUser.profile?.firstName || '',
          lastName: institution.createdByUser.profile?.lastName || ''
        } : undefined,
        lastModifiedBy: institution.lastModifiedByUser ? {
          id: institution.lastModifiedByUser.id,
          email: institution.lastModifiedByUser.email,
          firstName: institution.lastModifiedByUser.profile?.firstName || '',
          lastName: institution.lastModifiedByUser.profile?.lastName || ''
        } : undefined
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
          scriptTracking: true,
          analytics: false,
          mobileApp: false,
          desktopApp: false,
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
          storageQuota: 1,
          apiRequestLimit: 1000,
          webhookLimit: 10,
          customReportLimit: 5
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
          type: convertCustomTypeToPrisma(data.type),
          category: convertCustomCategoryToPrisma(data.category),
          address: data.address as any,
          contactInfo: data.contactInfo as any,
          logo: data.logo,
          motto: data.motto,
          description: data.description,
          establishedYear: data.establishedYear,
          timezone: 'Africa/Accra',
          language: 'en',
          currencies: ['GHS'],
          academicCalendar: {},
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
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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

      const updateData: any = {
        ...data,
        address: data.address ? (data.address as any) : undefined,
        contactInfo: data.contactInfo ? (data.contactInfo as any) : undefined,
        lastModifiedBy: updatedBy,
        updatedAt: new Date()
      };

      // Convert enums if provided
      if (data.type) {
        updateData.type = convertCustomTypeToPrisma(data.type);
      }
      if (data.category) {
        updateData.category = convertCustomCategoryToPrisma(data.category);
      }

      const institution = await this.prisma.institution.update({
        where: { id },
        data: updateData,
        include: {
          settings: true,
          createdByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          lastModifiedByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          lastModifiedByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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
   * Get institution configuration only
   */
  async getInstitutionConfiguration(id: string): Promise<InstitutionConfiguration> {
    try {
      const cacheKey = `institution:config:${id}`;

      // Try to get from cache
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const institution = await this.prisma.institution.findUnique({
        where: { id },
        select: { configuration: true }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      const configuration = institution.configuration as unknown as InstitutionConfiguration;

      // Cache for 30 minutes
      await this.redis.client.setEx(cacheKey, 1800, JSON.stringify(configuration));

      return configuration;
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error getting institution configuration:', error);
      throw new Error('Failed to retrieve institution configuration');
    }
  }

  /**
   * Change institution status with audit trail
   */
  async changeInstitutionStatus(
    id: string,
    status: InstitutionStatus,
    updatedBy: string,
    reason?: string
  ): Promise<InstitutionDetails> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      // Update institution status
      const updatedInstitution = await this.prisma.institution.update({
        where: { id },
        data: {
          status: status as any,
          lastModifiedBy: updatedBy,
          updatedAt: new Date(),
          // Add status change to custom fields for audit
          customFields: {
            ...((institution.customFields as any) || {}),
            statusHistory: [
              ...((institution.customFields as any)?.statusHistory || []),
              {
                previousStatus: institution.status,
                newStatus: status,
                changedBy: updatedBy,
                changedAt: new Date(),
                reason: reason || 'No reason provided'
              }
            ]
          }
        },
        include: {
          settings: true,
          createdByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          lastModifiedByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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

      loggerService.info(`Institution status changed: ${updatedInstitution.name} from ${institution.status} to ${status} by ${updatedBy}`);

      return this.transformToDetails(updatedInstitution);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error changing institution status:', error);
      throw new Error('Failed to change institution status');
    }
  }

  /**
   * Toggle institution feature
   */
  async toggleInstitutionFeature(
    id: string,
    feature: keyof FeatureConfig,
    enabled: boolean,
    updatedBy: string,
    reason?: string
  ): Promise<InstitutionDetails> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      const currentConfig = institution.configuration as unknown as InstitutionConfiguration;
      const updatedConfig = {
        ...currentConfig,
        features: {
          ...currentConfig.features,
          [feature]: enabled
        }
      };

      const updatedInstitution = await this.prisma.institution.update({
        where: { id },
        data: {
          configuration: updatedConfig as any,
          lastModifiedBy: updatedBy,
          updatedAt: new Date(),
          customFields: {
            ...((institution.customFields as any) || {}),
            featureToggles: [
              ...((institution.customFields as any)?.featureToggles || []),
              {
                feature,
                enabled,
                changedBy: updatedBy,
                changedAt: new Date(),
                reason: reason || 'No reason provided'
              }
            ]
          }
        },
        include: {
          settings: true,
          createdByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          lastModifiedByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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

      loggerService.info(`Institution feature toggled: ${updatedInstitution.name} - ${feature}=${enabled} by ${updatedBy}`);

      return this.transformToDetails(updatedInstitution);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error toggling institution feature:', error);
      throw new Error('Failed to toggle institution feature');
    }
  }

  /**
   * Perform bulk operations on institutions
   */
  async performBulkOperation(
    institutionIds: string[],
    operation: 'activate' | 'suspend' | 'delete' | 'update_subscription',
    data: any,
    performedBy: string,
    reason: string
  ): Promise<any> {
    try {
      const results = [];
      let successful = 0;
      let failed = 0;

      for (const institutionId of institutionIds) {
        try {
          let result = null;

          switch (operation) {
            case 'activate':
              result = await this.changeInstitutionStatus(institutionId, InstitutionStatus.ACTIVE, performedBy, reason);
              break;
            case 'suspend':
              result = await this.changeInstitutionStatus(institutionId, InstitutionStatus.SUSPENDED, performedBy, reason);
              break;
            case 'delete':
              await this.deleteInstitution(institutionId, performedBy);
              result = { success: true };
              break;
            case 'update_subscription':
              result = await this.updateInstitutionSubscription(institutionId, data.subscriptionPlan, performedBy);
              break;
          }

          results.push({
            institutionId,
            success: true,
            data: result
          });
          successful++;
        } catch (error) {
          results.push({
            institutionId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          failed++;
        }
      }

      const bulkResult = {
        success: failed === 0,
        results,
        summary: {
          total: institutionIds.length,
          successful,
          failed
        },
        timestamp: new Date().toISOString()
      };

      loggerService.info(`Bulk operation ${operation} completed: ${successful}/${institutionIds.length} successful`);

      return bulkResult;
    } catch (error) {
      loggerService.error('Error performing bulk operation:', error);
      throw new Error('Failed to perform bulk operation');
    }
  }

  /**
   * Update institution subscription
   */
  async updateInstitutionSubscription(
    id: string,
    subscriptionPlan: string,
    updatedBy: string
  ): Promise<InstitutionDetails> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      const updatedInstitution = await this.prisma.institution.update({
        where: { id },
        data: {
          subscriptionPlan,
          lastModifiedBy: updatedBy,
          updatedAt: new Date(),
          customFields: {
            ...((institution.customFields as any) || {}),
            subscriptionHistory: [
              ...((institution.customFields as any)?.subscriptionHistory || []),
              {
                previousPlan: institution.subscriptionPlan,
                newPlan: subscriptionPlan,
                changedBy: updatedBy,
                changedAt: new Date()
              }
            ]
          }
        },
        include: {
          settings: true,
          createdByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          lastModifiedByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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

      loggerService.info(`Institution subscription updated: ${updatedInstitution.name} from ${institution.subscriptionPlan} to ${subscriptionPlan}`);

      return this.transformToDetails(updatedInstitution);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error updating institution subscription:', error);
      throw new Error('Failed to update institution subscription');
    }
  }

  /**
   * Get institution billing information
   */
  async getInstitutionBilling(id: string): Promise<any> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          subscriptionPlan: true,
          billingEmail: true,
          subscriptionData: true,
          customFields: true
        }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      // This would typically integrate with a billing service like Stripe
      const billing = {
        institution: {
          id: institution.id,
          name: institution.name
        },
        subscription: {
          plan: institution.subscriptionPlan,
          billingEmail: institution.billingEmail,
          data: institution.subscriptionData || {}
        },
        invoices: [], // Would fetch from billing service
        payments: [], // Would fetch from billing service
        usage: {
          currentPeriod: new Date().toISOString().slice(0, 7), // Current month
          users: 0, // Would calculate actual usage
          storage: 0,
          apiCalls: 0
        },
        history: (institution.customFields as any)?.subscriptionHistory || []
      };

      return billing;
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error getting institution billing:', error);
      throw new Error('Failed to retrieve institution billing information');
    }
  }

  /**
   * Generate billing report for institution
   */
  async generateBillingReport(id: string, startDate: Date, endDate: Date): Promise<any> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              createdAt: true,
              isActive: true,
              lastLogin: true
            },
            where: {
              createdAt: {
                gte: startDate,
                lte: endDate
              }
            }
          }
        }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      const report = {
        institution: {
          id: institution.id,
          name: institution.name,
          plan: institution.subscriptionPlan
        },
        period: {
          start: startDate,
          end: endDate
        },
        usage: {
          totalUsers: institution.users.length,
          activeUsers: institution.users.filter(u => u.isActive).length,
          newUsers: institution.users.filter(u => u.createdAt >= startDate && u.createdAt <= endDate).length,
          activeLogins: institution.users.filter(u => u.lastLogin && u.lastLogin >= startDate && u.lastLogin <= endDate).length
        },
        charges: {
          baseSubscription: this.calculateSubscriptionCharge(institution.subscriptionPlan),
          additionalUsers: 0, // Would calculate based on overages
          storage: 0, // Would calculate based on storage usage
          total: 0 // Would calculate total charges
        },
        generatedAt: new Date()
      };

      report.charges.total = report.charges.baseSubscription + report.charges.additionalUsers + report.charges.storage;

      return report;
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error generating billing report:', error);
      throw new Error('Failed to generate billing report');
    }
  }

  // Helper methods
  
  private calculateGrowthTrend(dates: Date[]): any {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return {
        month: date.toISOString().slice(0, 7),
        count: dates.filter(d => d.getFullYear() === date.getFullYear() && d.getMonth() === date.getMonth()).length
      };
    }).reverse();

    return {
      months,
      trend: months.length > 1 ? 
        ((months[months.length - 1].count - months[months.length - 2].count) / Math.max(months[months.length - 2].count, 1)) * 100 : 0
    };
  }

  private calculateSubscriptionCharge(plan: string): number {
    const basePrices = {
      basic: 99,
      professional: 299,
      enterprise: 999,
      custom: 0
    };
    return basePrices[plan as keyof typeof basePrices] || 0;
  }
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
      type: convertPrismaTypeToCustom(institution.type),
      category: convertPrismaCategoryToCustom(institution.category),
      address: institution.address,
      contactInfo: institution.contactInfo,
      logo: institution.logo || undefined,
      motto: institution.motto || undefined,
      description: institution.description || undefined,
      establishedYear: institution.establishedYear || undefined,
      timezone: institution.timezone,
      language: institution.language,
      currencies: institution.currencies,
      academicCalendar: institution.academicCalendar,
      customFields: institution.customFields,
      configuration: institution.configuration,
      subscriptionPlan: institution.subscriptionPlan,
      billingEmail: institution.billingEmail || undefined,
      subscriptionData: institution.subscriptionData,
      settings: institution.settings || undefined,
      isActive: institution.isActive,
      totalUsers: institution._count?.users || 0,
      totalFaculties: institution._count?.faculties || 0,
      totalCampuses: institution._count?.campuses || 0,
      createdAt: institution.createdAt,
      updatedAt: institution.updatedAt,
      createdBy: institution.createdByUser ? {
        id: institution.createdByUser.id,
        email: institution.createdByUser.email,
        firstName: institution.createdByUser.profile?.firstName || '',
        lastName: institution.createdByUser.profile?.lastName || ''
      } : undefined,
      lastModifiedBy: institution.lastModifiedByUser ? {
        id: institution.lastModifiedByUser.id,
        email: institution.lastModifiedByUser.email,
        firstName: institution.lastModifiedByUser.profile?.firstName || '',
        lastName: institution.lastModifiedByUser.profile?.lastName || ''
      } : undefined
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

  /**
   * Update institution integration settings
   */
  async updateInstitutionIntegrations(
    id: string,
    integrations: Partial<IntegrationConfig>,
    updatedBy: string
  ): Promise<InstitutionDetails> {
    try {
      const institution = await this.prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      const currentConfig = institution.configuration as unknown as InstitutionConfiguration;
      const updatedConfig = {
        ...currentConfig,
        integrations: {
          ...currentConfig.integrations,
          ...integrations
        }
      };

      const updatedInstitution = await this.prisma.institution.update({
        where: { id },
        data: {
          configuration: updatedConfig as any,
          lastModifiedBy: updatedBy,
          updatedAt: new Date()
        },
        include: {
          settings: true,
          createdByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          lastModifiedByUser: {
            select: { 
              id: true, 
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
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

      loggerService.info(`Institution integrations updated: ${updatedInstitution.name} by ${updatedBy}`);

      return this.transformToDetails(updatedInstitution);
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error updating institution integrations:', error);
      throw new Error('Failed to update institution integrations');
    }
  }

  /**
   * Get institution usage statistics
   */
  async getInstitutionUsageStats(id: string): Promise<any> {
    try {
      const cacheKey = `institution:usage:${id}`;
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const institution = await this.prisma.institution.findUnique({
        where: { id },
        include: {
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

      const currentConfig = institution.configuration as unknown as InstitutionConfiguration;
      
      const usageStats = {
        institution: {
          id: institution.id,
          name: institution.name,
          plan: institution.subscriptionPlan
        },
        limits: currentConfig.limits,
        current: {
          users: institution._count.users,
          faculties: institution._count.faculties,
          campuses: institution._count.campuses,
          storageUsed: 0, // Would calculate from actual usage
          apiRequestsThisMonth: 0 // Would calculate from logs
        },
        utilization: {
          users: Math.round((institution._count.users / currentConfig.limits.maxUsers) * 100),
          storage: 0, // Would calculate storage percentage
          apiRequests: 0 // Would calculate API usage percentage
        },
        timestamp: new Date().toISOString()
      };

      // Cache for 15 minutes
      await this.redis.client.setEx(cacheKey, 900, JSON.stringify(usageStats));

      return usageStats;
    } catch (error) {
      if (error instanceof Error && error.message === 'Institution not found') throw error;
      loggerService.error('Error getting institution usage stats:', error);
      throw new Error('Failed to retrieve institution usage statistics');
    }
  }

  // Helper methods for subscription management
  private getSubscriptionUserLimit(plan: string): number {
    const userLimits = {
      basic: 100,
      professional: 500,
      enterprise: 2000,
      custom: 10000
    };
    return userLimits[plan as keyof typeof userLimits] || 100;
  }
}
