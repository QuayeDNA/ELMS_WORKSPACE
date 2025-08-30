import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import AuthService from '@/services/auth.service';
import { UserManagementService } from '@/services/user-management.service';
import RedisService from '@/services/redis.service';
import { NotificationService } from '@/services/notification.service';
import { PermissionService } from '@/services/permission.service';
import { AuditService } from '@/services/audit.service';
import { ValidationService } from '@/services/validation.service';
import { EmailService } from '@/services/email.service';
import { LoggerService } from '@/services/logger.service';
import { ConfigService } from '@/services/config.service';

const router = Router();

export const createAuthRoutes = (prisma: PrismaClient) => {
  const authService = new AuthService(prisma);
  const redisService = RedisService.getInstance();
  const notificationService = new NotificationService(prisma, redisService);
  const permissionService = new PermissionService(prisma, redisService);
  const auditService = new AuditService(prisma);
  const validationService = new ValidationService(prisma);
  const emailService = EmailService.getInstance();
  const loggerService = LoggerService.getInstance();
  const configService = ConfigService.getInstance();

  const userManagementService = new UserManagementService(
    prisma,
    redisService,
    notificationService,
    permissionService,
    auditService,
    validationService
  );

  // Login endpoint
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await authService.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = authService.generateToken({
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
      return;
    }
  });

  // Register endpoint
  router.post('/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const user = await userManagementService.createUser({
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
        return res.status(409).json({ error: 'User already exists' });
      }
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  });

  // Forgot password endpoint
  router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      await userManagementService.initiatePasswordReset(email);

      res.json({ message: 'Password reset email sent successfully' });
    } catch (error: any) {
      // Don't reveal if email exists or not for security
      res.json({ message: 'If the email exists, a password reset link has been sent' });
      return;
    }
  });

  // Reset password endpoint
  router.post('/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required' });
      }

      await userManagementService.resetPassword(token, password);

      res.json({ message: 'Password reset successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Invalid or expired reset token' });
      return;
    }
  });

  // Change password endpoint (authenticated)
  router.post('/change-password', async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
      }

      await userManagementService.changePassword(user.userId, currentPassword, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Failed to change password' });
      return;
    }
  });

  // Refresh token endpoint
  router.post('/refresh', async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
      }

      // For now, we'll implement a simple refresh mechanism
      // In production, you'd want to store refresh tokens securely
      const payload = authService.verifyToken(refreshToken);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const newToken = authService.generateToken({
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
      return;
    }
  });

  // Verify token endpoint
  router.get('/verify', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({ error: 'Access token required' });
      }

      const payload = authService.verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: 'Invalid or expired token' });
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
      return;
    }
  });

  // Verify email endpoint
  router.get('/verify-email/:token', async (req, res) => {
    try {
      const { token } = req.params;

      if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
      }

      const result = await userManagementService.verifyEmail(token);

      if (result) {
        res.json({ message: 'Email verified successfully' });
      } else {
        res.status(400).json({ error: 'Invalid or expired verification token' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message || 'Email verification failed' });
      return;
    }
  });

  // Logout endpoint
  router.post('/logout', async (req, res) => {
    try {
      // In a stateless JWT system, logout is handled client-side
      // In production, you might want to implement token blacklisting
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  return router;
};

export default router;
