// Utility function to generate unique QR codes for scripts
export async function generateQRCode(): Promise<string> {
  // Generate a unique QR code using timestamp and random string
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const qrCode = `ELMS-${timestamp}-${random}`.toUpperCase();

  return qrCode;
}

// Validate QR code format
export function validateQRCode(qrCode: string): boolean {
  const qrCodePattern = /^ELMS-[A-Z0-9]+-[A-Z0-9]+$/;
  return qrCodePattern.test(qrCode);
}
