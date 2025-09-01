/**
 * System Administration Feature Integration
 * 
 * Sets up the complete System Administration feature for Super Admin users
 */

import { SystemAdministrationService } from '../../../services/superadmin/system/system-administration.service';
import { SystemAdministrationController } from '../../../controllers/superadmin/system/system-administration-simple.controller';
import { createSystemAdministrationRoutes } from '../../../routes/superadmin/system/system-administration-simple.routes';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

export function initializeSystemAdministration(prisma: PrismaClient, redis: Redis) {
  // Initialize service
  const systemAdminService = new SystemAdministrationService(prisma, redis);
  
  // Initialize controller
  const systemAdminController = new SystemAdministrationController(systemAdminService);
  
  // Create routes
  const systemAdminRoutes = createSystemAdministrationRoutes(systemAdminController);
  
  return {
    service: systemAdminService,
    controller: systemAdminController,
    routes: systemAdminRoutes
  };
}
