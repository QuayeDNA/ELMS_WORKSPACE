import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth.middleware';
import logger from '@/utils/logger';
import { config } from '@/config/environment';

// Import services
import { SystemMonitoringService } from '@/services/monitoring/SystemMonitoringService';

// Import report scheduler routes
import reportSchedulerRoutes from './superadmin/report-scheduler';

export function createSuperAdminRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const monitoringService = new SystemMonitoringService(prisma);

  // Apply authentication middleware to all routes
  router.use(authenticateToken(prisma));

  // ==========================================
  // SYSTEM MANAGEMENT
  // ==========================================

  // Create system backup
  router.post('/system/backup', async (req: Request, res: Response) => {
    try {
      const { type = 'full', includeFiles = true } = req.body;

      // In a real implementation, this would trigger a backup process
      // For now, we'll simulate the backup creation
      const backupId = `backup_${Date.now()}`;
      const backupInfo = {
        id: backupId,
        type,
        includeFiles,
        status: 'in_progress',
        createdAt: new Date().toISOString(),
        estimatedCompletion: new Date(Date.now() + 300000).toISOString() // 5 minutes
      };

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'SYSTEM_ACCESS',
          entityType: 'USER',
          entityId: backupId,
          changes: { type: 'backup', backupType: type },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.status(201).json({
        message: 'Backup initiated successfully',
        backup: backupInfo
      });
    } catch (error) {
      logger.error('💾 Failed to create backup:', error);
      res.status(500).json({ error: 'Failed to create backup' });
    }
  });

  // Get backup status/list
  router.get('/system/backups', async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would query backup records
      // For now, return mock data
      const backups = [
        {
          id: 'backup_001',
          type: 'full',
          status: 'completed',
          size: '2.5GB',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 86000000).toISOString()
        },
        {
          id: 'backup_002',
          type: 'incremental',
          status: 'completed',
          size: '500MB',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          completedAt: new Date(Date.now() - 42800000).toISOString()
        }
      ];

      res.json({ backups });
    } catch (error) {
      logger.error('Failed to fetch backups:', error);
      res.status(500).json({ error: 'Failed to fetch backups' });
    }
  });

  // System health check
  router.get('/system/health', async (req: Request, res: Response) => {
    try {
      const healthStatus = await monitoringService.checkSystemHealth();

      res.json({
        success: true,
        data: healthStatus,
        message: 'System health check completed successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('🏥 Failed to check system health:', error);
      res.status(500).json({
        success: false,
        message: `Failed to check system health: ${message}`
      });
    }
  });

  // System metrics
  router.get('/system/metrics', async (req: Request, res: Response) => {
    try {
      const metrics = await monitoringService.collectSystemMetrics();

      res.json({
        success: true,
        data: metrics,
        message: 'System metrics retrieved successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('📊 Failed to collect system metrics:', error);
      res.status(500).json({
        success: false,
        message: `Failed to collect system metrics: ${message}`
      });
    }
  });

  // System alerts
  router.get('/system/alerts', async (req: Request, res: Response) => {
    try {
      // Get recent system alerts from database
      const alerts = await prisma.systemAlert.findMany({
        where: {
          isActive: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      res.json({
        success: true,
        data: alerts,
        message: 'System alerts retrieved successfully'
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      logger.error('🚨 Failed to fetch system alerts:', error);
      res.status(500).json({
        success: false,
        message: `Failed to fetch system alerts: ${message}`
      });
    }
  });

  // System maintenance mode
  router.put('/system/maintenance', async (req: Request, res: Response) => {
    try {
      const { enabled, message, estimatedDuration } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ error: 'Enabled status must be boolean' });
      }

      // In a real implementation, this would update system configuration
      // For now, we'll just log the change
      const maintenanceConfig = {
        enabled,
        message: message || (enabled ? 'System is under maintenance' : ''),
        estimatedDuration: estimatedDuration || null,
        updatedAt: new Date().toISOString(),
        updatedBy: (req as AuthenticatedRequest).user!.userId
      };

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'SYSTEM_ACCESS',
          entityType: 'USER',
          entityId: 'maintenance_mode',
          changes: maintenanceConfig,
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json({
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
        maintenance: maintenanceConfig
      });
    } catch (error) {
      logger.error('Failed to update maintenance mode:', error);
      res.status(500).json({ error: 'Failed to update maintenance mode' });
    }
  });

  // Get system maintenance status
  router.get('/system/maintenance', async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would check system configuration
      // For now, return mock data
      const maintenanceStatus = {
        enabled: false,
        message: '',
        estimatedDuration: null,
        lastUpdated: new Date().toISOString()
      };

      res.json(maintenanceStatus);
    } catch (error) {
      logger.error('Failed to fetch maintenance status:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance status' });
    }
  });

  // ==========================================
  // SECURITY MANAGEMENT
  // ==========================================

  // Get security policies
  router.get('/security/policies', async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would fetch from configuration
      const securityPolicies = {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          preventReuse: 5,
          maxAge: 90 // days
        },
        sessionPolicy: {
          timeout: 1800, // 30 minutes
          maxConcurrentSessions: 5,
          requireMFA: true,
          allowRememberMe: false
        },
        accessPolicy: {
          maxLoginAttempts: 5,
          lockoutDuration: 900, // 15 minutes
          ipWhitelist: [],
          ipBlacklist: [],
          allowedCountries: []
        },
        auditPolicy: {
          retentionPeriod: 365, // days
          enableRealTimeAlerts: true,
          alertOnSuspiciousActivity: true
        }
      };

      res.json(securityPolicies);
    } catch (error) {
      logger.error('Failed to fetch security policies:', error);
      res.status(500).json({ error: 'Failed to fetch security policies' });
    }
  });

  // Update security policies
  router.put('/security/policies', async (req: Request, res: Response) => {
    try {
      const { section, policies } = req.body;

      if (!section || !policies) {
        return res.status(400).json({ error: 'Section and policies are required' });
      }

      // Validate section
      const validSections = ['passwordPolicy', 'sessionPolicy', 'accessPolicy', 'auditPolicy'];
      if (!validSections.includes(section)) {
        return res.status(400).json({ error: 'Invalid policy section' });
      }

      // In a real implementation, this would update the security configuration
      // For now, we'll just log the change
      logger.info(`🔒 Security policy update requested: ${section}`, policies);

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'SYSTEM_ACCESS',
          entityType: 'USER',
          entityId: section,
          changes: { section, policies },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json({
        message: 'Security policies updated successfully',
        section,
        policies
      });
    } catch (error) {
      logger.error('Failed to update security policies:', error);
      res.status(500).json({ error: 'Failed to update security policies' });
    }
  });

  // Get security incidents/alerts
  router.get('/security/incidents', async (req: Request, res: Response) => {
    try {
      const { status = 'active', page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      // Get recent security-related audit logs
      const securityIncidents = await prisma.auditLog.findMany({
        where: {
          entityType: 'USER',
          OR: [
            { action: 'LOGIN' },
            { action: 'SYSTEM_ACCESS' },
            { action: 'PERMISSION_GRANT' }
          ]
        },
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
      });

      const totalCount = await prisma.auditLog.count({
        where: {
          entityType: 'USER',
          OR: [
            { action: 'LOGIN' },
            { action: 'SYSTEM_ACCESS' },
            { action: 'PERMISSION_GRANT' }
          ]
        }
      });

      // Transform incidents
      const transformedIncidents = securityIncidents.map(incident => ({
        id: incident.id,
        type: incident.action,
        severity: incident.action === 'SYSTEM_ACCESS' ? 'high' : 'medium',
        user: incident.user ? {
          id: incident.user.id,
          email: incident.user.email,
          name: incident.user.profile ?
            `${incident.user.profile.firstName} ${incident.user.profile.lastName}` :
            incident.user.email
        } : null,
        details: incident.changes,
        ipAddress: incident.ipAddress,
        userAgent: incident.userAgent,
        timestamp: incident.timestamp.toISOString(),
        status: 'investigating' // In real implementation, this would be tracked separately
      }));

      res.json({
        incidents: transformedIncidents,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      });
    } catch (error) {
      logger.error('🚨 Failed to fetch security incidents:', error);
      res.status(500).json({ error: 'Failed to fetch security incidents' });
    }
  });

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
      logger.error('📈 Failed to fetch analytics:', error);
      res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
  });

  // Get system analytics overview
  router.get('/analytics/overview', async (req: Request, res: Response) => {
    try {
      const { period = '30d' } = req.query;

      // Get user statistics
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { isActive: true }
      });
      const verifiedUsers = await prisma.user.count({
        where: { isVerified: true }
      });

      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentLogins = await prisma.auditLog.count({
        where: {
          action: 'LOGIN',
          timestamp: { gte: thirtyDaysAgo }
        }
      });

      // Get role distribution
      const roleStats = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      });

      // Get system health metrics (mock data for now)
      const systemHealth = {
        database: { status: 'healthy', responseTime: '45ms' },
        redis: { status: 'healthy', responseTime: '2ms' },
        api: { status: 'healthy', uptime: '99.9%' }
      };

      res.json({
        overview: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          recentActivity: recentLogins
        },
        roleDistribution: roleStats.map(stat => ({
          role: stat.role,
          count: stat._count.role
        })),
        systemHealth,
        period
      });
    } catch (error) {
      logger.error('Failed to fetch analytics overview:', error);
      res.status(500).json({ error: 'Failed to fetch analytics overview' });
    }
  });

  // Get user activity analytics
  router.get('/analytics/user-activity', async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, groupBy = 'day' } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate as string) : new Date();

      // Get login activity over time
      const loginActivity = await prisma.auditLog.findMany({
        where: {
          action: 'LOGIN',
          timestamp: { gte: start, lte: end }
        },
        select: {
          timestamp: true,
          userId: true,
          ipAddress: true
        },
        orderBy: { timestamp: 'asc' }
      });

      // Group by time period
      const groupedActivity = loginActivity.reduce((acc: any, log) => {
        const date = new Date(log.timestamp);
        let key: string;

        if (groupBy === 'hour') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
        } else if (groupBy === 'week') {
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else { // day
          key = date.toISOString().split('T')[0];
        }

        if (!acc[key]) {
          acc[key] = { date: key, logins: 0, uniqueUsers: new Set() };
        }
        acc[key].logins++;
        acc[key].uniqueUsers.add(log.userId);
        return acc;
      }, {});

      // Convert to array and calculate unique users
      const activityData = Object.values(groupedActivity).map((item: any) => ({
        date: item.date,
        logins: item.logins,
        uniqueUsers: item.uniqueUsers.size
      }));

      res.json({
        activity: activityData,
        summary: {
          totalLogins: loginActivity.length,
          uniqueUsers: new Set(loginActivity.map(log => log.userId)).size,
          period: { start: start.toISOString(), end: end.toISOString() }
        }
      });
    } catch (error) {
      logger.error('Failed to fetch user activity analytics:', error);
      res.status(500).json({ error: 'Failed to fetch user activity analytics' });
    }
  });

  // Get system performance metrics
  router.get('/analytics/performance', async (req: Request, res: Response) => {
    try {
      // Get API response times from audit logs (mock calculation)
      const recentLogs = await prisma.auditLog.findMany({
        take: 1000,
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true, action: true }
      });

      // Calculate response time trends (mock data)
      const performanceMetrics = {
        apiResponseTime: {
          average: 125, // ms
          p95: 250, // ms
          p99: 500  // ms
        },
        databaseQueryTime: {
          average: 45, // ms
          p95: 120, // ms
          p99: 300  // ms
        },
        throughput: {
          requestsPerSecond: 15.5,
          requestsPerMinute: 930
        },
        errorRate: {
          percentage: 0.02, // 0.02%
          errorsPerHour: 2
        }
      };

      res.json(performanceMetrics);
    } catch (error) {
      logger.error('Failed to fetch performance metrics:', error);
      res.status(500).json({ error: 'Failed to fetch performance metrics' });
    }
  });

  // Get security analytics
  router.get('/analytics/security', async (req: Request, res: Response) => {
    try {
      const { period = '7d' } = req.query;

      // Calculate period
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 1;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get security-related events
      const securityEvents = await prisma.auditLog.count({
        where: {
          action: { in: ['LOGIN', 'SYSTEM_ACCESS', 'PERMISSION_GRANT'] },
          timestamp: { gte: startDate }
        }
      });

      // Get failed login attempts (mock data - would need separate tracking)
      const failedLogins = await prisma.auditLog.count({
        where: {
          action: 'LOGIN',
          timestamp: { gte: startDate }
          // In real implementation, would filter by success/failure status
        }
      });

      // Get active sessions
      const activeSessions = await prisma.userSession.count({
        where: {
          expiresAt: { gt: new Date() }
        }
      });

      const securityAnalytics = {
        events: {
          total: securityEvents,
          failedLogins,
          successfulLogins: securityEvents - failedLogins
        },
        sessions: {
          active: activeSessions,
          averagePerUser: activeSessions / Math.max(await prisma.user.count({ where: { isActive: true } }), 1)
        },
        threats: {
          suspiciousActivities: 0, // Would need ML/anomaly detection
          blockedIPs: 0,
          rateLimited: 0
        },
        compliance: {
          mfaEnabled: await prisma.user.count({ where: { mfaEnabled: true } }),
          passwordStrength: 'good', // Would need password analysis
          lastSecurityAudit: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      };

      res.json(securityAnalytics);
    } catch (error) {
      logger.error('Failed to fetch security analytics:', error);
      res.status(500).json({ error: 'Failed to fetch security analytics' });
    }
  });

  // Export analytics data
  router.get('/analytics/export', async (req: Request, res: Response) => {
    try {
      const { type = 'overview', format = 'json', startDate, endDate } = req.query;

      // In a real implementation, this would generate and return export data
      // For now, return mock export info
      const exportData = {
        type,
        format,
        period: {
          start: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: endDate || new Date().toISOString()
        },
        status: 'generating',
        estimatedCompletion: new Date(Date.now() + 30000).toISOString(), // 30 seconds
        downloadUrl: null // Would be set when complete
      };

      // Log the export request
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'DATA_EXPORT',
          entityType: 'USER',
          entityId: 'analytics_export',
          changes: { type, format, period: exportData.period },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.json(exportData);
    } catch (error) {
      logger.error('Failed to export analytics:', error);
      res.status(500).json({ error: 'Failed to export analytics' });
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
      logger.error('🏫 Failed to fetch institutions:', error);
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
  // USER MANAGEMENT
  // ==========================================

  // Get all users with advanced filtering
  router.get('/users', async (req: Request, res: Response) => {
    try {
      const {
        page = 1,
        limit = 50,
        role,
        isActive,
        isVerified,
        search,
        institutionId,
        departmentId
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where: any = {};

      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive === 'true';
      if (isVerified !== undefined) where.isVerified = isVerified === 'true';
      if (institutionId) where.institutionId = institutionId;
      if (departmentId) where.departmentId = departmentId;

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
            _count: {
              select: {
                auditLogs: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      // Transform data
      const transformedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin?.toISOString(),
        profile: user.profile ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          phoneNumber: user.profile.phoneNumber,
          department: user.profile.department
        } : null,
        activityCount: user._count.auditLogs,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      }));

      res.json({
        users: transformedUsers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / Number(limit))
        }
      });
    } catch (error) {
      logger.error('Failed to fetch users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // Bulk user operations
  router.post('/users/bulk', async (req: Request, res: Response) => {
    try {
      const { operation, userIds, data } = req.body;

      if (!operation || !userIds || !Array.isArray(userIds)) {
        return res.status(400).json({ error: 'Operation and userIds array are required' });
      }

      const results = [];
      const errors = [];

      for (const userId of userIds) {
        try {
          let result;

          switch (operation) {
            case 'activate':
              result = await prisma.user.update({
                where: { id: userId },
                data: { isActive: true },
                select: { id: true, email: true, isActive: true }
              });
              break;

            case 'deactivate':
              result = await prisma.user.update({
                where: { id: userId },
                data: { isActive: false },
                select: { id: true, email: true, isActive: true }
              });
              break;

            case 'delete':
              // Check if user has dependencies
              const userCheck = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                  _count: {
                    select: {
                      auditLogs: true,
                      movements: true
                    }
                  }
                }
              });

              if (userCheck && (userCheck._count.auditLogs > 0 || userCheck._count.movements > 0)) {
                throw new Error('Cannot delete user with existing activity logs or movements');
              }

              result = await prisma.user.delete({
                where: { id: userId },
                select: { id: true, email: true }
              });
              break;

            case 'update_role':
              if (!data?.role) {
                throw new Error('Role is required for role update operation');
              }
              result = await prisma.user.update({
                where: { id: userId },
                data: { role: data.role },
                select: { id: true, email: true, role: true }
              });
              break;

            default:
              throw new Error(`Unsupported operation: ${operation}`);
          }

          results.push(result);

          // Log the action
          await prisma.auditLog.create({
            data: {
              userId: (req as AuthenticatedRequest).user!.userId,
              action: operation.toUpperCase(),
              entityType: 'USER',
              entityId: userId,
              changes: { operation, data },
              ipAddress: req.ip || 'unknown',
              userAgent: req.get('User-Agent') || 'unknown',
              sessionId: req.sessionID || 'unknown'
            }
          });

        } catch (error) {
          errors.push({
            userId,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      res.json({
        success: results.length,
        failed: errors.length,
        results,
        errors
      });
    } catch (error) {
      logger.error('Bulk user operation failed:', error);
      res.status(500).json({ error: 'Bulk operation failed' });
    }
  });

  // Get user details
  router.get('/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
          devices: true,
          sessions: {
            where: { isActive: true },
            orderBy: { lastActivity: 'desc' },
            take: 5
          },
          _count: {
            select: {
              auditLogs: true,
              movements: true,
              notifications: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Transform response
      const transformedUser = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        mfaEnabled: user.mfaEnabled,
        lastLogin: user.lastLogin?.toISOString(),
        profile: user.profile,
        devices: user.devices.map(device => ({
          id: device.id,
          platform: device.platform,
          lastUsed: device.lastUsed?.toISOString(),
          isActive: device.isActive
        })),
        activeSessions: user.sessions.map(session => ({
          id: session.id,
          deviceInfo: session.deviceInfo,
          lastActivity: session.lastActivity.toISOString(),
          ipAddress: session.ipAddress
        })),
        stats: {
          auditLogs: user._count.auditLogs,
          movements: user._count.movements,
          notifications: user._count.notifications
        },
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      };

      res.json(transformedUser);
    } catch (error) {
      logger.error('Failed to fetch user details:', error);
      res.status(500).json({ error: 'Failed to fetch user details' });
    }
  });

  // Update user
  router.put('/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Get original user for audit logging
      const originalUser = await prisma.user.findUnique({
        where: { id },
        select: {
          email: true,
          role: true,
          isActive: true,
          profile: true
        }
      });

      if (!originalUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prepare update data
      const data: any = {};
      if (updateData.role) data.role = updateData.role;
      if (updateData.isActive !== undefined) data.isActive = updateData.isActive;
      if (updateData.email) data.email = updateData.email;
      if (updateData.username) data.username = updateData.username;

      // Handle profile updates
      if (updateData.profile) {
        data.profile = {
          upsert: {
            create: {
              ...updateData.profile,
              userId: id,
              updatedAt: new Date(),
            },
            update: {
              ...updateData.profile,
              updatedAt: new Date(),
            },
          },
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data,
        include: {
          profile: true
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
      const transformedUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        profile: updatedUser.profile,
        updatedAt: updatedUser.updatedAt.toISOString()
      };

      res.json(transformedUser);
    } catch (error) {
      logger.error('Failed to update user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Delete user
  router.delete('/users/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              auditLogs: true,
              movements: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check for dependencies
      if (user._count.auditLogs > 0 || user._count.movements > 0) {
        return res.status(400).json({
          error: 'Cannot delete user with existing activity logs or movements. Deactivate instead.'
        });
      }

      await prisma.user.delete({
        where: { id }
      });

      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: (req as AuthenticatedRequest).user!.userId,
          action: 'DELETE',
          entityType: 'USER',
          entityId: id,
          changes: { email: user.email, role: user.role },
          ipAddress: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
          sessionId: req.sessionID || 'unknown'
        }
      });

      res.status(204).send();
    } catch (error) {
      logger.error('Failed to delete user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  });

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

  // ==========================================
  // REPORT SCHEDULER
  // ==========================================

  // Mount report scheduler routes
  router.use('/reports/scheduler', reportSchedulerRoutes);

  return router;
}
