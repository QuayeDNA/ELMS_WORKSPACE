import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Student, 
  EnrollmentStatus, 
  AcademicStatus 
} from '@/types/student';

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const StudentForm: React.FC<StudentFormProps> = ({
  student,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    // User fields
    email: '',
    firstName: '',
    lastName: '',
    middleName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    address: '',
    
    // Student specific fields
    studentId: '',
    programId: '',
    level: '',
    semester: '',
    academicYear: '',
    enrollmentStatus: EnrollmentStatus.ENROLLED,
    academicStatus: AcademicStatus.GOOD_STANDING,
    enrollmentDate: '',
    graduationDate: '',
    emergencyContact: '',
    parentGuardianName: '',
    parentGuardianPhone: '',
    parentGuardianEmail: '',
    section: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        email: student.user.email || '',
        firstName: student.user.firstName || '',
        lastName: student.user.lastName || '',
        middleName: student.user.middleName || '',
        phone: student.user.phone || '',
        dateOfBirth: student.user.dateOfBirth || '',
        gender: student.user.gender || '',
        nationality: student.user.nationality || '',
        address: student.user.address || '',
        studentId: student.studentId || '',
        programId: String(student.programId || ''),
        level: String(student.level || ''),
        semester: String(student.semester || ''),
        academicYear: student.academicYear || '',
        enrollmentStatus: student.enrollmentStatus,
        academicStatus: student.academicStatus,
        enrollmentDate: student.enrollmentDate || '',
        graduationDate: student.graduationDate || '',
        emergencyContact: student.emergencyContact || '',
        parentGuardianName: student.parentGuardianName || '',
        parentGuardianPhone: student.parentGuardianPhone || '',
        parentGuardianEmail: student.parentGuardianEmail || '',
        section: student.section || ''
      });
    }
  }, [student]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields validation
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.studentId) newErrors.studentId = 'Student ID is required';
    if (!formData.programId) newErrors.programId = 'Program is required';
    if (!formData.level) newErrors.level = 'Level is required';
    if (!formData.enrollmentDate) newErrors.enrollmentDate = 'Enrollment date is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (formData.phone && !/^[+]?[0-9\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      programId: parseInt(formData.programId),
      level: parseInt(formData.level),
      semester: formData.semester ? parseInt(formData.semester) : undefined
    };

    await onSubmit(submitData);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>
          {student ? 'Edit Student' : 'Create New Student'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <Label htmlFor="middleName">Middle Name</Label>
                <Input
                  id="middleName"
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Academic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="studentId">Student ID *</Label>
                <Input
                  id="studentId"
                  value={formData.studentId}
                  onChange={(e) => handleChange('studentId', e.target.value)}
                  className={errors.studentId ? 'border-red-500' : ''}
                />
                {errors.studentId && <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>}
              </div>

              <div>
                <Label htmlFor="programId">Program ID *</Label>
                <Input
                  id="programId"
                  type="number"
                  value={formData.programId}
                  onChange={(e) => handleChange('programId', e.target.value)}
                  className={errors.programId ? 'border-red-500' : ''}
                />
                {errors.programId && <p className="text-red-500 text-sm mt-1">{errors.programId}</p>}
              </div>

              <div>
                <Label htmlFor="level">Level *</Label>
                <Select value={formData.level} onValueChange={(value) => handleChange('level', value)}>
                  <SelectTrigger className={errors.level ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                    <SelectItem value="6">Level 6</SelectItem>
                  </SelectContent>
                </Select>
                {errors.level && <p className="text-red-500 text-sm mt-1">{errors.level}</p>}
              </div>

              <div>
                <Label htmlFor="semester">Semester</Label>
                <Select value={formData.semester} onValueChange={(value) => handleChange('semester', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Semester 1</SelectItem>
                    <SelectItem value="2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicYear">Academic Year</Label>
                <Input
                  id="academicYear"
                  value={formData.academicYear}
                  onChange={(e) => handleChange('academicYear', e.target.value)}
                  placeholder="e.g., 2023/2024"
                />
              </div>

              <div>
                <Label htmlFor="section">Section</Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => handleChange('section', e.target.value)}
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div>
                <Label htmlFor="enrollmentDate">Enrollment Date *</Label>
                <Input
                  id="enrollmentDate"
                  type="date"
                  value={formData.enrollmentDate}
                  onChange={(e) => handleChange('enrollmentDate', e.target.value)}
                  className={errors.enrollmentDate ? 'border-red-500' : ''}
                />
                {errors.enrollmentDate && <p className="text-red-500 text-sm mt-1">{errors.enrollmentDate}</p>}
              </div>

              <div>
                <Label htmlFor="graduationDate">Expected Graduation Date</Label>
                <Input
                  id="graduationDate"
                  type="date"
                  value={formData.graduationDate}
                  onChange={(e) => handleChange('graduationDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="enrollmentStatus">Enrollment Status</Label>
                <Select 
                  value={formData.enrollmentStatus} 
                  onValueChange={(value) => handleChange('enrollmentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={EnrollmentStatus.ENROLLED}>Enrolled</SelectItem>
                    <SelectItem value={EnrollmentStatus.DEFERRED}>Deferred</SelectItem>
                    <SelectItem value={EnrollmentStatus.WITHDRAWN}>Withdrawn</SelectItem>
                    <SelectItem value={EnrollmentStatus.GRADUATED}>Graduated</SelectItem>
                    <SelectItem value={EnrollmentStatus.SUSPENDED}>Suspended</SelectItem>
                    <SelectItem value={EnrollmentStatus.TRANSFERRED}>Transferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="academicStatus">Academic Status</Label>
                <Select 
                  value={formData.academicStatus} 
                  onValueChange={(value) => handleChange('academicStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AcademicStatus.GOOD_STANDING}>Good Standing</SelectItem>
                    <SelectItem value={AcademicStatus.PROBATION}>Probation</SelectItem>
                    <SelectItem value={AcademicStatus.WARNING}>Warning</SelectItem>
                    <SelectItem value={AcademicStatus.DISMISSED}>Dismissed</SelectItem>
                    <SelectItem value={AcademicStatus.HONORS}>Honors</SelectItem>
                    <SelectItem value={AcademicStatus.DEAN_LIST}>Dean's List</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Emergency & Parent Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Emergency Contact</Label>
                <Textarea
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleChange('emergencyContact', e.target.value)}
                  rows={3}
                  placeholder="Name, phone, relationship"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="parentGuardianName">Parent/Guardian Name</Label>
                  <Input
                    id="parentGuardianName"
                    value={formData.parentGuardianName}
                    onChange={(e) => handleChange('parentGuardianName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="parentGuardianPhone">Parent/Guardian Phone</Label>
                  <Input
                    id="parentGuardianPhone"
                    value={formData.parentGuardianPhone}
                    onChange={(e) => handleChange('parentGuardianPhone', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="parentGuardianEmail">Parent/Guardian Email</Label>
                  <Input
                    id="parentGuardianEmail"
                    type="email"
                    value={formData.parentGuardianEmail}
                    onChange={(e) => handleChange('parentGuardianEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : student ? 'Update Student' : 'Create Student'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
