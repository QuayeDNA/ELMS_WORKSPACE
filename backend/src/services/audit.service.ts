import { PrismaClient, AuditAction, EntityType } from '@prisma/client';
import { logger } from '../utils/logger';

export interface AuditLogData {
  userId: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface AuditSearchFilters {
  userId?: string;
  action?: AuditAction[];
  entityType?: EntityType[];
  entityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  ipAddress?: string;
  page?: number;
  limit?: number;
}

export interface SecurityEvent {
  type: 'LOGIN_FAILURE' | 'SUSPICIOUS_ACTIVITY' | 'PERMISSION_ESCALATION' | 'DATA_BREACH' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
}

export class AuditService {
  private readonly prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Create an audit log entry
   */
  async createAuditLog(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entityType: data.entityType,
          entityId: data.entityId,
          changes: data.changes || {},
          ipAddress: data.ipAddress || 'unknown',
          userAgent: data.userAgent || 'unknown',
          sessionId: data.sessionId || 'unknown',
          timestamp: new Date(),
        },
      });

      // Check for security-sensitive actions
      await this.checkSecurityEvent(data);
    } catch (error) {
      logger.error('Error creating audit log:', error);
      // Don't throw - audit logging should not break application flow
    }
  }

  /**
   * Log user authentication events
   */
  async logAuthentication(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE',
    success: boolean,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ): Promise<void> {
    const auditAction = action === 'LOGIN' ? AuditAction.LOGIN :
                       action === 'LOGOUT' ? AuditAction.LOGOUT :
                       AuditAction.PASSWORD_CHANGE;

    await this.createAuditLog({
      userId,
      action: auditAction,
      entityType: EntityType.USER,
      entityId: userId,
      changes: { success, ...details },
      ipAddress,
      userAgent,
    });

    // Log failed login attempts for security monitoring
    if (!success && action === 'LOGIN') {
      await this.logSecurityEvent({
        type: 'LOGIN_FAILURE',
        severity: 'MEDIUM',
        userId,
        ipAddress,
        userAgent,
        details: details || {},
      });
    }
  }

  /**
   * Log data changes with before/after values
   */
  async logDataChange(
    userId: string,
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    beforeData: Record<string, any>,
    afterData: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const changes = this.calculateChanges(beforeData, afterData);
    
    await this.createAuditLog({
      userId,
      action,
      entityType,
      entityId,
      changes: {
        before: beforeData,
        after: afterData,
        changes,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log permission changes
   */
  async logPermissionChange(
    userId: string,
    targetUserId: string,
    action: 'GRANT' | 'REVOKE',
    permissions: string[],
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const auditAction = action === 'GRANT' ? AuditAction.PERMISSION_GRANT : AuditAction.PERMISSION_REVOKE;

    await this.createAuditLog({
      userId,
      action: auditAction,
      entityType: EntityType.USER,
      entityId: targetUserId,
      changes: {
        action,
        permissions,
        grantedBy: userId,
      },
      ipAddress,
      userAgent,
    });

    // Log potential permission escalation
    if (action === 'GRANT') {
      await this.checkPermissionEscalation(userId, targetUserId, permissions);
    }
  }

  /**
   * Log bulk operations
   */
  async logBulkOperation(
    userId: string,
    action: AuditAction,
    entityType: EntityType,
    entityIds: string[],
    changes: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    await this.createAuditLog({
      userId,
      action,
      entityType,
      entityId: 'BULK_OPERATION',
      changes: {
        affectedEntities: entityIds,
        count: entityIds.length,
        changes,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Search audit logs with filters
   */
  async searchAuditLogs(filters: AuditSearchFilters) {
    try {
      const {
        userId,
        action,
        entityType,
        entityId,
        dateFrom,
        dateTo,
        ipAddress,
        page = 1,
        limit = 50,
      } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (userId) where.userId = userId;
      if (action && action.length > 0) where.action = { in: action };
      if (entityType && entityType.length > 0) where.entityType = { in: entityType };
      if (entityId) where.entityId = entityId;
      if (ipAddress) where.ipAddress = { contains: ipAddress };

      if (dateFrom || dateTo) {
        where.timestamp = {};
        if (dateFrom) where.timestamp.gte = dateFrom;
        if (dateTo) where.timestamp.lte = dateTo;
      }

      const [logs, total] = await Promise.all([
        this.prisma.auditLog.findMany({
          where,
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: {
            timestamp: 'desc',
          },
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      return {
        logs,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error searching audit logs:', error);
      throw error;
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStatistics(days: number = 30) {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [
        totalEvents,
        userActions,
        entityTypes,
        topUsers,
        recentEvents,
        securityEvents,
      ] = await Promise.all([
        // Total events in period
        this.prisma.auditLog.count({
          where: { timestamp: { gte: since } },
        }),

        // Actions breakdown
        this.prisma.auditLog.groupBy({
          by: ['action'],
          _count: { action: true },
          where: { timestamp: { gte: since } },
        }),

        // Entity types breakdown
        this.prisma.auditLog.groupBy({
          by: ['entityType'],
          _count: { entityType: true },
          where: { timestamp: { gte: since } },
        }),

        // Most active users
        this.prisma.auditLog.groupBy({
          by: ['userId'],
          _count: { userId: true },
          where: { timestamp: { gte: since } },
          orderBy: { _count: { userId: 'desc' } },
          take: 10,
        }),

        // Recent events
        this.prisma.auditLog.findMany({
          where: { timestamp: { gte: since } },
          include: {
            user: {
              select: {
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
          orderBy: { timestamp: 'desc' },
          take: 20,
        }),

        // Security-related events
        this.prisma.auditLog.count({
          where: {
            timestamp: { gte: since },
            action: {
              in: [
                AuditAction.LOGIN,
                AuditAction.PERMISSION_GRANT,
                AuditAction.PERMISSION_REVOKE,
                AuditAction.ROLE_CHANGE,
              ],
            },
          },
        }),
      ]);

      return {
        period: { days, since },
        totalEvents,
        securityEvents,
        breakdown: {
          actions: userActions.reduce((acc, item) => {
            acc[item.action] = item._count.action;
            return acc;
          }, {} as Record<string, number>),
          entityTypes: entityTypes.reduce((acc, item) => {
            acc[item.entityType] = item._count.entityType;
            return acc;
          }, {} as Record<string, number>),
        },
        topUsers: topUsers.slice(0, 10),
        recentEvents: recentEvents.slice(0, 10),
      };
    } catch (error) {
      logger.error('Error getting audit statistics:', error);
      throw error;
    }
  }

  /**
   * Export audit logs to CSV
   */
  async exportAuditLogs(filters: AuditSearchFilters): Promise<string> {
    try {
      const result = await this.searchAuditLogs({ ...filters, limit: 10000 });
      
      const csvHeader = 'Timestamp,User,Action,Entity Type,Entity ID,IP Address,User Agent,Changes\n';
      
      const csvRows = result.logs.map(log => {
        const user = log.user ? `${log.user.profile?.firstName} ${log.user.profile?.lastName} (${log.user.email})` : 'Unknown';
        const changes = JSON.stringify(log.changes).replace(/"/g, '""');
        
        return [
          log.timestamp.toISOString(),
          `"${user}"`,
          log.action,
          log.entityType,
          log.entityId,
          log.ipAddress,
          `"${log.userAgent}"`,
          `"${changes}"`,
        ].join(',');
      }).join('\n');

      return csvHeader + csvRows;
    } catch (error) {
      logger.error('Error exporting audit logs:', error);
      throw error;
    }
  }

  /**
   * Log security events
   */
  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      logger.warn('Security event detected:', event);

      // Store in audit log with special marker
      await this.createAuditLog({
        userId: event.userId || 'SYSTEM',
        action: AuditAction.SYSTEM_ACCESS,
        entityType: EntityType.USER,
        entityId: event.userId || 'ANONYMOUS',
        changes: {
          securityEvent: true,
          type: event.type,
          severity: event.severity,
          details: event.details,
        },
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
      });

      // Additional alerting for high severity events
      if (event.severity === 'CRITICAL' || event.severity === 'HIGH') {
        // TODO: Implement real-time alerting (email, SMS, Slack, etc.)
        logger.error('High severity security event:', event);
      }
    } catch (error) {
      logger.error('Error logging security event:', error);
    }
  }

  /**
   * Check for potential security events
   */
  private async checkSecurityEvent(auditData: AuditLogData): Promise<void> {
    try {
      // Check for suspicious permission changes
      if (auditData.action === AuditAction.PERMISSION_GRANT) {
        const changes = auditData.changes as any;
        if (changes?.permissions?.includes('user.impersonate') || 
            changes?.permissions?.includes('system.config.update')) {
          await this.logSecurityEvent({
            type: 'PERMISSION_ESCALATION',
            severity: 'HIGH',
            userId: auditData.userId,
            ipAddress: auditData.ipAddress || 'unknown',
            userAgent: auditData.userAgent || 'unknown',
            details: auditData.changes || {},
          });
        }
      }

      // Check for bulk operations
      if (auditData.entityId === 'BULK_OPERATION') {
        const changes = auditData.changes as any;
        if (changes?.count > 100) {
          await this.logSecurityEvent({
            type: 'SUSPICIOUS_ACTIVITY',
            severity: 'MEDIUM',
            userId: auditData.userId,
            ipAddress: auditData.ipAddress || 'unknown',
            userAgent: auditData.userAgent || 'unknown',
            details: { bulkOperation: true, count: changes.count },
          });
        }
      }

      // Check for data export
      if (auditData.action === AuditAction.DATA_EXPORT) {
        await this.logSecurityEvent({
          type: 'DATA_BREACH',
          severity: 'MEDIUM',
          userId: auditData.userId,
          ipAddress: auditData.ipAddress || 'unknown',
          userAgent: auditData.userAgent || 'unknown',
          details: auditData.changes || {},
        });
      }
    } catch (error) {
      logger.error('Error checking security event:', error);
    }
  }

  /**
   * Check for permission escalation attempts
   */
  private async checkPermissionEscalation(
    grantedBy: string,
    targetUser: string,
    permissions: string[]
  ): Promise<void> {
    try {
      // Check if user is granting permissions they don't have
      const granterUser = await this.prisma.user.findUnique({
        where: { id: grantedBy },
        select: { role: true },
      });

      if (granterUser) {
        const highRiskPermissions = [
          'user.impersonate',
          'system.config.update',
          'permission.grant',
          'role.create',
          'system.backup.create',
        ];

        const grantedHighRisk = permissions.filter(p => highRiskPermissions.includes(p));
        
        if (grantedHighRisk.length > 0) {
          await this.logSecurityEvent({
            type: 'PERMISSION_ESCALATION',
            severity: 'HIGH',
            userId: grantedBy,
            ipAddress: 'unknown',
            userAgent: 'unknown',
            details: {
              targetUser,
              highRiskPermissions: grantedHighRisk,
              granterRole: granterUser.role,
            },
          });
        }
      }
    } catch (error) {
      logger.error('Error checking permission escalation:', error);
    }
  }

  /**
   * Calculate changes between before and after data
   */
  private calculateChanges(before: Record<string, any>, after: Record<string, any>): Record<string, any> {
    const changes: Record<string, any> = {};

    // Check for added/modified fields
    for (const [key, value] of Object.entries(after)) {
      if (before[key] !== value) {
        changes[key] = {
          from: before[key],
          to: value,
        };
      }
    }

    // Check for removed fields
    for (const [key, value] of Object.entries(before)) {
      if (!(key in after)) {
        changes[key] = {
          from: value,
          to: null,
        };
      }
    }

    return changes;
  }
}
