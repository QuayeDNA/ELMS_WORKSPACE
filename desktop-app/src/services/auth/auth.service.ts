import { z } from 'zod';

// API Response types
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    profile: {
      firstName: string;
      lastName: string;
      department?: string;
      faculty?: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      nationality?: string;
      emergencyContact?: Record<string, unknown>;
    };
  };
  token: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface ApiError {
  error: string;
  message?: string;
  statusCode: number;
}

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  role: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData: ApiError = await response.json().catch(() => ({
      error: 'Network error',
      statusCode: response.status
    }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
};

// Auth API Service
export class AuthService {
  private static instance: AuthService;
  private refreshTokenTimeout?: NodeJS.Timeout;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Login user
  async login(credentials: LoginFormData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const data = await handleApiResponse<AuthResponse>(response);

      // Store tokens if remember me is checked
      if (credentials.rememberMe) {
        localStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refresh_token', data.refreshToken);
        }
      } else {
        sessionStorage.setItem('auth_token', data.token);
        if (data.refreshToken) {
          sessionStorage.setItem('refresh_token', data.refreshToken);
        }
      }

      // Set up automatic token refresh
      this.scheduleTokenRefresh(data.expiresIn);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterFormData): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role || 'STUDENT',
        }),
      });

      return handleApiResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  // Forgot password
  async forgotPassword(data: ForgotPasswordFormData): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return handleApiResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  // Reset password
  async resetPassword(data: ResetPasswordFormData): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return handleApiResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Change password
  async changePassword(data: ChangePasswordFormData): Promise<{ message: string }> {
    try {
      const token = this.getToken();
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      return handleApiResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await handleApiResponse<AuthResponse>(response);

      // Update stored tokens
      this.storeToken(data.token);
      if (data.refreshToken) {
        this.storeRefreshToken(data.refreshToken);
      }

      // Schedule next refresh
      this.scheduleTokenRefresh(data.expiresIn);

      return data;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.logout();
      throw error;
    }
  }

  // Verify token
  async verifyToken(): Promise<AuthResponse> {
    try {
      const token = this.getToken();
      if (!token) {
        throw new Error('No token available');
      }

      const response = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      return handleApiResponse<AuthResponse>(response);
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  }

  // Logout
  logout(): void {
    // Clear tokens
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('auth_token');
    sessionStorage.removeItem('refresh_token');

    // Clear refresh timeout
    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  }

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
  }

  // Store token
  private storeToken(token: string): void {
    if (localStorage.getItem('auth_token')) {
      localStorage.setItem('auth_token', token);
    } else {
      sessionStorage.setItem('auth_token', token);
    }
  }

  // Store refresh token
  private storeRefreshToken(refreshToken: string): void {
    if (localStorage.getItem('refresh_token')) {
      localStorage.setItem('refresh_token', refreshToken);
    } else {
      sessionStorage.setItem('refresh_token', refreshToken);
    }
  }

  // Schedule token refresh
  private scheduleTokenRefresh(expiresIn: number): void {
    // Refresh token 5 minutes before expiry
    const refreshTime = (expiresIn - 300) * 1000;

    if (this.refreshTokenTimeout) {
      clearTimeout(this.refreshTokenTimeout);
    }

    this.refreshTokenTimeout = setTimeout(() => {
      this.refreshToken().catch(console.error);
    }, refreshTime);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();
