import { PrismaClient, User, UserRole, UserProfile, Student, Lecturer, Staff } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import logger from '@/utils/logger';
import RedisService  from './redis.service';
import { NotificationService } from './notification.service';
import { PermissionService } from './permission.service';
import { AuditService } from './audit.service';
import { ValidationService } from './validation.service';

interface CreateUserData {
  email: string;
  password?: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    middleName?: string;
    phoneNumber?: string;
    title?: string;
  };
  roleSpecific?: any; // Student, Lecturer, or Staff specific data
  sendWelcomeEmail?: boolean;
}

interface UserSearchFilters {
  role?: UserRole;
  isActive?: boolean;
  isVerified?: boolean;
  departmentId?: string;
  facultyId?: string;
  search?: string; // Search in name, email, ID
  page?: number;
  limit?: number;
}

interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSymbols: boolean;
  preventReuse: number; // Number of previous passwords to check
}

interface MFASetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class UserManagementService {
  private prisma: PrismaClient;
  private redis: RedisService;
  private notification: NotificationService;
  private permission: PermissionService;
  private audit: AuditService;
  private validation: ValidationService;
  private defaultPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    preventReuse: 5,
  };

  constructor(
    prisma: PrismaClient,
    redis: RedisService,
    notification: NotificationService,
    permission: PermissionService,
    audit: AuditService,
    validation: ValidationService
  ) {
    this.prisma = prisma;
    this.redis = redis;
    this.notification = notification;
    this.permission = permission;
    this.audit = audit;
    this.validation = validation;
  }

  /**
   * Create a new user with comprehensive validation and setup
   */
  async createUser(data: CreateUserData, createdBy?: string): Promise<User> {
    try {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Generate password if not provided
      const password = data.password || this.generateSecurePassword();
      
      // Validate password policy
      if (!this.validatePasswordPolicy(password)) {
        throw new Error('Password does not meet security requirements');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12);

      // Generate email verification token
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user in transaction
      const user = await this.prisma.$transaction(async (prisma) => {
        // Create user
        const newUser = await prisma.user.create({
          data: {
            email: data.email,
            passwordHash,
            role: data.role,
            emailVerificationToken,
            emailVerificationExpires,
            createdById: createdBy,
            profile: {
              create: data.profile,
            },
          },
          include: {
            profile: true,
          },
        });

        // Create role-specific data
        if (data.roleSpecific) {
          await this.createRoleSpecificData(newUser.id, data.role, data.roleSpecific, prisma);
        }

        // Log user creation
        await this.createAuditLog({
          userId: createdBy || 'SYSTEM',
          action: 'USER_CREATED',
          target: newUser.id,
          details: {
            email: data.email,
            role: data.role,
          },
        });

        return newUser;
      });

      // Send welcome email if requested
      if (data.sendWelcomeEmail) {
        await this.sendWelcomeEmail(user, password);
      }

      logger.info(`User created successfully: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Update user information with validation
   */
  async updateUser(
    userId: string,
    updateData: Partial<User & { profile?: Partial<UserProfile> }>,
    updatedBy?: string
  ): Promise<User> {
    try {
      const user = await this.prisma.$transaction(async (prisma) => {
        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...updateData,
            profile: updateData.profile ? {
              update: updateData.profile,
            } : undefined,
          },
          include: {
            profile: true,
          },
        });

        // Log user update
        await this.createAuditLog({
          userId: updatedBy || userId,
          action: 'USER_UPDATED',
          target: userId,
          details: updateData,
        });

        return updatedUser;
      });

      logger.info(`User updated successfully: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Search and filter users with pagination
   */
  async searchUsers(filters: UserSearchFilters) {
    try {
      const {
        role,
        isActive,
        isVerified,
        departmentId,
        facultyId,
        search,
        page = 1,
        limit = 20,
      } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      // Apply filters
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (isVerified !== undefined) where.isVerified = isVerified;

      // Department filter (for lecturers and staff)
      if (departmentId) {
        where.OR = [
          {
            profile: {
              lecturer: {
                departmentId,
              },
            },
          },
          {
            profile: {
              staff: {
                departmentId,
              },
            },
          },
        ];
      }

      // Search in name, email, or ID
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          {
            profile: {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          include: {
            profile: {
              include: {
                student: {
                  include: {
                    program: {
                      include: {
                        department: true,
                      },
                    },
                  },
                },
                lecturer: {
                  include: {
                    department: true,
                  },
                },
                staff: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
          orderBy: [
            { updatedAt: 'desc' },
            { createdAt: 'desc' },
          ],
        }),
        this.prisma.user.count({ where }),
      ]);

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Setup Multi-Factor Authentication for user
   */
  async setupMFA(userId: string): Promise<MFASetupResult> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `ELMS - ${user.email}`,
        issuer: 'ELMS',
        length: 32,
      });

      // Generate backup codes
      const backupCodes = Array.from({ length: 10 }, () =>
        crypto.randomBytes(4).toString('hex').toUpperCase()
      );

      // Encrypt backup codes
      const encryptedBackupCodes = backupCodes.map(code => 
        this.encryptBackupCode(code)
      );

      // Store temporary secret (will be permanent after verification)
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorTempSecret: secret.base32,
        },
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Log MFA setup attempt
      await this.createAuditLog({
        userId,
        action: 'MFA_SETUP_INITIATED',
        target: userId,
        details: { hasBackupCodes: true },
      });

      return {
        secret: secret.base32,
        qrCodeUrl,
        backupCodes,
      };
    } catch (error) {
      logger.error('Error setting up MFA:', error);
      throw error;
    }
  }

  /**
   * Verify and enable MFA
   */
  async verifyAndEnableMFA(userId: string, token: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.twoFactorTempSecret) {
        throw new Error('MFA setup not initiated');
      }

      // Verify token
      const isValid = speakeasy.totp.verify({
        secret: user.twoFactorTempSecret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Enable MFA
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaEnabled: true,
          mfaSecret: user.twoFactorTempSecret,
          twoFactorTempSecret: null,
        },
      });

      // Log successful MFA enablement
      await this.createAuditLog({
        userId,
        action: 'MFA_ENABLED',
        target: userId,
        details: { timestamp: new Date() },
      });

      logger.info(`MFA enabled for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Error verifying MFA:', error);
      throw error;
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          emailVerificationToken: token,
          emailVerificationExpires: {
            gte: new Date(),
          },
        },
      });

      if (!user) {
        throw new Error('Invalid or expired verification token');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          isActive: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
        },
      });

      // Log email verification
      await this.createAuditLog({
        userId: user.id,
        action: 'EMAIL_VERIFIED',
        target: user.id,
        details: { email: user.email },
      });

      logger.info(`Email verified for user: ${user.email}`);
      return true;
    } catch (error) {
      logger.error('Error verifying email:', error);
      throw error;
    }
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: string, deactivatedBy: string, reason?: string): Promise<void> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Deactivate user
        await prisma.user.update({
          where: { id: userId },
          data: {
            isActive: false,
          },
        });

        // Invalidate all sessions
        await prisma.userSession.updateMany({
          where: { userId },
          data: { isActive: false },
        });

        // Log deactivation
        await this.createAuditLog({
          userId: deactivatedBy,
          action: 'USER_DEACTIVATED',
          target: userId,
          details: { reason },
        });
      });

      // Remove from Redis cache
      await this.redis.del(`user:${userId}`);

      logger.info(`User deactivated: ${userId}`);
    } catch (error) {
      logger.error('Error deactivating user:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics() {
    try {
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        mfaEnabledUsers,
        roleStats,
      ] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { isActive: true } }),
        this.prisma.user.count({ where: { isVerified: true } }),
        this.prisma.user.count({ where: { mfaEnabled: true } }),
        this.prisma.user.groupBy({
          by: ['role'],
          _count: { role: true },
        }),
      ]);

      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        mfaEnabledUsers,
        roleDistribution: roleStats.reduce((acc, stat) => {
          acc[stat.role] = stat._count.role;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      logger.error('Error getting user statistics:', error);
      throw error;
    }
  }

  /**
   * Bulk create users from CSV or array data
   */
  async bulkCreateUsers(
    usersData: CreateUserData[],
    createdBy: string,
    options: { skipValidation?: boolean; sendWelcomeEmails?: boolean } = {}
  ): Promise<{ success: User[]; errors: { index: number; error: string; data: CreateUserData }[] }> {
    const success: User[] = [];
    const errors: { index: number; error: string; data: CreateUserData }[] = [];

    for (let i = 0; i < usersData.length; i++) {
      try {
        const userData = usersData[i];
        
        // Validate if not skipped
        if (!options.skipValidation) {
          // Add validation logic here based on role
          if (userData.role === UserRole.STUDENT && userData.roleSpecific) {
            const validation = await this.validation.validateStudent(userData.roleSpecific);
            if (!validation.isValid) {
              errors.push({
                index: i,
                error: `Validation failed: ${Object.values(validation.errors).flat().join(', ')}`,
                data: userData,
              });
              continue;
            }
          }
        }

        const user = await this.createUser(userData, createdBy);
        success.push(user);

        // Log bulk operation progress
        if (i % 10 === 0) {
          logger.info(`Bulk user creation progress: ${i + 1}/${usersData.length}`);
        }

      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: usersData[i],
        });
      }
    }

    // Log bulk operation
    await this.audit.logBulkOperation(
      createdBy,
      'CREATE' as any,
      'USER' as any,
      success.map(u => u.id),
      {
        operation: 'BULK_USER_CREATION',
        total: usersData.length,
        successful: success.length,
        failed: errors.length,
      }
    );

    logger.info(`Bulk user creation completed: ${success.length} successful, ${errors.length} failed`);
    return { success, errors };
  }

  /**
   * Bulk update user roles
   */
  async bulkUpdateRoles(
    userIds: string[],
    newRole: UserRole,
    updatedBy: string
  ): Promise<{ success: string[]; errors: { userId: string; error: string }[] }> {
    const success: string[] = [];
    const errors: { userId: string; error: string }[] = [];

    // Check permission first
    const hasPermission = await this.permission.hasPermission(updatedBy, 'role.change');
    if (!hasPermission) {
      throw new Error('Insufficient permissions to change user roles');
    }

    for (const userId of userIds) {
      try {
        const oldUser = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, email: true },
        });

        if (!oldUser) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }

        await this.prisma.user.update({
          where: { id: userId },
          data: { role: newRole },
        });

        // Clear permission cache
        await this.permission.clearUserPermissionCache(userId);

        // Log role change
        await this.audit.logDataChange(
          updatedBy,
          'ROLE_CHANGE' as any,
          'USER' as any,
          userId,
          { role: oldUser.role },
          { role: newRole }
        );

        success.push(userId);
      } catch (error) {
        errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    logger.info(`Bulk role update completed: ${success.length} successful, ${errors.length} failed`);
    return { success, errors };
  }

  /**
   * Suspend multiple users
   */
  async bulkSuspendUsers(
    userIds: string[],
    suspendedBy: string,
    reason: string,
    duration?: number // Days
  ): Promise<{ success: string[]; errors: { userId: string; error: string }[] }> {
    const success: string[] = [];
    const errors: { userId: string; error: string }[] = [];

    const suspensionEnd = duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : undefined;

    for (const userId of userIds) {
      try {
        await this.suspendUser(userId, suspendedBy, reason, suspensionEnd);
        success.push(userId);
      } catch (error) {
        errors.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { success, errors };
  }

  /**
   * Suspend a user account
   */
  async suspendUser(
    userId: string,
    suspendedBy: string,
    reason: string,
    suspensionEnd?: Date
  ): Promise<void> {
    try {
      await this.prisma.$transaction(async (prisma) => {
        // Update user status
        await prisma.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            // Add suspension fields if they exist in your schema
          },
        });

        // Invalidate all sessions
        await prisma.userSession.updateMany({
          where: { userId },
          data: { isActive: false },
        });

        // Log suspension
        await this.audit.createAuditLog({
          userId: suspendedBy,
          action: 'UPDATE' as any,
          entityType: 'USER' as any,
          entityId: userId,
          changes: {
            action: 'SUSPENDED',
            reason,
            suspensionEnd,
            suspendedBy,
          },
        });
      });

      // Remove from cache
      await this.redis.del(`user:${userId}`);
      await this.permission.clearUserPermissionCache(userId);

      logger.info(`User suspended: ${userId} by ${suspendedBy}`);
    } catch (error) {
      logger.error('Error suspending user:', error);
      throw error;
    }
  }

  /**
   * Export users to CSV
   */
  async exportUsers(filters: UserSearchFilters): Promise<string> {
    try {
      const result = await this.searchUsers({ ...filters, limit: 10000 });
      
      const csvHeader = 'ID,Email,Role,First Name,Last Name,Status,Created At,Last Login\n';
      
      const csvRows = result.users.map(user => {
        const profile = user.profile;
        return [
          user.id,
          `"${user.email}"`,
          user.role,
          `"${profile?.firstName || ''}"`,
          `"${profile?.lastName || ''}"`,
          user.isActive ? 'Active' : 'Inactive',
          user.createdAt.toISOString(),
          user.lastLogin?.toISOString() || '',
        ].join(',');
      }).join('\n');

      // Log export activity
      await this.audit.createAuditLog({
        userId: 'SYSTEM', // Should be the requesting user ID
        action: 'DATA_EXPORT' as any,
        entityType: 'USER' as any,
        entityId: 'BULK_EXPORT',
        changes: {
          exportType: 'USER_DATA',
          filters,
          recordCount: result.users.length,
        },
      });

      return csvHeader + csvRows;
    } catch (error) {
      logger.error('Error exporting users:', error);
      throw error;
    }
  }

  /**
   * Force password reset for user
   */
  async forcePasswordReset(userId: string, forcedBy: string): Promise<void> {
    try {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordResetToken: resetToken,
          passwordResetExpires: resetExpires,
          forcePasswordChange: true,
        },
      });

      // Invalidate all sessions
      await this.prisma.userSession.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      // Log forced reset
      await this.audit.createAuditLog({
        userId: forcedBy,
        action: 'PASSWORD_CHANGE' as any,
        entityType: 'USER' as any,
        entityId: userId,
        changes: {
          action: 'FORCED_RESET',
          forcedBy,
        },
      });

      // Send notification
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true },
      });

      if (user) {
        await this.notification.sendEmail({
          to: user.email,
          subject: 'Password Reset Required',
          template: 'password-reset',
          data: {
            name: user.profile?.firstName || user.email,
            resetLink: `${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
          },
        });
      }

      logger.info(`Password reset forced for user: ${userId} by ${forcedBy}`);
    } catch (error) {
      logger.error('Error forcing password reset:', error);
      throw error;
    }
  }

  /**
   * Get user activity timeline
   */
  async getUserActivityTimeline(userId: string, days: number = 30) {
    try {
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const [auditLogs, loginHistory] = await Promise.all([
        this.prisma.auditLog.findMany({
          where: {
            userId,
            timestamp: { gte: since },
          },
          orderBy: { timestamp: 'desc' },
          take: 50,
        }),
        this.prisma.loginHistory.findMany({
          where: {
            userId,
            timestamp: { gte: since },
          },
          orderBy: { timestamp: 'desc' },
          take: 20,
        }),
      ]);

      // Combine and sort by timestamp
      const timeline = [
        ...auditLogs.map(log => ({
          type: 'AUDIT_LOG',
          timestamp: log.timestamp,
          action: log.action,
          details: log.changes,
        })),
        ...loginHistory.map(login => ({
          type: 'LOGIN',
          timestamp: login.timestamp,
          action: login.success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILURE',
          details: {
            ipAddress: login.ipAddress,
            userAgent: login.userAgent,
            failureReason: login.failureReason,
          },
        })),
      ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return timeline;
    } catch (error) {
      logger.error('Error getting user activity timeline:', error);
      throw error;
    }
  }

  /**
   * Check if user has permission for action
   */
  async checkUserPermission(userId: string, permission: string): Promise<boolean> {
    return this.permission.hasPermission(userId, permission);
  }

  /**
   * Grant permission to user
   */
  async grantUserPermission(
    userId: string,
    permissionName: string,
    grantedBy: string,
    expiresAt?: Date
  ): Promise<void> {
    try {
      const permission = await this.prisma.permission.findUnique({
        where: { name: permissionName },
      });

      if (!permission) {
        throw new Error('Permission not found');
      }

      await this.permission.grantPermissionToUser({
        userId,
        permissionId: permission.id,
        grantedBy,
        expiresAt,
      });

      // Log permission grant
      await this.audit.logPermissionChange(
        grantedBy,
        userId,
        'GRANT',
        [permissionName]
      );

      logger.info(`Permission ${permissionName} granted to user ${userId} by ${grantedBy}`);
    } catch (error) {
      logger.error('Error granting user permission:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async createRoleSpecificData(
    userId: string,
    role: UserRole,
    data: any,
    prisma: any
  ): Promise<void> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('User profile not found');
    }

    switch (role) {
      case UserRole.STUDENT:
        await prisma.student.create({
          data: {
            ...data,
            profileId: profile.id,
          },
        });
        break;

      case UserRole.LECTURER:
        await prisma.lecturer.create({
          data: {
            ...data,
            profileId: profile.id,
          },
        });
        break;

      case UserRole.INVIGILATOR:
        await prisma.invigilator.create({
          data: {
            ...data,
            profileId: profile.id,
          },
        });
        break;

      default:
        // For other roles, create as staff
        if (data.staffType) {
          await prisma.staff.create({
            data: {
              ...data,
              profileId: profile.id,
            },
          });
        }
        break;
    }
  }

  private validatePasswordPolicy(password: string): boolean {
    const policy = this.defaultPasswordPolicy;

    if (password.length < policy.minLength) return false;
    if (policy.requireUppercase && !/[A-Z]/.test(password)) return false;
    if (policy.requireLowercase && !/[a-z]/.test(password)) return false;
    if (policy.requireNumbers && !/\d/.test(password)) return false;
    if (policy.requireSymbols && !/[^a-zA-Z0-9]/.test(password)) return false;

    return true;
  }

  private generateSecurePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }

  private encryptBackupCode(code: string): string {
    // Implement encryption for backup codes
    // This is a simplified version - use proper encryption in production
    return Buffer.from(code).toString('base64');
  }

  private async createAuditLog(data: any): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        ...data,
        timestamp: new Date(),
        ipAddress: data.ipAddress || 'unknown',
        userAgent: data.userAgent || 'unknown',
      },
    });
  }

  private async sendWelcomeEmail(user: User, password: string): Promise<void> {
    try {
      await this.notification.sendEmail({
        to: user.email,
        subject: 'Welcome to ELMS - Your Account is Ready',
        template: 'welcome',
        data: {
          name: user.profile?.firstName || user.email,
          email: user.email,
          temporaryPassword: password,
          verificationLink: `${process.env.FRONTEND_URL}/verify-email/${user.emailVerificationToken}`,
        },
      });
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      // Don't throw error - user creation should succeed even if email fails
    }
  }
}
