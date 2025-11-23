import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { publicExamService, type QRValidationResult, type CheckInResult } from '@/services/publicExam.service';
import { CheckCircle2, XCircle, Camera, CameraOff, Clock, MapPin, User, BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PublicExamCheckIn() {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<QRValidationResult | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize scanner on mount
  useEffect(() => {
    const qrScanner = new Html5Qrcode('qr-reader');
    setScanner(qrScanner);

    return () => {
      if (qrScanner.isScanning) {
        qrScanner.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    if (!scanner) return;

    try {
      setError(null);
      setValidationResult(null);
      setCheckInResult(null);

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
      toast.success('Camera activated');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMessage);
      toast.error('Camera Error', { description: errorMessage });
    }
  };

  const stopScanning = async () => {
    if (!scanner || !scanner.isScanning) return;

    try {
      await scanner.stop();
      setIsScanning(false);
      toast.info('Camera stopped');
    } catch (err) {
      console.error('Error stopping scanner:', err);
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    // Stop scanning immediately
    await stopScanning();

    setIsProcessing(true);
    try {
      // Validate QR code
      const validation = await publicExamService.validateQRCode(decodedText);
      setValidationResult(validation);

      if (validation.valid && validation.data?.canCheckIn) {
        // Automatically proceed with check-in
        const checkIn = await publicExamService.checkInStudent(decodedText);
        setCheckInResult(checkIn);

        if (checkIn.success) {
          toast.success('Check-In Successful!', {
            description: `Welcome ${checkIn.data?.student.name}`
          });
        } else {
          toast.error('Check-In Failed', {
            description: checkIn.message || 'Unable to complete check-in'
          });
        }
      } else {
        toast.warning('Cannot Check In', {
          description: validation.message || 'QR code validation failed'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process QR code';
      setError(errorMessage);
      toast.error('Processing Error', { description: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const onScanError = (err: string) => {
    // Ignore common scanning errors (camera continuously scanning)
    if (!err.includes('NotFoundException')) {
      console.error('Scan error:', err);
    }
  };

  const resetScanner = () => {
    setValidationResult(null);
    setCheckInResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Exam Check-In
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan your QR code to check in for your examination
          </p>
        </div>

        {/* Scanner Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR Code Scanner
            </CardTitle>
            <CardDescription>
              Position your QR code within the camera frame
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scanner View */}
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '300px' }}>
              <div id="qr-reader" className="w-full" />
              {!isScanning && !isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <div className="text-center space-y-4">
                    <CameraOff className="h-16 w-16 mx-auto text-gray-400" />
                    <p className="text-gray-300">Camera is off</p>
                  </div>
                </div>
              )}
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-16 w-16 mx-auto text-white animate-spin" />
                    <p className="text-white">Processing QR code...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scanner Controls */}
            <div className="flex gap-2">
              {!isScanning ? (
                <Button
                  onClick={startScanning}
                  disabled={isProcessing}
                  className="flex-1"
                  size="lg"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Camera
                </Button>
              ) : (
                <Button
                  onClick={stopScanning}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <CameraOff className="mr-2 h-4 w-4" />
                  Stop Camera
                </Button>
              )}
              {(validationResult || checkInResult || error) && (
                <Button
                  onClick={resetScanner}
                  variant="outline"
                  size="lg"
                >
                  Reset
                </Button>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Validation Result */}
        {validationResult && validationResult.data && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.valid ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                Validation Result
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Student Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Student:</span>
                </div>
                <div className="pl-6">
                  <p className="font-semibold text-lg">
                    {validationResult.data.student.firstName} {validationResult.data.student.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    ID: {validationResult.data.student.studentNumber}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Exam Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium">Examination:</span>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="font-semibold">
                    {validationResult.data.exam.courseCode} - {validationResult.data.exam.courseName}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(validationResult.data.exam.examDate).toLocaleDateString()} | {' '}
                      {validationResult.data.exam.startTime} - {validationResult.data.exam.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-3 w-3" />
                    <span>{validationResult.data.exam.venue}</span>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Status */}
              <div className="space-y-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
                <div className="flex gap-2 flex-wrap">
                  {validationResult.data.alreadyCheckedIn && (
                    <Badge variant="secondary">Already Checked In</Badge>
                  )}
                  {validationResult.data.checkInWindow.isOpen ? (
                    <Badge variant="default" className="bg-green-600">Check-In Window Open</Badge>
                  ) : (
                    <Badge variant="destructive">Check-In Window Closed</Badge>
                  )}
                </div>
              </div>

              {/* Check-in Window Info */}
              {!validationResult.data.checkInWindow.isOpen && (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Check-in opens at {new Date(validationResult.data.checkInWindow.opens).toLocaleTimeString()}
                    and closes at {new Date(validationResult.data.checkInWindow.closes).toLocaleTimeString()}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Check-In Success Result */}
        {checkInResult && checkInResult.success && checkInResult.data && (
          <Card className="shadow-lg border-green-200 dark:border-green-800">
            <CardHeader className="bg-green-50 dark:bg-green-950">
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-6 w-6" />
                Check-In Successful!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold">
                  Welcome, {checkInResult.data.student.name}!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  You have been checked in for:
                </p>
                <p className="text-lg font-semibold">
                  {checkInResult.data.exam.courseCode} - {checkInResult.data.exam.courseName}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>{checkInResult.data.exam.venue}</span>
                </div>
                <div className="pt-4">
                  <Badge variant="outline" className="text-sm">
                    Checked in at {new Date(checkInResult.data.timestamp).toLocaleTimeString()}
                  </Badge>
                </div>
              </div>

              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  Please proceed to your assigned seat and wait for the exam to begin.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="shadow-lg bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-blue-900 dark:text-blue-100">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">1.</span>
                <span>Click "Start Camera" to activate the QR scanner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">2.</span>
                <span>Position your exam QR code within the camera frame</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">3.</span>
                <span>Hold steady until the code is scanned automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">4.</span>
                <span>Wait for confirmation before proceeding to your seat</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">5.</span>
                <span>Check-in is available 30 minutes before exam start time</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
