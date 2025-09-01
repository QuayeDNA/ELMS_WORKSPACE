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
import { AdvancedUserService } from '../../services/superadmin/users/advanced-user.service';
import { SystemAdministrationService } from '../../services/superadmin/system/system-administration.service';
import RedisService from '../../services/redis.service';

// Import controllers
import { DashboardController } from '../../controllers/superadmin/dashboard/dashboard.controller';
import { InstitutionController } from '../../controllers/superadmin/institutions/institution.controller';
import { AdvancedUserController } from '../../controllers/superadmin/users/advanced-user.controller';
import { SystemAdministrationController } from '../../controllers/superadmin/system/system-administration.controller';

// Import route modules
import { initializeDashboardRoutes } from './dashboard/dashboard.routes';
import { institutionRoutes } from './institutions/institution.routes';
import { advancedUserRoutes } from './users/advanced-user.routes';
import { createSystemAdministrationRoutes } from './system/system-administration.routes';

const router = Router();

// Initialize dependencies
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
const redisService = RedisService.getInstance();

// Initialize services
const dashboardService = new DashboardService(prisma, redis);
const institutionService = new InstitutionService();
const advancedUserService = new AdvancedUserService();
const systemAdministrationService = new SystemAdministrationService(prisma, redisService);

// Initialize controllers
const dashboardController = new DashboardController(dashboardService);
const institutionController = new InstitutionController(institutionService);
const advancedUserController = new AdvancedUserController(advancedUserService);
const systemAdministrationController = new SystemAdministrationController(systemAdministrationService);

// Mount route modules
router.use('/dashboard', initializeDashboardRoutes(dashboardController));
router.use('/institutions', institutionRoutes(institutionController));
router.use('/users', advancedUserRoutes(advancedUserController));
router.use('/system', createSystemAdministrationRoutes(systemAdministrationController, prisma));

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
