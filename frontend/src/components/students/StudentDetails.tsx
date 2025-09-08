import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Student } from '@/types/student';
import { Edit, Trash2, Mail, Phone, Calendar, GraduationCap, User } from 'lucide-react';

interface StudentDetailsProps {
  student: Student;
  onEdit: () => void;
  onDelete: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const StudentDetails: React.FC<StudentDetailsProps> = ({
  student,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ENROLLED':
        return 'bg-green-100 text-green-800';
      case 'GRADUATED':
        return 'bg-blue-100 text-blue-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'WITHDRAWN':
        return 'bg-yellow-100 text-yellow-800';
      case 'DEFERRED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAcademicStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD_STANDING':
        return 'bg-green-100 text-green-800';
      case 'HONORS':
      case 'DEAN_LIST':
        return 'bg-blue-100 text-blue-800';
      case 'PROBATION':
      case 'WARNING':
        return 'bg-yellow-100 text-yellow-800';
      case 'DISMISSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {student.user.firstName} {student.user.lastName}
                </CardTitle>
                <p className="text-gray-600">{student.studentId}</p>
                <div className="flex gap-2 mt-2">
                  <Badge className={getStatusColor(student.enrollmentStatus)}>
                    {student.enrollmentStatus.replace('_', ' ')}
                  </Badge>
                  <Badge className={getAcademicStatusColor(student.academicStatus)}>
                    {student.academicStatus.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <Button variant="outline" onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="destructive" onClick={onDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">First Name</span>
                <p className="text-sm">{student.user.firstName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Last Name</span>
                <p className="text-sm">{student.user.lastName}</p>
              </div>
              {student.user.middleName && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Middle Name</span>
                  <p className="text-sm">{student.user.middleName}</p>
                </div>
              )}
              {student.user.dateOfBirth && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Date of Birth</span>
                  <p className="text-sm">{formatDate(student.user.dateOfBirth)}</p>
                </div>
              )}
              {student.user.gender && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Gender</span>
                  <p className="text-sm">{student.user.gender}</p>
                </div>
              )}
              {student.user.nationality && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Nationality</span>
                  <p className="text-sm">{student.user.nationality}</p>
                </div>
              )}
            </div>
            
            {student.user.address && (
              <div>
                <span className="text-sm font-medium text-gray-600">Address</span>
                <p className="text-sm">{student.user.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <a href={`mailto:${student.user.email}`} className="text-blue-600 hover:underline">
                {student.user.email}
              </a>
            </div>
            
            {student.user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <a href={`tel:${student.user.phone}`} className="text-blue-600 hover:underline">
                  {student.user.phone}
                </a>
              </div>
            )}

            {student.emergencyContact && (
              <div>
                <span className="text-sm font-medium text-gray-600">Emergency Contact</span>
                <p className="text-sm">{student.emergencyContact}</p>
              </div>
            )}

            {(student.parentGuardianName || student.parentGuardianPhone || student.parentGuardianEmail) && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Parent/Guardian</h4>
                {student.parentGuardianName && (
                  <p className="text-sm"><span className="font-medium">Name:</span> {student.parentGuardianName}</p>
                )}
                {student.parentGuardianPhone && (
                  <p className="text-sm"><span className="font-medium">Phone:</span> {student.parentGuardianPhone}</p>
                )}
                {student.parentGuardianEmail && (
                  <p className="text-sm"><span className="font-medium">Email:</span> {student.parentGuardianEmail}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Student ID</span>
                <p className="text-sm font-mono">{student.studentId}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Level</span>
                <p className="text-sm">Level {student.level}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Semester</span>
                <p className="text-sm">Semester {student.semester}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Academic Year</span>
                <p className="text-sm">{student.academicYear}</p>
              </div>
              {student.section && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Section</span>
                  <p className="text-sm">{student.section}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-600">Credits</span>
                <p className="text-sm">{student.credits}</p>
              </div>
              {student.cgpa && (
                <div>
                  <span className="text-sm font-medium text-gray-600">CGPA</span>
                  <p className="text-sm font-semibold">{student.cgpa.toFixed(2)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Program Information */}
        <Card>
          <CardHeader>
            <CardTitle>Program Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Program</span>
              <p className="text-sm font-semibold">{student.program.name}</p>
              <p className="text-xs text-gray-500">{student.program.code} • {student.program.degree}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Department</span>
              <p className="text-sm">{student.program.department.name}</p>
              <p className="text-xs text-gray-500">{student.program.department.code}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Faculty</span>
              <p className="text-sm">{student.program.department.faculty.name}</p>
              <p className="text-xs text-gray-500">{student.program.department.faculty.code}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Institution</span>
              <p className="text-sm">{student.program.department.faculty.institution.name}</p>
              <p className="text-xs text-gray-500">{student.program.department.faculty.institution.code}</p>
            </div>
          </CardContent>
        </Card>

        {/* Important Dates */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Important Dates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">Enrollment Date</span>
                <p className="text-sm">{formatDate(student.enrollmentDate)}</p>
              </div>
              
              {student.graduationDate && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Expected Graduation</span>
                  <p className="text-sm">{formatDate(student.graduationDate)}</p>
                </div>
              )}
              
              <div>
                <span className="text-sm font-medium text-gray-600">Last Updated</span>
                <p className="text-sm">{formatDate(student.updatedAt)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
