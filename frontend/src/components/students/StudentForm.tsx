import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
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
  CreateStudentRequest,
  UpdateStudentRequest
} from '@/types/student';

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: CreateStudentRequest | UpdateStudentRequest) => Promise<void>;
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
    password: '', // Only for create mode
    firstName: '',
    lastName: '',
    middleName: '',
    title: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    address: '',
    
    // Profile fields
    studentId: '',
    indexNumber: '',
    programId: '',
    level: '',
    semester: '',
    academicYear: '',
    admissionDate: '',
    expectedGraduation: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    emergencyContact: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (student) {
      setFormData({
        email: student.user.email || '',
        password: '', // Not shown for edit mode
        firstName: student.user.firstName || '',
        lastName: student.user.lastName || '',
        middleName: student.user.middleName || '',
        title: student.user.title || '',
        phone: student.user.phone || '',
        dateOfBirth: student.user.dateOfBirth || '',
        gender: student.user.gender || '',
        nationality: student.user.nationality || '',
        address: student.user.address || '',
        studentId: student.studentId || '',
        indexNumber: student.indexNumber || '',
        programId: String(student.programId || ''),
        level: String(student.level || ''),
        semester: String(student.semester || ''),
        academicYear: student.academicYear || '',
        admissionDate: student.admissionDate || '',
        expectedGraduation: student.expectedGraduation || '',
        guardianName: student.guardianName || '',
        guardianPhone: student.guardianPhone || '',
        guardianEmail: student.guardianEmail || '',
        emergencyContact: student.emergencyContact || ''
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
    if (!formData.semester) newErrors.semester = 'Semester is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';
    if (!student && !formData.password) newErrors.password = 'Password is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation
    if (formData.phone && !/^[+]?[0-9\s\-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    // Password validation (only for create mode)
    if (!student && formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (student) {
      // Update mode - return UpdateStudentRequest structure
      const updateData: UpdateStudentRequest = {
        user: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          title: formData.title,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nationality: formData.nationality,
          address: formData.address,
        },
        profile: {
          indexNumber: formData.indexNumber,
          level: parseInt(formData.level),
          semester: parseInt(formData.semester),
          academicYear: formData.academicYear,
          programId: parseInt(formData.programId),
          admissionDate: formData.admissionDate,
          expectedGraduation: formData.expectedGraduation,
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          guardianEmail: formData.guardianEmail,
          emergencyContact: formData.emergencyContact,
        }
      };
      await onSubmit(updateData);
    } else {
      // Create mode - return CreateStudentRequest structure
      const createData: CreateStudentRequest = {
        user: {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          middleName: formData.middleName,
          title: formData.title,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nationality: formData.nationality,
          address: formData.address,
        },
        profile: {
          studentId: formData.studentId,
          indexNumber: formData.indexNumber,
          level: parseInt(formData.level),
          semester: parseInt(formData.semester),
          academicYear: formData.academicYear,
          programId: parseInt(formData.programId),
          admissionDate: formData.admissionDate,
          expectedGraduation: formData.expectedGraduation,
          guardianName: formData.guardianName,
          guardianPhone: formData.guardianPhone,
          guardianEmail: formData.guardianEmail,
          emergencyContact: formData.emergencyContact,
        }
      };
      await onSubmit(createData);
    }
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

              {!student && (
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
              )}

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
                <Label htmlFor="programId">Program *</Label>
                <Input
                  id="programId"
                  type="number"
                  value={formData.programId}
                  onChange={(e) => handleChange('programId', e.target.value)}
                  className={errors.programId ? 'border-red-500' : ''}
                  placeholder="Enter program ID"
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
                <Label htmlFor="admissionDate">Admission Date</Label>
                <Input
                  id="admissionDate"
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => handleChange('admissionDate', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="expectedGraduation">Expected Graduation Date</Label>
                <Input
                  id="expectedGraduation"
                  type="date"
                  value={formData.expectedGraduation}
                  onChange={(e) => handleChange('expectedGraduation', e.target.value)}
                />
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
                  <Label htmlFor="guardianName">Guardian Name</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardianName}
                    onChange={(e) => handleChange('guardianName', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="guardianPhone">Guardian Phone</Label>
                  <Input
                    id="guardianPhone"
                    value={formData.guardianPhone}
                    onChange={(e) => handleChange('guardianPhone', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="guardianEmail">Guardian Email</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={formData.guardianEmail}
                    onChange={(e) => handleChange('guardianEmail', e.target.value)}
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



