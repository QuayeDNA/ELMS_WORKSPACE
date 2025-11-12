import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getConfigByInstitution,
  createConfig,
  updateConfig,
  previewConfig,
} from '../controllers/studentIdConfigController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get configuration by institution
router.get('/institution/:institutionId', getConfigByInstitution);

// Create configuration
router.post('/', createConfig);

// Update configuration
router.put('/institution/:institutionId', updateConfig);

// Preview configuration
router.post('/preview', previewConfig);

export default router;
