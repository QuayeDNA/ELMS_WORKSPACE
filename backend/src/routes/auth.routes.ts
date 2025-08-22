import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import AuthService from '@/services/auth.service';

const router = Router();

export const createAuthRoutes = (prisma: PrismaClient) => {
  const authService = new AuthService(prisma);

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
    }
  });

  // Health check endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  return router;
};

export default router;
