// User and Authentication Types
export type UserRole = 'STUDENT' | 'LECTURER' | 'HOD' | 'ADMIN' | 'EXAMS_OFFICER' | 'INVIGILATOR' | 'SUPER_ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  faculty?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

// Exam and Session Types
export interface Course {
  id: number;
  code: string;
  name: string;
  level: number;
  duration: number; // in hours
  department: string;
  faculty: string;
}

export interface Program {
  id: number;
  name: string;
  code: string;
  department: string;
  faculty: string;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
}

export interface ExamSession {
  id: number;
  courseId: number;
  course: Course;
  programId: number;
  program: Program;
  venueId: number;
  venue: Venue;
  date: string;
  startTime: string;
  endTime: string;
  invigilatorId?: number;
  invigilator?: User;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  expectedStudents: number;
  registeredStudents: number;
  submittedScripts: number;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: number;
  indexNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  level: number;
  isRegistered: boolean;
  hasSubmitted: boolean;
}

// Batch and Script Types
export type BatchStatus = 'generated' | 'collected' | 'transferred' | 'assigned' | 'grading' | 'graded' | 'returned' | 'archived';

export interface BatchScript {
  id: number;
  batchNumber: string;
  courseId: number;
  course: Course;
  venueId: number;
  venue: Venue;
  scriptCount: number;
  status: BatchStatus;
  currentHandlerId: number;
  currentHandler: User;
  collectedAt?: string;
  sealedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScriptMovement {
  id: number;
  batchScriptId: number;
  fromHandlerId: number;
  fromHandler: User;
  toHandlerId: number;
  toHandler: User;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  timestamp: string;
}

// Submission Types
export interface ScriptSubmission {
  id: number;
  studentId: number;
  student: Student;
  sessionId: number;
  batchScriptId: number;
  submittedAt: string;
  submittedById: number;
  submittedBy: User;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  isValid: boolean;
  errorMessage?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface LoginForm {
  username: string;
  password: string;
}

export interface TransferForm {
  batchScriptId: number;
  toHandlerId: number;
  notes?: string;
}

export interface BulkSubmissionForm {
  sessionId: number;
  scriptCount: number;
  notes?: string;
}

// Navigation Types
export type RootStackParamList = {
  '(tabs)': undefined;
  'login': undefined;
  'session-details': { sessionId: number };
  'student-list': { sessionId: number };
  'bulk-submission': { sessionId: number };
  'batch-details': { batchId: number };
  'batch-history': { batchId: number };
  'transfer-batch': { batchId: number };
  'scanner': { sessionId?: number };
};

export type TabParamList = {
  index: undefined;
  sessions: undefined;
  scanner: undefined;
  batches: undefined;
};

// UI State Types
export interface UiState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

// App State Types
export interface AppState {
  auth: AuthState;
  ui: UiState;
}
