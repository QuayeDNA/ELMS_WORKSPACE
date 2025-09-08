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
import { CreateDepartmentData } from '@/types/department';
import { Faculty } from '@/types/faculty';

const departmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  code: z.string().min(1, 'Department code is required'),
  type: z.string().min(1, 'Department type is required'),
  description: z.string().optional(),
  officeLocation: z.string().optional(),
  contactInfo: z.string().optional(),
  facultyId: z.number().min(1, 'Faculty is required'),
  hodId: z.number().optional(),
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
      type: 'department',
      description: '',
      officeLocation: '',
      contactInfo: '',
      facultyId: 0,
      hodId: undefined,
    }
  });

  // Fetch available faculties based on user role
  const { data: facultiesData, isLoading: isFacultiesLoading } = useQuery({
    queryKey: ['faculties-for-department-create'],
    queryFn: async () => {
      if (user?.role === 'SUPER_ADMIN') {
        const response = await facultyService.getFaculties({});
        return response.data || [];
      } else if (user?.role === 'ADMIN' && user.institutionId) {
        const response = await facultyService.getFacultiesByInstitution(user.institutionId);
        return response.data || [];
      } else if (user?.role === 'FACULTY_ADMIN' && user.facultyId) {
        const response = await facultyService.getFaculty(user.facultyId);
        return [response.data];
      }
      return [];
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentData) => departmentService.createDepartment(data),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message || 'Failed to create department');
    }
  });

  const onSubmit = (data: DepartmentFormData) => {
    setError(null);
    
    const requestData: CreateDepartmentData = {
      name: data.name,
      code: data.code,
      type: data.type,
      description: data.description || undefined,
      officeLocation: data.officeLocation || undefined,
      contactInfo: data.contactInfo || undefined,
      facultyId: data.facultyId,
      hodId: data.hodId || undefined,
    };

    createMutation.mutate(requestData);
  };

  if (isFacultiesLoading) {
    return <div className="p-4">Loading faculties...</div>;
  }

  const faculties = Array.isArray(facultiesData) ? facultiesData.filter(Boolean) : (facultiesData?.faculties || []);

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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="department">Department</SelectItem>
                      <SelectItem value="school">School</SelectItem>
                      <SelectItem value="institute">Institute</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      {faculties.filter((faculty): faculty is Faculty => faculty !== undefined).map((faculty: Faculty) => (
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
          </div>

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
              name="officeLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Building A, Room 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information</FormLabel>
                  <FormControl>
                    <Input placeholder="Phone: +1 (555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hodId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Head of Department (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="User ID of HOD"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
