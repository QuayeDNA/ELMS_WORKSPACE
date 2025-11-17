import { QRCodeData, QRCodeScanResult } from '@/types/examLogistics';

/**
 * QR Code Service for exam logistics
 * Handles generation and scanning of QR codes for student verification and invigilator check-ins
 */
export class QRCodeService {
  private static readonly QR_CODE_EXPIRY_MINUTES = 15; // QR codes expire after 15 minutes

  /**
   * Generate QR code data for student verification
   */
  static generateStudentQRCode(
    examEntryId: number,
    studentId: number,
    venueId: number
  ): QRCodeData {
    const timestamp = new Date();
    const expiresAt = new Date(timestamp.getTime() + this.QR_CODE_EXPIRY_MINUTES * 60 * 1000);

    return {
      type: 'student_verification',
      examEntryId,
      studentId,
      venueId,
      timestamp,
      expiresAt,
    };
  }

  /**
   * Generate QR code data for invigilator check-in
   */
  static generateInvigilatorQRCode(
    examEntryId: number,
    invigilatorId: number,
    venueId: number
  ): QRCodeData {
    const timestamp = new Date();
    const expiresAt = new Date(timestamp.getTime() + this.QR_CODE_EXPIRY_MINUTES * 60 * 1000);

    return {
      type: 'invigilator_checkin',
      examEntryId,
      invigilatorId,
      venueId,
      timestamp,
      expiresAt,
    };
  }

  /**
   * Generate QR code data for venue access
   */
  static generateVenueAccessQRCode(
    examEntryId: number,
    venueId: number
  ): QRCodeData {
    const timestamp = new Date();
    const expiresAt = new Date(timestamp.getTime() + this.QR_CODE_EXPIRY_MINUTES * 60 * 1000);

    return {
      type: 'venue_access',
      examEntryId,
      venueId,
      timestamp,
      expiresAt,
    };
  }

  /**
   * Convert QR code data to string for encoding
   */
  static encodeQRData(data: QRCodeData): string {
    return btoa(JSON.stringify({
      ...data,
      timestamp: data.timestamp.toISOString(),
      expiresAt: data.expiresAt.toISOString(),
    }));
  }

  /**
   * Decode QR code string back to data
   */
  static decodeQRData(encodedData: string): QRCodeData | null {
    try {
      const decoded = JSON.parse(atob(encodedData));
      return {
        ...decoded,
        timestamp: new Date(decoded.timestamp),
        expiresAt: new Date(decoded.expiresAt),
      };
    } catch (error) {
      console.error('Failed to decode QR data:', error);
      return null;
    }
  }

  /**
   * Validate QR code data
   */
  static validateQRCode(data: QRCodeData): QRCodeScanResult {
    const now = new Date();

    // Check if QR code has expired
    if (now > data.expiresAt) {
      return {
        success: false,
        error: 'QR code has expired',
        message: 'Please generate a new QR code',
      };
    }

    // Check if QR code is too old (more than 1 hour)
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    if (data.timestamp < oneHourAgo) {
      return {
        success: false,
        error: 'QR code is too old',
        message: 'Please generate a new QR code',
      };
    }

    return {
      success: true,
      data,
      message: 'QR code is valid',
    };
  }

  /**
   * Scan and validate QR code
   */
  static scanQRCode(encodedData: string): QRCodeScanResult {
    const data = this.decodeQRData(encodedData);

    if (!data) {
      return {
        success: false,
        error: 'Invalid QR code format',
        message: 'Please ensure you are scanning a valid ELMS QR code',
      };
    }

    return this.validateQRCode(data);
  }

  /**
   * Generate QR code URL for display
   */
  static async generateQRCodeURL(data: QRCodeData): Promise<string> {
    const encodedData = this.encodeQRData(data);

    // Using a QR code generation service (you can replace with your preferred service)
    const qrCodeAPI = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(encodedData)}`;

    return qrCodeAPI;
  }

  /**
   * Check if device has camera permission for QR scanning
   */
  static async checkCameraPermission(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Camera permission check failed:', error);
      return false;
    }
  }

  /**
   * Request camera permission for QR scanning
   */
  static async requestCameraPermission(): Promise<boolean> {
    try {
      const result = await this.checkCameraPermission();
      return result;
    } catch (error) {
      console.error('Failed to request camera permission:', error);
      return false;
    }
  }

  /**
   * Get QR code expiry time in minutes
   */
  static getExpiryMinutes(): number {
    return this.QR_CODE_EXPIRY_MINUTES;
  }

  /**
   * Format QR code data for display
   */
  static formatQRDataForDisplay(data: QRCodeData): string {
    const timeString = data.timestamp.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    switch (data.type) {
      case 'student_verification':
        return `Student Verification\nExam: ${data.examEntryId}\nStudent: ${data.studentId}\nTime: ${timeString}`;

      case 'invigilator_checkin':
        return `Invigilator Check-in\nExam: ${data.examEntryId}\nInvigilator: ${data.invigilatorId}\nTime: ${timeString}`;

      case 'venue_access':
        return `Venue Access\nExam: ${data.examEntryId}\nVenue: ${data.venueId}\nTime: ${timeString}`;

      default:
        return 'Unknown QR Code Type';
    }
  }
}

// Export singleton instance
export const qrCodeService = QRCodeService;
