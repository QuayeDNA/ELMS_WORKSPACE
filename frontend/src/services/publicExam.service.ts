import { apiService } from './api';

// NEW: Updated interfaces for index number-based check-in
export interface IndexNumberValidationResult {
  success: boolean;
  valid?: boolean; // Backend returns 'valid' field
  student?: {
    id: number;
    indexNumber: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  activeExams?: Array<{
    examEntry: {
      id: number;
      courseCode: string;
      courseName: string;
      startTime: string;
      endTime: string;
      duration: number;
      venue: string;
      venueLocation: string;
    };
    registration: {
      id: number;
      examRegistrationId: number;
      seatNumber: string | null;
      isPresent: boolean;
      isVerified: boolean;
    };
    checkInWindow?: {  // Backend might return 'checkInWindow' or 'checkIn'
      isOpen: boolean;
      opens: string;
      closes: string;
    };
    checkIn?: {
      isOpen: boolean;
      canCheckIn: boolean;
      message: string;
    };
  }>;
  error?: string;
  message?: string;
}

export interface CheckInResult {
  success: boolean;
  verification?: {
    id: number;
  };
  timestamp?: string;
  student?: {
    indexNumber: string;
    name: string;
  };
  exam?: {
    courseCode: string;
    courseName: string;
    venue: string;
    seatNumber: string | null;
  };
  error?: string;
  message?: string;
}

export interface SessionDetails {
  id: number;
  courseCode: string;
  courseTitle: string;
  examDate: Date;
  startTime: string;
  endTime: string;
  duration: number;
  venue: {
    name: string;
    location: string;
  };
  timetable: string;
}

export interface CheckInStats {
  expected: number;
  checkedIn: number;
  pending: number;
  attendanceRate: number;
  invigilators: number;
}

class PublicExamService {
  private baseUrl = '/api/public/exam';

  /**
   * Validate student index number and get active exams
   * NEW: Replaces validateQRCode
   */
  async validateIndexNumber(indexNumber: string): Promise<IndexNumberValidationResult> {
    const response = await apiService.post<IndexNumberValidationResult>(
      `${this.baseUrl}/validate-index`,
      { indexNumber }
    );
    return response.data!;
  }

  /**
   * Check in student with index number
   * UPDATED: Now uses index number instead of QR token
   */
  async checkInStudent(indexNumber: string, examEntryId: number): Promise<CheckInResult> {
    try {
      const response = await apiService.post<CheckInResult>(
        `${this.baseUrl}/check-in`,
        { indexNumber, examEntryId }
      );
      return response.data || response;
    } catch (error: any) {
      // Return error response structure
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Get public exam session details
   */
  async getSessionDetails(sessionId: number): Promise<SessionDetails> {
    const response = await apiService.get<SessionDetails>(
      `${this.baseUrl}/session/${sessionId}`
    );
    return response.data!;
  }

  /**
   * Get real-time check-in statistics
   */
  async getCheckInStats(sessionId: number): Promise<CheckInStats> {
    const response = await apiService.get<CheckInStats>(
      `${this.baseUrl}/session/${sessionId}/stats`
    );
    return response.data!;
  }
}

export const publicExamService = new PublicExamService();
