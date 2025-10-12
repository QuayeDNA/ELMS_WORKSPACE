import { apiService } from './api';
import { API_ENDPOINTS } from '@/utils/constants';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest
} from '@/types/auth';

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const loginData = {
        email: credentials.email,
        password: credentials.password,
        rememberMe: credentials.rememberMe || false,
      };

      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        loginData
      );

      if (response.success && response.data) {
        return response.data;
      }

      // Return user-friendly error message
      throw new Error(response.message || 'Invalid email or password');
    } catch (error) {
      // Handle network or other errors
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Unable to connect to server. Please try again.');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );

    if (response.success && response.data) {
      return response.data;
    }

    throw new Error(response.message || 'Registration failed');
  }

  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch {
      // Don't throw error for logout, continue with local logout
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiService.get<User>(API_ENDPOINTS.AUTH.PROFILE);

      if (response.success && response.data) {
        return response.data;
      }

      return null;
    } catch {
      return null;
    }
  }

  async refreshToken(refreshToken: string): Promise<string | null> {
    try {
      const response = await apiService.post<AuthResponse>(
        API_ENDPOINTS.AUTH.REFRESH,
        { refreshToken }
      );

      if (response.success && response.data) {
        return response.data.token;
      }

      return null;
    } catch {
      return null;
    }
  }

  async forgotPassword(email: ForgotPasswordRequest): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, email);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    await apiService.post('/api/auth/change-password', data);
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  }
}

export const authService = new AuthService();
