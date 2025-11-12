import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types/student';
import { format, addYears } from 'date-fns';
import { GraduationCap } from 'lucide-react';

interface StudentIdCardProps {
  student: Student;
  className?: string;
}

/**
 * Student ID Card Component
 * Displays a realistic student ID card with QR code
 * QR Code contains: studentId|userId|programId for efficient backend queries
 */
export function StudentIdCard({ student, className = '' }: StudentIdCardProps) {
  // Calculate expiry date based on registration date + program duration
  const calculateExpiryDate = (): string => {
    if (!student.admissionDate || !student.program?.durationYears) {
      return 'N/A';
    }

    const admissionDate = new Date(student.admissionDate);
    const expiryDate = addYears(admissionDate, student.program.durationYears);
    return format(expiryDate, 'MMM yyyy');
  };

  // Calculate registration date
  const getRegistrationDate = (): string => {
    if (!student.admissionDate) return 'N/A';
    return format(new Date(student.admissionDate), 'MMM dd, yyyy');
  };

  // Generate QR code data (efficient: only 3 IDs for backend queries)
  const generateQRData = (): string => {
    const qrData = {
      sid: student.studentId, // Student ID
      uid: student.userId, // User ID
      pid: student.programId, // Program ID
    };
    return JSON.stringify(qrData);
  };

  // Get institution name
  const institutionName =
    student.program?.department?.faculty?.institution?.name || 'Institution Name';

  // Get institution code
  const institutionCode =
    student.program?.department?.faculty?.institution?.code || '';

  // Get full name
  const fullName = `${student.user.firstName} ${student.user.middleName || ''} ${student.user.lastName}`.trim();

  return (
    <Card className={`relative overflow-hidden max-w-md mx-auto ${className}`}>
      {/* Card Header - Institution Branding */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-2">
          <GraduationCap className="h-10 w-10" />
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            STUDENT
          </Badge>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{institutionName}</h2>
        {institutionCode && (
          <p className="text-sm text-blue-100 font-medium">{institutionCode}</p>
        )}
      </div>

      {/* Card Body - Student Information */}
      <div className="p-6 space-y-4 bg-white">
        {/* Photo Placeholder & QR Code Section */}
        <div className="flex gap-4 items-start">
          {/* Student Photo Placeholder */}
          <div className="w-24 h-28 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center border-2 border-gray-300 flex-shrink-0">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-500">
                {student.user.firstName.charAt(0)}{student.user.lastName.charAt(0)}
              </div>
            </div>
          </div>

          {/* Student Details */}
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Full Name</p>
              <p className="text-sm font-bold text-gray-900">{fullName}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Student ID</p>
              <p className="text-sm font-mono font-bold text-blue-600">
                {student.studentId}
              </p>
            </div>

            {student.indexNumber && (
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold">Index Number</p>
                <p className="text-xs font-mono text-gray-700">{student.indexNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Program Information */}
        <div className="border-t pt-3 space-y-2">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Program</p>
            <p className="text-sm font-medium text-gray-900">
              {student.program?.name || 'N/A'}
            </p>
            {student.program?.code && (
              <p className="text-xs text-gray-600">{student.program.code}</p>
            )}
          </div>

          {student.program?.department && (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Department</p>
              <p className="text-xs text-gray-700">{student.program.department.name}</p>
            </div>
          )}
        </div>

        {/* Academic Details */}
        <div className="border-t pt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Level</p>
            <p className="text-sm font-medium text-gray-900">Level {student.level}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Semester</p>
            <p className="text-sm font-medium text-gray-900">Semester {student.semester}</p>
          </div>
        </div>

        {/* Dates */}
        <div className="border-t pt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Registration</p>
            <p className="text-xs text-gray-700">{getRegistrationDate()}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase font-semibold">Expires</p>
            <p className="text-xs text-gray-700">{calculateExpiryDate()}</p>
          </div>
        </div>

        {/* QR Code Section */}
        <div className="border-t pt-4 flex flex-col items-center">
          <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
            <QRCodeSVG
              value={generateQRData()}
              size={120}
              level="H"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Scan for student verification
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex justify-center pt-2">
          <Badge
            variant={student.enrollmentStatus === 'ACTIVE' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {student.enrollmentStatus}
          </Badge>
        </div>
      </div>

      {/* Card Footer - Validation Info */}
      <div className="bg-gray-50 px-6 py-3 border-t">
        <p className="text-xs text-gray-600 text-center">
          This ID card is property of {institutionName}
        </p>
        <p className="text-xs text-gray-500 text-center mt-1">
          Valid for {student.program?.durationYears || 'N/A'} years from registration
        </p>
      </div>
    </Card>
  );
}
