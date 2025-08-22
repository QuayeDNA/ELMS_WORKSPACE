import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

export const createFileRoutes = (prisma: PrismaClient) => {
  // File routes will be implemented here
  router.post('/upload', async (req, res) => {
    res.json({ message: 'File upload endpoint - coming soon' });
  });

  return router;
};

export default router;
