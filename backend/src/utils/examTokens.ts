/**
 * Utility functions for QR code token generation and validation
 */

interface QRTokenData {
  examRegistrationId: number;
  studentId: number;
  examEntryId: number;
  courseCode: string;
  timestamp?: number;
}

/**
 * Parse a QR code string and extract token data
 * Expected format: EXAM-{COURSECODE}-S{studentId}-E{examEntryId}-R{registrationId}-{timestamp}-{hash}
 * Example: EXAM-CS101-S1-E5-R12-1732377600000-a1b2c3
 */
export function validateQRToken(qrCode: string): QRTokenData | null {
  try {
    // Basic format validation
    if (!qrCode || typeof qrCode !== 'string') {
      return null;
    }

    // Check if it starts with EXAM-
    if (!qrCode.startsWith('EXAM-')) {
      return null;
    }

    // Parse the QR code format
    const parts = qrCode.split('-');
    if (parts.length < 7) {
      return null;
    }

    // Extract components
    const courseCode = parts[1]; // e.g., CS101
    const studentPart = parts[2]; // e.g., S1
    const examEntryPart = parts[3]; // e.g., E5
    const registrationPart = parts[4]; // e.g., R12
    const timestamp = parts[5]; // e.g., 1732377600000

    // Validate and extract IDs
    if (!studentPart.startsWith('S') || !examEntryPart.startsWith('E') || !registrationPart.startsWith('R')) {
      return null;
    }

    const studentId = parseInt(studentPart.substring(1));
    const examEntryId = parseInt(examEntryPart.substring(1));
    const examRegistrationId = parseInt(registrationPart.substring(1));

    // Validate parsed values
    if (isNaN(studentId) || isNaN(examEntryId) || isNaN(examRegistrationId)) {
      return null;
    }

    if (studentId <= 0 || examEntryId <= 0 || examRegistrationId <= 0) {
      return null;
    }

    return {
      examRegistrationId,
      studentId,
      examEntryId,
      courseCode,
      timestamp: parseInt(timestamp)
    };
  } catch (error) {
    console.error('Error parsing QR token:', error);
    return null;
  }
}

/**
 * Generate a QR code token (for testing purposes)
 * In production, this would be done during registration creation
 */
export function generateQRToken(data: Omit<QRTokenData, 'timestamp'>): string {
  const timestamp = Date.now();
  const hash = generateHash(data, timestamp);

  return `EXAM-${data.courseCode}-S${data.studentId}-E${data.examEntryId}-R${data.examRegistrationId}-${timestamp}-${hash}`;
}

/**
 * Generate a simple hash for QR code validation
 * In production, use a proper HMAC with a secret key
 */
function generateHash(data: Omit<QRTokenData, 'timestamp'>, timestamp: number): string {
  const str = `${data.examRegistrationId}${data.studentId}${data.examEntryId}${timestamp}`;
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(36).substring(0, 6);
}

/**
 * Validate QR token expiry (optional security measure)
 * Returns true if token is still valid
 */
export function isTokenExpired(qrCode: string, expiryHours: number = 24): boolean {
  const tokenData = validateQRToken(qrCode);

  if (!tokenData || !tokenData.timestamp) {
    return true;
  }

  const now = Date.now();
  const tokenAge = now - tokenData.timestamp;
  const maxAge = expiryHours * 60 * 60 * 1000; // Convert hours to milliseconds

  return tokenAge > maxAge;
}

/**
 * Extract basic info from QR code without full validation
 * Useful for quick lookups
 */
export function extractQRInfo(qrCode: string): { courseCode?: string; studentId?: number } {
  try {
    const parts = qrCode.split('-');
    if (parts.length < 3) {
      return {};
    }

    const courseCode = parts[1];
    const studentPart = parts[2];
    const studentId = studentPart.startsWith('S') ? parseInt(studentPart.substring(1)) : undefined;

    return { courseCode, studentId };
  } catch {
    return {};
  }
}
