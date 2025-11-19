import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Student } from '@/types/student';
import { format, addYears } from 'date-fns';
import { GraduationCap, User } from 'lucide-react';

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
      uid: student.id, // User ID
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
  const fullName = `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim();

  return (
    <Card className={`relative overflow-hidden w-full gap-0 py-0 ${className}`}>
      {/* Horizontal Layout Container */}
      <div className="flex flex-col lg:flex-row">
        {/* Left Section - Photo and Basic Info */}
        <div className="flex-1 bg-linear-to-r from-blue-600 to-indigo-700 text-white p-6">
          <div className="flex items-center gap-4 mb-4">
            <GraduationCap className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold tracking-tight">{institutionName}</h2>
              {institutionCode && (
                <p className="text-sm text-blue-100 font-medium">{institutionCode}</p>
              )}
            </div>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 ml-auto">
              STUDENT
            </Badge>
          </div>

          <div className="flex gap-4 items-start">
            {/* Student Photo Placeholder */}
            <div className="w-50 h-50 bg-white/20 rounded-lg flex items-center justify-center border-2 border-white/30 shrink-0">
              <User className="h-12 w-12 text-white/80" />
            </div>

            {/* Basic Student Details */}
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-xs text-blue-100 uppercase font-semibold">Full Name</p>
                <p className="text-lg font-bold text-white">{fullName}</p>
              </div>

              <div>
                <p className="text-xs text-blue-100 uppercase font-semibold">Student ID</p>
                <p className="text-base font-mono font-bold text-white">
                  {student.studentId}
                </p>
              </div>

              {student.indexNumber && (
                <div>
                  <p className="text-xs text-blue-100 uppercase font-semibold">Index Number</p>
                  <p className="text-sm font-mono text-blue-100">{student.indexNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Academic Details and QR */}
        <div className="flex-1 bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Academic Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase">
                Academic Details
              </h4>

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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Level</p>
                  <p className="text-sm font-medium text-gray-900">Level {student.level}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Semester</p>
                  <p className="text-sm font-medium text-gray-900">Semester {student.semester}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Registration</p>
                  <p className="text-xs text-gray-700">{getRegistrationDate()}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">Expires</p>
                  <p className="text-xs text-gray-700">{calculateExpiryDate()}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-2">
                <Badge
                  variant={student.enrollmentStatus === 'ACTIVE' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {student.enrollmentStatus}
                </Badge>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 shadow-sm">
                <QRCodeSVG
                  value={generateQRData()}
                  size={180}
                  level="H"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center font-medium">
                Scan for verification
              </p>
            </div>
          </div>
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
