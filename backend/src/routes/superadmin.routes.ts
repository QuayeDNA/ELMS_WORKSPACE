import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth.middleware';
import logger from '@/utils/logger';
import { config } from '@/config/environment';

export function createSuperAdminRoutes(): Router {
  const router = Router();
  const prisma = new PrismaClient();

  // Apply authentication middleware to all routes
  router.use(authenticateToken);

  // ==========================================
  // ANALYTICS
  // ==========================================

  // Get analytics data
  router.get('/analytics', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter = startDate && endDate ? {
        createdAt: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      } : {};

      // Get user growth data
      const userGrowth = await prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as count
        FROM "User"
        WHERE "createdAt" >= ${dateFilter.createdAt?.gte || new Date('2024-01-01')}
        AND "createdAt" <= ${dateFilter.createdAt?.lte || new Date()}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month
      `;

      // Get exam session statistics
      const examStats = await prisma.examSession.aggregate({
        where: dateFilter,
        _count: { id: true },
        _avg: { duration: true }
      });

      // Get institution statistics
      const institutionStats = await prisma.institution.aggregate({
        _count: { id: true }
      });

      // Get regional distribution
      const regionalStats = await prisma.$queryRaw`
        SELECT
          (address->>'region') as region,
          COUNT(*) as institution_count
        FROM "Institution"
        GROUP BY (address->>'region')
        ORDER BY institution_count DESC
      `;

      // Get recent activity
      const recentActivity = await prisma.auditLog.findMany({
        take: 10,
        include: {
          user: {
            include: {
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: { timestamp: 'desc' }
      });

      const analytics = {
        userGrowth: userGrowth || [],
        examStats: {
          total: examStats._count.id,
          averageDuration: examStats._avg.duration || 0
        },
        institutionStats: {
          total: institutionStats._count.id
        },
        regionalStats: regionalStats || [],
        recentActivity: recentActivity.map(activity => ({
          id: activity.id,
          user: activity.user.profile ? {
            firstName: activity.user.profile.firstName,
            lastName: activity.user.profile.lastName
          } : null,
          action: activity.action,
          entityType: activity.entityType,
          createdAt: activity.timestamp.toISOString()
        }))
      };

      res.json(analytics);
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  // ==========================================
  // INSTITUTION MANAGEMENT
  // ==========================================

  // Get all institutions
  router.get('/institutions', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50, type, status, search } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (type) where.type = type;
      if (status !== undefined) where.isActive = status === 'active';
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { code: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const institutions = await prisma.institution.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' }
      });

      const totalCount = await prisma.institution.count({ where });

      // Transform data to match frontend expectations
      const transformedInstitutions = institutions.map(inst => ({
        id: inst.id,
        name: inst.name,
        code: inst.code,
        type: inst.type,
        location: inst.address, // Address is stored as JSON
        contactEmail: inst.contactInfo ? (inst.contactInfo as any).email : null,
        contactPhone: inst.contactInfo ? (inst.contactInfo as any).phone : null,
        website: inst.contactInfo ? (inst.contactInfo as any).website : null,
        established: inst.establishedYear,
        status: inst.isActive ? 'active' : 'inactive',
        totalUsers: 0, // Will be calculated separately
        totalExams: 0, // Would need to calculate from exam sessions
        createdAt: inst.createdAt.toISOString(),
        updatedAt: inst.updatedAt.toISOString()
      }));

      res.json({
        institutions: transformedInstitutions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Failed to fetch institutions:', error);
      res.status(500).json({ error: 'Failed to fetch institutions' });
    }
  });

  // Get single institution
  router.get('/institutions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const institution = await prisma.institution.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              faculties: true
            }
          }
        }
      });

      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' });
      }

      // Transform data to match frontend expectations
      const transformedInstitution = {
        id: institution.id,
        name: institution.name,
        code: institution.code,
        type: institution.type,
        location: institution.address,
        contactEmail: institution.contactInfo ? (institution.contactInfo as any).email : null,
        contactPhone: institution.contactInfo ? (institution.contactInfo as any).phone : null,
        website: institution.contactInfo ? (institution.contactInfo as any).website : null,
        established: institution.establishedYear,
        status: institution.isActive ? 'active' : 'inactive',
        totalUsers: institution._count.faculties,
        totalExams: 0,
        createdAt: institution.createdAt.toISOString(),
        updatedAt: institution.updatedAt.toISOString()
      };

      res.json(transformedInstitution);
    } catch (error) {
      logger.error('Failed to fetch institution:', error);
      res.status(500).json({ error: 'Failed to fetch institution' });
    }
  });

  // Create institution
  router.post('/institutions', async (req: Request, res: Response) => {
    try {
      const {
        name,
        code,
        type,
        location,
        contactEmail,
        contactPhone,
        website,
        established,
        status = 'active'
      } = req.body;

      const newInstitution = await prisma.institution.create({
        data: {
          name,
          code,
          type,
          address: location,
          contactInfo: {
            email: contactEmail,
            phone: contactPhone,
            website: website
          },
          establishedYear: established,
          isActive: status === 'active',
          academicCalendar: {
            semesters: ['First Semester', 'Second Semester'],
            academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
          },
          config: {
            allowSelfRegistration: true,
            requireEmailVerification: true,
            passwordPolicy: {
              minLength: 8,
              requireUppercase: true,
              requireLowercase: true,
              requireNumbers: true,
              requireSymbols: false
            },
            gradingSystem: 'Ghanaian Standard',
            maintenanceMode: false
          }
        }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'CREATE',
          entityType: 'USER', // Using USER as closest match
          entityId: newInstitution.id,
          changes: { name, code, type },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      // Transform response
      const transformedInstitution = {
        id: newInstitution.id,
        name: newInstitution.name,
        code: newInstitution.code,
        type: newInstitution.type,
        location: newInstitution.address,
        contactEmail: contactEmail,
        contactPhone: contactPhone,
        website: website,
        established: newInstitution.establishedYear,
        status: newInstitution.isActive ? 'active' : 'inactive',
        totalUsers: 0, // Will be calculated separately
        totalExams: 0,
        createdAt: newInstitution.createdAt.toISOString(),
        updatedAt: newInstitution.updatedAt.toISOString()
      };

      res.status(201).json(transformedInstitution);
    } catch (error) {
      logger.error('Failed to create institution:', error);
      res.status(500).json({ error: 'Failed to create institution' });
    }
  });

  // Update institution
  router.put('/institutions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get the original institution for audit logging
      const originalInstitution = await prisma.institution.findUnique({
        where: { id }
      });

      if (!originalInstitution) {
        return res.status(404).json({ error: 'Institution not found' });
      }

      // Prepare update data
      const data: any = {};
      if (updateData.name) data.name = updateData.name;
      if (updateData.code) data.code = updateData.code;
      if (updateData.type) data.type = updateData.type;
      if (updateData.location) data.address = updateData.location;
      if (updateData.contactEmail || updateData.contactPhone || updateData.website) {
        data.contactInfo = {
          email: updateData.contactEmail,
          phone: updateData.contactPhone,
          website: updateData.website
        };
      }
      if (updateData.established) data.establishedYear = updateData.established;
      if (updateData.status) data.isActive = updateData.status === 'active';

      const updatedInstitution = await prisma.institution.update({
        where: { id },
        data,
        include: {
          _count: {
            select: {
              faculties: true
            }
          }
        }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: id,
          changes: updateData,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      // Transform response
      const transformedInstitution = {
        id: updatedInstitution.id,
        name: updatedInstitution.name,
        code: updatedInstitution.code,
        type: updatedInstitution.type,
        location: updatedInstitution.address,
        contactEmail: updatedInstitution.contactInfo ? (updatedInstitution.contactInfo as any).email : null,
        contactPhone: updatedInstitution.contactInfo ? (updatedInstitution.contactInfo as any).phone : null,
        website: updatedInstitution.contactInfo ? (updatedInstitution.contactInfo as any).website : null,
        established: updatedInstitution.establishedYear,
        status: updatedInstitution.isActive ? 'active' : 'inactive',
        totalUsers: updatedInstitution._count.faculties,
        totalExams: 0,
        createdAt: updatedInstitution.createdAt.toISOString(),
        updatedAt: updatedInstitution.updatedAt.toISOString()
      };

      res.json(transformedInstitution);
    } catch (error) {
      logger.error('Failed to update institution:', error);
      res.status(500).json({ error: 'Failed to update institution' });
    }
  });

  // Delete institution
  router.delete('/institutions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if institution exists
      const institution = await prisma.institution.findUnique({
        where: { id }
      });

      if (!institution) {
        return res.status(404).json({ error: 'Institution not found' });
      }

      // Check if institution has faculties
      const facultyCount = await prisma.faculty.count({
        where: { institutionId: id }
      });

      if (facultyCount > 0) {
        return res.status(400).json({
          error: 'Cannot delete institution with existing faculties. Please reassign or remove all faculties first.'
        });
      }

      await prisma.institution.delete({
        where: { id }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'DELETE',
          entityType: 'USER',
          entityId: id,
          changes: { name: institution.name, code: institution.code },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete institution:', error);
      res.status(500).json({ error: 'Failed to delete institution' });
    }
  });

  // ==========================================
  // AUDIT LOG MANAGEMENT
  // ==========================================

  // Get audit logs
  router.get('/audit-logs', async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 50,
        userId,
        action,
        entityType,
        entityId,
        startDate,
        endDate,
        search
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (entityId) where.entityId = entityId;

      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate as string);
        if (endDate) where.timestamp.lte = new Date(endDate as string);
      }

      if (search) {
        where.OR = [
          { changes: { string_contains: search as string } },
          { ipAddress: { contains: search as string } }
        ];
      }

      const [auditLogs, totalCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { timestamp: 'desc' }
        }),
        prisma.auditLog.count({ where })
      ]);

      // Transform data to match frontend expectations
      const transformedLogs = auditLogs.map(log => ({
        id: log.id,
        userId: log.userId,
        user: log.user.profile ? {
          firstName: log.user.profile.firstName,
          lastName: log.user.profile.lastName
        } : null,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        changes: log.changes,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        sessionId: log.sessionId,
        createdAt: log.timestamp.toISOString()
      }));

      res.json({
        logs: transformedLogs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Failed to fetch audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Get audit log statistics
  router.get('/audit-logs/stats', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;

      const dateFilter = startDate && endDate ? {
        timestamp: {
          gte: new Date(startDate as string),
          lte: new Date(endDate as string)
        }
      } : {};

      const [
        totalLogs,
        actionStats,
        entityStats,
        recentActivity
      ] = await Promise.all([
        prisma.auditLog.count({ where: dateFilter }),
        prisma.auditLog.groupBy({
          by: ['action'],
          where: dateFilter,
          _count: { action: true }
        }),
        prisma.auditLog.groupBy({
          by: ['entityType'],
          where: dateFilter,
          _count: { entityType: true }
        }),
        prisma.auditLog.findMany({
          where: dateFilter,
          take: 10,
          include: {
            user: {
              include: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: { timestamp: 'desc' }
        })
      ]);

      const transformedStats = {
        totalLogs,
        actionBreakdown: actionStats.map(stat => ({
          action: stat.action,
          count: stat._count.action
        })),
        entityBreakdown: entityStats.map(stat => ({
          entityType: stat.entityType,
          count: stat._count.entityType
        })),
        recentActivity: recentActivity.map(log => ({
          id: log.id,
          user: log.user.profile ? {
            firstName: log.user.profile.firstName,
            lastName: log.user.profile.lastName
          } : null,
          action: log.action,
          entityType: log.entityType,
          createdAt: log.timestamp.toISOString()
        }))
      };

      res.json(transformedStats);
    } catch (error) {
      logger.error('Failed to fetch audit log stats:', error);
      res.status(500).json({ error: 'Failed to fetch audit log statistics' });
    }
  });

  // ==========================================
  // CONFIGURATION MANAGEMENT
  // ==========================================

  // Get system configuration
  router.get('/config', async (req: Request, res: Response) => {
    try {
      // Get configuration from database or environment
      const systemConfig = {
        app: {
          name: config.institution.name,
          version: '1.0.0', // Hardcoded for now
          environment: config.env,
          port: config.server.port
        },
        database: {
          type: 'PostgreSQL',
          url: config.database.url,
          poolSize: config.database.poolSize
        },
        security: {
          jwtSecret: '***masked***',
          jwtExpiresIn: config.auth.jwtExpiresIn,
          sessionTimeout: config.auth.sessionTimeout,
          corsOrigins: config.security.allowedOrigins
        },
        email: {
          host: config.email.host,
          port: config.email.port,
          from: config.email.from
        },
        features: {
          realtimeUpdates: true,
          auditLogging: true,
          fileUploads: true,
          notifications: true
        }
      };

      res.json(systemConfig);
    } catch (error) {
      logger.error('Failed to fetch system configuration:', error);
      res.status(500).json({ error: 'Failed to fetch system configuration' });
    }
  });

  // Update system configuration
  router.put('/config', async (req: Request, res: Response) => {
    try {
      const { section, key, value } = req.body;

      // Validate input
      if (!section || !key) {
        return res.status(400).json({ error: 'Section and key are required' });
      }

      // In a real implementation, you would update the configuration
      // For now, we'll just log the change and return success
      logger.info(`Configuration update requested: ${section}.${key} = ${value}`);

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: `${section}.${key}`,
          changes: { section, key, value },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json({
        message: 'Configuration updated successfully',
        section,
        key,
        value
      });
    } catch (error) {
      logger.error('Failed to update system configuration:', error);
      res.status(500).json({ error: 'Failed to update system configuration' });
    }
  });

  // Get system health
  router.get('/health', async (req: Request, res: Response) => {
    try {
      // Check database connectivity
      const dbHealth = await prisma.$queryRaw`SELECT 1 as health_check`;

      // Check system resources
      const systemHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: dbHealth ? 'connected' : 'disconnected',
        version: '1.0.0'
      };

      res.json(systemHealth);
    } catch (error) {
      logger.error('Health check failed:', error);
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'System health check failed'
      });
    }
  });

  // Get system statistics
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const [
        userCount,
        institutionCount,
        examSessionCount,
        activeSessionCount
      ] = await Promise.all([
        prisma.user.count(),
        prisma.institution.count(),
        prisma.examSession.count(),
        prisma.examSession.count({ where: { status: 'SCHEDULED' } })
      ]);

      const systemStats = {
        users: {
          total: userCount,
          active: userCount
        },
        institutions: {
          total: institutionCount,
          active: institutionCount
        },
        exams: {
          total: examSessionCount,
          active: activeSessionCount
        },
        system: {
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          nodeVersion: process.version
        }
      };

      res.json(systemStats);
    } catch (error) {
      logger.error('Failed to fetch system statistics:', error);
      res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
  });

  return router;
}
