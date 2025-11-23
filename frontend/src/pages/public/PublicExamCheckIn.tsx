import { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { publicExamService, type IndexNumberValidationResult, type CheckInResult } from '@/services/publicExam.service';
import { CheckCircle2, XCircle, Camera, CameraOff, Clock, MapPin, User, BookOpen, AlertCircle, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export function PublicExamCheckIn() {
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [validationResult, setValidationResult] = useState<IndexNumberValidationResult | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [checkInResult, setCheckInResult] = useState<CheckInResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedIndexNumber, setScannedIndexNumber] = useState<string | null>(null);

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
      setSelectedExamId(null);
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
      // Store the scanned index number for later use
      setScannedIndexNumber(decodedText);

      // Validate index number (QR code contains student's index number)
      const response = await publicExamService.validateIndexNumber(decodedText);

      // Backend wraps result in 'data' property
      const validation = response.success && response.data ? response.data : response;
      setValidationResult(validation);

      if (validation && validation.student && validation.activeExams) {
        const { activeExams } = validation;

        if (activeExams.length === 0) {
          toast.warning('No Active Exams', {
            description: 'You have no exams available for check-in at this time.'
          });
        } else if (activeExams.length === 1) {
          // Auto check-in for single exam
          const exam = activeExams[0];
          const canCheckIn = exam.checkIn?.canCheckIn || (exam.checkInWindow?.isOpen && !exam.registration.isPresent);

          if (canCheckIn) {
            await handleCheckIn(decodedText, exam.examEntry.id);
          } else {
            const message = exam.checkIn?.message || 'Check-in is not available at this time';
            toast.info('Cannot Check In', {
              description: message
            });
          }
        } else {
          // Multiple exams - let user choose
          toast.success('Index Number Validated', {
            description: `Found ${activeExams.length} active exams. Please select one.`
          });
        }
      } else {
        toast.error('Validation Failed', {
          description: response.message || 'Unable to validate index number'
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process QR code';
      setError(errorMessage);
      toast.error('Error', { description: errorMessage });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckIn = async (indexNumber: string, examEntryId: number) => {
    setIsProcessing(true);
    try {
      const checkIn = await publicExamService.checkInStudent(indexNumber, examEntryId);

      // Handle response properly - check for success field
      if (checkIn && checkIn.success) {
        setCheckInResult(checkIn);
        toast.success('Check-In Successful!', {
          description: `Welcome ${checkIn.student?.name || ''}`,
          duration: 5000
        });
        setSelectedExamId(examEntryId);
      } else {
        // Handle error response with message
        toast.error('Check-In Failed', {
          description: checkIn?.message || 'Unable to complete check-in',
          duration: 6000
        });
      }
    } catch (err: any) {
      // Handle network/API errors
      const errorMessage = err?.response?.data?.message || err?.message || 'Check-in failed';
      toast.error('Check-In Error', {
        description: errorMessage,
        duration: 6000
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExamSelection = async (examEntryId: number) => {
    if (!scannedIndexNumber) {
      toast.error('Error', { description: 'No index number found. Please scan again.' });
      return;
    }
    await handleCheckIn(scannedIndexNumber, examEntryId);
  };

  const onScanError = (error: string) => {
    // Suppress continuous error messages
    // Only log critical errors
    if (error.includes('NotFoundError') || error.includes('NotAllowedError')) {
      console.error('QR scan error:', error);
    }
  };

  const resetScan = () => {
    setValidationResult(null);
    setSelectedExamId(null);
    setCheckInResult(null);
    setError(null);
    setScannedIndexNumber(null);
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
                  onClick={resetScan}
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

        {/* Validation Result - Student Info & Active Exams */}
        {validationResult && validationResult.student && (
          <>
            {/* Student Information Card */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  Student Verified
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-semibold text-lg">
                  {validationResult.student.firstName} {validationResult.student.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Index Number: {validationResult.student.indexNumber}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email: {validationResult.student.email}
                </p>
              </CardContent>
            </Card>

            {/* Active Exams Selection */}
            {validationResult.activeExams && validationResult.activeExams.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {validationResult.activeExams.length === 1
                    ? 'Your Exam Today'
                    : `Select Your Exam (${validationResult.activeExams.length} available)`}
                </h3>
                <div className="space-y-3">
                  {validationResult.activeExams.map((exam) => {
                    // Handle both checkIn and checkInWindow structures
                    const isCheckInOpen = exam.checkInWindow?.isOpen ?? exam.checkIn?.isOpen ?? false;
                    const canCheckIn = exam.checkIn?.canCheckIn ?? (isCheckInOpen && !exam.registration.isPresent);
                    const checkInMessage = exam.checkIn?.message || '';

                    return (
                      <Card
                        key={exam.examEntry.id}
                        className={`shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                          selectedExamId === exam.examEntry.id
                            ? 'border-blue-500 border-2'
                            : 'hover:border-blue-300'
                        } ${
                          exam.registration.isPresent
                            ? 'bg-green-50 dark:bg-green-950 border-green-300'
                            : ''
                        }`}
                        onClick={() =>
                          canCheckIn && handleExamSelection(exam.examEntry.id)
                        }
                      >
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            {/* Course Info */}
                            <div>
                            <p className="font-semibold text-lg">
                              {exam.examEntry.courseCode} - {exam.examEntry.courseName}
                            </p>
                          </div>

                          {/* Time and Venue */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock className="h-4 w-4" />
                              <span>
                                {exam.examEntry.startTime} - {exam.examEntry.endTime}
                              </span>
                              <Badge variant="outline" className="ml-2">
                                {exam.examEntry.duration} min
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <MapPin className="h-4 w-4" />
                              <span>{exam.examEntry.venue}</span>
                            </div>
                            {exam.registration.seatNumber && (
                              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Seat:</span>
                                <Badge variant="secondary">{exam.registration.seatNumber}</Badge>
                              </div>
                            )}
                          </div>

                          <Separator />

                          {/* Status Badges */}
                          <div className="flex gap-2 flex-wrap items-center">
                            {exam.registration.isPresent ? (
                              <>
                                <Badge variant="default" className="bg-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Checked In
                                </Badge>
                                {exam.registration.isVerified && (
                                  <Badge variant="outline">Verified</Badge>
                                )}
                              </>
                            ) : isCheckInOpen ? (
                              <Badge variant="default" className="bg-blue-600">
                                Check-In Available
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Check-In Closed</Badge>
                            )}
                            {checkInMessage && (
                              <Badge variant="outline" className="text-xs">
                                {checkInMessage}
                              </Badge>
                            )}
                          </div>

                          {/* Check-in Window Info */}
                          {!exam.registration.isPresent && !isCheckInOpen && exam.checkInWindow && (
                            <Alert variant="destructive">
                              <Clock className="h-4 w-4" />
                              <AlertDescription className="text-sm">
                                Check-in window:{' '}
                                {new Date(exam.checkInWindow.opens).toLocaleTimeString()} -{' '}
                                {new Date(exam.checkInWindow.closes).toLocaleTimeString()}
                              </AlertDescription>
                            </Alert>
                          )}

                          {/* Action Hint */}
                          {canCheckIn && (
                            <div className="pt-2">
                              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                                Click to check in →
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                  })}
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No active exams found. Check-in is only available during the exam check-in window
                  (30 minutes before exam start).
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Validation Error */}
        {validationResult && !validationResult.student && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {validationResult.message || 'Invalid index number or no active exams found.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Check-In Success Result */}
        {checkInResult && checkInResult.success && (
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
                  Welcome, {checkInResult.student.name}!
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  You have been checked in for:
                </p>
                <p className="text-lg font-semibold">
                  {checkInResult.exam.courseCode} - {checkInResult.exam.courseName}
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>Venue: {checkInResult.exam.venue}</span>
                </div>
                {checkInResult.exam.seatNumber && (
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      Seat: {checkInResult.exam.seatNumber}
                    </Badge>
                  </div>
                )}
                <div className="pt-4">
                  <Badge variant="outline" className="text-sm">
                    Checked in at {new Date(checkInResult.timestamp).toLocaleTimeString()}
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
                <span>Position your student index number QR code within the camera frame</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">3.</span>
                <span>Hold steady until the code is scanned automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">4.</span>
                <span>Select your exam from the list if you have multiple exams today</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">5.</span>
                <span>Wait for confirmation and note your seat number before proceeding</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold mt-0.5">6.</span>
                <span>Check-in is available 30 minutes before exam start time</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
