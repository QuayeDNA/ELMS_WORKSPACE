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
        type: data.type,
        category: data.category,
        code: data.code || `${data.name.replace(/\s+/g, '').toUpperCase()}${Date.now()}`,
        address: data.address as any || {},
        contactInfo: data.contactInfo as any || {},
        logo: data.logo,
        motto: data.motto,
        description: data.description,
        establishedYear: data.establishedYear,
        charter: data.charter,
        accreditation: data.accreditation,
        affiliations: data.affiliations || [],
        timezone: data.timezone || 'Africa/Accra',
        language: data.language || 'en',
        currencies: data.currencies || ['GHS'],
        academicCalendar: data.academicCalendar as any || {},
        customFields: data.customFields as any || {},
        config: data.config as any || {},
        isActive: data.isActive ?? true,
      },
    });

    const response: InstitutionResponse = {
      id: institution.id,
      name: institution.name,
      type: institution.type,
      category: institution.category,
      code: institution.code,
      address: institution.address as any,
      contactInfo: institution.contactInfo as any,
      logo: institution.logo || undefined,
      motto: institution.motto || undefined,
      description: institution.description || undefined,
      establishedYear: institution.establishedYear || undefined,
      charter: institution.charter as string || undefined,
      accreditation: institution.accreditation as string || undefined,
      affiliations: institution.affiliations,
      timezone: institution.timezone,
      language: institution.language,
      currencies: institution.currencies,
      academicCalendar: institution.academicCalendar as any,
      customFields: institution.customFields as any,
      config: institution.config as any,
      settings: institution.config as any,
      isActive: institution.isActive,
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
      code: inst.code,
      address: inst.address as any,
      contactInfo: inst.contactInfo as any,
      logo: inst.logo || undefined,
      motto: inst.motto || undefined,
      description: inst.description || undefined,
      establishedYear: inst.establishedYear || undefined,
      charter: inst.charter as string || undefined,
      accreditation: inst.accreditation as string || undefined,
      affiliations: inst.affiliations,
      timezone: inst.timezone,
      language: inst.language,
      currencies: inst.currencies,
      academicCalendar: inst.academicCalendar as any,
      customFields: inst.customFields as any,
      config: inst.config as any,
      settings: inst.config as any,
      isActive: inst.isActive,
      createdAt: inst.createdAt.toISOString(),
      updatedAt: inst.updatedAt.toISOString(),
    }));
  }

  async updateInstitution(id: string, data: UpdateInstitutionRequest, triggeredBy?: string): Promise<InstitutionResponse> {
    if (!validateInstitutionData(data)) throw new Error('Invalid institution data');

    const oldInstitution = await this.prisma.institution.findUnique({ where: { id } });
    if (!oldInstitution) throw new Error('Institution not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.address !== undefined) updateData.address = data.address as any;
    if (data.contactInfo !== undefined) updateData.contactInfo = data.contactInfo as any;
    if (data.logo !== undefined) updateData.logo = data.logo;
    if (data.motto !== undefined) updateData.motto = data.motto;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.establishedYear !== undefined) updateData.establishedYear = data.establishedYear;
    if (data.charter !== undefined) updateData.charter = data.charter;
    if (data.accreditation !== undefined) updateData.accreditation = data.accreditation;
    if (data.affiliations !== undefined) updateData.affiliations = data.affiliations;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.language !== undefined) updateData.language = data.language;
    if (data.currencies !== undefined) updateData.currencies = data.currencies;
    if (data.academicCalendar !== undefined) updateData.academicCalendar = data.academicCalendar as any;
    if (data.customFields !== undefined) updateData.customFields = data.customFields as any;
    if (data.config !== undefined) updateData.config = data.config as any;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const institution = await this.prisma.institution.update({
      where: { id },
      data: updateData,
    });

    const response: InstitutionResponse = {
      id: institution.id,
      name: institution.name,
      type: institution.type,
      category: institution.category,
      code: institution.code,
      address: institution.address as any,
      contactInfo: institution.contactInfo as any,
      logo: institution.logo || undefined,
      motto: institution.motto || undefined,
      description: institution.description || undefined,
      establishedYear: institution.establishedYear || undefined,
      charter: institution.charter as string || undefined,
      accreditation: institution.accreditation as string || undefined,
      affiliations: institution.affiliations,
      timezone: institution.timezone,
      language: institution.language,
      currencies: institution.currencies,
      academicCalendar: institution.academicCalendar as any,
      customFields: institution.customFields as any,
      config: institution.config as any,
      settings: institution.config as any,
      isActive: institution.isActive,
      createdAt: institution.createdAt.toISOString(),
      updatedAt: institution.updatedAt.toISOString(),
    };

    // Emit real-time event
    if (this.socketService) {
      const changes: Record<string, any> = {};
      if (oldInstitution.name !== institution.name) changes.name = { from: oldInstitution.name, to: institution.name };
      if (oldInstitution.type !== institution.type) changes.type = { from: oldInstitution.type, to: institution.type };
      if (oldInstitution.category !== institution.category) changes.category = { from: oldInstitution.category, to: institution.category };
      if (oldInstitution.code !== institution.code) changes.code = { from: oldInstitution.code, to: institution.code };
      if (JSON.stringify(oldInstitution.address) !== JSON.stringify(institution.address)) changes.address = { from: oldInstitution.address, to: institution.address };
      if (JSON.stringify(oldInstitution.contactInfo) !== JSON.stringify(institution.contactInfo)) changes.contactInfo = { from: oldInstitution.contactInfo, to: institution.contactInfo };
      if (oldInstitution.logo !== institution.logo) changes.logo = { from: oldInstitution.logo, to: institution.logo };
      if (oldInstitution.motto !== institution.motto) changes.motto = { from: oldInstitution.motto, to: institution.motto };
      if (oldInstitution.description !== institution.description) changes.description = { from: oldInstitution.description, to: institution.description };
      if (oldInstitution.establishedYear !== institution.establishedYear) changes.establishedYear = { from: oldInstitution.establishedYear, to: institution.establishedYear };
      if (oldInstitution.charter !== institution.charter) changes.charter = { from: oldInstitution.charter, to: institution.charter };
      if (oldInstitution.accreditation !== institution.accreditation) changes.accreditation = { from: oldInstitution.accreditation, to: institution.accreditation };
      if (JSON.stringify(oldInstitution.affiliations) !== JSON.stringify(institution.affiliations)) changes.affiliations = { from: oldInstitution.affiliations, to: institution.affiliations };
      if (oldInstitution.timezone !== institution.timezone) changes.timezone = { from: oldInstitution.timezone, to: institution.timezone };
      if (oldInstitution.language !== institution.language) changes.language = { from: oldInstitution.language, to: institution.language };
      if (JSON.stringify(oldInstitution.currencies) !== JSON.stringify(institution.currencies)) changes.currencies = { from: oldInstitution.currencies, to: institution.currencies };
      if (JSON.stringify(oldInstitution.academicCalendar) !== JSON.stringify(institution.academicCalendar)) changes.academicCalendar = { from: oldInstitution.academicCalendar, to: institution.academicCalendar };
      if (JSON.stringify(oldInstitution.customFields) !== JSON.stringify(institution.customFields)) changes.customFields = { from: oldInstitution.customFields, to: institution.customFields };
      if (JSON.stringify(oldInstitution.config) !== JSON.stringify(institution.config)) changes.config = { from: oldInstitution.config, to: institution.config };
      if (oldInstitution.isActive !== institution.isActive) changes.isActive = { from: oldInstitution.isActive, to: institution.isActive };

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