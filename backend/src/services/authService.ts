import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  UserRole,
  UserStatus 
} from '../types/auth';
import { getRolePermissions } from '../config/roles';

const prisma = new PrismaClient();

// ========================================
// JWT CONFIGURATION
// ========================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// ========================================
// AUTHENTICATION SERVICE
// ========================================

export class AuthService {
  
  // ========================================
  // USER REGISTRATION
  // ========================================
  
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Validate role assignment permissions
      await this.validateRoleAssignment(data.role, data);

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role,
          status: UserStatus.PENDING_VERIFICATION,
          institutionId: data.institutionId,
          facultyId: data.facultyId,
          departmentId: data.departmentId,
        },
        include: {
          institution: true,
          faculty: true,
          department: true,
        }
      });

      // Create role-specific profile
      await this.createRoleProfile(user.id, data.role, data);

      // Generate tokens
      const { token, refreshToken } = await this.generateTokens(user);

      // Create user session
      await this.createUserSession(user.id, token, refreshToken);

      return {
        user: this.transformUserResponse(user),
        token,
        refreshToken,
        expiresIn: this.getTokenExpirationTime(),
      };

    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ========================================
  // USER LOGIN
  // ========================================
  
  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: {
          institution: true,
          faculty: true,
          department: true,
        }
      });

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check user status
      if (user.status === UserStatus.SUSPENDED) {
        throw new Error('Account is suspended. Please contact administrator.');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Check institution scope if provided
      if (data.institutionId && user.institutionId !== data.institutionId) {
        throw new Error('Invalid institution access');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate tokens
      const { token, refreshToken } = await this.generateTokens(user);

      // Create user session
      await this.createUserSession(user.id, token, refreshToken);

      // Log authentication event
      await this.logAuditEvent(user.id, 'LOGIN', 'user', user.id.toString());

      return {
        user: this.transformUserResponse(user),
        token,
        refreshToken,
        expiresIn: this.getTokenExpirationTime(),
      };

    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ========================================
  // TOKEN MANAGEMENT
  // ========================================
  
  static async generateTokens(user: any): Promise<{ token: string; refreshToken: string }> {
    const permissions = getRolePermissions(user.role);

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      institutionId: user.institutionId,
      facultyId: user.facultyId,
      departmentId: user.departmentId,
      permissions,
    };

    // Create main access token
    const token = jwt.sign(payload, JWT_SECRET!, { 
      expiresIn: '24h',
      issuer: 'elms-system',
      audience: 'elms-users'
    });

    // Create refresh token
    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' }, 
      JWT_SECRET!, 
      { 
        expiresIn: '7d',
        issuer: 'elms-system',
        audience: 'elms-users'
      }
    );

    return { token, refreshToken };
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_SECRET!) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // Find user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: {
          institution: true,
          faculty: true,
          department: true,
        }
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const { token: newToken, refreshToken: newRefreshToken } = await this.generateTokens(user);

      return {
        user: this.transformUserResponse(user),
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpirationTime(),
      };

    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ========================================
  // USER PROFILE MANAGEMENT
  // ========================================
  
  static async createRoleProfile(userId: number, role: UserRole, data: RegisterRequest): Promise<void> {
    switch (role) {
      case UserRole.ADMIN:
        await prisma.adminProfile.create({
          data: {
            userId,
            permissions: {},
            canManageFaculties: true,
            canManageUsers: true,
            canViewAnalytics: true,
          }
        });
        break;

      case UserRole.FACULTY_ADMIN:
        await prisma.facultyAdminProfile.create({
          data: {
            userId,
            permissions: {},
            canManageDepartments: true,
            canCreateExams: true,
            canManageOfficers: true,
            canViewFacultyData: true,
          }
        });
        break;

      case UserRole.EXAMS_OFFICER:
        await prisma.examOfficerProfile.create({
          data: {
            userId,
            permissions: {},
            canScheduleExams: true,
            canManageIncidents: true,
            canAssignInvigilators: true,
            canManageVenues: true,
          }
        });
        break;

      case UserRole.SCRIPT_HANDLER:
        await prisma.scriptHandlerProfile.create({
          data: {
            userId,
            permissions: {},
            canReceiveScripts: true,
            canDispatchScripts: true,
            canScanQrCodes: true,
            canReportIncidents: true,
          }
        });
        break;

      case UserRole.INVIGILATOR:
        await prisma.invigilatorProfile.create({
          data: {
            userId,
            permissions: {},
            canConductExams: true,
            canReportIncidents: true,
            canManageScripts: true,
          }
        });
        break;

      case UserRole.LECTURER:
        await prisma.lecturerProfile.create({
          data: {
            userId,
            permissions: {},
            canCreateExams: true,
            canGradeScripts: true,
            canViewResults: true,
          }
        });
        break;

      case UserRole.STUDENT:
        await prisma.studentProfile.create({
          data: {
            userId,
            studentId: data.studentId || `STU${userId}${Date.now()}`,
            level: '100', // Default level
            program: data.departmentId ? 'General' : undefined,
          }
        });
        break;
    }
  }

  // ========================================
  // SESSION MANAGEMENT
  // ========================================
  
  static async createUserSession(userId: number, token: string, refreshToken: string): Promise<void> {
    // Implementation would store session in Redis or database
    // For now, we'll skip this but it's important for production
    console.log(`Session created for user ${userId}`);
  }

  static async invalidateUserSession(userId: number, sessionId?: string): Promise<void> {
    // Implementation would invalidate specific session or all user sessions
    console.log(`Session invalidated for user ${userId}`);
  }

  // ========================================
  // USER VALIDATION
  // ========================================
  
  static async validateRoleAssignment(role: UserRole, data: RegisterRequest): Promise<void> {
    // Validate that the role assignment is appropriate
    switch (role) {
      case UserRole.SUPER_ADMIN:
        throw new Error('Super Admin accounts cannot be created through registration');
      
      case UserRole.ADMIN:
        if (!data.institutionId) {
          throw new Error('Institution ID is required for Admin role');
        }
        break;
      
      case UserRole.FACULTY_ADMIN:
        if (!data.institutionId || !data.facultyId) {
          throw new Error('Institution and Faculty IDs are required for Faculty Admin role');
        }
        break;
      
      case UserRole.STUDENT:
        if (!data.institutionId || !data.facultyId) {
          throw new Error('Institution and Faculty IDs are required for Student role');
        }
        break;
    }
  }

  // ========================================
  // UTILITY METHODS
  // ========================================
  
  static transformUserResponse(user: any): User {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      institutionId: user.institutionId,
      facultyId: user.facultyId,
      departmentId: user.departmentId,
      permissions: getRolePermissions(user.role),
      lastLogin: user.lastLogin,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };
  }

  static getTokenExpirationTime(): number {
    const expiresIn = JWT_EXPIRES_IN;
    if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn) * 60 * 60; // hours to seconds
    }
    if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn) * 24 * 60 * 60; // days to seconds
    }
    return parseInt(expiresIn); // assume seconds
  }

  static async logAuditEvent(userId: number, action: string, entity: string, entityId: string): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action: action as any,
          entity,
          entityId,
          timestamp: new Date(),
        }
      });
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  // ========================================
  // PASSWORD MANAGEMENT
  // ========================================
  
  static async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      // Log password change
      await this.logAuditEvent(userId, 'UPDATE', 'user', userId.toString());

    } catch (error) {
      throw new Error(`Password change failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async requestPasswordReset(email: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal whether user exists or not
        return;
      }

      // Generate password reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        JWT_SECRET!,
        { expiresIn: '1h' }
      );

      // In production, send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`);

    } catch (error) {
      console.error('Password reset request failed:', error);
    }
  }

  static async resetPassword(resetToken: string, newPassword: string): Promise<void> {
    try {
      // Verify reset token
      const decoded = jwt.verify(resetToken, JWT_SECRET!) as any;
      
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword }
      });

      // Log password reset
      await this.logAuditEvent(decoded.userId, 'UPDATE', 'user', decoded.userId.toString());

    } catch (error) {
      throw new Error(`Password reset failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ========================================
  // USER ACCOUNT MANAGEMENT
  // ========================================
  
  static async activateUser(userId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.ACTIVE }
    });
  }

  static async suspendUser(userId: number, reason?: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { status: UserStatus.SUSPENDED }
    });
    
    // Log suspension
    await this.logAuditEvent(userId, 'UPDATE', 'user', userId.toString());
  }

  static async verifyEmail(userId: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true }
    });
  }
}
