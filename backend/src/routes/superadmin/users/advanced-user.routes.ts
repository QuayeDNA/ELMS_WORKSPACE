/**
 * Advanced User Management Routes
 * 
 * All routes for advanced user management operations including
 * cross-institutional search, analytics, impersonation, and bulk operations
 */

import { Router } from "express";
import {
  AdvancedUserController,
  advancedUserValidationRules,
} from "../../../controllers/superadmin/users/advanced-user.controller";

const router = Router();

export function advancedUserRoutes(
  advancedUserController: AdvancedUserController
): Router {
  // User statistics and overview
  router.get(
    "/stats",
    advancedUserController.getUserStatistics.bind(advancedUserController)
  );

  // User search and filtering
  router.get(
    "/search",
    advancedUserValidationRules.searchUsers,
    advancedUserController.searchUsers.bind(advancedUserController)
  );

  // User analytics
  router.get(
    "/:userId/analytics",
    advancedUserValidationRules.getUserAnalytics,
    advancedUserController.getUserAnalytics.bind(advancedUserController)
  );

  // User activity history
  router.get(
    "/:userId/activity",
    advancedUserValidationRules.getUserActivityHistory,
    advancedUserController.getUserActivityHistory.bind(advancedUserController)
  );

  // Impersonation management
  router.post(
    "/impersonate",
    advancedUserValidationRules.startImpersonation,
    advancedUserController.startImpersonation.bind(advancedUserController)
  );

  router.post(
    "/impersonate/:sessionId/end",
    advancedUserValidationRules.endImpersonation,
    advancedUserController.endImpersonation.bind(advancedUserController)
  );

  router.get(
    "/impersonation/history",
    advancedUserValidationRules.getImpersonationHistory,
    advancedUserController.getImpersonationHistory.bind(advancedUserController)
  );

  // Bulk operations
  router.post(
    "/bulk-operations",
    advancedUserValidationRules.performBulkOperation,
    advancedUserController.performBulkOperation.bind(advancedUserController)
  );

  router.get(
    "/bulk-operations/:operationId",
    advancedUserValidationRules.getBulkOperationStatus,
    advancedUserController.getBulkOperationStatus.bind(advancedUserController)
  );

  return router;
}

export default router;
