import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showMessage } from 'react-native-flash-message';

// API Base URL - change this to your backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: any) => {
    if (error.response?.status === 401) {
      // Token expired, clear auth and redirect to login
      await AsyncStorage.removeItem('auth_token');
      showMessage({
        message: 'Session Expired',
        description: 'Please log in again',
        type: 'warning',
      });
    } else if (error.response?.status >= 500) {
      showMessage({
        message: 'Server Error',
        description: 'Something went wrong. Please try again.',
        type: 'danger',
      });
    }
    return Promise.reject(new Error(error.message || 'Request failed'));
  }
);

// Auth API
export const authAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials),
  
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => api.post('/auth/register', userData),
  
  refreshToken: () => api.post('/auth/refresh'),
  
  logout: () => api.post('/auth/logout'),
  
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
};

// Scripts API
export const scriptsAPI = {
  getScripts: (filters?: { examId?: string; status?: string; batchId?: string }) =>
    api.get('/scripts', { params: filters }),
  
  getScript: (id: string) =>
    api.get(`/scripts/${id}`),
  
  getBatches: (examId?: string) =>
    api.get('/scripts/batches', { params: { examId } }),
  
  getBatch: (id: string) =>
    api.get(`/scripts/batches/${id}`),
  
  scanScript: (qrCode: string) =>
    api.post('/scripts/scan', { qrCode }),
  
  moveScript: (data: {
    scriptId: string;
    fromLocation: string;
    toLocation: string;
    notes?: string;
  }) => api.post('/scripts/move', data),
  
  updateStatus: (scriptId: string, status: string) =>
    api.put(`/scripts/${scriptId}/status`, { status }),
  
  reportIncident: (data: {
    scriptId: string;
    type: string;
    description: string;
  }) => api.post('/scripts/incidents', data),
  
  getMovementHistory: (scriptId: string) =>
    api.get(`/scripts/${scriptId}/movements`),
};

// Exams API
export const examsAPI = {
  getExams: () => api.get('/exams'),
  
  getExam: (id: string) => api.get(`/exams/${id}`),
  
  getExamStudents: (id: string) => api.get(`/exams/${id}/students`),
  
  startExam: (id: string) => api.post(`/exams/${id}/start`),
  
  endExam: (id: string) => api.post(`/exams/${id}/end`),
  
  updateAttendance: (examId: string, studentId: string, status: string) =>
    api.put(`/exams/${examId}/attendance`, { studentId, status }),
};

// Incidents API
export const incidentsAPI = {
  getIncidents: () => api.get('/incidents'),
  
  getIncident: (id: string) => api.get(`/incidents/${id}`),
  
  createIncident: (data: any) => api.post('/incidents', data),
  
  updateIncident: (id: string, data: any) =>
    api.put(`/incidents/${id}`, data),
  
  assignIncident: (id: string, assignedTo: string) =>
    api.put(`/incidents/${id}/assign`, { assignedTo }),
  
  resolveIncident: (id: string, resolution: string) =>
    api.put(`/incidents/${id}/resolve`, { resolution }),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  
  updateProfile: (data: any) => api.put('/users/profile', data),
  
  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) => api.put('/users/change-password', data),
  
  getUsers: () => api.get('/users'),
  
  getUser: (id: string) => api.get(`/users/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  
  getScriptStats: () => api.get('/analytics/scripts'),
  
  getExamStats: () => api.get('/analytics/exams'),
  
  getIncidentStats: () => api.get('/analytics/incidents'),
  
  getUserActivity: () => api.get('/analytics/user-activity'),
};

export default api;
