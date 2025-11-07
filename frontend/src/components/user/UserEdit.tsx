import React, { useState, useEffect } from 'react'
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/user.service';
import { facultyService } from '@/services/faculty.service';
import { User, USER_ROLES, USER_STATUSES, GENDERS, UserRole } from '@/types/user';
import { Faculty } from '@/types/faculty';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  middleName: z.string().optional(),
  title: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  status: z.string().min(1, 'Status is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  institutionId: z.string().optional(),
  facultyId: z.string().optional(),
  departmentId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserEditProps {
  user: User;
  onSuccess: () => void;
  onCancel: () => void;
}

export const UserEdit: React.FC<UserEditProps> = ({ user, onSuccess, onCancel }) => {
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
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName || '',
      title: user.title || '',
      role: user.role,
      status: user.status,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      gender: user.gender || '',
      nationality: user.nationality || '',
      address: user.address || '',
      institutionId: user.institutionId?.toString() || '',
      facultyId: user.facultyId?.toString() || '',
      departmentId: user.departmentId?.toString() || '',
    },
  });

  useEffect(() => {
    setValue('firstName', user.firstName);
    setValue('lastName', user.lastName);
    setValue('middleName', user.middleName || '');
    setValue('title', user.title || '');
    setValue('role', user.role);
    setValue('status', user.status);
    setValue('phone', user.phone || '');
    setValue('dateOfBirth', user.dateOfBirth || '');
    setValue('gender', user.gender || '');
    setValue('nationality', user.nationality || '');
    setValue('address', user.address || '');
    setValue('institutionId', user.institutionId?.toString() || '');
    setValue('facultyId', user.facultyId?.toString() || '');
    setValue('departmentId', user.departmentId?.toString() || '');
  }, [user, setValue]);

  // Fetch faculties when institution changes
  useEffect(() => {
    const fetchFaculties = async () => {
      const institutionId = user.institutionId;
      if (!institutionId) return;

      setIsLoadingFaculties(true);
      try {
        const response = await facultyService.getFaculties({
          institutionId: institutionId
        });

        if (response.success && response.data) {
          setFaculties(response.data);
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
  }, [user.institutionId]);

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const updateData = {
        firstName: data.firstName,
        lastName: data.lastName,
        middleName: data.middleName || undefined,
        title: data.title || undefined,
        role: data.role as UserRole,
        status: data.status as typeof USER_STATUSES[number]['value'],
        phone: data.phone || undefined,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        nationality: data.nationality || undefined,
        address: data.address || undefined,
        institutionId: data.institutionId ? parseInt(data.institutionId) : undefined,
        facultyId: data.facultyId ? parseInt(data.facultyId) : undefined,
        departmentId: data.departmentId ? parseInt(data.departmentId) : undefined,
      };

      const response = await userService.updateUser(user.id, updateData);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to update user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
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

      {/* Role and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={user.role}
            onValueChange={(value) => setValue('role', value)}
          >
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

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={user.status}
            onValueChange={(value) => setValue('status', value)}
          >
            <SelectTrigger className={errors.status ? 'border-red-500' : ''}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {USER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.status && (
            <p className="text-red-500 text-sm">{errors.status.message}</p>
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
          <Select
            value={user.gender || ''}
            onValueChange={(value) => setValue('gender', value)}
          >
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
            value={user.institutionId?.toString() || ''}
            onValueChange={(value) => setValue('institutionId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select institution" />
            </SelectTrigger>
            <SelectContent>
              {user.institutionId && (
                <SelectItem key={`current-institution-${user.institutionId}`} value={user.institutionId.toString()}>
                  {user.institution?.name || 'Current Institution'}
                </SelectItem>
              )}
              {user.institutionId !== 1 && (
                <SelectItem key="sample-university" value="1">Sample University</SelectItem>
              )}
              {user.institutionId !== 2 && (
                <SelectItem key="tech-institute" value="2">Tech Institute</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="facultyId">Faculty</Label>
          <Select
            value={user.facultyId?.toString() || ''}
            onValueChange={(value) => setValue('facultyId', value)}
            disabled={isLoadingFaculties}
          >
            <SelectTrigger>
              <SelectValue placeholder={
                isLoadingFaculties
                  ? "Loading faculties..."
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
                <SelectItem value="NO_FACULTIES" disabled>
                  {isLoadingFaculties
                    ? "Loading..."
                    : "No faculties available"}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="departmentId">Department</Label>
          <Select
            value={user.departmentId?.toString() || ''}
            onValueChange={(value) => setValue('departmentId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE_OPTIONAL">None (optional)</SelectItem>
              {user.departmentId && (
                <SelectItem key={`current-department-${user.departmentId}`} value={user.departmentId.toString()}>
                  {user.department?.name || 'Current Department'}
                </SelectItem>
              )}
              {user.departmentId !== 1 && (
                <SelectItem key="department-cs" value="1">Computer Science</SelectItem>
              )}
              {user.departmentId !== 2 && (
                <SelectItem key="department-math" value="2">Mathematics</SelectItem>
              )}
              {user.departmentId !== 3 && (
                <SelectItem key="department-physics" value="3">Physics</SelectItem>
              )}
              {user.departmentId !== 4 && (
                <SelectItem key="department-chemistry" value="4">Chemistry</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update User'}
        </Button>
      </div>
    </form>
  );
};



