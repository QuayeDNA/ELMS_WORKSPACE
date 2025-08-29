import { PrismaClient } from '@prisma/client';

export interface ReportQueryConfig {
  entity: 'users' | 'institutions' | 'courses' | 'exams' | 'audit_logs';
  filters: Record<string, any>;
  aggregations?: Array<{
    field: string;
    operation: 'count' | 'sum' | 'avg' | 'min' | 'max';
    alias?: string;
  }>;
  groupBy?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface ReportScheduleConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  recipients: string[];
  format: 'json' | 'csv' | 'pdf';
}

export interface CreateReportDto {
  name: string;
  description?: string;
  queryConfig: ReportQueryConfig;
  scheduleConfig?: ReportScheduleConfig;
}

export interface UpdateReportDto {
  name?: string;
  description?: string;
  queryConfig?: Partial<ReportQueryConfig>;
  scheduleConfig?: Partial<ReportScheduleConfig>;
  isActive?: boolean;
}

export class CustomReportService {
  constructor(private prisma: PrismaClient) {}

  async createReport(userId: string, dto: CreateReportDto) {
    try {
      // Validate query configuration
      await this.validateQueryConfig(dto.queryConfig);

      const report = await this.prisma.customReport.create({
        data: {
          name: dto.name,
          description: dto.description,
          queryConfig: dto.queryConfig as any,
          scheduleConfig: dto.scheduleConfig as any,
          createdBy: userId,
          updatedBy: userId,
        },
      });

      return report;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to create report: ${message}`);
    }
  }

  async getReports(userId?: string) {
    const where = userId ? { createdBy: userId } : {};

    return this.prisma.customReport.findMany({
      where,
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        updatedByUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            executions: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getReportById(id: number) {
    const report = await this.prisma.customReport.findUnique({
      where: { id },
      include: {
        createdByUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        updatedByUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        executions: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!report) {
      throw new Error('Report not found');
    }

    return report;
  }

  async updateReport(id: number, userId: string, dto: UpdateReportDto) {
    await this.getReportById(id);

    // Validate query config if provided
    if (dto.queryConfig) {
      await this.validateQueryConfig(dto.queryConfig as ReportQueryConfig);
    }

    try {
      return await this.prisma.customReport.update({
        where: { id },
        data: {
          ...(dto.name && { name: dto.name }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.queryConfig && { queryConfig: dto.queryConfig as any }),
          ...(dto.scheduleConfig && { scheduleConfig: dto.scheduleConfig as any }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          updatedBy: userId,
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to update report: ${message}`);
    }
  }

  async deleteReport(id: number) {
    await this.getReportById(id);

    await this.prisma.customReport.delete({
      where: { id },
    });

    return { message: 'Report deleted successfully' };
  }

  async executeReport(id: number, userId: string, parameters?: Record<string, any>) {
    const report = await this.getReportById(id);

    if (!report.isActive) {
      throw new Error('Report is not active');
    }

    // Create execution record
    const execution = await this.prisma.reportExecution.create({
      data: {
        reportId: id,
        status: 'running',
        parameters: parameters as any,
        executedBy: userId,
        executedAt: new Date(),
      },
    });

    try {
      // Execute the report query
      const startTime = Date.now();
      const result = await this.executeQuery(report.queryConfig as unknown as ReportQueryConfig, parameters);
      const executionTime = Date.now() - startTime;

      // Update execution record with results
      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          resultData: result as any,
          executionTime,
          completedAt: new Date(),
        },
      });

      return {
        executionId: execution.id,
        data: result,
        executionTime,
      };
    } catch (error) {
      // Update execution record with error
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.prisma.reportExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
          errorMessage: message,
          completedAt: new Date(),
        },
      });

      throw new Error(`Report execution failed: ${message}`);
    }
  }

  async getReportExecutions(reportId: number) {
    return this.prisma.reportExecution.findMany({
      where: { reportId },
      include: {
        executedByUser: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async validateQueryConfig(config: ReportQueryConfig) {
    const allowedEntities = ['users', 'institutions', 'courses', 'exams', 'audit_logs'];

    if (!allowedEntities.includes(config.entity)) {
      throw new Error(`Invalid entity: ${config.entity}`);
    }

    // Additional validation logic can be added here
  }

  private async executeQuery(config: ReportQueryConfig, parameters?: Record<string, any>) {
    const { entity, filters, aggregations, groupBy, sortBy, sortOrder, limit, offset } = config;

    let query: any = {
      where: this.buildWhereClause(filters, parameters),
      select: this.buildSelectClause(aggregations),
    };

    if (groupBy && groupBy.length > 0) {
      query = this.buildGroupByQuery(query, groupBy, aggregations);
    }

    if (sortBy) {
      query.orderBy = {
        [sortBy]: sortOrder || 'asc',
      };
    }

    if (limit) {
      query.take = limit;
    }

    if (offset) {
      query.skip = offset;
    }

    switch (entity) {
      case 'users':
        return this.prisma.user.findMany(query);
      case 'institutions':
        return this.prisma.institution.findMany(query);
      case 'courses':
        return this.prisma.course.findMany(query);
      case 'exams':
        return this.prisma.examSession.findMany(query);
      case 'audit_logs':
        return this.prisma.auditLog.findMany(query);
      default:
        throw new Error(`Unsupported entity: ${entity}`);
    }
  }

  private buildWhereClause(filters: Record<string, any>, parameters?: Record<string, any>) {
    const where: any = {};

    for (const [key, value] of Object.entries(filters)) {
      if (parameters && parameters[key] !== undefined) {
        // Use parameter value if provided
        where[key] = parameters[key];
      } else if (typeof value === 'object' && value !== null) {
        // Handle complex filter objects
        where[key] = value;
      } else {
        // Use static filter value
        where[key] = value;
      }
    }

    return where;
  }

  private buildSelectClause(aggregations?: Array<{ field: string; operation: string; alias?: string }>) {
    if (!aggregations || aggregations.length === 0) {
      return undefined; // Select all fields
    }

    const select: any = {};

    for (const agg of aggregations) {
      const fieldName = agg.alias || `${agg.operation}_${agg.field}`;
      select[fieldName] = {
        [agg.operation]: agg.field,
      };
    }

    return select;
  }

  private buildGroupByQuery(baseQuery: any, groupBy: string[], aggregations?: Array<{ field: string; operation: string; alias?: string }>) {
    // For now, return the base query
    // In a real implementation, you might need to use raw SQL for complex aggregations
    return baseQuery;
  }
}
