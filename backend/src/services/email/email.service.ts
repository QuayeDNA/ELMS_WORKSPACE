import nodemailer from 'nodemailer';
import { ConfigService } from '../config/config.service';
import { LoggerService } from '../logger/logger.service';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export class EmailService {
  private static instance: EmailService;
  private readonly transporter: nodemailer.Transporter;
  private readonly configService: ConfigService;
  private readonly loggerService: LoggerService;

  private constructor() {
    this.configService = ConfigService.getInstance();
    this.loggerService = LoggerService.getInstance();

    this.transporter = nodemailer.createTransport({
      host: this.configService.getString('EMAIL_HOST'),
      port: this.configService.getNumber('EMAIL_PORT'),
      secure: this.configService.getNumber('EMAIL_PORT') === 465,
      auth: {
        user: this.configService.getString('EMAIL_USER'),
        pass: this.configService.getString('EMAIL_PASS'),
      },
    });
  }

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.getString('EMAIL_FROM'),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      await this.transporter.sendMail(mailOptions);
      this.loggerService.info('Email sent successfully', { to: options.to, subject: options.subject });
    } catch (error) {
      this.loggerService.error('Failed to send email', error, { to: options.to, subject: options.subject });
      throw error;
    }
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    await this.sendEmail({
      to,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your ELMS account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
      text: `Password Reset Request\n\nYou requested a password reset for your ELMS account.\n\nReset your password here: ${resetUrl}\n\nIf you didn't request this, please ignore this email.\n\nThis link will expire in 1 hour.`,
    });
  }

  async sendEmailVerificationEmail(to: string, verificationToken: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    await this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      html: `
        <h2>Welcome to ELMS!</h2>
        <p>Please verify your email address to complete your registration.</p>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
      `,
      text: `Welcome to ELMS!\n\nPlease verify your email address to complete your registration.\n\nVerify your email here: ${verificationUrl}\n\nIf you didn't create an account, please ignore this email.`,
    });
  }
}
