import { PrismaClient } from '@prisma/client';
import { CreateInstitutionRequest, UpdateInstitutionRequest, GetUsersRequest, GetUsersResponse, UpdateUserStatusRequest, BulkUpdateUsersRequest, InstitutionResponse, UserSummary } from '../../../types/superadmin/users/user-management-types';
import { validateInstitutionData, validatePagination, buildUserFilter, calculateOffset } from '../../../utils/superadmin/users/user-management-utils';
import SocketService from '../../socket.service';
import { UserManagementEvents, USER_MANAGEMENT_ROOMS } from '../../../types/superadmin/users/socket-events';

export class UserManagementService {
  constructor(private prisma: PrismaClient, private socketService?: SocketService) {}

  async createInstitution(data: CreateInstitutionRequest, triggeredBy?: string): Promise<InstitutionResponse> {
    if (!validateInstitutionData(data)) throw new Error('Invalid institution data');

    const institution = await this.prisma.institution.create({
      data: {
        name: data.name,
        type: data.type as any,
        category: data.category as any,
        code: `${data.name.replace(/\s+/g, '').toUpperCase()}${Date.now()}`,
        address: {},
        contactInfo: {},
        academicCalendar: {},
        config: data.settings || {},
        timezone: data.settings?.timezone || 'Africa/Accra',
        currencies: data.settings?.currency ? [data.settings.currency] : ['GHS'],
      },
    });

    const response: InstitutionResponse = {
      id: institution.id,
      name: institution.name,
      type: institution.type,
      category: institution.category,
      settings: (institution.config as object) || {},
      createdAt: institution.createdAt.toISOString(),
      updatedAt: institution.updatedAt.toISOString(),
    };

    // Emit real-time event
    if (this.socketService) {
      this.socketService.emitToRoom(
        USER_MANAGEMENT_ROOMS.SUPERADMIN_DASHBOARD,
        UserManagementEvents.INSTITUTION_CREATED,
        {
          institution: {
            id: institution.id,
            name: institution.name,
            type: institution.type,
            category: institution.category,
          },
          timestamp: new Date().toISOString(),
          triggeredBy: triggeredBy || 'system',
        }
      );
    }

    return response;
  }

  async getInstitutions(): Promise<InstitutionResponse[]> {
    const institutions = await this.prisma.institution.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return institutions.map(inst => ({
      id: inst.id,
      name: inst.name,
      type: inst.type,
      category: inst.category,
      settings: (inst.config as object) || {},
      createdAt: inst.createdAt.toISOString(),
      updatedAt: inst.updatedAt.toISOString(),
    }));
  }

  async updateInstitution(id: string, data: UpdateInstitutionRequest, triggeredBy?: string): Promise<InstitutionResponse> {
    if (!validateInstitutionData(data)) throw new Error('Invalid institution data');

    const oldInstitution = await this.prisma.institution.findUnique({ where: { id } });
    if (!oldInstitution) throw new Error('Institution not found');

    const institution = await this.prisma.institution.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type as any,
        category: data.category as any,
        config: data.settings,
      },
    });

    const response: InstitutionResponse = {
      id: institution.id,
      name: institution.name,
      type: institution.type,
      category: institution.category,
      settings: (institution.config as object) || {},
      createdAt: institution.createdAt.toISOString(),
      updatedAt: institution.updatedAt.toISOString(),
    };

    // Emit real-time event
    if (this.socketService) {
      const changes: Record<string, any> = {};
      if (oldInstitution.name !== institution.name) changes.name = { from: oldInstitution.name, to: institution.name };
      if (oldInstitution.type !== institution.type) changes.type = { from: oldInstitution.type, to: institution.type };
      if (oldInstitution.category !== institution.category) changes.category = { from: oldInstitution.category, to: institution.category };
      if (JSON.stringify(oldInstitution.config) !== JSON.stringify(institution.config)) changes.settings = { from: oldInstitution.config, to: institution.config };

      this.socketService.emitToRoom(
        USER_MANAGEMENT_ROOMS.SUPERADMIN_DASHBOARD,
        UserManagementEvents.INSTITUTION_UPDATED,
        {
          institution: {
            id: institution.id,
            name: institution.name,
            type: institution.type,
            category: institution.category,
          },
          changes,
          timestamp: new Date().toISOString(),
          triggeredBy: triggeredBy || 'system',
        }
      );
    }

    return response;
  }

  async deleteInstitution(id: string, triggeredBy?: string): Promise<void> {
    const institution = await this.prisma.institution.findUnique({ where: { id } });
    if (!institution) throw new Error('Institution not found');

    const facultyCount = await this.prisma.faculty.count({ where: { institutionId: id } });
    if (facultyCount > 0) throw new Error('Cannot delete institution with existing faculties');

    await this.prisma.institution.delete({ where: { id } });

    // Emit real-time event
    if (this.socketService) {
      this.socketService.emitToRoom(
        USER_MANAGEMENT_ROOMS.SUPERADMIN_DASHBOARD,
        UserManagementEvents.INSTITUTION_DELETED,
        {
          institutionId: id,
          institutionName: institution.name,
          timestamp: new Date().toISOString(),
          triggeredBy: triggeredBy || 'system',
        }
      );
    }
  }

  async getUsersByInstitution(query: GetUsersRequest): Promise<GetUsersResponse> {
    const { page, limit } = validatePagination(query.page || 1, query.limit || 10);
    const filter: any = {};
    if (query.role) filter.role = query.role;

    const offset = calculateOffset(page, limit);

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filter,
        include: { profile: true },
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: filter }),
    ]);

    const userSummaries: UserSummary[] = users.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.isActive ? 'ACTIVE' : 'INACTIVE',
      profile: user.profile ? {
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
        department: user.profile.department || undefined,
      } : undefined,
      lastActivityAt: user.lastActivityAt?.toISOString(),
    }));

    return { users: userSummaries, total, page, limit };
  }

  async updateUserStatus(data: UpdateUserStatusRequest, triggeredBy?: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) throw new Error('User not found');

    const oldStatus = user.isActive ? 'ACTIVE' : 'INACTIVE';
    const isActive = data.status === 'ACTIVE';

    await this.prisma.user.update({
      where: { id: data.userId },
      data: { isActive },
    });

    // Emit real-time event
    if (this.socketService) {
      this.socketService.emitToRoom(
        USER_MANAGEMENT_ROOMS.SUPERADMIN_DASHBOARD,
        UserManagementEvents.USER_STATUS_UPDATED,
        {
          userId: data.userId,
          email: user.email,
          oldStatus,
          newStatus: data.status,
          timestamp: new Date().toISOString(),
          triggeredBy: triggeredBy || 'system',
        }
      );
    }
  }

  async bulkUpdateUsers(data: BulkUpdateUsersRequest, triggeredBy?: string): Promise<void> {
    const statusMap: Record<string, boolean> = {
      ACTIVATE: true,
      DEACTIVATE: false,
    };

    await this.prisma.user.updateMany({
      where: { id: { in: data.userIds } },
      data: { isActive: statusMap[data.action] },
    });

    // Emit real-time event
    if (this.socketService) {
      this.socketService.emitToRoom(
        USER_MANAGEMENT_ROOMS.SUPERADMIN_DASHBOARD,
        UserManagementEvents.USERS_BULK_UPDATED,
        {
          userIds: data.userIds,
          action: data.action,
          count: data.userIds.length,
          timestamp: new Date().toISOString(),
          triggeredBy: triggeredBy || 'system',
        }
      );
    }
  }
}