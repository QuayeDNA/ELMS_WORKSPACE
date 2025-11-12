import { Router } from 'express';
import {
  registerStudent,
  getAvailablePrograms,
  getAvailableAcademicYears,
} from '../controllers/publicRegistrationController';

const router = Router();

/**
 * PUBLIC ROUTES - No authentication required
 */

// Student registration
router.post('/students/register', registerStudent);

// Get available programs for an institution
router.get('/institutions/:institutionId/programs', getAvailablePrograms);

// Get available academic years for an institution
router.get('/institutions/:institutionId/academic-years', getAvailableAcademicYears);

export default router;
