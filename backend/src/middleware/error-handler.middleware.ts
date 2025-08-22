import { Request, Response, NextFunction } from 'express';
import logger from '@/utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Default error
  let status = 500;
  let message = 'Internal Server Error';

  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = error.message;
  } else if (error.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (error.name === 'ForbiddenError') {
    status = 403;
    message = 'Forbidden';
  } else if (error.name === 'NotFoundError') {
    status = 404;
    message = 'Not Found';
  }

  // Don't expose error details in production
  if (process.env.NODE_ENV === 'production') {
    res.status(status).json({
      error: message,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(status).json({
      error: message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
  }
};
