import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

export const createIncidentRoutes = (prisma: PrismaClient) => {
  // Incident routes will be implemented here
  router.get('/reports', async (req, res) => {
    res.json({ message: 'Incident reports endpoint - coming soon' });
  });

  return router;
};

export default router;
