import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/Loading';
import { QrCode, Download, RefreshCw, Users, UserCheck, Clock, XCircle } from 'lucide-react';
import { qrCodeService } from '@/services/qrCode.service';
import { QRCodeData } from '@/types/examLogistics';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CardDescription } from '@/components/ui/card';

type QRCodeType = 'student_verification' | 'invigilator_checkin' | 'venue_access';

interface QRCodeGeneratorProps {
  type: QRCodeType;
  examEntryId: number;
  studentId?: number;
  invigilatorId?: number;
  venueId: number;
  title: string;
  description?: string;
}

export function QRCodeGenerator({
  type,
  examEntryId,
  studentId,
  invigilatorId,
  venueId,
  title,
  description
}: QRCodeGeneratorProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQR = useCallback(async () => {
    try {
      setLoading(true);

      // Generate QR code data based on type
      let qrData: QRCodeData;
      switch (type) {
        case 'student_verification':
          if (!studentId) throw new Error('Student ID required for student verification');
          qrData = qrCodeService.generateStudentQRCode(examEntryId, studentId, venueId);
          break;
        case 'invigilator_checkin':
          if (!invigilatorId) throw new Error('Invigilator ID required for invigilator check-in');
          qrData = qrCodeService.generateInvigilatorQRCode(examEntryId, invigilatorId, venueId);
          break;
        case 'venue_access':
          qrData = qrCodeService.generateVenueAccessQRCode(examEntryId, venueId);
          break;
        default:
          throw new Error('Invalid QR code type');
      }

      // Generate QR code URL
      const qrCodeUrl = await qrCodeService.generateQRCodeURL(qrData);
      setQrCode(qrCodeUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [type, examEntryId, studentId, invigilatorId, venueId]);

  const downloadQR = () => {
    if (!qrCode) return;

    const id = studentId || invigilatorId || examEntryId;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${type}-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : qrCode ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-48 h-48 border rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateQR}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadQR}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Failed to generate QR code</p>
            <Button onClick={generateQR} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Student QR Code Generator
export function StudentQRCodeGenerator({ studentId, examEntryId, venueId }: {
  studentId: number;
  examEntryId: number;
  venueId: number;
}) {
  return (
    <QRCodeGenerator
      type="student_verification"
      examEntryId={examEntryId}
      studentId={studentId}
      venueId={venueId}
      title="Student Check-in QR Code"
      description="Scan this QR code at the exam venue for check-in verification"
    />
  );
}

// Invigilator QR Code Generator
export function InvigilatorQRCodeGenerator({ assignmentId, invigilatorId, venueId }: {
  assignmentId: number;
  invigilatorId: number;
  venueId: number;
}) {
  return (
    <QRCodeGenerator
      type="invigilator_checkin"
      examEntryId={assignmentId}
      invigilatorId={invigilatorId}
      venueId={venueId}
      title="Invigilator Check-in QR Code"
      description="Scan this QR code to confirm invigilator presence at the venue"
    />
  );
}

// Bulk QR Code Generator for Students
export function BulkStudentQRGenerator({ students, examEntryId, venueId }: {
  students: Array<{ id: number; name: string; registrationNumber: string }>;
  examEntryId: number;
  venueId: number;
}) {
  const [generatedQRs, setGeneratedQRs] = useState<Array<{ student: { id: number; name: string; registrationNumber: string }; qrCode: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateBulkQRs = async () => {
    try {
      setLoading(true);
      setProgress(0);
      const results = [];

      for (let i = 0; i < students.length; i++) {
        const student = students[i];
        const qrData = qrCodeService.generateStudentQRCode(examEntryId, student.id, venueId);
        const qrCodeUrl = await qrCodeService.generateQRCodeURL(qrData);

        results.push({
          student,
          qrCode: qrCodeUrl
        });

        setProgress(((i + 1) / students.length) * 100);
      }

      setGeneratedQRs(results);
      toast.success(`Generated ${results.length} QR codes`);
    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
      toast.error('Failed to generate QR codes');
    } finally {
      setLoading(false);
    }
  };

  const downloadAllQRs = () => {
    generatedQRs.forEach(({ student, qrCode }, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = qrCode;
        link.download = `${student.registrationNumber}-qrcode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, index * 100); // Stagger downloads to avoid browser blocking
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5 text-primary" />
          Bulk Student QR Code Generation
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate QR codes for {students.length} students
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm">{students.length} students</span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-green-600" />
            <span className="text-sm">{generatedQRs.length} generated</span>
          </div>
        </div>

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Generating QR codes...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={generateBulkQRs}
            disabled={loading || students.length === 0}
            className="flex-1"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="h-4 w-4 mr-2" />
                Generate All QR Codes
              </>
            )}
          </Button>
          {generatedQRs.length > 0 && (
            <Button
              variant="outline"
              onClick={downloadAllQRs}
            >
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          )}
        </div>

        {generatedQRs.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h4 className="font-medium">Generated QR Codes:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generatedQRs.map(({ student, qrCode }) => (
                <div key={student.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.registrationNumber}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">Ready</Badge>
                  </div>
                  <img
                    src={qrCode}
                    alt={`QR Code for ${student.name}`}
                    className="w-20 h-20 mx-auto border rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// QR Code Display Component for printing/distribution
export function QRCodeDisplay({ qrCode, title, subtitle }: {
  qrCode: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="qr-code-display bg-white p-6 rounded-lg shadow-lg max-w-sm mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
      </div>

      <div className="flex justify-center mb-4">
        <img
          src={qrCode}
          alt="QR Code"
          className="w-48 h-48 border-2 border-gray-300 rounded-lg"
        />
      </div>

      <div className="text-center text-xs text-gray-500">
        <p>Scan this QR code for check-in verification</p>
        <p className="mt-1">Generated on {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

// QR Code Validation Component
export function QRCodeValidator({ qrData, onValidate }: {
  qrData: string;
  onValidate: (isValid: boolean, data?: QRCodeData) => void;
}) {
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    const validate = async () => {
      try {
        setValidating(true);
        const validationResult = qrCodeService.scanQRCode(qrData);
        onValidate(validationResult.success, validationResult.data);
      } catch (error) {
        console.error('Error validating QR code:', error);
        onValidate(false);
      } finally {
        setValidating(false);
      }
    };

    if (qrData) {
      validate();
    }
  }, [qrData, onValidate]);

  if (validating) {
    return (
      <div className="flex items-center justify-center py-4">
        <LoadingSpinner />
        <span className="ml-2 text-sm">Validating QR code...</span>
      </div>
    );
  }

  return null; // The parent component will handle displaying the result
}

// Main QR Code Components Container
export function QRCodeComponents() {
  const [activeTab, setActiveTab] = useState<'generate' | 'bulk' | 'validate'>('generate');
  const [qrData, setQrData] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; data?: QRCodeData } | null>(null);

  const handleValidation = (isValid: boolean, data?: QRCodeData) => {
    setValidationResult({ isValid, data });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Generate QR Codes</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Generation</TabsTrigger>
          <TabsTrigger value="validate">Validate QR Code</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Student Check-in QR Code</h3>
              <StudentQRCodeGenerator
                studentId={1}
                examEntryId={1}
                venueId={1}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Invigilator Check-in QR Code</h3>
              <InvigilatorQRCodeGenerator
                assignmentId={1}
                invigilatorId={1}
                venueId={1}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-6">
          <BulkStudentQRGenerator
            students={[
              { id: 1, name: 'John Doe', registrationNumber: 'STU001' },
              { id: 2, name: 'Jane Smith', registrationNumber: 'STU002' },
              { id: 3, name: 'Bob Johnson', registrationNumber: 'STU003' },
            ]}
            examEntryId={1}
            venueId={1}
          />
        </TabsContent>

        <TabsContent value="validate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>QR Code Validation</CardTitle>
              <CardDescription>
                Enter QR code data to validate its authenticity and extract information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qr-data">QR Code Data</Label>
                <Textarea
                  id="qr-data"
                  placeholder="Paste QR code data here..."
                  value={qrData}
                  onChange={(e) => setQrData(e.target.value)}
                  rows={4}
                />
              </div>
              {qrData && (
                <QRCodeValidator qrData={qrData} onValidate={handleValidation} />
              )}
              {validationResult && (
                <div className={`p-4 rounded-lg border ${validationResult.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center gap-2">
                    {validationResult.isValid ? (
                      <UserCheck className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className={`font-medium ${validationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                      {validationResult.isValid ? 'Valid QR Code' : 'Invalid QR Code'}
                    </span>
                  </div>
                  {validationResult.isValid && validationResult.data && (
                    <div className="mt-2 text-sm text-green-700">
                      <p>Type: {validationResult.data.type}</p>
                      {validationResult.data.type === 'student_verification' && validationResult.data.studentId && (
                        <p>Student ID: {validationResult.data.studentId}</p>
                      )}
                      {validationResult.data.type === 'invigilator_checkin' && validationResult.data.invigilatorId && (
                        <p>Invigilator ID: {validationResult.data.invigilatorId}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
