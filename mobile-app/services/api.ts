import { User, ExamSession, Student, BatchScript, ScriptMovement, ApiResponse } from '../types';
import { API_BASE_URL, API_ENDPOINTS, HTTP_STATUS, REQUEST_TIMEOUT, ApiError, ApiErrorType } from '../constants/api';

// HTTP Client Configuration
class HttpClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private getAuthToken: () => Promise<string | null>;

  constructor(baseURL: string, getAuthToken: () => Promise<string | null>) {
    this.baseURL = baseURL;
    this.getAuthToken = getAuthToken;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    // Add authorization header if token exists
    const token = await this.getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        let errorType = ApiErrorType.UNKNOWN_ERROR;
        switch (response.status) {
          case HTTP_STATUS.UNAUTHORIZED:
            errorType = ApiErrorType.AUTHENTICATION_ERROR;
            break;
          case HTTP_STATUS.FORBIDDEN:
            errorType = ApiErrorType.AUTHORIZATION_ERROR;
            break;
          case HTTP_STATUS.BAD_REQUEST:
            errorType = ApiErrorType.VALIDATION_ERROR;
            break;
          case HTTP_STATUS.INTERNAL_SERVER_ERROR:
            errorType = ApiErrorType.SERVER_ERROR;
            break;
        }

        throw new ApiError({
          type: errorType,
          message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          details: errorData,
        });
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError({
          type: ApiErrorType.NETWORK_ERROR,
          message: 'Network connection failed. Please check your internet connection.',
          details: error,
        });
      }

      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError({
          type: ApiErrorType.TIMEOUT_ERROR,
          message: 'Request timed out. Please try again.',
          details: error,
        });
      }

      // Handle other errors
      throw new ApiError({
        type: ApiErrorType.UNKNOWN_ERROR,
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error,
      });
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create HTTP client instance
// This will be initialized with the store later
let httpClient: HttpClient;

export const initializeHttpClient = (getAuthToken: () => Promise<string | null>) => {
  httpClient = new HttpClient(API_BASE_URL, getAuthToken);
};

// For now, create a basic client that will be replaced
const getTokenPlaceholder = async (): Promise<string | null> => {
  // TODO: Get token from Redux store
  return null;
};

httpClient = new HttpClient(API_BASE_URL, getTokenPlaceholder);

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    return httpClient.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
  },

  logout: async (): Promise<ApiResponse<void>> => {
    return httpClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return httpClient.get(API_ENDPOINTS.AUTH.PROFILE);
  },

  refreshToken: async (): Promise<ApiResponse<{ token: string }>> => {
    return httpClient.post(API_ENDPOINTS.AUTH.REFRESH);
  },
};

// Sessions API
export const sessionsApi = {
  getMySessions: async (): Promise<ApiResponse<ExamSession[]>> => {
    return httpClient.get(API_ENDPOINTS.EXAM_LOGISTICS.MY_SESSIONS);
  },

  getSessionDetails: async (sessionId: number): Promise<ApiResponse<ExamSession>> => {
    return httpClient.get(API_ENDPOINTS.EXAM_LOGISTICS.SESSION_DETAILS(sessionId));
  },
};

// Students API
export const studentsApi = {
  getSessionStudents: async (sessionId: number): Promise<ApiResponse<Student[]>> => {
    return httpClient.get(API_ENDPOINTS.STUDENTS.SESSION_STUDENTS(sessionId));
  },
};

// Batches API
export const batchesApi = {
  getMyBatches: async (): Promise<ApiResponse<BatchScript[]>> => {
    return httpClient.get(API_ENDPOINTS.BATCH_SCRIPTS.LIST);
  },

  getBatchDetails: async (batchId: number): Promise<ApiResponse<BatchScript>> => {
    return httpClient.get(API_ENDPOINTS.BATCH_SCRIPTS.DETAILS(batchId));
  },

  transferBatch: async (transferData: {
    batchScriptId: number;
    toHandlerId: number;
    location: { latitude: number; longitude: number; address?: string };
    notes?: string;
  }): Promise<ApiResponse<{ movementId: number }>> => {
    // TODO: Implement batch transfer endpoint when available
    throw new Error('Batch transfer not yet implemented');
  },
};

// Movements API
export const movementsApi = {
  getBatchMovements: async (batchId: number): Promise<ApiResponse<ScriptMovement[]>> => {
    // TODO: Implement movements endpoint when available
    return {
      success: true,
      data: [],
    };
  },
};

// Handlers API
export const handlersApi = {
  getAllHandlers: async (): Promise<ApiResponse<User[]>> => {
    // TODO: Implement handlers endpoint when available
    return {
      success: true,
      data: [],
    };
  },
};

// Dashboard API
export const dashboardApi = {
  getInvigilatorDashboard: async (): Promise<ApiResponse<{
    user: User;
    activeSessions: {
      id: number;
      examEntryId: number;
      courseName: string;
      courseCode: string;
      venueName: string;
      roomName?: string;
      startTime: string;
      endTime: string;
      expectedStudents: number;
      presentStudents: number;
      submittedScripts: number;
      status: 'not_started' | 'in_progress' | 'completed';
      isCheckedIn: boolean;
      lastActivity?: string;
    }[];
    todayStats: {
      sessionsAssigned: number;
      sessionsCompleted: number;
      scriptsCollected: number;
      studentsVerified: number;
      incidentsReported: number;
      batchesSealed: number;
    };
    activeIncidents: {
      id: number;
      type: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      venueName: string;
      reportedAt: string;
      status: 'reported' | 'investigating' | 'resolved';
    }[];
    pendingTasks: {
      unsealedBatches: number;
      unverifiedStudents: number;
      unresolvedIncidents: number;
      uncheckedSessions: number;
    };
    recentActivity: {
      id: string;
      type: 'script_submitted' | 'student_verified' | 'incident_reported' | 'batch_sealed' | 'session_checked_in';
      description: string;
      timestamp: string;
      sessionId?: number;
      venueName?: string;
    }[];
  }>> => {
    return httpClient.get(API_ENDPOINTS.EXAM_LOGISTICS.DASHBOARD);
  },
};
