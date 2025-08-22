import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();

export const createExamRoutes = (prisma: PrismaClient) => {
  // Exam routes will be implemented here
  router.get('/sessions', async (req, res) => {
    res.json({ message: 'Exam sessions endpoint - coming soon' });
  });

  return router;
};

export default router;
