import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserManagementService } from '../../../services/superadmin/users/user-management-service';
import { CreateInstitutionRequest, UpdateInstitutionRequest, GetUsersRequest, UpdateUserStatusRequest, BulkUpdateUsersRequest } from '../../../types/superadmin/users/user-management-types';
import { AuthenticatedRequest } from '../../../middleware/auth.middleware';
import SocketService from '../../../services/socket.service';

export class UserManagementController {
  private service: UserManagementService;

  constructor(prisma: PrismaClient, socketService?: SocketService) {
    this.service = new UserManagementService(prisma, socketService);
  }

  async handleCreateInstitution(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data: CreateInstitutionRequest = req.body;
      const triggeredBy = req.user?.userId;
      const result = await this.service.createInstitution(data, triggeredBy);
      res.status(201).json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: message });
    }
  }

  async handleGetInstitutions(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.service.getInstitutions();
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: message });
    }
  }

  async handleUpdateInstitution(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data: UpdateInstitutionRequest = req.body;
      const triggeredBy = req.user?.userId;
      const result = await this.service.updateInstitution(id, data, triggeredBy);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: message });
    }
  }

  async handleDeleteInstitution(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const triggeredBy = req.user?.userId;
      await this.service.deleteInstitution(id, triggeredBy);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: message });
    }
  }

  async handleGetUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { institutionId } = req.params;
      const query: GetUsersRequest = {
        institutionId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        role: req.query.role as string,
        status: req.query.status as string,
        department: req.query.department as string,
      };
      const result = await this.service.getUsersByInstitution(query);
      res.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(500).json({ error: message });
    }
  }

  async handleUpdateUserStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data: UpdateUserStatusRequest = req.body;
      const triggeredBy = req.user?.userId;
      await this.service.updateUserStatus(data, triggeredBy);
      res.status(200).json({ message: 'User status updated successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: message });
    }
  }

  async handleBulkUpdateUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data: BulkUpdateUsersRequest = req.body;
      const triggeredBy = req.user?.userId;
      await this.service.bulkUpdateUsers(data, triggeredBy);
      res.status(200).json({ message: 'Users updated successfully' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      res.status(400).json({ error: message });
    }
  }
}
