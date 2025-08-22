import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

export const createUserRoutes = (prisma: PrismaClient) => {
  // User routes will be implemented here
  router.get('/profile', async (req, res) => {
    res.json({ message: 'User profile endpoint - coming soon' });
  });

  return router;
};

export default router;
