/**
 * Institution Management Routes
 * 
 * All routes for institution management operations including
 * CRUD operations, configuration management, analytics, billing,
 * integration management, and bulk operations
 */

import { Router } from "express";
import {
  InstitutionController,
  institutionValidationRules,
} from "../../../controllers/superadmin/institutions/institution.controller";

const router = Router();

export function institutionRoutes(
  institutionController: InstitutionController
): Router {
  // Institution CRUD operations
  router.get(
    "/stats",
    institutionController.getInstitutionStats.bind(institutionController)
  );
  router.get(
    "/",
    institutionValidationRules.getInstitutions,
    institutionController.getInstitutions.bind(institutionController)
  );
  router.get(
    "/:id",
    institutionValidationRules.getInstitutionById,
    institutionController.getInstitutionById.bind(institutionController)
  );
  router.post(
    "/",
    institutionValidationRules.createInstitution,
    institutionController.createInstitution.bind(institutionController)
  );
  router.put(
    "/:id",
    institutionValidationRules.updateInstitution,
    institutionController.updateInstitution.bind(institutionController)
  );
  router.delete(
    "/:id",
    institutionValidationRules.deleteInstitution,
    institutionController.deleteInstitution.bind(institutionController)
  );

  // Configuration management
  router.get(
    "/:id/configuration",
    institutionValidationRules.getInstitutionConfiguration,
    institutionController.getInstitutionConfiguration.bind(
      institutionController
    )
  );
  router.put(
    "/:id/configuration",
    institutionValidationRules.updateInstitutionConfiguration,
    institutionController.updateInstitutionConfiguration.bind(
      institutionController
    )
  );

  // Analytics and reporting
  router.get(
    "/:id/analytics",
    institutionValidationRules.getInstitutionAnalytics,
    institutionController.getInstitutionAnalytics.bind(institutionController)
  );
  router.get(
    "/:id/usage-stats",
    institutionValidationRules.getInstitutionUsageStats,
    institutionController.getInstitutionUsageStats.bind(institutionController)
  );

  // Status management
  router.patch(
    "/:id/status",
    institutionValidationRules.changeInstitutionStatus,
    institutionController.changeInstitutionStatus.bind(institutionController)
  );

  // Feature management
  router.patch(
    "/:id/features/toggle",
    institutionValidationRules.toggleInstitutionFeature,
    institutionController.toggleInstitutionFeature.bind(institutionController)
  );

  // Integration management
  router.put(
    "/:id/integrations",
    institutionValidationRules.updateInstitutionIntegrations,
    institutionController.updateInstitutionIntegrations.bind(
      institutionController
    )
  );

  // Billing and subscription management
  router.get(
    "/:id/billing",
    institutionValidationRules.getInstitutionBilling,
    institutionController.getInstitutionBilling.bind(institutionController)
  );
  router.get(
    "/:id/billing/report",
    institutionValidationRules.generateBillingReport,
    institutionController.generateBillingReport.bind(institutionController)
  );

  // Bulk operations
  router.post(
    "/bulk",
    institutionValidationRules.performBulkOperation,
    institutionController.performBulkOperation.bind(institutionController)
  );

  return router;
}

export default router;
