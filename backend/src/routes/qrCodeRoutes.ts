import { Router } from 'express';
import { verifyQRCode, quickStudentLookup } from '../controllers/qrCodeController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Public route for quick student lookup (useful for scanners)
router.get('/student/:studentId', quickStudentLookup);

// Protected route for full QR verification
router.post('/verify', authenticateToken, verifyQRCode);

export default router;
