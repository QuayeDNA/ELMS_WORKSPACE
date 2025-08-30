import { Router, Request, Response } from 'express';
import { WebhookManagementService, WebhookConfig, WebhookFilter } from '../../services/integrations/WebhookManagementService';
import { authenticateToken, authorize } from '../../middleware/auth.middleware';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();
const webhookService = new WebhookManagementService(prisma);

// Middleware
const authMiddleware = authenticateToken(prisma);
const superAdminOnly = authorize(['SUPER_ADMIN']);

/**
 * @route GET /api/webhooks
 * @desc Get all webhooks with filtering and pagination
 * @access Private (Super Admin only)
 */
router.get('/', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const filter: WebhookFilter = {
      isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
      event: req.query.event as string,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
    };

    const result = await webhookService.getWebhooks(filter);

    res.json({
      success: true,
      data: result,
      message: 'Webhooks retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve webhooks: ${message}`
    });
  }
});

/**
 * @route GET /api/webhooks/:id
 * @desc Get a specific webhook by ID
 * @access Private (Super Admin only)
 */
router.get('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook ID'
      });
    }

    const webhook = await webhookService.getWebhookById(id);

    res.json({
      success: true,
      data: webhook,
      message: 'Webhook retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to retrieve webhook: ${message}`
    });
    return;
  }
});

/**
 * @route POST /api/webhooks
 * @desc Create a new webhook
 * @access Private (Super Admin only)
 */
router.post('/', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const webhookConfig: WebhookConfig = req.body;
    const user = (req as any).user;

    const webhook = await webhookService.createWebhook(webhookConfig, user.userId);

    res.status(201).json({
      success: true,
      data: webhook,
      message: 'Webhook created successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to create webhook: ${message}`
    });
  }
});

/**
 * @route PUT /api/webhooks/:id
 * @desc Update a webhook
 * @access Private (Super Admin only)
 */
router.put('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook ID'
      });
    }

    const updates: Partial<WebhookConfig> = req.body;
    const webhook = await webhookService.updateWebhook(id, updates);

    res.json({
      success: true,
      data: webhook,
      message: 'Webhook updated successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to update webhook: ${message}`
    });
  }
});

/**
 * @route DELETE /api/webhooks/:id
 * @desc Delete a webhook
 * @access Private (Super Admin only)
 */
router.delete('/:id', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook ID'
      });
    }

    await webhookService.deleteWebhook(id);

    res.json({
      success: true,
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message
      });
    }
    res.status(500).json({
      success: false,
      message: `Failed to delete webhook: ${message}`
    });
  }
});

/**
 * @route POST /api/webhooks/test
 * @desc Test webhook delivery
 * @access Private (Super Admin only)
 */
router.post('/test', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const { url, secret, headers } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Webhook URL is required'
      });
    }

    // Create test payload
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
        timestamp: new Date().toISOString()
      },
      webhookId: 0
    };

    // Test the webhook
    const testWebhook = {
      id: 0,
      url,
      secret,
      headers: headers || {},
      retryCount: 1,
      timeout: 10000
    };

    const result = await webhookService['sendWebhookRequest'](testWebhook, testPayload);

    res.json({
      success: true,
      data: {
        status: result.status,
        response: result.responseBody
      },
      message: 'Webhook test completed successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Webhook test failed: ${message}`
    });
  }
});

/**
 * @route GET /api/webhooks/deliveries/history
 * @desc Get webhook delivery history
 * @access Private (Super Admin only)
 */
router.get('/deliveries/history', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const webhookId = req.query.webhookId ? parseInt(req.query.webhookId as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    const deliveries = await webhookService.getWebhookDeliveries(webhookId, limit);

    res.json({
      success: true,
      data: deliveries,
      message: 'Webhook delivery history retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve delivery history: ${message}`
    });
  }
});

/**
 * @route POST /api/webhooks/deliveries/:id/retry
 * @desc Retry a failed webhook delivery
 * @access Private (Super Admin only)
 */
router.post('/deliveries/:id/retry', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery ID'
      });
    }

    const result = await webhookService.retryWebhookDelivery(id);

    res.json({
      success: true,
      data: result,
      message: 'Webhook delivery retry completed'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retry delivery: ${message}`
    });
  }
});

/**
 * @route GET /api/webhooks/statistics/overview
 * @desc Get webhook statistics and overview
 * @access Private (Super Admin only)
 */
router.get('/statistics/overview', authMiddleware, superAdminOnly, async (req: Request, res: Response) => {
  try {
    const statistics = await webhookService.getWebhookStatistics();

    res.json({
      success: true,
      data: statistics,
      message: 'Webhook statistics retrieved successfully'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({
      success: false,
      message: `Failed to retrieve webhook statistics: ${message}`
    });
  }
});

export default router;
