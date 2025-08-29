import { PrismaClient } from '@prisma/client';

export interface AlertConfig {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  metadata?: any;
  autoResolve?: boolean;
  escalationPolicy?: {
    levels: Array<{
      delay: number; // minutes
      channels: string[];
      recipients: string[];
    }>;
  };
}

export interface AlertFilter {
  type?: string;
  severity?: string;
  status?: 'active' | 'resolved';
  resolved?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export class AlertManagementService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Create a new system alert
   */
  async createAlert(config: AlertConfig, createdBy?: string): Promise<any> {
    try {
      const alert = await this.prisma.systemAlert.create({
        data: {
          type: config.type,
          severity: config.severity,
          title: config.title,
          message: config.message,
          metadata: config.metadata || {},
          isActive: true,
          resolved: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // Trigger notifications based on alert severity
      await this.triggerNotifications(alert);

      // Schedule escalation if configured
      if (config.escalationPolicy) {
        await this.scheduleEscalation(alert.id, config.escalationPolicy);
      }

      return alert;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw new Error('Failed to create alert');
    }
  }

  /**
   * Get alerts with filtering and pagination
   */
  async getAlerts(filter: AlertFilter = {}): Promise<{
    alerts: any[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        type,
        severity,
        status,
        resolved,
        dateFrom,
        dateTo,
        limit = 20,
        offset = 0
      } = filter;

      const where: any = {};

      if (type) where.type = type;
      if (severity) where.severity = severity;
      if (status === 'active') where.isActive = true;
      if (status === 'resolved') where.resolved = true;
      if (resolved !== undefined) where.resolved = resolved;
      if (dateFrom || dateTo) {
        where.createdAt = {};
        if (dateFrom) where.createdAt.gte = dateFrom;
        if (dateTo) where.createdAt.lte = dateTo;
      }

      const [alerts, total] = await Promise.all([
        this.prisma.systemAlert.findMany({
          where,
          include: {
            resolvedByUser: {
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
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: limit,
          skip: offset
        }),
        this.prisma.systemAlert.count({ where })
      ]);

      return {
        alerts,
        total,
        page: Math.floor(offset / limit) + 1,
        limit
      };
    } catch (error) {
      console.error('Error getting alerts:', error);
      throw new Error('Failed to retrieve alerts');
    }
  }

  /**
   * Get a specific alert by ID
   */
  async getAlertById(id: number): Promise<any> {
    try {
      const alert = await this.prisma.systemAlert.findUnique({
        where: { id },
        include: {
          resolvedByUser: {
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

      if (!alert) {
        throw new Error('Alert not found');
      }

      return alert;
    } catch (error) {
      console.error('Error getting alert:', error);
      throw error;
    }
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(id: number, resolvedBy: string, resolution?: string): Promise<any> {
    try {
      const alert = await this.prisma.systemAlert.update({
        where: { id },
        data: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy,
          isActive: false,
          updatedAt: new Date(),
          metadata: {
            resolution
          }
        },
        include: {
          resolvedByUser: {
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

      // Send resolution notification
      await this.sendResolutionNotification(alert);

      return alert;
    } catch (error) {
      console.error('Error resolving alert:', error);
      throw new Error('Failed to resolve alert');
    }
  }

  /**
   * Update alert status
   */
  async updateAlert(id: number, updates: Partial<AlertConfig>): Promise<any> {
    try {
      const alert = await this.prisma.systemAlert.update({
        where: { id },
        data: {
          ...updates,
          updatedAt: new Date()
        },
        include: {
          resolvedByUser: {
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

      return alert;
    } catch (error) {
      console.error('Error updating alert:', error);
      throw new Error('Failed to update alert');
    }
  }

  /**
   * Delete an alert
   */
  async deleteAlert(id: number): Promise<void> {
    try {
      await this.prisma.systemAlert.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw new Error('Failed to delete alert');
    }
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics(): Promise<{
    total: number;
    active: number;
    resolved: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    recentActivity: any[];
  }> {
    try {
      const [total, active, resolved, alerts] = await Promise.all([
        this.prisma.systemAlert.count(),
        this.prisma.systemAlert.count({ where: { isActive: true } }),
        this.prisma.systemAlert.count({ where: { resolved: true } }),
        this.prisma.systemAlert.findMany({
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            type: true,
            severity: true,
            title: true,
            createdAt: true,
            resolved: true
          }
        })
      ]);

      // Group by type and severity
      const byType: Record<string, number> = {};
      const bySeverity: Record<string, number> = {};

      const allAlerts = await this.prisma.systemAlert.findMany({
        select: { type: true, severity: true }
      });

      allAlerts.forEach(alert => {
        byType[alert.type] = (byType[alert.type] || 0) + 1;
        bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1;
      });

      return {
        total,
        active,
        resolved,
        byType,
        bySeverity,
        recentActivity: alerts
      };
    } catch (error) {
      console.error('Error getting alert statistics:', error);
      throw new Error('Failed to get alert statistics');
    }
  }

  /**
   * Trigger notifications for an alert
   */
  private async triggerNotifications(alert: any): Promise<void> {
    try {
      // Get notification channels based on severity
      const channels = this.getNotificationChannels(alert.severity);

      // Send notifications through different channels
      for (const channel of channels) {
        await this.sendNotification(channel, alert);
      }
    } catch (error) {
      console.error('Error triggering notifications:', error);
    }
  }

  /**
   * Schedule escalation for an alert
   */
  private async scheduleEscalation(alertId: number, escalationPolicy: any): Promise<void> {
    try {
      // In a real implementation, you'd use a job scheduler like Bull or Agenda
      // For now, we'll just log the escalation plan
      console.log(`Alert ${alertId} escalation scheduled:`, escalationPolicy);
    } catch (error) {
      console.error('Error scheduling escalation:', error);
    }
  }

  /**
   * Send resolution notification
   */
  private async sendResolutionNotification(alert: any): Promise<void> {
    try {
      // Send notification that alert has been resolved
      console.log(`Alert ${alert.id} resolved:`, alert.title);
    } catch (error) {
      console.error('Error sending resolution notification:', error);
    }
  }

  /**
   * Get notification channels based on severity
   */
  private getNotificationChannels(severity: string): string[] {
    switch (severity) {
      case 'critical':
        return ['email', 'sms', 'slack', 'dashboard'];
      case 'high':
        return ['email', 'slack', 'dashboard'];
      case 'medium':
        return ['email', 'dashboard'];
      case 'low':
        return ['dashboard'];
      default:
        return ['dashboard'];
    }
  }

  /**
   * Send notification through a specific channel
   */
  private async sendNotification(channel: string, alert: any): Promise<void> {
    try {
      switch (channel) {
        case 'email':
          await this.sendEmailNotification(alert);
          break;
        case 'sms':
          await this.sendSmsNotification(alert);
          break;
        case 'slack':
          await this.sendSlackNotification(alert);
          break;
        case 'dashboard':
          // Dashboard notifications are handled by the frontend
          break;
        default:
          console.log(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Error sending ${channel} notification:`, error);
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(alert: any): Promise<void> {
    // In a real implementation, you'd use a service like SendGrid or AWS SES
    console.log(`Sending email notification for alert ${alert.id}: ${alert.title}`);
  }

  /**
   * Send SMS notification
   */
  private async sendSmsNotification(alert: any): Promise<void> {
    // In a real implementation, you'd use a service like Twilio or AWS SNS
    console.log(`Sending SMS notification for alert ${alert.id}: ${alert.title}`);
  }

  /**
   * Send Slack notification
   */
  private async sendSlackNotification(alert: any): Promise<void> {
    // In a real implementation, you'd use Slack's Web API
    console.log(`Sending Slack notification for alert ${alert.id}: ${alert.title}`);
  }
}
