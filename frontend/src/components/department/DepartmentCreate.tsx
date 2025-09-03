import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { departmentService } from '@/services/department.service';
import { facultyService } from '@/services/faculty.service';
import { useAuth } from '@/hooks/useAuth';
import { CreateDepartmentRequest } from '@/types/department';

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
  description: z.string().optional(),
  facultyId: z.number().min(1, 'Faculty is required'),
  headOfDepartment: z.string().optional(),
  contactEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  establishedYear: z.number().min(1800).max(new Date().getFullYear()).optional().or(z.nan()),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

interface DepartmentCreateProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const DepartmentCreate: React.FC<DepartmentCreateProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: '',
      code: '',
      description: '',
      facultyId: 0,
      headOfDepartment: '',
      contactEmail: '',
      contactPhone: '',
      website: '',
    }
  });

  // Fetch available faculties based on user role
  const { data: facultiesData, isLoading: isFacultiesLoading } = useQuery({
    queryKey: ['faculties-for-department-create'],
    queryFn: () => {
      if (user?.role === 'SUPER_ADMIN') {
        return facultyService.getFaculties({});
      } else if (user?.role === 'ADMIN' && user.institutionId) {
        return facultyService.getFacultiesByInstitution(user.institutionId);
      } else if (user?.role === 'FACULTY_ADMIN' && user.facultyId) {
        return facultyService.getFacultyById(user.facultyId).then(faculty => ({
          faculties: [faculty]
        }));
      }
      return Promise.resolve({ faculties: [] });
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentRequest) => departmentService.createDepartment(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to create department');
    }
  });

  const onSubmit = (data: DepartmentFormData) => {
    setError(null);
    
    const requestData: CreateDepartmentRequest = {
      name: data.name,
      code: data.code,
      description: data.description || undefined,
      facultyId: data.facultyId,
      headOfDepartment: data.headOfDepartment || undefined,
      contactEmail: data.contactEmail || undefined,
      contactPhone: data.contactPhone || undefined,
      website: data.website || undefined,
      establishedYear: isNaN(data.establishedYear || 0) ? undefined : data.establishedYear,
    };

    createMutation.mutate(requestData);
  };

  if (isFacultiesLoading) {
    return <div className="p-4">Loading faculties...</div>;
  }

  const faculties = facultiesData?.faculties || [];

  if (faculties.length === 0) {
    return (
      <div className="p-4">
        <DialogHeader>
          <DialogTitle>Create Department</DialogTitle>
        </DialogHeader>
        <Alert className="mt-4">
          <AlertDescription>
            No faculties available. Please create a faculty first before adding departments.
          </AlertDescription>
        </Alert>
        <div className="flex justify-end mt-4">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>Create Department</DialogTitle>
      </DialogHeader>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Code</FormLabel>
                  <FormControl>
                    <Input placeholder="CS" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="facultyId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faculty</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select faculty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty.id} value={faculty.id.toString()}>
                        {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief description of the department..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="headOfDepartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Head of Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="establishedYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Established Year</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="2000"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="cs@university.edu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://cs.university.edu"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DepartmentCreate;
