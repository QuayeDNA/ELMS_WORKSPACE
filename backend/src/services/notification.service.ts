import { PrismaClient, NotificationType, NotificationPriority } from '@prisma/client';
import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import logger from '@/utils/logger';
import { RedisService } from './redis.service';

interface EmailData {
  to: string | string[];
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, any>;
  attachments?: any[];
}

interface SMSData {
  to: string;
  message: string;
  templateId?: string;
  data?: Record<string, any>;
}

interface PushNotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: number;
}

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: string;
  priority?: NotificationPriority;
  data?: Record<string, any>;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  categories: {
    [key: string]: {
      email: boolean;
      sms: boolean;
      push: boolean;
      inApp: boolean;
    };
  };
}

export class NotificationService {
  private prisma: PrismaClient;
  private redis: RedisService;
  private emailTransporter: nodemailer.Transporter;
  private twilioClient?: Twilio;
  private templates: Map<string, any> = new Map();

  constructor(prisma: PrismaClient, redis: RedisService) {
    this.prisma = prisma;
    this.redis = redis;
    this.initializeEmailTransporter();
    this.initializeSMSClient();
    this.loadEmailTemplates();
  }

  /**
   * Initialize email transporter
   */
  private initializeEmailTransporter() {
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Initialize SMS client (Twilio)
   */
  private initializeSMSClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      this.twilioClient = new Twilio(accountSid, authToken);
    }
  }

  /**
   * Load email templates
   */
  private loadEmailTemplates() {
    // Welcome email template
    this.templates.set('welcome', {
      subject: 'Welcome to ELMS - Your Account is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ELMS</h2>
          <p>Dear {{name}},</p>
          <p>Your account has been created successfully. Here are your login credentials:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> {{email}}</p>
            <p><strong>Temporary Password:</strong> {{temporaryPassword}}</p>
          </div>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="{{verificationLink}}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p><strong>Important:</strong> Please change your password after your first login for security purposes.</p>
          <p>If you have any questions, please contact your system administrator.</p>
          <p>Best regards,<br>ELMS Team</p>
        </div>
      `,
    });

    // Password reset template
    this.templates.set('password-reset', {
      subject: 'Password Reset Request - ELMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Dear {{name}},</p>
          <p>We received a request to reset your password. Click the link below to reset your password:</p>
          <a href="{{resetLink}}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour for security purposes.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>ELMS Team</p>
        </div>
      `,
    });

    // Exam notification template
    this.templates.set('exam-notification', {
      subject: 'Exam Notification - {{examTitle}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Exam Notification</h2>
          <p>Dear {{name}},</p>
          <p>This is a reminder about your upcoming exam:</p>
          <div style="background-color: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Course:</strong> {{courseCode}} - {{courseName}}</p>
            <p><strong>Date:</strong> {{examDate}}</p>
            <p><strong>Time:</strong> {{examTime}}</p>
            <p><strong>Venue:</strong> {{venue}}</p>
            <p><strong>Duration:</strong> {{duration}} minutes</p>
          </div>
          <p>Please arrive at least 15 minutes before the exam starts.</p>
          <p>Good luck!</p>
          <p>Best regards,<br>ELMS Team</p>
        </div>
      `,
    });

    // Incident report template
    this.templates.set('incident-report', {
      subject: 'Incident Report - {{incidentType}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Incident Report</h2>
          <p>An incident has been reported in the ELMS system:</p>
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Type:</strong> {{incidentType}}</p>
            <p><strong>Priority:</strong> {{priority}}</p>
            <p><strong>Reported by:</strong> {{reporterName}}</p>
            <p><strong>Date:</strong> {{reportDate}}</p>
            <p><strong>Description:</strong> {{description}}</p>
          </div>
          <p>Please review and take appropriate action.</p>
          <a href="{{incidentLink}}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Incident</a>
          <p>Best regards,<br>ELMS Team</p>
        </div>
      `,
    });
  }

  /**
   * Create in-app notification
   */
  async createNotification(data: CreateNotificationData) {
    try {
      const notification = await this.prisma.userNotification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type,
          category: data.category,
          priority: data.priority || NotificationPriority.NORMAL,
          data: data.data,
        },
      });

      // Cache for real-time delivery
      await this.redis.lpush(
        `notifications:${data.userId}`,
        JSON.stringify(notification)
      );

      // Keep only latest 100 notifications in cache
      await this.redis.ltrim(`notifications:${data.userId}`, 0, 99);

      logger.info(`Notification created for user ${data.userId}: ${data.title}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(data: EmailData): Promise<void> {
    try {
      let htmlContent = data.html;
      let subject = data.subject;

      // Use template if specified
      if (data.template && this.templates.has(data.template)) {
        const template = this.templates.get(data.template);
        htmlContent = this.renderTemplate(template.html, data.data || {});
        subject = this.renderTemplate(template.subject, data.data || {});
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@elms.edu',
        to: Array.isArray(data.to) ? data.to.join(',') : data.to,
        subject,
        html: htmlContent,
        text: data.text,
        attachments: data.attachments,
      };

      await this.emailTransporter.sendMail(mailOptions);
      logger.info(`Email sent to ${data.to}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(data: SMSData): Promise<void> {
    try {
      if (!this.twilioClient) {
        throw new Error('SMS service not configured');
      }

      const message = data.templateId
        ? this.renderTemplate(data.message, data.data || {})
        : data.message;

      await this.twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.to,
      });

      logger.info(`SMS sent to ${data.to}`);
    } catch (error) {
      logger.error('Error sending SMS:', error);
      throw error;
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(data: PushNotificationData): Promise<void> {
    try {
      // Get user's device tokens
      const devices = await this.prisma.deviceToken.findMany({
        where: {
          userId: data.userId,
          isActive: true,
        },
      });

      if (devices.length === 0) {
        logger.warn(`No active devices found for user ${data.userId}`);
        return;
      }

      // Send to each device
      const pushPromises = devices.map(async (device) => {
        try {
          // Implementation depends on push service (FCM, APNS, etc.)
          // This is a placeholder - implement actual push notification logic
          await this.sendPushToDevice(device.token, {
            title: data.title,
            body: data.body,
            data: data.data,
            icon: data.icon,
            badge: data.badge,
          });
        } catch (error) {
          logger.error(`Failed to send push to device ${device.token}:`, error);
          // Mark device as inactive if token is invalid
          if (error.message.includes('invalid') || error.message.includes('expired')) {
            await this.prisma.deviceToken.update({
              where: { id: device.id },
              data: { isActive: false },
            });
          }
        }
      });

      await Promise.allSettled(pushPromises);
      logger.info(`Push notifications sent to ${devices.length} devices for user ${data.userId}`);
    } catch (error) {
      logger.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send comprehensive notification (email + SMS + push + in-app)
   */
  async sendComprehensiveNotification(
    userId: string,
    notificationData: CreateNotificationData,
    emailData?: Partial<EmailData>,
    smsData?: Partial<SMSData>
  ) {
    try {
      // Get user preferences
      const preferences = await this.getUserNotificationPreferences(userId);
      
      // Get user information
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const promises: Promise<any>[] = [];

      // Create in-app notification if enabled
      if (preferences.inApp) {
        promises.push(this.createNotification(notificationData));
      }

      // Send email if enabled and email data provided
      if (preferences.email && emailData) {
        promises.push(
          this.sendEmail({
            to: user.email,
            subject: emailData.subject || notificationData.title,
            template: emailData.template,
            html: emailData.html,
            text: emailData.text,
            data: {
              name: `${user.profile?.firstName} ${user.profile?.lastName}`,
              email: user.email,
              ...emailData.data,
            },
          })
        );
      }

      // Send SMS if enabled and SMS data provided
      if (preferences.sms && smsData && user.profile?.phoneNumber) {
        promises.push(
          this.sendSMS({
            to: user.profile.phoneNumber,
            message: smsData.message || notificationData.message,
            templateId: smsData.templateId,
            data: smsData.data,
          })
        );
      }

      // Send push notification if enabled
      if (preferences.push) {
        promises.push(
          this.sendPushNotification({
            userId,
            title: notificationData.title,
            body: notificationData.message,
            data: notificationData.data,
          })
        );
      }

      await Promise.allSettled(promises);
      logger.info(`Comprehensive notification sent to user ${userId}`);
    } catch (error) {
      logger.error('Error sending comprehensive notification:', error);
      throw error;
    }
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      isRead?: boolean;
      type?: NotificationType;
      category?: string;
    } = {}
  ) {
    try {
      const { page = 1, limit = 20, isRead, type, category } = options;
      const skip = (page - 1) * limit;

      const where: any = { userId };
      if (isRead !== undefined) where.isRead = isRead;
      if (type) where.type = type;
      if (category) where.category = category;

      const [notifications, total] = await Promise.all([
        this.prisma.userNotification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        this.prisma.userNotification.count({ where }),
      ]);

      return {
        notifications,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      await this.prisma.userNotification.updateMany({
        where: {
          id: notificationId,
          userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info(`Notification ${notificationId} marked as read`);
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      await this.prisma.userNotification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info(`All notifications marked as read for user ${userId}`);
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId: string) {
    try {
      const [total, unread, byType, byPriority] = await Promise.all([
        this.prisma.userNotification.count({
          where: { userId },
        }),
        this.prisma.userNotification.count({
          where: { userId, isRead: false },
        }),
        this.prisma.userNotification.groupBy({
          by: ['type'],
          where: { userId },
          _count: { type: true },
        }),
        this.prisma.userNotification.groupBy({
          by: ['priority'],
          where: { userId, isRead: false },
          _count: { priority: true },
        }),
      ]);

      return {
        total,
        unread,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count.type;
          return acc;
        }, {} as Record<string, number>),
        byPriority: byPriority.reduce((acc, item) => {
          acc[item.priority] = item._count.priority;
          return acc;
        }, {} as Record<string, number>),
      };
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private renderTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
    return result;
  }

  private async sendPushToDevice(
    token: string,
    payload: {
      title: string;
      body: string;
      data?: any;
      icon?: string;
      badge?: number;
    }
  ): Promise<void> {
    // Implement actual push notification logic here
    // This could be FCM, APNS, or other push service
    logger.info(`Push notification would be sent to device: ${token}`);
  }

  private async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences> {
    // This would typically come from user settings
    // For now, return default preferences
    return {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      categories: {
        SYSTEM: { email: true, sms: false, push: true, inApp: true },
        EXAM: { email: true, sms: true, push: true, inApp: true },
        INCIDENT: { email: true, sms: false, push: true, inApp: true },
        SCRIPT: { email: false, sms: false, push: true, inApp: true },
        ANNOUNCEMENT: { email: true, sms: false, push: true, inApp: true },
        PERSONAL: { email: true, sms: false, push: true, inApp: true },
      },
    };
  }
}
