import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

export interface WebhookConfig {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  isActive?: boolean;
  retryCount?: number;
  timeout?: number;
}

export interface WebhookDeliveryPayload {
  event: string;
  timestamp: string;
  data: any;
  webhookId: number;
}

export interface WebhookFilter {
  isActive?: boolean;
  event?: string;
  limit?: number;
  offset?: number;
}

export class WebhookManagementService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new webhook
   */
  async createWebhook(config: WebhookConfig, createdBy: string): Promise<any> {
    try {
      // Generate a secret if not provided
      const secret = config.secret || this.generateWebhookSecret();

      const webhook = await this.prisma.webhook.create({
        data: {
          name: config.name,
          url: config.url,
          events: config.events,
          secret,
          headers: config.headers || {},
          isActive: config.isActive !== undefined ? config.isActive : true,
          retryCount: config.retryCount || 3,
          timeout: config.timeout || 30000,
          createdBy,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      return webhook;
    } catch (error) {
      console.error('Error creating webhook:', error);
      throw new Error('Failed to create webhook');
    }
  }

  /**
   * Get webhooks with filtering and pagination
   */
  async getWebhooks(filter: WebhookFilter = {}): Promise<{
    webhooks: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        isActive,
        event,
        limit = 20,
        offset = 0
      } = filter;

      const where: any = {};

      if (isActive !== undefined) where.isActive = isActive;
      if (event) where.events = { has: event };

      const [webhooks, total] = await Promise.all([
        this.prisma.webhook.findMany({
          where,
          include: {
            createdByUser: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            },
            _count: {
              select: {
                deliveries: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        }),
        this.prisma.webhook.count({ where })
      ]);

      return {
        webhooks,
        total,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      console.error('Error getting webhooks:', error);
      throw new Error('Failed to retrieve webhooks');
    }
  }

  /**
   * Get a specific webhook by ID
   */
  async getWebhookById(id: number): Promise<any> {
    try {
      const webhook = await this.prisma.webhook.findUnique({
        where: { id },
        include: {
          createdByUser: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          },
          deliveries: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          },
          _count: {
            select: {
              deliveries: true
            }
          }
        }
      });

      if (!webhook) {
        throw new Error('Webhook not found');
      }

      return webhook;
    } catch (error) {
      console.error('Error getting webhook:', error);
      throw error;
    }
  }

  /**
   * Update a webhook
   */
  async updateWebhook(id: number, updates: Partial<WebhookConfig>): Promise<any> {
    try {
      const webhook = await this.prisma.webhook.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          createdByUser: {
            select: {
              id: true,
              email: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      });

      return webhook;
    } catch (error) {
      console.error('Error updating webhook:', error);
      throw new Error('Failed to update webhook');
    }
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: number): Promise<void> {
    try {
      await this.prisma.webhook.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      throw new Error('Failed to delete webhook');
    }
  }

  /**
   * Trigger webhook delivery for an event
   */
  async triggerWebhook(event: string, data: any): Promise<any[]> {
    try {
      // Find all active webhooks that subscribe to this event
      const webhooks = await this.prisma.webhook.findMany({
        where: {
          isActive: true,
          events: {
            has: event
          }
        }
      });

      const deliveries: any[] = [];

      // Send webhook to each subscriber
      for (const webhook of webhooks) {
        try {
          const delivery = await this.deliverWebhook(webhook, event, data);
          deliveries.push(delivery);
        } catch (error) {
          console.error(`Failed to deliver webhook ${webhook.id}:`, error);
          // Create failed delivery record
          const failedDelivery = await this.createFailedDelivery(webhook.id, event, data, error);
          deliveries.push(failedDelivery);
        }
      }

      return deliveries;
    } catch (error) {
      console.error('Error triggering webhook:', error);
      throw new Error('Failed to trigger webhook');
    }
  }

  /**
   * Get webhook delivery history
   */
  async getWebhookDeliveries(webhookId?: number, limit: number = 50): Promise<any[]> {
    try {
      const where: any = {};
      if (webhookId) where.webhookId = webhookId;

      const deliveries = await this.prisma.webhookDelivery.findMany({
        where,
        include: {
          webhook: {
            select: {
              id: true,
              name: true,
              url: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit
      });

      return deliveries;
    } catch (error) {
      console.error('Error getting webhook deliveries:', error);
      throw new Error('Failed to retrieve webhook deliveries');
    }
  }

  /**
   * Retry failed webhook delivery
   */
  async retryWebhookDelivery(deliveryId: number): Promise<any> {
    try {
      const delivery = await this.prisma.webhookDelivery.findUnique({
        where: { id: deliveryId },
        include: { webhook: true }
      });

      if (!delivery) {
        throw new Error('Delivery not found');
      }

      if (delivery.status === 'success') {
        throw new Error('Delivery already successful');
      }

      // Retry the delivery
      const result = await this.deliverWebhook(
        delivery.webhook,
        delivery.eventType,
        delivery.payload
      );

      return result;
    } catch (error) {
      console.error('Error retrying webhook delivery:', error);
      throw error;
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStatistics(): Promise<{
    total: number;
    active: number;
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    byEvent: Record<string, number>;
    recentActivity: any[];
  }> {
    try {
      const [total, active, deliveries] = await Promise.all([
        this.prisma.webhook.count(),
        this.prisma.webhook.count({ where: { isActive: true } }),
        this.prisma.webhookDelivery.findMany({
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            webhook: {
              select: { name: true }
            }
          }
        })
      ]);

      // Calculate delivery statistics
      const totalDeliveries = deliveries.length;
      const successfulDeliveries = deliveries.filter(d => d.status === 'success').length;
      const failedDeliveries = deliveries.filter(d => d.status === 'failed').length;

      // Group deliveries by event
      const byEvent: Record<string, number> = {};
      deliveries.forEach(delivery => {
        byEvent[delivery.eventType] = (byEvent[delivery.eventType] || 0) + 1;
      });

      return {
        total,
        active,
        totalDeliveries,
        successfulDeliveries,
        failedDeliveries,
        byEvent,
        recentActivity: deliveries
      };
    } catch (error) {
      console.error('Error getting webhook statistics:', error);
      throw new Error('Failed to get webhook statistics');
    }
  }

  /**
   * Deliver webhook to endpoint
   */
  private async deliverWebhook(webhook: any, event: string, data: any): Promise<any> {
    const payload: WebhookDeliveryPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      webhookId: webhook.id
    };

    // Create delivery record
    const delivery = await this.prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        eventType: event,
        payload: payload as any,
        status: 'pending',
        attempts: 0,
        createdAt: new Date()
      }
    });

    let attempts = 0;
    let lastError: any = null;

    // Retry logic
    while (attempts < webhook.retryCount) {
      try {
        attempts++;

        const result = await this.sendWebhookRequest(webhook, payload);

        // Update delivery record on success
        await this.prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: {
            status: 'success',
            responseStatus: result.status,
            responseBody: result.responseBody,
            deliveredAt: new Date(),
            attempts
          }
        });

        return {
          ...delivery,
          status: 'success',
          responseStatus: result.status,
          deliveredAt: new Date(),
          attempts
        };

      } catch (error) {
        lastError = error;
        console.error(`Webhook delivery attempt ${attempts} failed:`, error);

        // Wait before retry (exponential backoff)
        if (attempts < webhook.retryCount) {
          await this.delay(Math.pow(2, attempts) * 1000);
        }
      }
    }

    // All attempts failed
    await this.prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: 'failed',
        errorMessage: lastError?.message || 'Unknown error',
        attempts
      }
    });

    throw lastError;
  }

  /**
   * Send HTTP request to webhook endpoint
   */
  private async sendWebhookRequest(webhook: any, payload: WebhookDeliveryPayload): Promise<{
    status: number;
    responseBody: string;
  }> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'ELMS-Webhook/1.0',
      ...webhook.headers
    };

    // Add signature if secret is configured
    if (webhook.secret) {
      const signature = this.generateWebhookSignature(JSON.stringify(payload), webhook.secret);
      headers['X-Webhook-Signature'] = signature;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), webhook.timeout);

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const responseBody = await response.text();

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseBody}`);
      }

      return {
        status: response.status,
        responseBody
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Create failed delivery record
   */
  private async createFailedDelivery(webhookId: number, event: string, data: any, error: any): Promise<any> {
    return await this.prisma.webhookDelivery.create({
      data: {
        webhookId,
        eventType: event,
        payload: data,
        status: 'failed',
        errorMessage: error?.message || 'Unknown error',
        attempts: 1,
        createdAt: new Date()
      }
    });
  }

  /**
   * Generate webhook secret
   */
  private generateWebhookSecret(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate webhook signature
   */
  private generateWebhookSignature(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex');
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
