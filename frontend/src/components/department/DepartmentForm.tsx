import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { departmentService } from "@/services/department.service";
import { facultyService } from "@/services/faculty.service";
import { useAuth } from "@/hooks/useAuth";
import { DepartmentFormProps, DepartmentType, Faculty } from "@/types/shared";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  code: z.string().min(1, "Department code is required"),
  type: z.enum(["department", "school", "institute"], {
    message: "Department type is required",
  }),
  description: z.string().optional(),
  officeLocation: z.string().optional(),
  contactInfo: z.string().optional(),
  facultyId: z.number().min(1, "Faculty is required"),
  hodId: z.number().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  mode,
  department,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const isEditMode = mode === "edit";
  const dialogTitle = isEditMode
    ? `Edit Department: ${department?.name}`
    : "Create Department";
  const submitButtonText = isEditMode ? "Save Changes" : "Create Department";
  const submitButtonLoadingText = isEditMode ? "Saving..." : "Creating...";

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: department?.name || "",
      code: department?.code || "",
      type: department?.type || "department",
      description: department?.description || "",
      officeLocation: department?.officeLocation || "",
      contactInfo: department?.contactInfo || "",
      facultyId: department?.facultyId || 0,
      hodId: department?.hodId || undefined,
    },
  });

  // Update form when department prop changes (for edit mode)
  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        code: department.code,
        type: department.type,
        description: department.description || "",
        officeLocation: department.officeLocation || "",
        contactInfo: department.contactInfo || "",
        facultyId: department.facultyId,
        hodId: department.hodId || undefined,
      });
    }
  }, [department, form]);

  // Fetch available faculties based on user role
  const { data: facultiesData, isLoading: isFacultiesLoading } = useQuery({
    queryKey: [
      "faculties-for-department-form",
      user?.role,
      user?.institutionId,
      user?.facultyId,
    ],
    queryFn: async () => {
      if (user?.role === "SUPER_ADMIN") {
        const response = await facultyService.getFaculties({});
        return response.data?.faculties || [];
      } else if (user?.role === "ADMIN" && user.institutionId) {
        const response = await facultyService.getFaculties({
          institutionId: user.institutionId,
        });
        return response.data?.faculties || [];
      } else if (user?.role === "FACULTY_ADMIN" && user.facultyId) {
        const response = await facultyService.getFaculty(user.facultyId);
        return response.data ? [response.data] : [];
      }
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DepartmentFormValues) =>
      departmentService.createDepartment({
        name: data.name,
        code: data.code,
        type: data.type as DepartmentType,
        description: data.description || undefined,
        officeLocation: data.officeLocation || undefined,
        contactInfo: data.contactInfo || undefined,
        facultyId: data.facultyId,
        hodId: data.hodId || undefined,
      }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to create department");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: DepartmentFormValues) => {
      if (!department) throw new Error("Department is required for edit mode");
      return departmentService.updateDepartment(department.id, {
        name: data.name,
        code: data.code,
        type: data.type as DepartmentType,
        description: data.description || undefined,
        officeLocation: data.officeLocation || undefined,
        contactInfo: data.contactInfo || undefined,
        hodId: data.hodId || undefined,
      });
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error.message || "Failed to update department");
    },
  });

  const onSubmit = (data: DepartmentFormValues) => {
    setError(null);

    if (isEditMode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isFacultiesLoading) {
    return <div className="p-4">Loading faculties...</div>;
  }

  const faculties = Array.isArray(facultiesData) ? facultiesData : [];

  if (faculties.length === 0) {
    return (
      <div className="p-4">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <Alert className="mt-4">
          <AlertDescription>
            No faculties available. Please create a faculty first before adding
            departments.
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
        <DialogTitle>{dialogTitle}</DialogTitle>
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
                    disabled={isEditMode} // Don't allow changing faculty in edit mode
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select faculty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {faculties.map((faculty: Faculty) => (
                        <SelectItem
                          key={faculty.id}
                          value={faculty.id.toString()}
                        >
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
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? submitButtonLoadingText : submitButtonText}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DepartmentForm;
