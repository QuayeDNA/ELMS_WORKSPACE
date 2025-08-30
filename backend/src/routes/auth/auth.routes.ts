import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import AuthController from '@/controllers/auth/auth.controller';

const router = Router();

export const createAuthRoutes = (prisma: PrismaClient) => {
  const authController = new AuthController(prisma);

  // Login endpoint
  router.post('/login', authController.login.bind(authController));

  // Register endpoint
  router.post('/register', authController.register.bind(authController));

  // Forgot password endpoint
  router.post('/forgot-password', authController.forgotPassword.bind(authController));

  // Reset password endpoint
  router.post('/reset-password', authController.resetPassword.bind(authController));

  // Change password endpoint (authenticated)
  router.post('/change-password', authController.changePassword.bind(authController));

  // Refresh token endpoint
  router.post('/refresh', authController.refreshToken.bind(authController));

  // Verify token endpoint
  router.get('/verify', authController.verifyToken.bind(authController));

  // Verify email endpoint
  router.get('/verify-email/:token', authController.verifyEmail.bind(authController));

  // Logout endpoint
  router.post('/logout', authController.logout.bind(authController));

  // Health check endpoint
  router.get('/health', authController.health.bind(authController));

  return router;
};

export default router;
