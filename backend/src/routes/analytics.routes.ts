import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

export const createAnalyticsRoutes = (prisma: PrismaClient) => {
  // Analytics routes will be implemented here
  router.get('/dashboard', async (req, res) => {
    res.json({ message: 'Analytics dashboard endpoint - coming soon' });
  });

  return router;
};

export default router;
