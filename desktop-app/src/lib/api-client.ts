import {
  API_CONFIG,
  HTTP_STATUS,
  API_ERROR_TYPES,
  RequestConfig
} from './api-config';

/**
 * Base API Client
 * Provides common functionality for all API calls
 */
export class BaseApiClient {
  private static instance: BaseApiClient;
  private baseUrl: string;
  private token: string | null = null;

  private constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
  }

  static getInstance(): BaseApiClient {
    if (!BaseApiClient.instance) {
      BaseApiClient.instance = new BaseApiClient();
    }
    return BaseApiClient.instance;
  }

  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  /**
   * Make an authenticated API request
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const {
      timeout = API_CONFIG.TIMEOUT,
      retry = true,
      retryAttempts = API_CONFIG.RETRY_ATTEMPTS,
      retryDelay = API_CONFIG.RETRY_DELAY,
      ...fetchConfig
    } = config;

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchConfig.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData
          );
        }

        const data = await response.json();
        return data;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (
          error instanceof ApiError &&
          (error.status === HTTP_STATUS.UNAUTHORIZED ||
           error.status === HTTP_STATUS.FORBIDDEN ||
           error.status === HTTP_STATUS.BAD_REQUEST)
        ) {
          break;
        }

        // Don't retry on the last attempt
        if (attempt === retryAttempts || !retry) {
          break;
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    }

    throw lastError || new Error('Request failed after all retry attempts');
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /**
   * Get error type based on status code
   */
  getErrorType(): string {
    switch (this.status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return API_ERROR_TYPES.AUTHENTICATION_ERROR;
      case HTTP_STATUS.FORBIDDEN:
        return API_ERROR_TYPES.AUTHORIZATION_ERROR;
      case HTTP_STATUS.BAD_REQUEST:
        return API_ERROR_TYPES.VALIDATION_ERROR;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return API_ERROR_TYPES.SERVER_ERROR;
      default:
        return API_ERROR_TYPES.UNKNOWN_ERROR;
    }
  }

  /**
   * Check if error is retryable
   */
  isRetryable(): boolean {
    return this.status >= 500 || this.status === 429;
  }
}

/**
 * Create singleton instance
 */
export const apiClient = BaseApiClient.getInstance();
