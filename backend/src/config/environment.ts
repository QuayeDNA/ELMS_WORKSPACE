import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string(),
  DATABASE_POOL_SIZE: z.string().transform(Number).default('10'),
  
  // Redis
  REDIS_URL: z.string(),
  REDIS_PASSWORD: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // Session
  SESSION_SECRET: z.string().min(32),
  SESSION_TIMEOUT: z.string().transform(Number).default('1800000'),
  
  // Network Security
  ALLOWED_NETWORKS: z.string().default('127.0.0.1/32'),
  TRUSTED_PROXIES: z.string().default('127.0.0.1'),
  ENABLE_GEOBLOCKING: z.string().transform(Boolean).default('false'),
  
  // Rate Limiting
  API_RATE_LIMIT: z.string().transform(Number).default('100'),
  MAX_LOGIN_ATTEMPTS: z.string().transform(Number).default('3'),
  LOCKOUT_DURATION: z.string().transform(Number).default('300000'),
  
  // Storage
  STORAGE_TYPE: z.enum(['local', 's3', 'minio']).default('local'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  
  // MinIO
  MINIO_ENDPOINT: z.string().optional(),
  MINIO_ACCESS_KEY: z.string().optional(),
  MINIO_SECRET_KEY: z.string().optional(),
  MINIO_BUCKET: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).optional(),
  SMTP_SECURE: z.string().transform(Boolean).default('false'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  
  // SMS
  SMS_PROVIDER: z.enum(['twilio', 'aws-sns']).optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  LOG_FILE: z.string().default('logs/application.log'),
  AUDIT_LOG_FILE: z.string().default('logs/audit.log'),
  
  // Monitoring
  ENABLE_METRICS: z.string().transform(Boolean).default('true'),
  METRICS_PORT: z.string().transform(Number).default('9091'),
  
  // Institution
  INSTITUTION_NAME: z.string().default('Demo Institution'),
  INSTITUTION_CODE: z.string().default('DEMO'),
  INSTITUTION_DOMAIN: z.string().default('localhost'),
  TIMEZONE: z.string().default('UTC'),
  
  // Security Headers
  ENABLE_HSTS: z.string().transform(Boolean).default('true'),
  ENABLE_CSP: z.string().transform(Boolean).default('true'),
  ENABLE_XSS_PROTECTION: z.string().transform(Boolean).default('true'),
  
  // Development
  DEV_SEED_DATA: z.string().transform(Boolean).default('false'),
  DEV_MOCK_SMS: z.string().transform(Boolean).default('true'),
  DEV_MOCK_EMAIL: z.string().transform(Boolean).default('true'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  
  server: {
    port: env.PORT,
    domain: env.INSTITUTION_DOMAIN,
  },
  
  database: {
    url: env.DATABASE_URL,
    poolSize: env.DATABASE_POOL_SIZE,
  },
  
  redis: {
    url: env.REDIS_URL,
    password: env.REDIS_PASSWORD,
  },
  
  auth: {
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN,
    refreshTokenSecret: env.REFRESH_TOKEN_SECRET,
    refreshTokenExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    sessionSecret: env.SESSION_SECRET,
    sessionTimeout: env.SESSION_TIMEOUT,
    maxLoginAttempts: env.MAX_LOGIN_ATTEMPTS,
    lockoutDuration: env.LOCKOUT_DURATION,
  },
  
  security: {
    allowedNetworks: env.ALLOWED_NETWORKS.split(',').map(n => n.trim()),
    trustedProxies: env.TRUSTED_PROXIES.split(',').map(p => p.trim()),
    enableGeoBlocking: env.ENABLE_GEOBLOCKING,
    apiRateLimit: env.API_RATE_LIMIT,
    enableHSTS: env.ENABLE_HSTS,
    enableCSP: env.ENABLE_CSP,
    enableXSSProtection: env.ENABLE_XSS_PROTECTION,
    allowedOrigins: env.NODE_ENV === 'development' 
      ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:19006']
      : [`https://${env.INSTITUTION_DOMAIN}`],
  },
  
  storage: {
    type: env.STORAGE_TYPE,
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_S3_BUCKET,
    },
    minio: {
      endpoint: env.MINIO_ENDPOINT,
      accessKey: env.MINIO_ACCESS_KEY,
      secretKey: env.MINIO_SECRET_KEY,
      bucket: env.MINIO_BUCKET,
    },
  },
  
  email: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.FROM_EMAIL,
  },
  
  sms: {
    provider: env.SMS_PROVIDER,
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_PHONE_NUMBER,
    },
  },
  
  logging: {
    level: env.LOG_LEVEL,
    file: env.LOG_FILE,
    auditFile: env.AUDIT_LOG_FILE,
  },
  
  monitoring: {
    enableMetrics: env.ENABLE_METRICS,
    metricsPort: env.METRICS_PORT,
  },
  
  institution: {
    name: env.INSTITUTION_NAME,
    code: env.INSTITUTION_CODE,
    domain: env.INSTITUTION_DOMAIN,
    timezone: env.TIMEZONE,
  },
  
  development: {
    seedData: env.DEV_SEED_DATA,
    mockSMS: env.DEV_MOCK_SMS,
    mockEmail: env.DEV_MOCK_EMAIL,
  },
} as const;

export type Config = typeof config;
