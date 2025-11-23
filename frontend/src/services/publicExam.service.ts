import { apiService } from './api';

export interface QRValidationResult {
  valid: boolean;
  data?: {
    examRegistrationId: number;
    studentId: number;
    examEntryId: number;
    student: {
      id: number;
      studentNumber: string;
      firstName: string;
      lastName: string;
    };
    exam: {
      id: number;
      courseCode: string;
      courseName: string;
      examDate: Date;
      startTime: string;
      endTime: string;
      venue: string;
    };
    canCheckIn: boolean;
    alreadyCheckedIn: boolean;
    checkInWindow: {
      opens: Date;
      closes: Date;
      isOpen: boolean;
    };
  };
  error?: string;
  message?: string;
}

export interface CheckInResult {
  success: boolean;
  data?: {
    verificationId: number;
    timestamp: Date;
    student: {
      studentNumber: string;
      name: string;
    };
    exam: {
      courseCode: string;
      courseName: string;
      venue: string;
    };
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
   * Validate QR code token
   */
  async validateQRCode(qrCode: string): Promise<QRValidationResult> {
    const response = await apiService.post<QRValidationResult>(
      `${this.baseUrl}/validate-qr`,
      { qrCode }
    );
    return response.data!;
  }

  /**
   * Check in student with QR code
   */
  async checkInStudent(qrCode: string): Promise<CheckInResult> {
    const response = await apiService.post<CheckInResult>(
      `${this.baseUrl}/check-in`,
      { qrCode }
    );
    return response.data!;
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
