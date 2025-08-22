import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

export const createScriptRoutes = (prisma: PrismaClient) => {
  // Script routes will be implemented here
  router.get('/tracking', async (req, res) => {
    res.json({ message: 'Script tracking endpoint - coming soon' });
  });

  return router;
};

export default router;
