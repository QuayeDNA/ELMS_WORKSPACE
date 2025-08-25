import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth.middleware';
import { requireSuperAdmin } from '@/middleware/rbac.middleware';
import logger from '@/utils/logger';

export const createSuperAdminRoutes = (prisma: PrismaClient) => {
  const router = Router();
  
  // Apply authentication and super admin middleware to all routes
  router.use(authenticateToken);
  router.use(requireSuperAdmin);

  // ==========================================
  // SYSTEM MANAGEMENT
  // ==========================================

  // Get system overview
  router.get('/overview', async (req: Request, res: Response) => {
    try {
      const [
        totalUsers,
        totalInstitutions,
        totalExams,
        totalIncidents,
        recentActivity
      ] = await Promise.all([
        prisma.user.count(),
        prisma.institution.count(),
        prisma.examSession.count(),
        prisma.incident.count(),
        prisma.auditLog.findMany({
          take: 10,
          orderBy: { timestamp: 'desc' },
          include: { user: { select: { email: true } } }
        })
      ]);

      res.json({
        systemStats: {
          totalUsers,
          totalInstitutions,
          totalExams,
          totalIncidents
        },
        recentActivity
      });
    } catch (error) {
      logger.error('Failed to fetch system overview:', error);
      res.status(500).json({ error: 'Failed to fetch system overview' });
    }
  });

  // Get system health status
  router.get('/health', async (req: Request, res: Response) => {
    try {
      // Check database connection
      const dbStatus = await prisma.$queryRaw`SELECT 1 as status`;
      
      // Get system metrics
      const systemMetrics = {
        database: dbStatus ? 'healthy' : 'unhealthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      };

      res.json(systemMetrics);
    } catch (error) {
      logger.error('System health check failed:', error);
      res.status(503).json({ error: 'System health check failed' });
    }
  });

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  // Get all users with detailed information
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50, role, search, status } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      if (role) where.role = role;
      if (status) where.isActive = status === 'active';
      if (search) {
        where.OR = [
          { email: { contains: search as string, mode: 'insensitive' } },
          { profile: { firstName: { contains: search as string, mode: 'insensitive' } } },
          { profile: { lastName: { contains: search as string, mode: 'insensitive' } } }
        ];
      }

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            profile: true,
            loginHistory: {
              where: { success: true },
              orderBy: { timestamp: 'desc' },
              take: 1,
              select: { timestamp: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      res.json({
        users,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          limit: Number(limit)
        }
      });
    } catch (error) {
      logger.error('Failed to fetch users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Create new user
  router.post('/users', async (req: Request, res: Response) => {
    try {
      const { email, role, profileData, password, isVerified = true, isActive = true } = req.body;

      // Hash password
      const bcrypt = require('bcryptjs');
      const passwordHash = await bcrypt.hash(password, 12);

      const newUser = await prisma.user.create({
        data: {
          email,
          role,
          passwordHash,
          isActive,
          isVerified, // Super admin can create pre-verified users
          createdById: (req as AuthenticatedRequest).user!.userId,
          profile: {
            create: profileData
          }
        },
        include: { profile: true }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'CREATE',
          entityType: 'USER',
          entityId: (req as AuthenticatedRequest).user!.userId,
          changes: { email, role },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.status(201).json(newUser);
    } catch (error) {
      logger.error('Failed to create user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  // Update user
  router.put('/users/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { role, isActive, isVerified, profileData } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          role,
          isActive,
          isVerified,
          profile: profileData ? { update: profileData } : undefined
        },
        include: { profile: true }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: userId,
          changes: { role, isActive, isVerified, profileData },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json(updatedUser);
    } catch (error) {
      logger.error('Failed to update user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Toggle user status (activate/deactivate)
  router.patch('/users/:userId/status', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        include: { profile: true }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'UPDATE',
          entityType: 'USER',
          entityId: userId,
          changes: { isActive },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json(updatedUser);
    } catch (error) {
      logger.error('Failed to update user status:', error);
      res.status(500).json({ error: 'Failed to update user status' });
    }
  });

  // Delete user (soft delete)
  router.delete('/users/:userId', async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;

      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'DELETE',
          entityType: 'USER',
          entityId: userId,
          changes: { isActive: false },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

  // ==========================================
  // INSTITUTION MANAGEMENT
  // ==========================================

  // Get all institutions
  router.get('/institutions', async (req: Request, res: Response) => {
    try {
      const institutions = await prisma.institution.findMany({
        include: {
          settings: true,
          _count: {
            select: {
              faculties: true,
              academicYears: true,
              campuses: true,
              schools: true
            }
          }
        }
      });

      res.json(institutions);
    } catch (error) {
      logger.error('Failed to fetch institutions:', error);
      res.status(500).json({ error: 'Failed to fetch institutions' });
    }
  });

  // Create new institution
  router.post('/institutions', async (req: Request, res: Response) => {
    try {
      const institutionData = req.body;

      const institution = await prisma.institution.create({
        data: institutionData
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'CREATE',
          entityType: 'USER', // Using USER since INSTITUTION is not in the enum
          entityId: institution.id,
          changes: institutionData,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.status(201).json(institution);
    } catch (error) {
      logger.error('Failed to create institution:', error);
      res.status(500).json({ error: 'Failed to create institution' });
    }
  });

  // ==========================================
  // AUDIT & MONITORING
  // ==========================================

  // Get audit logs
  router.get('/audit-logs', async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 50, action, entityType, userId, dateFrom, dateTo } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const where: any = {};
      
      if (action) where.action = action;
      if (entityType) where.entityType = entityType;
      if (userId) where.userId = userId;
      if (dateFrom || dateTo) {
        where.timestamp = {};
        if (dateFrom) where.timestamp.gte = new Date(dateFrom as string);
        if (dateTo) where.timestamp.lte = new Date(dateTo as string);
      }

      const [auditLogs, totalCount] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: {
              select: {
                email: true,
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

      res.json({
        auditLogs,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          limit: Number(limit)
        }
      });
    } catch (error) {
      logger.error('Failed to fetch audit logs:', error);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  // Get system analytics
  router.get('/analytics', async (req: Request, res: Response) => {
    try {
      const { timeframe = '7d' } = req.query;
      
      let dateFilter: Date;
      switch (timeframe) {
        case '24h':
          dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      }

      const [
        userActivity,
        roleDistribution,
        incidentTrends,
        examActivity
      ] = await Promise.all([
        prisma.auditLog.groupBy({
          by: ['action'],
          where: { timestamp: { gte: dateFilter } },
          _count: { action: true }
        }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        }),
        prisma.incident.groupBy({
          by: ['type'],
          where: { createdAt: { gte: dateFilter } },
          _count: { type: true }
        }),
        prisma.examSession.count({
          where: { createdAt: { gte: dateFilter } }
        })
      ]);

      res.json({
        timeframe,
        userActivity,
        roleDistribution,
        incidentTrends,
        examActivity
      });
    } catch (error) {
      logger.error('Failed to fetch analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  // ==========================================
  // SYSTEM CONFIGURATION
  // ==========================================

  // Get system configuration
  router.get('/configuration', async (req: Request, res: Response) => {
    try {
      const config = await prisma.systemConfiguration.findMany({
        orderBy: { category: 'asc' }
      });

      res.json(config);
    } catch (error) {
      logger.error('Failed to fetch configuration:', error);
      res.status(500).json({ error: 'Failed to fetch configuration' });
    }
  });

  // Update system configuration
  router.put('/configuration', async (req: Request, res: Response) => {
    try {
      const { configurations } = req.body;

      // Update configurations in a transaction
      const updates = await prisma.$transaction(
        configurations.map((config: any) =>
          prisma.systemConfiguration.upsert({
            where: { key: config.key },
            update: {
              value: config.value,
              description: config.description,
              modifiedBy: (req as AuthenticatedRequest).user!.userId
            },
            create: {
              key: config.key,
              value: config.value,
              description: config.description,
              category: config.category,
              environment: config.environment || 'PRODUCTION',
              modifiedBy: (req as AuthenticatedRequest).user!.userId
            }
          })
        )
      );

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'UPDATE',
          entityType: 'USER', // Using USER since SYSTEM_CONFIGURATION is not in the enum
          entityId: 'bulk',
          changes: configurations,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json(updates);
    } catch (error) {
      logger.error('Failed to update configuration:', error);
      res.status(500).json({ error: 'Failed to update configuration' });
    }
  });

  return router;
};
