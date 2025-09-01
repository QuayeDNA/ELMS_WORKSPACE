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
import { InstitutionService } from '../../services/superadmin/institutions/institution.service';

// Import controllers
import { DashboardController } from '../../controllers/superadmin/dashboard/dashboard.controller';
import { InstitutionController } from '../../controllers/superadmin/institutions/institution.controller';

// Import route modules
import { initializeDashboardRoutes } from './dashboard/dashboard.routes';
import { institutionRoutes } from './institutions/institution.routes';

const router = Router();

// Initialize dependencies
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Initialize services
const dashboardService = new DashboardService(prisma, redis);
const institutionService = new InstitutionService();

// Initialize controllers
const dashboardController = new DashboardController(dashboardService);
const institutionController = new InstitutionController(institutionService);

// Mount route modules
router.use('/dashboard', initializeDashboardRoutes(dashboardController));
router.use('/institutions', institutionRoutes(institutionController));

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
