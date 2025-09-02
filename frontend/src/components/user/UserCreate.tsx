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
import { UserFormData, USER_ROLES, GENDERS } from '@/types/user';
import { Faculty } from '@/types/faculty';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      institutionId: institutionId?.toString() || '',
    },
  });

  // Fetch faculties when institution changes
  useEffect(() => {
    const fetchFaculties = async () => {
      if (!institutionId) return;

      setIsLoadingFaculties(true);
      try {
        const response = await facultyService.getFaculties({
          institutionId: parseInt(institutionId.toString())
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

    fetchFaculties();
  }, [institutionId]);

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
              {USER_ROLES.map((role) => (
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
            disabled={!!institutionId}
          >
            <SelectTrigger>
              <SelectValue placeholder={institutionId ? "Institution pre-selected" : "Select institution"} />
            </SelectTrigger>
            <SelectContent>
              {institutionId ? (
                <SelectItem value={institutionId.toString()}>
                  Current Institution (ID: {institutionId})
                </SelectItem>
              ) : (
                <>
                  <SelectItem value="1">Sample University</SelectItem>
                  <SelectItem value="2">Tech Institute</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facultyId">Faculty</Label>
          <Select
            onValueChange={(value) => setValue('facultyId', value)}
            disabled={isLoadingFaculties || !institutionId}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoadingFaculties
                  ? "Loading faculties..."
                  : !institutionId
                    ? "Select institution first"
                    : faculties.length === 0
                      ? "No faculties available"
                      : "Select faculty"
              } />
            </SelectTrigger>
            <SelectContent>
              {faculties.length > 0 ? (
                faculties.map((faculty) => (
                  <SelectItem
                    key={`faculty-${faculty.id}`}
                    value={faculty.id.toString()}
                  >
                    {faculty.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  {isLoadingFaculties
                    ? "Loading..."
                    : !institutionId
                      ? "Select institution first"
                      : "No faculties available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <Select
            onValueChange={(value) => setValue('departmentId', value)}
            disabled={!institutionId}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                !institutionId
                  ? "Select institution first"
                  : "Select department (optional)"
              } />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None (optional)</SelectItem>
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
