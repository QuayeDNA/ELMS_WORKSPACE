import { Request, Response, NextFunction } from 'express';
import { isIP } from 'net';

export const networkSecurityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientIP = req.ip || req.connection.remoteAddress || '';
  
  // Allow all IPs in development
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Define allowed networks (configurable via environment)
  const allowedNetworks = process.env.ALLOWED_NETWORKS?.split(',') || [];

  if (allowedNetworks.length === 0) {
    return next(); // No restrictions if not configured
  }

  // Check if IP is in allowed networks
  const isAllowed = allowedNetworks.some(network => {
    if (network.includes('/')) {
      // CIDR notation check (simplified)
      const [networkAddr, prefixLength] = network.split('/');
      return clientIP.startsWith(networkAddr.split('.').slice(0, Math.floor(parseInt(prefixLength) / 8)).join('.'));
    } else {
      // Direct IP match
      return clientIP === network;
    }
  });

  if (!isAllowed) {
    return res.status(403).json({
      error: 'Access denied from this network',
      ip: clientIP
    });
  }

  next();
};
