/**
 * Main Super Admin Routes
 * 
 * Integrates all super admin feature routes and initializes
 * controllers with proper dependency injection
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

// Import services
import { DashboardService } from '../../services/superadmin/dashboard/dashboard.service';

// Import controllers
import { DashboardController } from '../../controllers/superadmin/dashboard/dashboard.controller';

// Import route modules
import { initializeDashboardRoutes } from './dashboard/dashboard.routes';

const router = Router();

// Initialize dependencies
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize services
const dashboardService = new DashboardService(prisma, redis);

// Initialize controllers
const dashboardController = new DashboardController(dashboardService);

// Mount route modules
router.use('/dashboard', initializeDashboardRoutes(dashboardController));

// Health check endpoint for super admin routes
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Super Admin API is healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      cache: 'connected'
    }
  });
});

export default router;
