import { PrismaClient } from '@prisma/client';

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  responseTime: number;
  errorRate: number;
  uptime: number;
}

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime: number;
  lastChecked: Date;
  details?: any;
}

export interface MonitoringConfig {
  enabled: boolean;
  checkInterval: number; // in minutes
  alertThresholds: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    responseTime: number;
    errorRate: number;
  };
  notificationChannels: string[];
}

export class SystemMonitoringService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Collect current system metrics
   */
  async collectSystemMetrics(): Promise<SystemMetrics> {
    try {
      const startTime = Date.now();

      // Get database connection count
      const activeConnections = await this.getActiveDatabaseConnections();

      // Get system uptime
      const uptime = process.uptime();

      // Simulate CPU and memory metrics (in production, use system monitoring libraries)
      const cpuUsage = await this.getCpuUsage();
      const memoryUsage = await this.getMemoryUsage();
      const diskUsage = await this.getDiskUsage();

      // Get response time
      const responseTime = Date.now() - startTime;

      // Get error rate from recent logs
      const errorRate = await this.getErrorRate();

      return {
        cpuUsage,
        memoryUsage,
        diskUsage,
        activeConnections,
        responseTime,
        errorRate,
        uptime
      };
    } catch (error) {
      console.error('Error collecting system metrics:', error);
      throw new Error('Failed to collect system metrics');
    }
  }

  /**
   * Perform health checks on all system services
   */
  async performHealthChecks(): Promise<HealthCheckResult[]> {
    const healthChecks: HealthCheckResult[] = [];

    // Database health check
    healthChecks.push(await this.checkDatabaseHealth());

    // Redis health check
    healthChecks.push(await this.checkRedisHealth());

    // External services health check
    healthChecks.push(await this.checkExternalServicesHealth());

    // File system health check
    healthChecks.push(await this.checkFileSystemHealth());

    return healthChecks;
  }

  /**
   * Check if system metrics are within acceptable thresholds
   */
  async checkSystemHealth(): Promise<{
    overallStatus: 'healthy' | 'warning' | 'critical';
    metrics: SystemMetrics;
    healthChecks: HealthCheckResult[];
    alerts: any[];
  }> {
    const metrics = await this.collectSystemMetrics();
    const healthChecks = await this.performHealthChecks();

    const alerts = [
      ...this.checkPerformanceMetrics(metrics),
      ...this.checkHealthStatus(healthChecks)
    ];

    const overallStatus = this.determineOverallStatus(metrics, healthChecks, alerts);

    return {
      overallStatus,
      metrics,
      healthChecks,
      alerts
    };
  }

  /**
   * Check performance metrics and generate alerts
   */
  private checkPerformanceMetrics(metrics: SystemMetrics): any[] {
    const alerts: any[] = [];

    // Check CPU usage
    if (metrics.cpuUsage > 90) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'high', 'High CPU Usage',
        `CPU usage is at ${metrics.cpuUsage.toFixed(1)}%`, { cpuUsage: metrics.cpuUsage }));
    } else if (metrics.cpuUsage > 75) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'medium', 'Elevated CPU Usage',
        `CPU usage is at ${metrics.cpuUsage.toFixed(1)}%`, { cpuUsage: metrics.cpuUsage }));
    }

    // Check memory usage
    if (metrics.memoryUsage > 90) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'high', 'High Memory Usage',
        `Memory usage is at ${metrics.memoryUsage.toFixed(1)}%`, { memoryUsage: metrics.memoryUsage }));
    } else if (metrics.memoryUsage > 80) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'medium', 'High Memory Usage',
        `Memory usage is at ${metrics.memoryUsage.toFixed(1)}%`, { memoryUsage: metrics.memoryUsage }));
    }

    // Check disk usage
    if (metrics.diskUsage > 95) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'high', 'Critical Disk Usage',
        `Disk usage is at ${metrics.diskUsage.toFixed(1)}%`, { diskUsage: metrics.diskUsage }));
    } else if (metrics.diskUsage > 85) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'medium', 'High Disk Usage',
        `Disk usage is at ${metrics.diskUsage.toFixed(1)}%`, { diskUsage: metrics.diskUsage }));
    }

    // Check response time
    if (metrics.responseTime > 5000) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'high', 'Slow Response Time',
        `Response time is ${metrics.responseTime}ms`, { responseTime: metrics.responseTime }));
    } else if (metrics.responseTime > 2000) {
      alerts.push(this.createAlert('SYSTEM_PERFORMANCE', 'medium', 'Slow Response Time',
        `Response time is ${metrics.responseTime}ms`, { responseTime: metrics.responseTime }));
    }

    // Check error rate
    if (metrics.errorRate > 5) {
      alerts.push(this.createAlert('SYSTEM_ERROR', 'high', 'High Error Rate',
        `Error rate is ${metrics.errorRate.toFixed(2)}%`, { errorRate: metrics.errorRate }));
    } else if (metrics.errorRate > 1) {
      alerts.push(this.createAlert('SYSTEM_ERROR', 'medium', 'Elevated Error Rate',
        `Error rate is ${metrics.errorRate.toFixed(2)}%`, { errorRate: metrics.errorRate }));
    }

    return alerts;
  }

  /**
   * Check health status of services and generate alerts
   */
  private checkHealthStatus(healthChecks: HealthCheckResult[]): any[] {
    const alerts: any[] = [];
    const unhealthyServices = healthChecks.filter(hc => hc.status === 'unhealthy');
    const degradedServices = healthChecks.filter(hc => hc.status === 'degraded');

    unhealthyServices.forEach(service => {
      alerts.push(this.createAlert('SERVICE_UNHEALTHY', 'high',
        `${service.service} Service Unhealthy`,
        `${service.service} service is not responding properly`, service));
    });

    degradedServices.forEach(service => {
      alerts.push(this.createAlert('SERVICE_DEGRADED', 'medium',
        `${service.service} Service Degraded`,
        `${service.service} service is experiencing issues`, service));
    });

    return alerts;
  }

  /**
   * Determine overall system status
   */
  private determineOverallStatus(metrics: SystemMetrics, healthChecks: HealthCheckResult[], alerts: any[]): 'healthy' | 'warning' | 'critical' {
    // Check for critical alerts
    const hasCriticalAlerts = alerts.some(alert => alert.severity === 'high');
    if (hasCriticalAlerts) return 'critical';

    // Check for warning alerts
    const hasWarningAlerts = alerts.some(alert => alert.severity === 'medium');
    if (hasWarningAlerts) return 'warning';

    // Check unhealthy services
    const hasUnhealthyServices = healthChecks.some(hc => hc.status === 'unhealthy');
    if (hasUnhealthyServices) return 'critical';

    // Check degraded services
    const hasDegradedServices = healthChecks.some(hc => hc.status === 'degraded');
    if (hasDegradedServices) return 'warning';

    return 'healthy';
  }

  /**
   * Create a standardized alert object
   */
  private createAlert(type: string, severity: string, title: string, message: string, metadata: any): any {
    return {
      type,
      severity,
      title,
      message,
      metadata
    };
  }

  /**
   * Get system metrics history
   */
  async getMetricsHistory(hours: number = 24): Promise<any[]> {
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // In a real implementation, you'd store metrics in a time-series database
    // For now, we'll return mock historical data
    const history = [];
    const intervals = hours * 4; // Every 15 minutes

    for (let i = 0; i < intervals; i++) {
      const timestamp = new Date(startTime.getTime() + i * 15 * 60 * 1000);
      history.push({
        timestamp,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 100),
        responseTime: Math.random() * 1000,
        errorRate: Math.random() * 10
      });
    }

    return history;
  }

  /**
   * Get active database connections
   */
  private async getActiveDatabaseConnections(): Promise<number> {
    try {
      // This is a simplified implementation
      // In production, you'd query the database for active connections
      return Math.floor(Math.random() * 50) + 10; // Mock data
    } catch (error) {
      console.error('Error getting database connections:', error);
      return 0;
    }
  }

  /**
   * Get CPU usage
   */
  private async getCpuUsage(): Promise<number> {
    try {
      // In production, use a library like 'os' or 'systeminformation'
      return Math.random() * 100; // Mock data
    } catch (error) {
      console.error('Error getting CPU usage:', error);
      return 0;
    }
  }

  /**
   * Get memory usage
   */
  private async getMemoryUsage(): Promise<number> {
    try {
      const memUsage = process.memoryUsage();
      const totalMem = memUsage.heapTotal + memUsage.external;
      const usedMem = memUsage.heapUsed + memUsage.external;
      return (usedMem / totalMem) * 100;
    } catch (error) {
      console.error('Error getting memory usage:', error);
      return 0;
    }
  }

  /**
   * Get disk usage
   */
  private async getDiskUsage(): Promise<number> {
    try {
      // In production, use a library like 'fs' or 'systeminformation'
      return Math.random() * 100; // Mock data
    } catch (error) {
      console.error('Error getting disk usage:', error);
      return 0;
    }
  }

  /**
   * Get error rate from recent logs
   */
  private async getErrorRate(): Promise<number> {
    try {
      // In production, you'd analyze log files or use monitoring tools
      return Math.random() * 10; // Mock data
    } catch (error) {
      console.error('Error getting error rate:', error);
      return 0;
    }
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Simple database health check
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        service: 'Database',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        service: 'Database',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // In production, you'd check Redis connectivity
      // For now, return healthy status
      return {
        service: 'Redis',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        service: 'Redis',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check external services health
   */
  private async checkExternalServicesHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // In production, you'd check external APIs, email services, etc.
      return {
        service: 'External Services',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        service: 'External Services',
        status: 'degraded',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Check file system health
   */
  private async checkFileSystemHealth(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Check if we can write to temp directory
      const fs = require('fs').promises;
      const tempDir = process.env.TEMP || '/tmp';
      const testFile = `${tempDir}/health_check_${Date.now()}.txt`;

      await fs.writeFile(testFile, 'health check');
      await fs.unlink(testFile);

      return {
        service: 'File System',
        status: 'healthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date()
      };
    } catch (error) {
      return {
        service: 'File System',
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }
}
