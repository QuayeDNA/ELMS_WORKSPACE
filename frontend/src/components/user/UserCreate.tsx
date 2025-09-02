import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/user.service';
import { facultyService } from '@/services/faculty.service';
import { institutionService } from '@/services/institution.service';
import { useAuthStore } from '@/stores/auth.store';
import { UserFormData, USER_ROLES, GENDERS, UserRole } from '@/types/user';
import { Faculty } from '@/types/faculty';
import { Institution } from '@/types/institution';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  title: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  institutionId: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
  institutionId?: number;
}

export const UserCreate: React.FC<UserCreateProps> = ({ onSuccess, onCancel, institutionId }) => {
  const { user: currentUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);

  // Determine access level
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAdmin = currentUser?.role === UserRole.ADMIN;
  const isFacultyAdmin = currentUser?.role === UserRole.FACULTY_ADMIN;

  // Determine available roles based on current user's role
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return USER_ROLES; // Super Admin can create any role
    } else if (isAdmin) {
      // Admin can create roles below them in their institution
      return USER_ROLES.filter(role => ![UserRole.SUPER_ADMIN].includes(role.value));
    } else if (isFacultyAdmin) {
      // Faculty Admin can create roles below them in their faculty
      return USER_ROLES.filter(role => 
        [UserRole.EXAMS_OFFICER, UserRole.SCRIPT_HANDLER, UserRole.INVIGILATOR, UserRole.LECTURER, UserRole.STUDENT].includes(role.value)
      );
    }
    return [];
  };

  // Determine default institution
  const getDefaultInstitutionId = () => {
    if (institutionId) return institutionId;
    if (!isSuperAdmin && currentUser?.institutionId) return currentUser.institutionId;
    return undefined;
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      institutionId: getDefaultInstitutionId()?.toString() || '',
      facultyId: isFacultyAdmin ? currentUser?.facultyId?.toString() || '' : '',
    },
  });

  const watchInstitutionId = watch('institutionId');

  // Fetch institutions (Super Admin only)
  useEffect(() => {
    const fetchInstitutions = async () => {
      if (!isSuperAdmin) return;

      setIsLoadingInstitutions(true);
      try {
        const response = await institutionService.getInstitutions();
        if (response.success && response.data) {
          setInstitutions(response.data.institutions);
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setIsLoadingInstitutions(false);
      }
    };

    fetchInstitutions();
  }, [isSuperAdmin]);

  // Fetch faculties when institution changes
  useEffect(() => {
    const fetchFaculties = async () => {
      const selectedInstitutionId = watchInstitutionId ? parseInt(watchInstitutionId) : null;
      if (!selectedInstitutionId) return;

      setIsLoadingFaculties(true);
      try {
        const response = await facultyService.getFaculties({
          institutionId: selectedInstitutionId
        });

        if (response.success && response.data) {
          setFaculties(response.data.faculties);
        } else {
          setFaculties([]);
        }
      } catch (error) {
        console.error('Error fetching faculties:', error);
        setFaculties([]);
      } finally {
        setIsLoadingFaculties(false);
      }
    };

    if (watchInstitutionId) {
      fetchFaculties();
      // Reset faculty selection when institution changes
      setValue('facultyId', '');
    }
  }, [watchInstitutionId, setValue]);

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData: UserFormData = {
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || '',
        title: data.title || '',
        role: data.role,
        status: 'ACTIVE', // Default status for new users
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        nationality: data.nationality || '',
        address: data.address || '',
        institutionId: data.institutionId || '',
        facultyId: data.facultyId || '',
        departmentId: data.departmentId || '',
      };

      const requestData = userService.transformFormData(formData);
      
      // Handle special "NONE_OPTIONAL" values
      if (requestData.facultyId && requestData.facultyId.toString() === 'NONE_OPTIONAL') {
        requestData.facultyId = undefined;
      }
      if (requestData.departmentId && requestData.departmentId.toString() === 'NONE_OPTIONAL') {
        requestData.departmentId = undefined;
      }
      
      const response = await userService.createUser(requestData);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to create user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            {...register('firstName')}
            placeholder="Enter first name"
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && (
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            {...register('lastName')}
            placeholder="Enter last name"
            className={errors.lastName ? 'border-red-500' : ''}
          />
          {errors.lastName && (
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            {...register('middleName')}
            placeholder="Enter middle name (optional)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="e.g., Dr., Prof., Mr."
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="Enter email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select onValueChange={(value) => setValue('role', value)}>
            <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableRoles().map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>
      </div>

      {/* Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="Enter password"
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            placeholder="Confirm password"
            className={errors.confirmPassword ? 'border-red-500' : ''}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder="Enter phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register('dateOfBirth')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select onValueChange={(value) => setValue('gender', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {GENDERS.map((gender) => (
                <SelectItem key={gender.value} value={gender.value}>
                  {gender.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationality</Label>
          <Input
            id="nationality"
            {...register('nationality')}
            placeholder="Enter nationality"
          />
        </div>
      </div>

      {/* Address */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder="Enter address"
          rows={3}
        />
      </div>

      {/* Organizational Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="institutionId">Institution</Label>
          <Select
            onValueChange={(value) => setValue('institutionId', value)}
            disabled={!isSuperAdmin}
            defaultValue={getDefaultInstitutionId()?.toString()}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !isSuperAdmin 
                  ? "Institution pre-selected" 
                  : isLoadingInstitutions
                    ? "Loading institutions..."
                    : "Select institution"
              } />
            </SelectTrigger>
            <SelectContent>
              {isSuperAdmin ? (
                institutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.id.toString()}>
                    {institution.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value={getDefaultInstitutionId()?.toString() || ''}>
                  {currentUser?.institutionId ? `Institution ID: ${currentUser.institutionId}` : 'Current Institution'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facultyId">Faculty</Label>
          <Select
            onValueChange={(value) => setValue('facultyId', value)}
            disabled={isLoadingFaculties || !watchInstitutionId || isFacultyAdmin}
            defaultValue={isFacultyAdmin ? currentUser?.facultyId?.toString() : ''}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isFacultyAdmin
                  ? "Faculty pre-selected"
                  : isLoadingFaculties
                    ? "Loading faculties..."
                    : !watchInstitutionId
                      ? "Select institution first"
                      : faculties.length === 0
                        ? "No faculties available"
                        : "Select faculty (optional)"
              } />
            </SelectTrigger>
            <SelectContent>
              {!isFacultyAdmin && <SelectItem value="NONE_OPTIONAL">None (optional)</SelectItem>}
              {faculties.map((faculty) => (
                <SelectItem key={faculty.id} value={faculty.id.toString()}>
                  {faculty.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <Select
            onValueChange={(value) => setValue('departmentId', value)}
            disabled={!watchInstitutionId}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !watchInstitutionId
                  ? "Select institution first"
                  : "Select department (optional)"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE_OPTIONAL">None (optional)</SelectItem>
              <SelectItem value="1">Computer Science</SelectItem>
              <SelectItem value="2">Mathematics</SelectItem>
              <SelectItem value="3">Physics</SelectItem>
              <SelectItem value="4">Chemistry</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};
