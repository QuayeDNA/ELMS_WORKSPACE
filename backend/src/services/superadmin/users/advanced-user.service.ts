/**
 * Advanced User Management Service
 * 
 * Handles cross-institutional user operations, analytics, impersonation,
 * and bulk operations for Super Admin functionality
 */

import { PrismaClient } from '@prisma/client';
import {
  UserSearchFilters,
  UserSearchResult,
  UserWithInstitution,
  UserAggregations,
  UserAnalytics,
  UserStatistics,
  BulkUserOperation,
  BulkOperationResult,
  StartImpersonationRequest,
  ImpersonationSession,
  DateRange,
  ActivityPattern,
  PerformanceMetrics,
  EngagementScore,
  RetentionMetrics,
  UserStatus,
  UserRole,
  ImpersonationStatus
} from '../../../types/superadmin/users/user.types';
import RedisService from '../../../services/redis.service';
import logger from '../../../utils/logger';
import crypto from 'crypto';

export class AdvancedUserService {
  private readonly prisma: PrismaClient;
  private readonly redis: RedisService;

  constructor() {
    this.prisma = new PrismaClient();
    this.redis = RedisService.getInstance();
  }

  /**
   * Search users across all institutions with advanced filtering
   */
  async searchUsers(filters: UserSearchFilters, page = 1, limit = 20): Promise<UserSearchResult> {
    try {
      const cacheKey = `user_search:${JSON.stringify({ filters, page, limit })}`;
      
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const {
        query,
        institutionIds,
        roles,
        status,
        lastLoginRange,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      
      if (query) {
        where.OR = [
          { email: { contains: query, mode: 'insensitive' } },
          { username: { contains: query, mode: 'insensitive' } },
          { profile: { firstName: { contains: query, mode: 'insensitive' } } },
          { profile: { lastName: { contains: query, mode: 'insensitive' } } }
        ];
      }

      if (institutionIds?.length) {
        where.institutionId = { in: institutionIds };
      }

      if (roles?.length) {
        where.role = { in: roles };
      }

      if (status?.length) {
        // Note: Assuming we'll add a status field to User model later
        // For now, mapping to isActive field
        if (status.includes('active' as UserStatus)) {
          where.isActive = true;
        } else if (status.includes('inactive' as UserStatus)) {
          where.isActive = false;
        }
      }

      if (lastLoginRange) {
        where.lastLogin = {};
        if (lastLoginRange.start) where.lastLogin.gte = lastLoginRange.start;
        if (lastLoginRange.end) where.lastLogin.lte = lastLoginRange.end;
      }

      // Execute query
      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          include: {
            institution: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true,
                status: true
              }
            },
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit
        }),
        this.prisma.user.count({ where })
      ]);

      // Transform users to match interface - only include users with institutions
      const transformedUsers: UserWithInstitution[] = users
        .filter(user => user.institution) // Only include users with institutions
        .map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.profile?.firstName || '',
          lastName: user.profile?.lastName || '',
          role: user.role as any, // Type conversion for enum compatibility
          status: user.isActive ? 'active' as UserStatus : 'inactive' as UserStatus,
          institutionId: user.institutionId || '',
          profileImage: undefined, // Remove since not available in profile select
          lastLoginAt: user.lastLogin || undefined,
          emailVerifiedAt: user.isVerified ? user.createdAt : undefined,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          institution: {
            id: user.institution!.id,
            name: user.institution!.name,
            code: user.institution!.code || '', // Add default empty string
            type: String(user.institution!.type),
            status: String(user.institution!.status)
          }
        }));

      // Calculate aggregations
      const aggregations: UserAggregations = {
        byInstitution: users.reduce((acc, user) => {
          if (user.institutionId && user.institution) {
            acc[user.institutionId] = {
              count: (acc[user.institutionId]?.count || 0) + 1,
              name: user.institution.name
            };
          }
          return acc;
        }, {} as Record<string, { count: number; name: string }>),
        byRole: users.reduce((acc, user) => {
          acc[user.role as any] = (acc[user.role as any] || 0) + 1;
          return acc;
        }, {} as Record<any, number>),
        byStatus: {
          [UserStatus.ACTIVE]: users.filter(u => u.isActive).length,
          [UserStatus.INACTIVE]: users.filter(u => !u.isActive).length,
          [UserStatus.SUSPENDED]: 0,
          [UserStatus.PENDING_VERIFICATION]: 0,
          [UserStatus.LOCKED]: 0,
          [UserStatus.DELETED]: 0
        },
        byEmailVerification: {
          verified: users.filter(u => u.isVerified).length,
          unverified: users.filter(u => !u.isVerified).length
        },
        totalActiveUsers: users.filter(u => u.isActive).length,
        totalInactiveUsers: users.filter(u => !u.isActive).length,
        newUsersThisMonth: 0, // Calculate based on createdAt if needed
        usersWithRecentActivity: users.filter(u => u.lastLogin && 
          new Date(u.lastLogin).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000).length
      };

      const result: UserSearchResult = {
        users: transformedUsers,
        total,
        page,
        limit,
        aggregations
      };

      // Cache result for 5 minutes
      await this.redis.client.set(cacheKey, JSON.stringify(result), { EX: 300 });
      
      logger.info('User search completed', {
        filters,
        resultCount: users.length,
        total
      });

      return result;
    } catch (error) {
      logger.error('Failed to search users', { error, filters });
      throw error;
    }
  }

  /**
   * Get comprehensive analytics for a specific user
   */
  async getUserAnalytics(userId: string, dateRange?: DateRange): Promise<UserAnalytics> {
    try {
      const cacheKey = `user_analytics:${userId}:${JSON.stringify(dateRange)}`;
      
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          institution: true,
          profile: true,
          sessions: true
        }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // For now, create mock analytics data since UserAnalyticsData model might not be in DB yet
      const activityPatterns: ActivityPattern[] = [
        {
          date: new Date(),
          loginCount: 5,
          sessionDuration: 1800,
          featuresUsed: ['dashboard', 'exams', 'reports'],
          peakHours: [9, 10, 14, 15]
        }
      ];

      const performance: PerformanceMetrics = {
        totalLogins: 150,
        averageSessionDuration: 1200,
        totalExamsCreated: 12,
        totalExamsTaken: 25,
        averageExamScore: 85.5,
        completionRate: 0.92,
        responseTime: 250,
        errorRate: 0.02
      };

      const engagementScores: EngagementScore[] = [
        {
          date: new Date(),
          score: 85,
          factors: {
            loginFrequency: 80,
            featureUsage: 90,
            examParticipation: 85,
            socialInteraction: 75
          }
        }
      ];

      const retentionMetrics: RetentionMetrics = {
        firstLoginDate: user.createdAt,
        lastLoginDate: user.lastLogin || user.createdAt,
        totalDaysActive: 45,
        streakDays: 5,
        churnRisk: 'low',
        retentionRate: 0.85,
        lifecycleStage: 'active'
      };

      const analytics: UserAnalytics = {
        userId,
        activityPatterns,
        performanceMetrics: performance,
        engagementScores,
        retentionMetrics,
        institutionComparison: {
          userInstitution: user.institutionId || '',
          ranking: {
            activityRank: 15,
            performanceRank: 12,
            engagementRank: 8
          },
          benchmarks: {
            averageLoginFrequency: 4.5,
            averageExamScore: 78.2,
            averageEngagement: 72.1
          }
        }
      };

      // Cache for 1 hour
      await this.redis.client.set(cacheKey, JSON.stringify(analytics), { EX: 3600 });

      return analytics;
    } catch (error) {
      logger.error('Failed to get user analytics', { error, userId });
      throw error;
    }
  }

  /**
   * Start impersonation session for super admin support
   */
  async startImpersonation(adminId: string, request: StartImpersonationRequest): Promise<ImpersonationSession> {
    try {
      const { targetUserId, reason, duration = 60 } = request;
      const expiresIn = duration * 60; // Convert minutes to seconds

      // Verify target user exists
      const targetUser = await this.prisma.user.findUnique({
        where: { id: targetUserId },
        include: { 
          institution: true,
          profile: true 
        }
      });

      if (!targetUser) {
        throw new Error('Target user not found');
      }

      // Create session record - For now using a simplified approach
      const sessionId = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Store session in Redis for now (later we'll use the DB model)
      const sessionData = {
        id: sessionId,
        adminId,
        targetUserId,
        reason,
        status: ImpersonationStatus.ACTIVE,
        startedAt: new Date(),
        expiresAt,
        ipAddress: '', // Will be set by controller
        userAgent: ''  // Will be set by controller
      };

      await this.redis.client.set(
        `impersonation:${sessionId}`,
        JSON.stringify(sessionData),
        { EX: expiresIn }
      );

      const session: ImpersonationSession = {
        id: sessionId,
        superAdminId: adminId,
        superAdminEmail: '',
        targetUserId,
        targetUserEmail: targetUser.email,
        reason: reason || 'Administrative support',
        startTime: sessionData.startedAt,
        status: ImpersonationStatus.ACTIVE,
        ipAddress: '',
        userAgent: '',
        actions: [],
        auditLog: []
      };

      // Log the impersonation start
      logger.info('Impersonation session started', {
        sessionId,
        adminId,
        targetUserId,
        reason
      });

      return session;
    } catch (error) {
      logger.error('Failed to start impersonation', { error, adminId, request });
      throw error;
    }
  }

  /**
   * End impersonation session
   */
  async endImpersonation(sessionId: string, adminId: string): Promise<void> {
    try {
      // Get session from Redis
      const sessionData = await this.redis.client.get(`impersonation:${sessionId}`);
      if (!sessionData) {
        throw new Error('Impersonation session not found');
      }

      const session = JSON.parse(sessionData);
      
      if (session.adminId !== adminId) {
        throw new Error('Unauthorized to end this session');
      }

      // Delete session from Redis
      await this.redis.client.del(`impersonation:${sessionId}`);

      logger.info('Impersonation session ended', { sessionId, adminId });
    } catch (error) {
      logger.error('Failed to end impersonation', { error, sessionId, adminId });
      throw error;
    }
  }

  /**
   * Perform bulk operations on multiple users
   */
  async performBulkOperation(operation: BulkUserOperation): Promise<BulkOperationResult> {
    try {
      const { operation: operationType, userIds, data: parameters } = operation;

      // For now, simulate bulk operations since we don't have the full models
      let successCount = 0;
      let failureCount = 0;
      const results: any[] = [];

      const operationId = crypto.randomUUID();

      // Process each user
      for (const userId of userIds) {
        try {
          await this.executeBulkAction(operationType, userId, parameters);
          successCount++;
          results.push({ userId, status: 'success' });
        } catch (error) {
          failureCount++;
          results.push({ 
            userId, 
            status: 'failed', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }

      const result: BulkOperationResult = {
        operationId,
        operation: operationType,
        status: failureCount === 0 ? 'completed' : 'partial',
        totalUsers: userIds.length,
        processedUsers: userIds.length,
        successCount,
        failureCount,
        results,
        startTime: new Date(),
        endTime: new Date()
      };

      logger.info('Bulk operation completed', {
        operationId,
        operationType,
        totalUsers: userIds.length,
        successCount,
        failureCount
      });

      return result;
    } catch (error) {
      logger.error('Failed to perform bulk operation', { error, operation });
      throw error;
    }
  }

  /**
   * Get user statistics for dashboard
   */
  async getUserStatistics(): Promise<UserStatistics> {
    try {
      const cacheKey = 'user_statistics';
      
      const cached = await this.redis.client.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisWeek = new Date(today);
      thisWeek.setDate(today.getDate() - 7);
      
      const thisMonth = new Date(today);
      thisMonth.setMonth(today.getMonth() - 1);

      // Get basic counts
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isActive: false } }),
        this.prisma.user.count({ where: { createdAt: { gte: today } } }),
        this.prisma.user.count({ where: { createdAt: { gte: thisWeek } } }),
        this.prisma.user.count({ where: { createdAt: { gte: thisMonth } } })
      ]);

      // Get role distribution
      const roleDistribution = await this.prisma.user.groupBy({
        by: ['role'],
        _count: true
      });

      // Get institution distribution
      const institutionDistribution = await this.prisma.user.groupBy({
        by: ['institutionId'],
        where: { institutionId: { not: null } },
        _count: true
      });

      // Transform role distribution
      const roleStats = roleDistribution.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>);

      const statistics: UserStatistics = {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers: 0, // Will implement when status field is added
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        usersByRole: roleStats as Record<UserRole, number>,
        usersByInstitution: institutionDistribution.reduce((acc, item) => {
          if (item.institutionId) {
            acc[item.institutionId] = {
              count: item._count,
              institutionName: `Institution ${item.institutionId}` // Simplified for now
            };
          }
          return acc;
        }, {} as Record<string, { count: number; institutionName: string }>),
        averageSessionDuration: 1200, // Mock data  
        totalLoginsSessions: activeUsers * 10, // Mock data
        mostActiveUsers: [], // Will implement when needed
        recentlyCreatedUsers: [], // Will implement when needed
        usersAtRisk: [] // Will implement when needed
      };

      // Cache for 10 minutes
      await this.redis.client.set(cacheKey, JSON.stringify(statistics), { EX: 600 });

      return statistics;
    } catch (error) {
      logger.error('Failed to get user statistics', { error });
      throw error;
    }
  }

  /**
   * Get user activity history
   */
  async getUserActivityHistory(userId: string, page = 1, limit = 20): Promise<any[]> {
    // For now, return mock data since UserActivity model might not be in DB yet
    return [
      {
        id: '1',
        userId,
        action: 'login',
        details: { ip: '192.168.1.1' },
        performedAt: new Date(),
        performedBy: userId
      }
    ];
  }

  /**
   * Get impersonation history for an admin
   */
  async getImpersonationHistory(adminId: string, page = 1, limit = 20): Promise<any[]> {
    // Mock data for now
    return [];
  }

  /**
   * Get bulk operation status
   */
  async getBulkOperationStatus(operationId: string): Promise<BulkOperationResult | null> {
    // For now, return null since we're not storing operations yet
    return null;
  }

  /**
   * Execute bulk action on a single user
   */
  private async executeBulkAction(operationType: string, userId: string, parameters?: any): Promise<void> {
    switch (operationType) {
      case 'ACTIVATE':
        await this.prisma.user.update({
          where: { id: userId },
          data: { isActive: true }
        });
        break;
      case 'DEACTIVATE':
        await this.prisma.user.update({
          where: { id: userId },
          data: { isActive: false }
        });
        break;
      case 'RESET_PASSWORD': {
        // Generate reset token and send email
        const resetToken = crypto.randomBytes(32).toString('hex');
        await this.prisma.user.update({
          where: { id: userId },
          data: { 
            passwordResetToken: resetToken,
            passwordResetExpires: new Date(Date.now() + 3600000) // 1 hour
          }
        });
        break;
      }
      default:
        throw new Error(`Unsupported operation type: ${operationType}`);
    }
  }

  /**
   * Clear user-related cache
   */
  async clearUserCache(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.client.keys(pattern);
      if (keys.length > 0) {
        await this.redis.client.del(keys);
      }
    } catch (error) {
      logger.error('Failed to clear user cache', { error, pattern });
    }
  }

  /**
   * Calculate average of numbers array
   */
  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  }
}
