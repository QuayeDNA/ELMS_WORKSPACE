/**
 * Dashboard Routes for Super Admin
 *
 * Defines all API routes for dashboard functionality with proper
 * authentication, authorization, and validation middleware
 */

import { Router, Request, Response } from "express";
import { body, query } from "express-validator";
import { DashboardController } from "../../../controllers/superadmin/dashboard/dashboard.controller";
import { authenticateToken } from "../../../middleware/auth.middleware";
import { requireSuperAdmin } from "../../../middleware/rbac.middleware";
import {
  AlertSeverity,
  AlertSource,
} from "../../../types/superadmin/dashboard/dashboard.types";

const router = Router();

// Initialize controller (will be injected in main routes)
let dashboardController: DashboardController;

export const initializeDashboardRoutes = (controller: DashboardController) => {
  dashboardController = controller;
  return router;
};

/**
 * @route   GET /api/v1/superadmin/dashboard/overview
 * @desc    Get system overview with key metrics
 * @access  Super Admin
 */
router.get(
  "/overview",
  authenticateToken,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    await dashboardController.getOverview(req, res);
  }
);

/**
 * @route   GET /api/v1/superadmin/dashboard/metrics/realtime
 * @desc    Get real-time system metrics
 * @access  Super Admin
 */
router.get(
  "/metrics/realtime",
  authenticateToken,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    await dashboardController.getRealTimeMetrics(req, res);
  }
);

/**
 * @route   GET /api/v1/superadmin/dashboard/alerts
 * @desc    Get system alerts with filtering and pagination
 * @access  Super Admin
 */
router.get(
  "/alerts",
  authenticateToken,
  requireSuperAdmin,
  [
    query("severity")
      .optional()
      .custom((value) => {
        const severities = Array.isArray(value) ? value : [value];
        return severities.every((s: string) =>
          Object.values(AlertSeverity).includes(s as AlertSeverity)
        );
      })
      .withMessage("Invalid severity value"),

    query("source")
      .optional()
      .custom((value) => {
        const sources = Array.isArray(value) ? value : [value];
        return sources.every((s: string) =>
          Object.values(AlertSource).includes(s as AlertSource)
        );
      })
      .withMessage("Invalid source value"),

    query("resolved")
      .optional()
      .isBoolean()
      .withMessage("Resolved must be a boolean"),

    query("startDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid start date format"),

    query("endDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid end date format"),

    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),

    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be a non-negative integer"),
  ],
  async (req: Request, res: Response) => {
    await dashboardController.getAlerts(req, res);
  }
);

/**
 * @route   GET /api/v1/superadmin/dashboard/quick-actions
 * @desc    Get available quick actions for super admin
 * @access  Super Admin
 */
router.get(
  "/quick-actions",
  authenticateToken,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    await dashboardController.getQuickActions(req, res);
  }
);

/**
 * @route   POST /api/v1/superadmin/dashboard/alerts/:id/resolve
 * @desc    Resolve a specific alert
 * @access  Super Admin
 */
router.post(
  "/alerts/:id/resolve",
  authenticateToken,
  requireSuperAdmin,
  async (req: Request, res: Response) => {
    await dashboardController.resolveAlert(req, res);
  }
);

/**
 * @route   POST /api/v1/superadmin/dashboard/alerts
 * @desc    Create a new system alert
 * @access  Super Admin
 */
router.post(
  "/alerts",
  authenticateToken,
  requireSuperAdmin,
  [
    body("severity")
      .isIn(Object.values(AlertSeverity))
      .withMessage("Invalid severity level"),

    body("title")
      .isLength({ min: 3, max: 255 })
      .withMessage("Title must be between 3 and 255 characters"),

    body("description")
      .isLength({ min: 10, max: 1000 })
      .withMessage("Description must be between 10 and 1000 characters"),

    body("source")
      .isIn(Object.values(AlertSource))
      .withMessage("Invalid alert source"),

    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be an object"),
  ],
  async (req: Request, res: Response) => {
    await dashboardController.createAlert(req, res);
  }
);

export default router;
