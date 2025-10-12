import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  CreateInstitutionRequest,
  UpdateInstitutionRequest,
  InstitutionQuery,
  InstitutionStats,
  InstitutionSpecificAnalytics,
  CreateInstitutionWithAdminRequest,
  InstitutionWithAdminResponse,
  InstitutionType,
  InstitutionStatus,
  Institution
} from '../types/institution';
import { UserRole, UserStatus } from '../types/auth';
import {
  PaginatedResponse,
  ApiResponse,
  createPaginatedResponse,
  createSuccessResponse
} from '../types/shared/api';
import { normalizeQuery } from '../types/shared/query';

const prisma = new PrismaClient();

export class InstitutionService {
  // ========================================
  // BASIC CRUD OPERATIONS
  // ========================================

  async createInstitution(data: CreateInstitutionRequest) {
    try {
      // Check if institution code already exists
      const existingInstitution = await prisma.institution.findUnique({
        where: { code: data.code }
      });

      if (existingInstitution) {
        throw new Error(`Institution with code '${data.code}' already exists`);
      }

      const institution = await prisma.institution.create({
        data: {
          ...data,
          status: InstitutionStatus.PENDING
        }
      });

      return institution;
    } catch (error) {
      console.error('Error creating institution:', error);
      throw error;
    }
  }

  async getInstitutionById(id: number) {
    try {
      const institution = await prisma.institution.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              status: true,
              lastLogin: true
            }
          },
          faculties: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      return institution;
    } catch (error) {
      console.error('Error fetching institution:', error);
      throw error;
    }
  }

  async getInstitutions(query: InstitutionQuery = {}): Promise<PaginatedResponse<Institution>> {
    try {
      const {
        page,
        limit,
        search,
        type,
        status,
        sortBy = 'createdAt',
        sortOrder
      } = normalizeQuery(query);

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (type) {
        where.type = type;
      }

      if (status) {
        where.status = status;
      }

      // Get institutions with pagination
      const [institutions, total] = await Promise.all([
        prisma.institution.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            _count: {
              select: {
                users: true,
                faculties: true
              }
            }
          }
        }),
        prisma.institution.count({ where })
      ]);

      // Transform institutions to match Institution type
      const transformedInstitutions = institutions.map(({ _count, ...inst }) => ({
        ...inst,
        type: inst.type as InstitutionType,
        status: inst.status as InstitutionStatus,
        establishedYear: inst.establishedYear ?? undefined,
        address: inst.address ?? undefined,
        city: inst.city ?? undefined,
        state: inst.state ?? undefined,
        country: inst.country ?? undefined,
        contactEmail: inst.contactEmail ?? undefined,
        contactPhone: inst.contactPhone ?? undefined,
        website: inst.website ?? undefined,
        description: inst.description ?? undefined,
        logoUrl: inst.logoUrl ?? undefined
      })) as Institution[];

      return createPaginatedResponse(
        transformedInstitutions,
        page,
        limit,
        total,
        'Institutions retrieved successfully'
      );
    } catch (error) {
      console.error('Error fetching institutions:', error);
      throw error;
    }
  }

  async updateInstitution(id: number, data: UpdateInstitutionRequest) {
    try {
      // Check if institution exists
      const existingInstitution = await prisma.institution.findUnique({
        where: { id }
      });

      if (!existingInstitution) {
        throw new Error('Institution not found');
      }

      // Check if code is being updated and doesn't conflict
      if (data.code && data.code !== existingInstitution.code) {
        const codeExists = await prisma.institution.findUnique({
          where: { code: data.code }
        });

        if (codeExists) {
          throw new Error(`Institution with code '${data.code}' already exists`);
        }
      }

      const institution = await prisma.institution.update({
        where: { id },
        data
      });

      return institution;
    } catch (error) {
      console.error('Error updating institution:', error);
      throw error;
    }
  }

  async deleteInstitution(id: number) {
    try {
      // Check if institution exists
      const institution = await prisma.institution.findUnique({
        where: { id },
        include: {
          users: true,
          faculties: true
        }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      // Check if institution has users or faculties
      if (institution.users.length > 0 || institution.faculties.length > 0) {
        throw new Error('Cannot delete institution with existing users or faculties');
      }

      await prisma.institution.delete({
        where: { id }
      });

      return { message: 'Institution deleted successfully' };
    } catch (error) {
      console.error('Error deleting institution:', error);
      throw error;
    }
  }

  // ========================================
  // ANALYTICS & STATS
  // ========================================

  async getInstitutionStats(): Promise<InstitutionStats> {
    try {
      const [
        totalInstitutions,
        activeInstitutions,
        inactiveInstitutions,
        pendingInstitutions,
        institutionsByType,
        recentInstitutions
      ] = await Promise.all([
        // Total count
        prisma.institution.count(),

        // Active count
        prisma.institution.count({
          where: { status: InstitutionStatus.ACTIVE }
        }),

        // Inactive count
        prisma.institution.count({
          where: { status: InstitutionStatus.INACTIVE }
        }),

        // Pending count
        prisma.institution.count({
          where: { status: InstitutionStatus.PENDING }
        }),

        // Group by type
        prisma.institution.groupBy({
          by: ['type'],
          _count: {
            type: true
          }
        }),

        // Recent institutions
        prisma.institution.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            status: true,
            establishedYear: true,
            address: true,
            city: true,
            state: true,
            country: true,
            contactEmail: true,
            contactPhone: true,
            website: true,
            description: true,
            logoUrl: true,
            createdAt: true,
            updatedAt: true
          }
        })
      ]);

      // Convert type grouping to record
      const typeRecord: Record<InstitutionType, number> = {
        [InstitutionType.UNIVERSITY]: 0,
        [InstitutionType.TECHNICAL_UNIVERSITY]: 0,
        [InstitutionType.POLYTECHNIC]: 0,
        [InstitutionType.COLLEGE]: 0,
        [InstitutionType.INSTITUTE]: 0,
        [InstitutionType.OTHER]: 0
      };

      institutionsByType.forEach(item => {
        if (item.type in typeRecord) {
          typeRecord[item.type as InstitutionType] = item._count.type;
        }
      });

      // Transform recent institutions to match Institution type
      const transformedRecentInstitutions = recentInstitutions.map(inst => ({
        ...inst,
        type: inst.type as InstitutionType,
        status: inst.status as InstitutionStatus,
        establishedYear: inst.establishedYear ?? undefined,
        address: inst.address ?? undefined,
        city: inst.city ?? undefined,
        state: inst.state ?? undefined,
        country: inst.country ?? undefined,
        contactEmail: inst.contactEmail ?? undefined,
        contactPhone: inst.contactPhone ?? undefined,
        website: inst.website ?? undefined,
        description: inst.description ?? undefined,
        logoUrl: inst.logoUrl ?? undefined
      }));

      return {
        totalInstitutions,
        activeInstitutions,
        inactiveInstitutions,
        pendingInstitutions,
        institutionsByType: typeRecord,
        recentInstitutions: transformedRecentInstitutions
      };
    } catch (error) {
      console.error('Error fetching institution stats:', error);
      throw error;
    }
  }

  async getInstitutionAnalytics(institutionId: number): Promise<InstitutionSpecificAnalytics> {
    try {
      // First check if institution exists
      const institution = await prisma.institution.findUnique({
        where: { id: institutionId }
      });

      if (!institution) {
        throw new Error('Institution not found');
      }

      const [
        totalUsers,
        activeUsers,
        totalStudents,
        totalLecturers,
        totalAdmins,
        totalFaculties,
        usersByRole,
        facultyDetails,
        recentUserRegistrations,
        recentFacultyCreations
      ] = await Promise.all([
        // Total users in institution
        prisma.user.count({
          where: { institutionId }
        }),

        // Active users count
        prisma.user.count({
          where: {
            institutionId,
            status: UserStatus.ACTIVE
          }
        }),

        // Students count
        prisma.user.count({
          where: {
            institutionId,
            role: UserRole.STUDENT
          }
        }),

        // Lecturers count
        prisma.user.count({
          where: {
            institutionId,
            role: UserRole.LECTURER
          }
        }),

        // Admins count
        prisma.user.count({
          where: {
            institutionId,
            role: {
              in: [UserRole.ADMIN, UserRole.FACULTY_ADMIN]
            }
          }
        }),

        // Total faculties
        prisma.faculty.count({
          where: { institutionId }
        }),

        // Users grouped by role
        prisma.user.groupBy({
          by: ['role'],
          where: { institutionId },
          _count: {
            role: true
          }
        }),

        // Faculty details with user counts
        prisma.faculty.findMany({
          where: { institutionId },
          include: {
            _count: {
              select: {
                users: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }),

        // Recent user registrations (last 7 days)
        prisma.user.count({
          where: {
            institutionId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        // Recent faculty creations (last 7 days)
        prisma.faculty.count({
          where: {
            institutionId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      // Transform usersByRole to a simple record
      const usersByRoleMap: Record<string, number> = {};
      usersByRole.forEach(item => {
        usersByRoleMap[item.role] = item._count.role;
      });

      // Transform faculty details
      const facultyDetailsTransformed = facultyDetails.map(faculty => ({
        id: faculty.id,
        name: faculty.name,
        code: faculty.code,
        userCount: faculty._count.users
      }));

      // Create recent activity data
      const recentActivity = [
        {
          type: 'User Registration',
          count: recentUserRegistrations,
          time: 'Last 7 days'
        },
        {
          type: 'Faculty Created',
          count: recentFacultyCreations,
          time: 'Last 7 days'
        }
      ];

      return {
        totalUsers,
        activeUsers,
        totalStudents,
        totalLecturers,
        totalAdmins,
        totalFaculties,
        usersByRole: usersByRoleMap,
        facultyDetails: facultyDetailsTransformed,
        recentActivity,
        performanceMetrics: {
          studentSatisfaction: 95, // This could be calculated from actual data
          courseCompletion: 88,    // This could be calculated from actual data
          facultyRating: 92        // This could be calculated from actual data
        }
      };
    } catch (error) {
      console.error('Error fetching institution analytics:', error);
      throw error;
    }
  }

  // ========================================
  // INSTITUTION WITH ADMIN REGISTRATION
  // ========================================

  async createInstitutionWithAdmin(data: CreateInstitutionWithAdminRequest): Promise<InstitutionWithAdminResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Create institution
        const institution = await tx.institution.create({
          data: {
            ...data.institution,
            status: InstitutionStatus.PENDING
          }
        });

        // 2. Check if admin email already exists
        const existingUser = await tx.user.findUnique({
          where: { email: data.admin.email }
        });

        if (existingUser) {
          throw new Error(`User with email '${data.admin.email}' already exists`);
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(data.admin.password, 12);

        // 4. Create admin user
        const adminUser = await tx.user.create({
          data: {
            email: data.admin.email,
            password: hashedPassword,
            firstName: data.admin.firstName,
            lastName: data.admin.lastName,
            phone: data.admin.phone,
            role: UserRole.ADMIN,
            status: UserStatus.ACTIVE,
            institutionId: institution.id,
            emailVerified: true // Auto-verify institution admin
          }
        });

        return {
          institution: {
            ...institution,
            type: institution.type as InstitutionType,
            status: institution.status as InstitutionStatus,
            establishedYear: institution.establishedYear ?? undefined,
            address: institution.address ?? undefined,
            city: institution.city ?? undefined,
            state: institution.state ?? undefined,
            country: institution.country ?? undefined,
            contactEmail: institution.contactEmail ?? undefined,
            contactPhone: institution.contactPhone ?? undefined,
            website: institution.website ?? undefined,
            description: institution.description ?? undefined,
            logoUrl: institution.logoUrl ?? undefined
          },
          admin: {
            id: adminUser.id,
            email: adminUser.email,
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            role: adminUser.role,
            status: adminUser.status,
            institutionId: adminUser.institutionId!
          }
        };
      });
    } catch (error) {
      console.error('Error creating institution with admin:', error);
      throw error;
    }
  }

  async getInstitutionAdmins(institutionId: number) {
    try {
      const admins = await prisma.user.findMany({
        where: {
          institutionId,
          role: {
            in: [UserRole.ADMIN, UserRole.FACULTY_ADMIN]
          }
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return admins;
    } catch (error) {
      console.error('Error fetching institution admins:', error);
      throw error;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  async activateInstitution(id: number) {
    return this.updateInstitution(id, { status: InstitutionStatus.ACTIVE });
  }

  async deactivateInstitution(id: number) {
    return this.updateInstitution(id, { status: InstitutionStatus.INACTIVE });
  }

  async searchInstitutions(searchTerm: string) {
    try {
      const institutions = await prisma.institution.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm } },
            { code: { contains: searchTerm } },
            { city: { contains: searchTerm } }
          ]
        },
        take: 10,
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          status: true,
          city: true,
          state: true
        },
        orderBy: { name: 'asc' }
      });

      return institutions;
    } catch (error) {
      console.error('Error searching institutions:', error);
      throw error;
    }
  }
}

export const institutionService = new InstitutionService();
