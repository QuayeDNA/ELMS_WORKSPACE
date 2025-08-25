import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import RedisStore from 'connect-redis';
import { PrismaClient } from '@prisma/client';

import logger from '@/utils/logger';
import DatabaseService from '@/services/database.service';
import RedisService from '@/services/redis.service';
import SocketService from '@/services/socket.service';

// Import middleware
import { authenticateToken } from '@/middleware/auth.middleware';
import { networkSecurityMiddleware } from '@/middleware/network-security.middleware';
import { errorHandler } from '@/middleware/error-handler.middleware';
import { requestLogger } from '@/middleware/request-logger.middleware';

// Import routes
import { createAuthRoutes } from '@/routes/auth.routes';
import { createUserRoutes } from '@/routes/user.routes';
import { createExamRoutes } from '@/routes/exam.routes';
import { createScriptRoutes } from '@/routes/script.routes';
import { createIncidentRoutes } from '@/routes/incident.routes';
import { createAnalyticsRoutes } from '@/routes/analytics.routes';
import { createFileRoutes } from '@/routes/file.routes';
import { createSuperAdminRoutes } from '@/routes/superadmin.routes';

class ElmsServer {
  private readonly app: express.Application;
  private readonly server: any;
  private io!: SocketIOServer;
  private prisma!: PrismaClient;
  private redis: any;

  private socketService!: SocketService;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
  }

  public async initialize(): Promise<void> {
    await this.initializeServices();
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize database
      const dbService = DatabaseService.getInstance();
      this.prisma = dbService.prisma;
      await dbService.connect();
      logger.info('Database connected successfully');

      // Initialize Redis
      const redisService = RedisService.getInstance();
      this.redis = redisService.client;
      logger.info('Redis connected successfully');

    } catch (error) {
      logger.error('Failed to initialize services:', error);
      process.exit(1);
    }
  }

  private initializeMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // Network security
    this.app.use(networkSecurityMiddleware);

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    }));

    // Compression and parsing
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100,
      message: 'Too many requests from this IP',
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use('/api/', limiter);

    // Session configuration
    const sessionConfig: any = {
      secret: process.env.SESSION_SECRET || 'default-secret',
      resave: false,
      saveUninitialized: false,
      name: 'elms.sid',
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict',
      },
    };

    // Only use Redis store in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.USE_REDIS_SESSIONS === 'true') {
      sessionConfig.store = new RedisStore({ client: this.redis });
    }

    this.app.use(session(sessionConfig));
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/api/health', async (req, res) => {
      const dbService = DatabaseService.getInstance();
      const redisService = RedisService.getInstance();
      
      const dbHealthy = await dbService.healthCheck();
      const redisHealthy = await redisService.healthCheck();

      res.status(200).json({
        status: dbHealthy && redisHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        services: {
          database: dbHealthy ? 'healthy' : 'unhealthy',
          redis: redisHealthy ? 'healthy' : 'unhealthy',
        }
      });
    });

    // API routes
    this.app.use('/api/auth', createAuthRoutes(this.prisma));
    this.app.use('/api/users', authenticateToken(this.prisma), createUserRoutes(this.prisma));
    this.app.use('/api/exams', authenticateToken(this.prisma), createExamRoutes(this.prisma));
    this.app.use('/api/scripts', authenticateToken(this.prisma), createScriptRoutes(this.prisma));
    this.app.use('/api/incidents', authenticateToken(this.prisma), createIncidentRoutes(this.prisma));
    this.app.use('/api/analytics', authenticateToken(this.prisma), createAnalyticsRoutes(this.prisma));
    this.app.use('/api/files', authenticateToken(this.prisma), createFileRoutes(this.prisma));
    this.app.use('/api/superadmin', createSuperAdminRoutes(this.prisma));

    // API documentation
    this.app.get('/api/docs', (req, res) => {
      res.json({
        message: 'ELMS API Documentation',
        version: '1.0.0',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          exams: '/api/exams',
          scripts: '/api/scripts',
          incidents: '/api/incidents',
          analytics: '/api/analytics',
          files: '/api/files',
          superadmin: '/api/superadmin',
        }
      });
    });

    // 404 handler for API routes
    this.app.use('/api/*', (req, res) => {
      res.status(404).json({
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
      });
    });
  }

  private initializeSocketIO(): void {
    this.io = new SocketIOServer(this.server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001",
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    // Initialize socket service
    this.socketService = new SocketService(this.server);
    logger.info('Socket.IO initialized');
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);

    // Global error handlers
    process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      process.exit(1);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      this.shutdown();
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      this.shutdown();
    });
  }

  private async shutdown(): Promise<void> {
    try {
      logger.info('Starting graceful shutdown...');

      // Close server
      this.server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database connections
      const dbService = DatabaseService.getInstance();
      await dbService.disconnect();
      logger.info('Database disconnected');

      // Close Redis connection
      const redisService = RedisService.getInstance();
      await redisService.disconnect();
      logger.info('Redis disconnected');

      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  public async start(): Promise<void> {
    await this.initialize();
    
    const port = parseInt(process.env.PORT || '3000');
    
    this.server.listen(port, () => {
      logger.info(`🚀 ELMS Server running on port ${port}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🏥 Health check: http://localhost:${port}/api/health`);
      logger.info(`📚 API docs: http://localhost:${port}/api/docs`);
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🔍 Database Studio: Run 'npm run db:studio' to open Prisma Studio`);
      }
    });
  }
}

// Start the server
const server = new ElmsServer();
server.start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default ElmsServer;
