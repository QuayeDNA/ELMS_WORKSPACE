import axios, { AxiosResponse } from 'axios';
import { API_BASE_URL } from '@/utils/constants';
import { storageService } from './storage.service';
import { ApiResponse, ApiError } from '@/types/api';

class ApiService {
  private readonly api: ReturnType<typeof axios.create>;

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
      (config) => {
        // Get token synchronously
        const token = storageService.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(new Error(String(error)))
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const axiosError = error as any;

        if (axiosError.response?.status === 401 && !axiosError.config?._retry) {
          axiosError.config = axiosError.config || {};
          axiosError.config._retry = true;

          // Try to refresh token
          const refreshToken = storageService.getRefreshToken();
          if (refreshToken) {
            const response = await this.api.post('/auth/refresh', {
              refreshToken,
            });
            const responseData = response.data as { data: { token: string } };
            const { token } = responseData.data;
            storageService.setToken(token);

            // Retry original request
            axiosError.config.headers = axiosError.config.headers || {};
            axiosError.config.headers.Authorization = `Bearer ${token}`;
            return this.api.request(axiosError.config);
          }
        }

        return Promise.reject(new Error(this.createApiError(axiosError).message));
      }
    );
  }

  private createApiError(error: unknown): ApiError {
    const axiosError = error as {
      response?: { status: number; data?: { message?: string; error?: string } };
      message?: string;
    };

    if (axiosError.response) {
      return {
        status: axiosError.response.status,
        message: axiosError.response.data?.message || axiosError.response.data?.error || 'Request failed',
        details: axiosError.response.data,
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
      return {
        success: true,
        data: response.data,
        message: 'Request successful',
      };
    } catch (error) {
      const apiError = this.createApiError(error);
      return {
        success: false,
        error: apiError,
        message: apiError.message,
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
}

export const apiService = new ApiService();
export default apiService;
