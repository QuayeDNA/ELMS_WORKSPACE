import { createClient, RedisClientType } from 'redis';
import logger from '@/utils/logger';

class RedisService {
  private static instance: RedisService;
  public client: RedisClientType;

  private constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      // Only include password if it's set in environment
      ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
    });

    this.client.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      // Only log error if it's not an authentication error in development
      if (process.env.NODE_ENV === 'production' || !error.message.includes('NOAUTH')) {
        logger.error('Redis connection error:', error);
      }
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    // Connect to Redis
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
    } catch (error) {
      // Silently handle auth errors in development
      if (process.env.NODE_ENV !== 'production' && 
          error instanceof Error && 
          error.message.includes('NOAUTH')) {
        logger.info('Redis: No authentication required in development mode');
      } else {
        logger.error('Redis connection failed:', error);
      }
    }
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client.isOpen) {
        await this.client.quit();
      }
      logger.info('Redis disconnected successfully');
    } catch (error) {
      logger.error('Redis disconnection failed:', error);
      throw error;
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.client.isOpen) {
        await this.connect();
      }
      await this.client.ping();
      return true;
    } catch (error) {
      if (process.env.NODE_ENV !== 'production' && 
          error instanceof Error && 
          error.message.includes('NOAUTH')) {
        // Return true for development even with auth errors
        return true;
      }
      logger.error('Redis health check failed:', error);
      return false;
    }
  }
}

export default RedisService;
