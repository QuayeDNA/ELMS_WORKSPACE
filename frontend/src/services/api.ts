import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '@/utils/constants';
import { storageService } from './storage.service';
import { ApiResponse, ApiError } from '@/types/api';

class ApiService {
  private readonly api: ReturnType<typeof axios.create>;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storageService.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 304 Not Modified as success
        if (error.response?.status === 304) {
          return error.response;
        }

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          // Prevent multiple refresh attempts
          if (this.isRefreshing) {
            // Wait for the ongoing refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.api.request(originalRequest));
              });
            });
          }

          this.isRefreshing = true;

          try {
            const refreshToken = storageService.getRefreshToken();

            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Attempt to refresh the token
            const response = await this.api.post(API_ENDPOINTS.AUTH.REFRESH, {
              refreshToken,
            });

            if (response.data?.success && response.data?.data?.token) {
              const newToken = response.data.data.token;

              // Update stored token
              storageService.setToken(newToken);

              // Update authorization header
              this.api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              originalRequest.headers.Authorization = `Bearer ${newToken}`;

              // Notify all waiting requests
              this.onRefreshSuccess(newToken);

              // Retry original request
              return this.api.request(originalRequest);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);

            // Clear auth data and redirect to login
            storageService.clearAuthData();

            // Notify waiting requests of failure
            this.onRefreshFailure();

            // Redirect to login page
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }

            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
            this.refreshSubscribers = [];
          }
        }

        // Handle other errors
        return Promise.reject(error);
      }
    );
  }

  private onRefreshSuccess(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
  }

  private onRefreshFailure(): void {
    this.refreshSubscribers = [];
  }

  private createApiError(error: unknown): ApiError {
    const axiosError = error as {
      response?: {
        status: number;
        data?: {
          message?: string;
          error?: string;
          errors?: Record<string, string[]>;
        }
      };
      message?: string;
    };

    if (axiosError.response) {
      const errorData = axiosError.response.data;
      let message = errorData?.message || errorData?.error || 'Request failed';

      // Handle validation errors
      if (errorData?.errors) {
        const validationMessages = Object.entries(errorData.errors)
          .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
          .join('; ');
        message = validationMessages || message;
      }

      return {
        status: axiosError.response.status,
        message,
        details: errorData,
      };
    }

    return {
      status: 0,
      message: axiosError.message || 'Network error',
      details: null,
    };
  }

  private async handleRequest<T>(requestPromise: Promise<AxiosResponse>): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse = await requestPromise;

      // Handle successful responses (200-299, 304)
      if (response.status === 304 || (response.status >= 200 && response.status < 300)) {
        // Check if the backend already returns a structured response
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
          return response.data as ApiResponse<T>;
        }

        // Backend returns raw data, wrap it
        return {
          success: true,
          data: response.data,
          message: 'Request successful',
        };
      }

      // For other status codes, treat as error
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);

    } catch (error) {
      const apiError = this.createApiError(error);

      return {
        success: false,
        error: apiError.message,
        message: apiError.message,
        data: undefined as T,
      };
    }
  }

  // HTTP Methods
  async get<T>(url: string, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.api.get(url, config));
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.api.post(url, data, config));
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.api.put(url, data, config));
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.api.patch(url, data, config));
  }

  async delete<T>(url: string, config?: Record<string, unknown>): Promise<ApiResponse<T>> {
    return this.handleRequest<T>(this.api.delete(url, config));
  }

  // File upload with progress
  async uploadFile<T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const config: Record<string, unknown> = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent: { total?: number; loaded: number }) => {
        if (progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      };
    }

    return this.handleRequest<T>(this.api.post(url, formData, config));
  }

  // Get axios instance for advanced usage
  getAxiosInstance() {
    return this.api;
  }

  // Clear authentication headers
  clearAuthHeader(): void {
    delete this.api.defaults.headers.common['Authorization'];
  }

  // Set authentication header
  setAuthHeader(token: string): void {
    this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
}

export const apiService = new ApiService();
export default apiService;
