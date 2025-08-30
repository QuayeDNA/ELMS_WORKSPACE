import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import AuthService from '@/services/auth/auth.service';
import { UserManagementService } from '@/services/user-management.service';
import RedisService from '@/services/redis.service';
import { NotificationService } from '@/services/notification.service';
import { PermissionService } from '@/services/permission.service';
import { AuditService } from '@/services/audit.service';
import { ValidationService } from '@/services/validation.service';
import { EmailService } from '@/services/email/email.service';
import { LoggerService } from '@/services/logger/logger.service';
import { ConfigService } from '@/services/config/config.service';

class AuthController {
  private authService: AuthService;
  private userManagementService: UserManagementService;
  private redisService: RedisService;
  private notificationService: NotificationService;
  private permissionService: PermissionService;
  private auditService: AuditService;
  private validationService: ValidationService;
  private emailService: EmailService;
  private loggerService: LoggerService;
  private configService: ConfigService;

  constructor(prisma: PrismaClient) {
    this.authService = new AuthService(prisma);
    this.redisService = RedisService.getInstance();
    this.notificationService = new NotificationService(prisma, this.redisService);
    this.permissionService = new PermissionService(prisma, this.redisService);
    this.auditService = new AuditService(prisma);
    this.validationService = new ValidationService(prisma);
    this.emailService = EmailService.getInstance();
    this.loggerService = LoggerService.getInstance();
    this.configService = ConfigService.getInstance();

    this.userManagementService = new UserManagementService(
      prisma,
      this.redisService,
      this.notificationService,
      this.permissionService,
      this.auditService,
      this.validationService
    );
  }

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await this.authService.authenticateUser(email, password);
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = this.authService.generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password || !firstName || !lastName) {
        res.status(400).json({ error: 'All fields are required' });
        return;
      }

      const user = await this.userManagementService.createUser({
        email,
        password,
        role: role || 'STUDENT',
        profile: {
          firstName,
          lastName,
        },
        sendWelcomeEmail: true,
      });

      res.status(201).json({
        message: 'User registered successfully. Please check your email for verification.',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: 'User already exists' });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      await this.userManagementService.initiatePasswordReset(email);

      res.json({ message: 'Password reset email sent successfully' });
    } catch (error: any) {
      // Don't reveal if email exists or not for security
      res.json({ message: 'If the email exists, a password reset link has been sent' });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({ error: 'Token and password are required' });
        return;
      }

      await this.userManagementService.resetPassword(token, password);

      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Invalid or expired reset token' });
    }
  }

  public async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = (req as any).user;

      if (!user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current password and new password are required' });
        return;
      }

      await this.userManagementService.changePassword(user.userId, currentPassword, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to change password' });
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token is required' });
        return;
      }

      // For now, we'll implement a simple refresh mechanism
      // In production, you'd want to store refresh tokens securely
      const payload = this.authService.verifyToken(refreshToken);
      if (!payload) {
        res.status(401).json({ error: 'Invalid refresh token' });
        return;
      }

      const newToken = this.authService.generateToken({
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      });

      res.json({
        token: newToken,
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        },
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  public async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const payload = this.authService.verifyToken(token);
      if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
      }

      res.json({
        valid: true,
        user: {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        },
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid token' });
    }
  }

  public async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({ error: 'Verification token is required' });
        return;
      }

      const result = await this.userManagementService.verifyEmail(token);

      if (result) {
        res.json({ message: 'Email verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid or expired verification token' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Email verification failed' });
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      // In a stateless JWT system, logout is handled client-side
      // In production, you might want to implement token blacklisting
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public health(req: Request, res: Response): void {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  }
}

export default AuthController;
