import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { LoginRequest, RegisterRequest, UserRole } from '../types/auth';
import { validationResult, body } from 'express-validator';

// ========================================
// VALIDATION MIDDLEWARE
// ========================================

export const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export const validateRegister = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number, and special character'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .isIn(Object.values(UserRole))
    .withMessage('Invalid user role'),
];

export const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must be at least 8 characters with uppercase, lowercase, number, and special character'),
];

// ========================================
// AUTHENTICATION CONTROLLER
// ========================================

export class AuthController {

  // ========================================
  // USER REGISTRATION
  // ========================================
  
  static async register(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const registerData: RegisterRequest = req.body;
      
      // Register user
      const authResponse = await AuthService.register(registerData);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: authResponse
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
        code: 'REGISTRATION_FAILED'
      });
    }
  }

  // ========================================
  // USER LOGIN
  // ========================================
  
  static async login(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const loginData: LoginRequest = req.body;
      
      // Authenticate user
      const authResponse = await AuthService.login(loginData);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: authResponse
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Login failed',
        code: 'LOGIN_FAILED'
      });
    }
  }

  // ========================================
  // TOKEN REFRESH
  // ========================================
  
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          message: 'Refresh token is required',
          code: 'MISSING_REFRESH_TOKEN'
        });
        return;
      }

      // Refresh tokens
      const authResponse = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: authResponse
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        message: error instanceof Error ? error.message : 'Token refresh failed',
        code: 'TOKEN_REFRESH_FAILED'
      });
    }
  }

  // ========================================
  // USER LOGOUT
  // ========================================
  
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      if (userId) {
        // Invalidate user sessions
        await AuthService.invalidateUserSession(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed',
        code: 'LOGOUT_FAILED'
      });
    }
  }

  // ========================================
  // USER PROFILE
  // ========================================
  
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: {
          id: user.userId,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
          institutionId: user.institutionId,
          facultyId: user.facultyId,
          departmentId: user.departmentId
        }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve profile',
        code: 'PROFILE_RETRIEVAL_FAILED'
      });
    }
  }

  // ========================================
  // PASSWORD MANAGEMENT
  // ========================================
  
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const userId = req.user?.userId;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'User not authenticated',
          code: 'NOT_AUTHENTICATED'
        });
        return;
      }

      // Change password
      await AuthService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password change failed',
        code: 'PASSWORD_CHANGE_FAILED'
      });
    }
  }

  static async requestPasswordReset(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
          code: 'MISSING_EMAIL'
        });
        return;
      }

      // Request password reset
      await AuthService.requestPasswordReset(email);

      // Always return success for security (don't reveal if email exists)
      res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });

    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Password reset request failed',
        code: 'PASSWORD_RESET_REQUEST_FAILED'
      });
    }
  }

  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          message: 'Token and new password are required',
          code: 'MISSING_REQUIRED_FIELDS'
        });
        return;
      }

      // Validate new password strength
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
      if (newPassword.length < 8 || !passwordRegex.test(newPassword)) {
        res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
          code: 'WEAK_PASSWORD'
        });
        return;
      }

      // Reset password
      await AuthService.resetPassword(token, newPassword);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed',
        code: 'PASSWORD_RESET_FAILED'
      });
    }
  }

  // ========================================
  // ACCOUNT MANAGEMENT
  // ========================================
  
  static async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      
      // In a real implementation, you'd verify the email token here
      // For now, we'll just return success
      
      res.status(200).json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(400).json({
        success: false,
        message: 'Email verification failed',
        code: 'EMAIL_VERIFICATION_FAILED'
      });
    }
  }

  static async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required',
          code: 'MISSING_EMAIL'
        });
        return;
      }

      // In a real implementation, you'd resend the verification email here
      console.log(`Resending verification email to: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Verification email sent'
      });

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification email',
        code: 'VERIFICATION_RESEND_FAILED'
      });
    }
  }

  // ========================================
  // HEALTH CHECK
  // ========================================
  
  static async healthCheck(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      message: 'Auth service is healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  }
}
