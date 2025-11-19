import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole, UserStatus } from '@prisma/client';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  JwtPayload
} from '../types/auth';
import { StudentMetadata, LecturerMetadata, RoleMetadata } from '../types/roleProfile';
import { getRoleProfile, upsertRoleProfile, DEFAULT_PERMISSIONS } from '../utils/profileHelpers';

const prisma = new PrismaClient();

// ========================================
// JWT CONFIGURATION
// ========================================

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
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
      const userRole = data.role || UserRole.STUDENT;
      await this.validateRoleAssignment(userRole, data);

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
          middleName: data.middleName || null,
          title: data.title || null,
          phone: data.phone || null,
          dateOfBirth: data.dateOfBirth || null,
          gender: data.gender || null,
          nationality: data.nationality || null,
          address: data.address || null,
          role: userRole, // Required by Prisma schema
          status: UserStatus.PENDING_VERIFICATION,
          institutionId: data.institutionId || null,
          facultyId: data.facultyId || null,
          departmentId: data.departmentId || null,
        },
        include: {
          institution: true,
          faculty: true,
          department: true,
        }
      });

      // Create role-specific profile using new RoleProfile system
      const roleMetadata = this.buildRoleMetadata(user.id, userRole, data);
      const rolePermissions = DEFAULT_PERMISSIONS[userRole];

      await upsertRoleProfile(
        user.id,
        userRole,
        rolePermissions,
        roleMetadata,
        true, // isPrimary
        prisma
      );

      // Get user's role profile for response
      const roleProfile = await getRoleProfile(user.id, userRole, prisma);

      // Generate tokens with multi-role support
      const { token, refreshToken } = await this.generateTokens(user, roleProfile);

      // Create user session
      await this.createUserSession(user.id, token, refreshToken);

      return {
        token,
        refreshToken,
        expiresIn: this.getTokenExpirationTime(),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName || undefined,
          title: user.title || undefined,
          status: user.status,
          institutionId: user.institutionId || undefined,
          facultyId: user.facultyId || undefined,
          departmentId: user.departmentId || undefined,
          emailVerified: user.emailVerified,
        },
        primaryRole: roleProfile.role as UserRole,
        roles: [{
          role: roleProfile.role as UserRole,
          isActive: roleProfile.isActive,
          isPrimary: roleProfile.isPrimary,
          permissions: roleProfile.permissions as any,
          metadata: roleProfile.metadata as any,
        }],
        permissions: roleProfile.permissions as any,
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
      // Trim email and password to prevent whitespace issues
      const email = data.email.trim();
      const password = data.password.trim();

      console.log('Login attempt for email:', email);

      // Find user by email (case-insensitive)
      // PostgreSQL's unique constraint is case-sensitive, but we need case-insensitive login
      const user = await prisma.user.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        },
        include: {
          institution: true,
          faculty: true,
          department: true,
        }
      });

      if (!user) {
        console.log('User not found with email:', email);
        // Check if user exists with slightly different email (case sensitivity, etc.)
        const allUsers = await prisma.user.findMany({
          where: {
            email: {
              contains: email.split('@')[0],
              mode: 'insensitive'
            }
          },
          select: { email: true, id: true }
        });
        console.log('Similar emails found:', allUsers);
        throw new Error('Invalid email or password');
      }

      console.log('User found:', { id: user.id, email: user.email, role: user.role, status: user.status });

      // Check user status
      if (user.status === UserStatus.SUSPENDED) {
        throw new Error('Account is suspended. Please contact administrator.');
      }

      if (user.status === UserStatus.INACTIVE) {
        throw new Error('Account is inactive. Please contact administrator.');
      }

      // Verify password
      console.log('Verifying password for user:', user.email);
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password validation result:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
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

      // Get all user's role profiles
      const roleProfiles = await prisma.roleProfile.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
        orderBy: { isPrimary: 'desc' },
      });

      const primaryProfile = roleProfiles.find(rp => rp.isPrimary) || roleProfiles[0];
      if (!primaryProfile) {
        throw new Error('No active role profile found for user');
      }

      // Generate tokens with multi-role support
      const { token, refreshToken } = await this.generateTokens(user, primaryProfile);

      // Create user session
      await this.createUserSession(user.id, token, refreshToken);

      // Log authentication event
      await this.logAuditEvent(user.id, 'LOGIN', 'user', user.id.toString());

      return {
        token,
        refreshToken,
        expiresIn: this.getTokenExpirationTime(),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName || undefined,
          title: user.title || undefined,
          status: user.status,
          institutionId: user.institutionId || undefined,
          facultyId: user.facultyId || undefined,
          departmentId: user.departmentId || undefined,
          emailVerified: user.emailVerified,
        },
        primaryRole: primaryProfile.role as UserRole,
        roles: roleProfiles.map(rp => ({
          role: rp.role as UserRole,
          isActive: rp.isActive,
          isPrimary: rp.isPrimary,
          permissions: rp.permissions as any,
          metadata: rp.metadata as any,
        })),
        permissions: primaryProfile.permissions as any,
      };

    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ========================================
  // TOKEN MANAGEMENT
  // ========================================

  static async generateTokens(user: any, primaryProfile: any): Promise<{ token: string; refreshToken: string }> {
    // Get all active roles for JWT
    const allProfiles = await prisma.roleProfile.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      select: { role: true },
    });

    const payload: JwtPayload = {
      id: user.id, // Backward compatibility
      userId: user.id,
      email: user.email,
      primaryRole: primaryProfile.role as UserRole,
      roles: allProfiles.map(p => p.role as UserRole),
      institutionId: user.institutionId || undefined,
      facultyId: user.facultyId || undefined,
      departmentId: user.departmentId || undefined,
      permissions: primaryProfile.permissions as any,
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

      // Get user's primary role profile
      const primaryProfile = await prisma.roleProfile.findFirst({
        where: {
          userId: user.id,
          isPrimary: true,
          isActive: true,
        },
      });

      if (!primaryProfile) {
        throw new Error('No active role profile found');
      }

      // Get all role profiles
      const roleProfiles = await prisma.roleProfile.findMany({
        where: {
          userId: user.id,
          isActive: true,
        },
      });

      // Generate new tokens
      const { token: newToken, refreshToken: newRefreshToken } = await this.generateTokens(user, primaryProfile);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: this.getTokenExpirationTime(),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          middleName: user.middleName || undefined,
          title: user.title || undefined,
          status: user.status,
          institutionId: user.institutionId || undefined,
          facultyId: user.facultyId || undefined,
          departmentId: user.departmentId || undefined,
          emailVerified: user.emailVerified,
        },
        primaryRole: primaryProfile.role as UserRole,
        roles: roleProfiles.map(rp => ({
          role: rp.role as UserRole,
          isActive: rp.isActive,
          isPrimary: rp.isPrimary,
          permissions: rp.permissions as any,
          metadata: rp.metadata as any,
        })),
        permissions: primaryProfile.permissions as any,
      };

    } catch (error) {
      throw new Error(`Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ========================================
  // ROLE METADATA BUILDER
  // ========================================

  static buildRoleMetadata(userId: number, role: UserRole, data: RegisterRequest): RoleMetadata {
    switch (role) {
      case UserRole.STUDENT:
        const studentMetadata: StudentMetadata = {
          studentId: data.studentId || `STU${userId}${Date.now()}`,
          indexNumber: data.indexNumber,
          level: data.level || 100,
          semester: data.semester || 1,
          programId: data.programId,
          enrollmentStatus: 'ACTIVE',
          academicStatus: 'GOOD_STANDING',
        };
        return studentMetadata;

      case UserRole.LECTURER:
        const lecturerMetadata: LecturerMetadata = {
          staffId: data.staffId || `STAFF${userId}${Date.now()}`,
          employmentType: 'FULL_TIME',
          employmentStatus: 'ACTIVE',
        };
        return lecturerMetadata;

      case UserRole.ADMIN:
      case UserRole.FACULTY_ADMIN:
      case UserRole.EXAMS_OFFICER:
      case UserRole.SCRIPT_HANDLER:
      case UserRole.INVIGILATOR:
      default:
        return {}; // Empty metadata for other roles
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

  static async getUserById(userId: number): Promise<any> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          institution: true,
          faculty: true,
          department: true,
        }
      });

      return user;
    } catch (error) {
      console.error('Failed to fetch user by ID:', error);
      return null;
    }
  }

  static async getUserWithRoles(userId: number): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roleProfiles: {
          where: { isActive: true },
          orderBy: { isPrimary: 'desc' },
        },
        institution: true,
        faculty: true,
        department: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const primaryProfile = user.roleProfiles.find(rp => rp.isPrimary) || user.roleProfiles[0];

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      title: user.title,
      status: user.status,
      primaryRole: primaryProfile?.role || UserRole.STUDENT,
      roles: user.roleProfiles.map(rp => ({
        role: rp.role as UserRole,
        isActive: rp.isActive,
        isPrimary: rp.isPrimary,
        permissions: rp.permissions as any,
        metadata: rp.metadata as any,
      })),
      institutionId: user.institutionId,
      facultyId: user.facultyId,
      departmentId: user.departmentId,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      lastLogin: user.lastLogin,
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
      // TODO: Implement general audit logging system
      // For now, we'll log to console instead of database
      console.log(`AUDIT: User ${userId} performed ${action} on ${entity} ${entityId}`);
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
