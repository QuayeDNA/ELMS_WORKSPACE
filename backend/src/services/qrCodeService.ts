import crypto from 'crypto';
import { QRCodeData, QRValidationResult } from '../types/scriptSubmission';

export class QRCodeService {
  private static readonly SECRET_KEY = process.env.QR_SECRET_KEY || 'your-secret-key-change-in-production';
  private static readonly ALGORITHM = 'sha256';

  /**
   * Generate a student QR code for exam registration
   */
  static generateStudentQRCode(data: {
    studentId: number;
    examEntryId: number;
    courseId: number;
  }): string {
    const timestamp = new Date().toISOString();
    const payload = {
      type: 'STUDENT',
      studentId: data.studentId,
      examEntryId: data.examEntryId,
      courseId: data.courseId,
      timestamp,
      securityHash: this.generateHash(`${data.studentId}-${data.examEntryId}-${timestamp}`)
    };

    // Encode as base64 for QR code
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Generate a batch QR code for course-level script tracking
   */
  static generateBatchQRCode(data: {
    batchId: number;
    courseId: number;
    courseCode: string;
    examEntryId: number;
  }): string {
    const timestamp = new Date().toISOString();
    const payload = {
      type: 'BATCH',
      batchId: data.batchId,
      courseId: data.courseId,
      courseCode: data.courseCode,
      examEntryId: data.examEntryId,
      timestamp,
      securityHash: this.generateHash(`${data.batchId}-${data.courseId}-${timestamp}`)
    };

    // Encode as base64 for QR code
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  /**
   * Decode and validate a student QR code
   */
  static validateStudentQRCode(qrCode: string): QRValidationResult {
    try {
      const decoded = Buffer.from(qrCode, 'base64').toString('utf-8');
      const data: QRCodeData = JSON.parse(decoded);

      if (data.type !== 'STUDENT') {
        return {
          isValid: false,
          errorMessage: 'Invalid QR code type. Expected STUDENT QR code.'
        };
      }

      // Verify security hash
      const expectedHash = this.generateHash(
        `${data.studentId}-${data.examEntryId}-${data.timestamp}`
      );

      if (data.securityHash !== expectedHash) {
        return {
          isValid: false,
          errorMessage: 'QR code security validation failed. Possible tampering detected.'
        };
      }

      return {
        isValid: true,
        data: {
          type: 'STUDENT',
          studentId: data.studentId,
          examEntryId: data.examEntryId,
          courseId: data.courseId,
          timestamp: data.timestamp,
          securityHash: data.securityHash
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Failed to decode QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Decode and validate a batch QR code
   */
  static validateBatchQRCode(qrCode: string): QRValidationResult {
    try {
      const decoded = Buffer.from(qrCode, 'base64').toString('utf-8');
      const data = JSON.parse(decoded);

      if (data.type !== 'BATCH') {
        return {
          isValid: false,
          errorMessage: 'Invalid QR code type. Expected BATCH QR code.'
        };
      }

      // Verify security hash
      const expectedHash = this.generateHash(
        `${data.batchId}-${data.courseId}-${data.timestamp}`
      );

      
      if (data.securityHash !== expectedHash) {
        return {
          isValid: false,
          errorMessage: 'QR code security validation failed. Possible tampering detected.'
        };
      }

      return {
        isValid: true,
        data: {
          type: 'BATCH',
          batchId: data.batchId,
          courseId: data.courseId,
          courseCode: data.courseCode,
          examEntryId: data.examEntryId,
          timestamp: data.timestamp,
          securityHash: data.securityHash
        }
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Failed to decode QR code: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate a security hash for QR code validation
   */
  private static generateHash(data: string): string {
    return crypto
      .createHmac(this.ALGORITHM, this.SECRET_KEY)
      .update(data)
      .digest('hex');
  }

  /**
   * Check if a QR code has expired (optional - for future time-based validation)
   */
  static isQRCodeExpired(timestamp: string, expiryHours: number = 24): boolean {
    const qrTimestamp = new Date(timestamp);
    const now = new Date();
    const hoursDiff = (now.getTime() - qrTimestamp.getTime()) / (1000 * 60 * 60);

    return hoursDiff > expiryHours;
  }
}
