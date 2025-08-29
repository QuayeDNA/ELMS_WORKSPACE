import { PrismaClient, Permission, Role, UserRole, User } from '@prisma/client';
import RedisService from './redis.service';
import logger from '../utils/logger';

export interface PermissionCheck {
  hasPermission: boolean;
  permissions: string[];
  roles: string[];
}

export interface CreatePermissionData {
  name: string;
  description: string;
  category: string;
  isSystem?: boolean;
}

export interface CreateRoleData {
  name: string;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface GrantPermissionData {
  userId: string;
  permissionId: string;
  grantedBy: string;
  expiresAt?: Date;
}

export class PermissionService {
  private readonly prisma: PrismaClient;
  private readonly redis: RedisService;
  private readonly permissionCachePrefix = 'permissions:user:';
  private readonly roleCachePrefix = 'roles:user:';
  private readonly permissionTTL = 3600; // 1 hour

  constructor(prisma: PrismaClient, redis: RedisService) {
    this.prisma = prisma;
    this.redis = redis;
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(userId: string, permissionName: string): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return userPermissions.includes(permissionName);
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check multiple permissions for user
   */
  async hasPermissions(userId: string, permissionNames: string[]): Promise<PermissionCheck> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      const userRoles = await this.getUserRoles(userId);
      
      const hasAll = permissionNames.every(permission => 
        userPermissions.includes(permission)
      );

      return {
        hasPermission: hasAll,
        permissions: userPermissions,
        roles: userRoles,
      };
    } catch (error) {
      logger.error('Error checking permissions:', error);
      return {
        hasPermission: false,
        permissions: [],
        roles: [],
      };
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions(userId);
      return permissionNames.some(permission => 
        userPermissions.includes(permission)
      );
    } catch (error) {
      logger.error('Error checking any permission:', error);
      return false;
    }
  }

  /**
   * Get all permissions for a user (from roles and direct grants)
   */
  async getUserPermissions(userId: string): Promise<string[]> {
    try {
      // Check cache first
      const cached = await this.redis.client.get(`${this.permissionCachePrefix}${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
            where: {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
              ],
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get permissions from user's role
      const rolePermissions = await this.getRolePermissions(user.role);
      
      // Get direct user permissions
      const directPermissions = user.permissions.map(up => up.permission.name);
      
      // Combine and deduplicate
      const allPermissions = [...new Set([...rolePermissions, ...directPermissions])];

      // Cache permissions
      await this.redis.client.setEx(
        `${this.permissionCachePrefix}${userId}`,
        this.permissionTTL,
        JSON.stringify(allPermissions)
      );

      return allPermissions;
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      throw error;
    }
  }

  /**
   * Get permissions for a specific role
   */
  async getRolePermissions(role: UserRole): Promise<string[]> {
    try {
      // Define default permissions for each role
      const defaultPermissions = await this.getDefaultRolePermissions(role);
      
      // Get additional permissions from database
      const dbRole = await this.prisma.role.findUnique({
        where: { name: role },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      const dbPermissions = dbRole?.permissions.map(rp => rp.permission.name) || [];
      
      return [...new Set([...defaultPermissions, ...dbPermissions])];
    } catch (error) {
      logger.error('Error getting role permissions:', error);
      return [];
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      return user ? [user.role] : [];
    } catch (error) {
      logger.error('Error getting user roles:', error);
      return [];
    }
  }

  /**
   * Create a new permission
   */
  async createPermission(data: CreatePermissionData): Promise<Permission> {
    try {
      const permission = await this.prisma.permission.create({
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          isSystem: data.isSystem || false,
        },
      });

      logger.info(`Permission created: ${permission.name}`);
      return permission;
    } catch (error) {
      logger.error('Error creating permission:', error);
      throw error;
    }
  }

  /**
   * Create a new role with permissions
   */
  async createRole(data: CreateRoleData): Promise<Role> {
    try {
      const role = await this.prisma.$transaction(async (prisma) => {
        // Create role
        const newRole = await prisma.role.create({
          data: {
            name: data.name,
            description: data.description,
            isSystem: data.isSystem || false,
          },
        });

        // Add permissions to role
        if (data.permissions.length > 0) {
          const permissions = await prisma.permission.findMany({
            where: {
              name: { in: data.permissions },
            },
          });

          await prisma.rolePermission.createMany({
            data: permissions.map(permission => ({
              roleId: newRole.id,
              permissionId: permission.id,
            })),
          });
        }

        return newRole;
      });

      logger.info(`Role created: ${role.name}`);
      return role;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Grant permission to user
   */
  async grantPermissionToUser(data: GrantPermissionData): Promise<void> {
    try {
      await this.prisma.userPermission.create({
        data: {
          userId: data.userId,
          permissionId: data.permissionId,
          grantedBy: data.grantedBy,
          expiresAt: data.expiresAt,
        },
      });

      // Clear user permission cache
      await this.redis.client.del(`${this.permissionCachePrefix}${data.userId}`);

      logger.info(`Permission granted to user: ${data.userId}`);
    } catch (error) {
      logger.error('Error granting permission to user:', error);
      throw error;
    }
  }

  /**
   * Revoke permission from user
   */
  async revokePermissionFromUser(userId: string, permissionId: string): Promise<void> {
    try {
      await this.prisma.userPermission.delete({
        where: {
          userId_permissionId: {
            userId,
            permissionId,
          },
        },
      });

      // Clear user permission cache
      await this.redis.client.del(`${this.permissionCachePrefix}${userId}`);

      logger.info(`Permission revoked from user: ${userId}`);
    } catch (error) {
      logger.error('Error revoking permission from user:', error);
      throw error;
    }
  }

  /**
   * Initialize system permissions and roles
   */
  async initializeSystemPermissions(): Promise<void> {
    try {
      // Define system permissions by category
      const systemPermissions = [
        // User Management
        { name: 'user.create', description: 'Create new users', category: 'user_management' },
        { name: 'user.read', description: 'View user information', category: 'user_management' },
        { name: 'user.update', description: 'Update user information', category: 'user_management' },
        { name: 'user.delete', description: 'Delete users', category: 'user_management' },
        { name: 'user.activate', description: 'Activate/deactivate users', category: 'user_management' },
        { name: 'user.impersonate', description: 'Impersonate other users', category: 'user_management' },
        
        // Role and Permission Management
        { name: 'role.create', description: 'Create roles', category: 'role_management' },
        { name: 'role.update', description: 'Update roles', category: 'role_management' },
        { name: 'role.delete', description: 'Delete roles', category: 'role_management' },
        { name: 'permission.grant', description: 'Grant permissions', category: 'role_management' },
        { name: 'permission.revoke', description: 'Revoke permissions', category: 'role_management' },
        
        // Academic Management
        { name: 'academic.program.manage', description: 'Manage academic programs', category: 'academic' },
        { name: 'academic.course.manage', description: 'Manage courses', category: 'academic' },
        { name: 'academic.grade.manage', description: 'Manage grades', category: 'academic' },
        { name: 'academic.transcript.generate', description: 'Generate transcripts', category: 'academic' },
        
        // Exam Management
        { name: 'exam.session.create', description: 'Create exam sessions', category: 'exam_management' },
        { name: 'exam.session.update', description: 'Update exam sessions', category: 'exam_management' },
        { name: 'exam.session.delete', description: 'Delete exam sessions', category: 'exam_management' },
        { name: 'exam.invigilate', description: 'Invigilate exams', category: 'exam_management' },
        { name: 'exam.script.handle', description: 'Handle exam scripts', category: 'exam_management' },
        
        // Incident Management
        { name: 'incident.create', description: 'Create incidents', category: 'incident_management' },
        { name: 'incident.assign', description: 'Assign incidents', category: 'incident_management' },
        { name: 'incident.resolve', description: 'Resolve incidents', category: 'incident_management' },
        { name: 'incident.close', description: 'Close incidents', category: 'incident_management' },
        
        // System Administration
        { name: 'system.config.read', description: 'View system configuration', category: 'system_admin' },
        { name: 'system.config.update', description: 'Update system configuration', category: 'system_admin' },
        { name: 'system.audit.read', description: 'View audit logs', category: 'system_admin' },
        { name: 'system.backup.create', description: 'Create system backups', category: 'system_admin' },
        
        // Reporting and Analytics
        { name: 'report.generate', description: 'Generate reports', category: 'reporting' },
        { name: 'analytics.view', description: 'View analytics', category: 'reporting' },
        { name: 'data.export', description: 'Export data', category: 'reporting' },
      ];

      // Create permissions if they don't exist
      for (const permData of systemPermissions) {
        await this.prisma.permission.upsert({
          where: { name: permData.name },
          update: {},
          create: {
            ...permData,
            isSystem: true,
          },
        });
      }

      logger.info('System permissions initialized');
    } catch (error) {
      logger.error('Error initializing system permissions:', error);
      throw error;
    }
  }

  /**
   * Clear permission cache for user
   */
  async clearUserPermissionCache(userId: string): Promise<void> {
    await this.redis.client.del(`${this.permissionCachePrefix}${userId}`);
    await this.redis.client.del(`${this.roleCachePrefix}${userId}`);
  }

  /**
   * Get default permissions for user roles
   */
  private async getDefaultRolePermissions(role: UserRole): Promise<string[]> {
    const rolePermissions: Record<UserRole, string[]> = {
      [UserRole.SUPER_ADMIN]: [
        'user.create', 'user.read', 'user.update', 'user.delete', 'user.activate', 'user.impersonate',
        'role.create', 'role.update', 'role.delete', 'permission.grant', 'permission.revoke',
        'academic.program.manage', 'academic.course.manage', 'academic.grade.manage', 'academic.transcript.generate',
        'exam.session.create', 'exam.session.update', 'exam.session.delete', 'exam.invigilate', 'exam.script.handle',
        'incident.create', 'incident.assign', 'incident.resolve', 'incident.close',
        'system.config.read', 'system.config.update', 'system.audit.read', 'system.backup.create',
        'report.generate', 'analytics.view', 'data.export',
      ],
      [UserRole.SYSTEM_ADMIN]: [
        'user.read', 'user.update', 'user.activate',
        'system.config.read', 'system.config.update', 'system.audit.read', 'system.backup.create',
        'report.generate', 'analytics.view', 'data.export',
      ],
      [UserRole.INSTITUTIONAL_ADMIN]: [
        'user.create', 'user.read', 'user.update', 'user.activate',
        'academic.program.manage', 'academic.course.manage', 'academic.grade.manage', 'academic.transcript.generate',
        'exam.session.create', 'exam.session.update', 'exam.session.delete',
        'incident.assign', 'incident.resolve', 'incident.close',
        'report.generate', 'analytics.view', 'data.export',
      ],
      [UserRole.FACULTY_ADMIN]: [
        'user.read', 'user.update',
        'academic.course.manage', 'academic.grade.manage',
        'exam.session.create', 'exam.session.update',
        'incident.assign', 'incident.resolve',
        'report.generate', 'analytics.view',
      ],
      [UserRole.DEPARTMENT_HEAD]: [
        'user.read', 'user.update',
        'academic.course.manage', 'academic.grade.manage',
        'exam.session.create', 'exam.session.update',
        'incident.assign', 'incident.resolve',
        'report.generate',
      ],
      [UserRole.PROGRAM_COORDINATOR]: [
        'user.read',
        'academic.course.manage', 'academic.grade.manage',
        'exam.session.create', 'exam.session.update',
        'incident.create', 'incident.resolve',
        'report.generate',
      ],
      [UserRole.ACADEMIC_OFFICER]: [
        'user.read',
        'academic.grade.manage', 'academic.transcript.generate',
        'exam.session.update',
        'incident.create',
        'report.generate',
      ],
      [UserRole.EXAM_COORDINATOR]: [
        'user.read',
        'exam.session.create', 'exam.session.update', 'exam.session.delete', 'exam.script.handle',
        'incident.create', 'incident.assign', 'incident.resolve',
        'report.generate',
      ],
      [UserRole.CHIEF_INVIGILATOR]: [
        'user.read',
        'exam.invigilate', 'exam.script.handle',
        'incident.create', 'incident.assign',
      ],
      [UserRole.INVIGILATOR]: [
        'user.read',
        'exam.invigilate',
        'incident.create',
      ],
      [UserRole.SCRIPT_HANDLER]: [
        'user.read',
        'exam.script.handle',
        'incident.create',
      ],
      [UserRole.SECURITY_OFFICER]: [
        'user.read',
        'incident.create', 'incident.assign', 'incident.resolve',
      ],
      [UserRole.IT_SUPPORT]: [
        'user.read',
        'system.config.read', 'system.audit.read',
        'incident.create', 'incident.resolve',
      ],
      [UserRole.LECTURER]: [
        'user.read',
        'academic.grade.manage',
        'exam.invigilate',
        'incident.create',
      ],
      [UserRole.TEACHING_ASSISTANT]: [
        'user.read',
        'incident.create',
      ],
      [UserRole.STUDENT]: [
        'user.read',
      ],
      [UserRole.GUEST]: [],
    };

    return rolePermissions[role] || [];
  }
}
