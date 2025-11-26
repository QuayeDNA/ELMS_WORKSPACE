import { User, ExamSession, Student, BatchScript, ScriptMovement, ApiResponse } from '../types';

// Dummy data for development
const DUMMY_USERS: User[] = [
  {
    id: 1,
    username: 'johndoe',
    email: 'john.doe@university.edu',
    firstName: 'John',
    lastName: 'Doe',
    role: 'INVIGILATOR',
    department: 'Computer Science',
    faculty: 'Engineering',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'janesmith',
    email: 'jane.smith@university.edu',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'LECTURER',
    department: 'Mathematics',
    faculty: 'Science',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

const DUMMY_SESSIONS: ExamSession[] = [
  {
    id: 1,
    courseId: 1,
    course: {
      id: 1,
      code: 'CE201',
      name: 'Data Structures',
      level: 200,
      duration: 2,
      department: 'Computer Science',
      faculty: 'Engineering',
    },
    programId: 1,
    program: {
      id: 1,
      name: 'Computer Engineering',
      code: 'CE',
      department: 'Computer Science',
      faculty: 'Engineering',
    },
    venueId: 1,
    venue: {
      id: 1,
      name: 'Hall A',
      location: 'Main Campus',
      capacity: 100,
    },
    date: '2025-11-26',
    startTime: '09:00',
    endTime: '11:00',
    invigilatorId: 1,
    invigilator: DUMMY_USERS[0],
    status: 'active',
    expectedStudents: 45,
    registeredStudents: 42,
    submittedScripts: 38,
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2024-11-26T08:00:00Z',
  },
  {
    id: 2,
    courseId: 2,
    course: {
      id: 2,
      code: 'MA101',
      name: 'Calculus I',
      level: 100,
      duration: 2,
      department: 'Mathematics',
      faculty: 'Science',
    },
    programId: 2,
    program: {
      id: 2,
      name: 'Mathematics',
      code: 'MA',
      department: 'Mathematics',
      faculty: 'Science',
    },
    venueId: 2,
    venue: {
      id: 2,
      name: 'Hall B',
      location: 'Main Campus',
      capacity: 80,
    },
    date: '2025-11-27',
    startTime: '14:00',
    endTime: '16:00',
    status: 'scheduled',
    expectedStudents: 60,
    registeredStudents: 58,
    submittedScripts: 0,
    createdAt: '2024-11-20T00:00:00Z',
    updatedAt: '2024-11-20T00:00:00Z',
  },
];

const DUMMY_STUDENTS: Student[] = Array.from({ length: 45 }, (_, i) => ({
  id: i + 1,
  indexNumber: `CE${String(i + 1).padStart(3, '0')}`,
  firstName: `Student${i + 1}`,
  lastName: 'Doe',
  email: `student${i + 1}@university.edu`,
  program: 'Computer Engineering',
  level: 200,
  isRegistered: Math.random() > 0.1, // 90% registered
  hasSubmitted: Math.random() > 0.2, // 80% submitted
}));

const DUMMY_BATCHES: BatchScript[] = [
  {
    id: 1,
    batchNumber: 'BATCH-001',
    courseId: 1,
    course: DUMMY_SESSIONS[0].course,
    venueId: 1,
    venue: DUMMY_SESSIONS[0].venue,
    scriptCount: 38,
    status: 'collected',
    currentHandlerId: 1,
    currentHandler: DUMMY_USERS[0],
    collectedAt: '2025-11-26T11:00:00Z',
    createdAt: '2025-11-26T09:00:00Z',
    updatedAt: '2025-11-26T11:00:00Z',
  },
  {
    id: 2,
    batchNumber: 'BATCH-002',
    courseId: 2,
    course: DUMMY_SESSIONS[1].course,
    venueId: 2,
    venue: DUMMY_SESSIONS[1].venue,
    scriptCount: 0,
    status: 'generated',
    currentHandlerId: 1,
    currentHandler: DUMMY_USERS[0],
    createdAt: '2025-11-25T00:00:00Z',
    updatedAt: '2025-11-25T00:00:00Z',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Auth API
export const authApi = {
  login: async (username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
    await delay(1000);
    const user = DUMMY_USERS.find(u => u.username === username);
    if (user && password === 'password') {
      return {
        success: true,
        data: {
          user,
          token: 'dummy-jwt-token',
        },
      };
    }
    throw new Error('Invalid credentials');
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    await delay(500);
    return {
      success: true,
      data: DUMMY_USERS[0],
    };
  },
};

// Sessions API
export const sessionsApi = {
  getMySessions: async (): Promise<ApiResponse<ExamSession[]>> => {
    await delay(800);
    return {
      success: true,
      data: DUMMY_SESSIONS,
    };
  },

  getSessionDetails: async (sessionId: number): Promise<ApiResponse<ExamSession>> => {
    await delay(600);
    const session = DUMMY_SESSIONS.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    return {
      success: true,
      data: session,
    };
  },
};

// Students API
export const studentsApi = {
  getSessionStudents: async (sessionId: number): Promise<ApiResponse<Student[]>> => {
    await delay(700);
    return {
      success: true,
      data: DUMMY_STUDENTS,
    };
  },
};

// Batches API
export const batchesApi = {
  getMyBatches: async (): Promise<ApiResponse<BatchScript[]>> => {
    await delay(600);
    return {
      success: true,
      data: DUMMY_BATCHES,
    };
  },

  getBatchDetails: async (batchId: number): Promise<ApiResponse<BatchScript>> => {
    await delay(500);
    const batch = DUMMY_BATCHES.find(b => b.id === batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }
    return {
      success: true,
      data: batch,
    };
  },

  transferBatch: async (transferData: {
    batchScriptId: number;
    toHandlerId: number;
    location: { latitude: number; longitude: number; address?: string };
    notes?: string;
  }): Promise<ApiResponse<{ movementId: number }>> => {
    await delay(1000);
    return {
      success: true,
      data: {
        movementId: Math.floor(Math.random() * 1000),
      },
    };
  },
};

// Movements API
export const movementsApi = {
  getBatchMovements: async (batchId: number): Promise<ApiResponse<ScriptMovement[]>> => {
    await delay(600);
    // Dummy movements
    const movements: ScriptMovement[] = [
      {
        id: 1,
        batchScriptId: batchId,
        fromHandlerId: 1,
        fromHandler: DUMMY_USERS[0],
        toHandlerId: 2,
        toHandler: DUMMY_USERS[1],
        location: {
          latitude: 5.6037,
          longitude: -0.1870,
          address: 'University Campus',
        },
        notes: 'Transfer to lecturer for grading',
        timestamp: '2025-11-26T12:00:00Z',
      },
    ];
    return {
      success: true,
      data: movements,
    };
  },
};

// Handlers API
export const handlersApi = {
  getAllHandlers: async (): Promise<ApiResponse<User[]>> => {
    await delay(500);
    return {
      success: true,
      data: DUMMY_USERS,
    };
  },
};
