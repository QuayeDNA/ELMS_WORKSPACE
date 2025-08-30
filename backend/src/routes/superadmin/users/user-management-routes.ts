import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { UserManagementController } from '../../../controllers/superadmin/users/user-management-controller';
import { authenticateToken, authorize, AuthenticatedRequest } from '../../../middleware/auth.middleware';
import SocketService from '../../../services/socket.service';

const createUserManagementRoutes = (prisma: PrismaClient, socketService?: SocketService) => {
  const router = Router();
  const controller = new UserManagementController(prisma, socketService);

  // Helper function to wrap controller methods with proper type casting
  const wrapHandler = (handler: (req: AuthenticatedRequest, res: Response) => Promise<void>) =>
    async (req: Request, res: Response) => {
      await handler(req as AuthenticatedRequest, res);
    };

  router.post('/institutions', authenticateToken(prisma), authorize(['SUPER_ADMIN']), wrapHandler(controller.handleCreateInstitution.bind(controller)));
  router.get('/institutions', authenticateToken(prisma), authorize(['SUPER_ADMIN']), controller.handleGetInstitutions.bind(controller));
  router.put('/institutions/:id', authenticateToken(prisma), authorize(['SUPER_ADMIN']), wrapHandler(controller.handleUpdateInstitution.bind(controller)));
  router.delete('/institutions/:id', authenticateToken(prisma), authorize(['SUPER_ADMIN']), wrapHandler(controller.handleDeleteInstitution.bind(controller)));
  router.get('/institutions/:institutionId/users', authenticateToken(prisma), authorize(['SUPER_ADMIN']), async (req: Request, res: Response) => {
    await controller.handleGetUsers(req as AuthenticatedRequest, res);
  });
  router.put('/users/status', authenticateToken(prisma), authorize(['SUPER_ADMIN']), wrapHandler(controller.handleUpdateUserStatus.bind(controller)));
  router.put('/users/bulk', authenticateToken(prisma), authorize(['SUPER_ADMIN']), wrapHandler(controller.handleBulkUpdateUsers.bind(controller)));

  return router;
};

export default createUserManagementRoutes;
