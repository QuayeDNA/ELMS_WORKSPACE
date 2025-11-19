import { Router } from 'express';
import {
  AuthController,
  validateLogin,
  validateRegister,
  validatePasswordChange
} from '../controllers/authController';
import {
  authenticateToken,
  requireRole,
  requirePermission,
  requireHierarchicalAccess
} from '../middleware/auth';
import { UserRole } from '../types/auth';

const router = Router();

// ========================================
// PUBLIC ROUTES (No Authentication Required)
// ========================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post('/login', validateLogin, AuthController.login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', AuthController.refreshToken);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', AuthController.requestPasswordReset);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using reset token
 * @access  Public
 */
router.post('/reset-password', AuthController.resetPassword);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify email address
 * @access  Public
 */
router.get('/verify-email/:token', AuthController.verifyEmail);

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Public
 */
router.post('/resend-verification', AuthController.resendVerificationEmail);

/**
 * @route   GET /api/auth/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', AuthController.healthCheck);

// ========================================
// PROTECTED ROUTES (Authentication Required)
// ========================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate token
 * @access  Private
 */
router.post('/logout', authenticateToken, AuthController.logout);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password',
  authenticateToken,
  validatePasswordChange,
  AuthController.changePassword
);

// ========================================
// ADMIN ROUTES (Role-Based Access)
// ========================================

/**
 * @route   POST /api/auth/admin/create-user
 * @desc    Create new user (Admin only)
 * @access  Private - Admin+
 */
router.post('/admin/create-user',
  authenticateToken,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  requirePermission('users', 'create'),
  validateRegister,
  AuthController.register
);

/**
 * @route   POST /api/auth/admin/create-faculty-admin
 * @desc    Create new faculty admin (Admin only)
 * @access  Private - Admin+
 */
router.post('/admin/create-faculty-admin',
  authenticateToken,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  requireHierarchicalAccess(UserRole.FACULTY_ADMIN),
  validateRegister,
  AuthController.register
);

/**
 * @route   POST /api/auth/admin/create-exam-officer
 * @desc    Create new exam officer (Faculty Admin+)
 * @access  Private - Faculty Admin+
 */
router.post('/admin/create-exam-officer',
  authenticateToken,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  requireHierarchicalAccess(UserRole.EXAMS_OFFICER),
  validateRegister,
  AuthController.register
);

/**
 * @route   POST /api/auth/admin/create-script-handler
 * @desc    Create new script handler (Exam Officer+)
 * @access  Private - Exam Officer+
 */
router.post('/admin/create-script-handler',
  authenticateToken,
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  requireHierarchicalAccess(UserRole.SCRIPT_HANDLER),
  validateRegister,
  AuthController.register
);

/**
 * @route   POST /api/auth/admin/create-invigilator
 * @desc    Create new invigilator (Exam Officer+)
 * @access  Private - Exam Officer+
 */
router.post('/admin/create-invigilator',
  authenticateToken,
  requireRole(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.FACULTY_ADMIN,
    UserRole.EXAMS_OFFICER
  ),
  requireHierarchicalAccess(UserRole.INVIGILATOR),
  validateRegister,
  AuthController.register
);

/**
 * @route   POST /api/auth/admin/create-lecturer
 * @desc    Create new lecturer (Faculty Admin+)
 * @access  Private - Faculty Admin+
 */
router.post('/admin/create-lecturer',
  authenticateToken,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  requireHierarchicalAccess(UserRole.LECTURER),
  validateRegister,
  AuthController.register
);

/**
 * @route   POST /api/auth/admin/create-student
 * @desc    Create new student (Faculty Admin+)
 * @access  Private - Faculty Admin+
 */
router.post('/admin/create-student',
  authenticateToken,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  requireHierarchicalAccess(UserRole.STUDENT),
  validateRegister,
  AuthController.register
);

// ========================================
// ROLE INFORMATION ROUTES
// ========================================

/**
 * @route   GET /api/auth/roles
 * @desc    Get available roles and their permissions
 * @access  Private - Admin+
 */
router.get('/roles',
  authenticateToken,
  requireRole(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN),
  (req, res) => {
    res.json({
      success: true,
      data: {
        roles: Object.values(UserRole),
        descriptions: {
          [UserRole.SUPER_ADMIN]: 'System-wide administrator with full control',
          [UserRole.ADMIN]: 'Institution-level administrator',
          [UserRole.FACULTY_ADMIN]: 'Faculty-level administrator and manager',
          [UserRole.EXAMS_OFFICER]: 'Exam logistics and operations manager',
          [UserRole.SCRIPT_HANDLER]: 'Script transit and security specialist',
          [UserRole.INVIGILATOR]: 'Exam supervisor and script collector',
          [UserRole.LECTURER]: 'Course instructor and exam creator',
          [UserRole.STUDENT]: 'Exam participant and student user'
        }
      }
    });
  }
);

/**
 * @route   GET /api/auth/my-permissions
 * @desc    Get current user's permissions
 * @access  Private
 */
router.get('/my-permissions',
  authenticateToken,
  (req, res) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    res.json({
      success: true,
      data: {
        role: user.primaryRole,
        permissions: user.permissions,
        scope: {
          institutionId: user.institutionId,
          facultyId: user.facultyId,
          departmentId: user.departmentId
        }
      }
    });
  }
);

export default router;
