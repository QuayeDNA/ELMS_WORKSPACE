import logger from '../../utils/logger';

export class LoggerService {
  private static instance: LoggerService;

  private constructor() {}

  static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService();
    }
    return LoggerService.instance;
  }

  info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  error(message: string, error?: any, meta?: any): void {
    logger.error(message, { error, ...meta });
  }

  warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }

  log(level: string, message: string, meta?: any): void {
    logger.log(level, message, meta);
  }
}
