import express from 'express';
import { publicExamController } from '../controllers/publicExamController';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for public endpoints to prevent abuse
const checkInLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 check-in attempts per window
  message: 'Too many check-in attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const validateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 validation attempts per minute
  message: 'Too many validation attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route   POST /api/public/exam/validate-index
 * @desc    Validate a student index number and get active exams
 * @access  Public (no auth required)
 * NEW: Replaces /validate-qr endpoint
 */
router.post('/validate-index', validateLimiter, publicExamController.validateIndexNumber);

/**
 * @route   POST /api/public/exam/check-in
 * @desc    Check in a student for an exam using their index number
 * @access  Public (no auth required)
 * UPDATED: Now uses index number instead of QR token
 */
router.post('/check-in', checkInLimiter, publicExamController.checkInStudent);

/**
 * @route   GET /api/public/exam/session/:sessionId
 * @desc    Get public exam session details
 * @access  Public (no auth required)
 */
router.get('/session/:sessionId', publicExamController.getExamSessionDetails);

/**
 * @route   GET /api/public/exam/session/:sessionId/stats
 * @desc    Get check-in statistics for a session
 * @access  Public (no auth required)
 */
router.get('/session/:sessionId/stats', publicExamController.getSessionCheckInStats);

export default router;
