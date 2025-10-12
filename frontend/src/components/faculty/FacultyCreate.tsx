import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { facultyService } from "@/services/faculty.service";
import { useAuthStore } from "@/stores/auth.store";
import { FacultyFormData, FacultyCreateProps, User } from "@/types/shared";
import { userService } from "@/services/user.service";
import { UserRole, UserStatus } from "@/types/auth";

const facultySchema = z.object({
  name: z.string().min(1, "Faculty name is required"),
  code: z.string().min(1, "Faculty code is required"),
  institutionId: z.string().min(1, "Institution is required"),
  description: z.string().optional(),
  deanId: z.string().optional(),
});

type FacultyFormValues = z.infer<typeof facultySchema>;

export const FacultyCreate: React.FC<FacultyCreateProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDeans, setAvailableDeans] = useState<User[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
  });

  const selectedInstitutionId = watch("institutionId");

  // Fetch available deans when institution is selected
  useEffect(() => {
    const fetchAvailableDeans = async () => {
      if (selectedInstitutionId) {
        try {
          const institutionId = parseInt(selectedInstitutionId);
          // Fetch users who can be deans (typically lecturers)
          const lecturerResponse = await userService.getUsers({
            institutionId,
            role: UserRole.LECTURER,
            status: UserStatus.ACTIVE,
          });
          const allUsers = [
            ...(lecturerResponse.success && lecturerResponse.data
              ? lecturerResponse.data || []
              : []),
          ];
          // Remove duplicates based on user ID
          const uniqueUsers = allUsers.filter(
            (user, index, self) =>
              index === self.findIndex((u) => u.id === user.id)
          );
          setAvailableDeans(uniqueUsers);
        } catch (error) {
          console.error("Error fetching available deans:", error);
        }
      } else {
        setAvailableDeans([]);
      }
    };

    fetchAvailableDeans();
  }, [selectedInstitutionId]);

  // Set the user's institution automatically for ADMIN users
  useEffect(() => {
    if (user?.institutionId) {
      setValue("institutionId", user.institutionId.toString());
    }
  }, [user, setValue]);

  const onSubmit = async (data: FacultyFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData: FacultyFormData = {
        name: data.name,
        code: data.code,
        institutionId: parseInt(data.institutionId),
        description: data.description || "",
      };

      const requestData = facultyService.transformFormData(formData);

      // Create faculty first
      const facultyResponse = await facultyService.createFaculty(requestData);

      // If dean was selected, assign the dean
      if (data.deanId && facultyResponse.success && facultyResponse.data) {
        await facultyService.assignDean(
          facultyResponse.data.id,
          parseInt(data.deanId)
        );
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create faculty");
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Faculty Name *</Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="Enter faculty name"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Faculty Code *</Label>
          <Input
            id="code"
            {...register("code")}
            placeholder="Enter faculty code (e.g., ENG, SCI)"
            className={errors.code ? "border-red-500" : ""}
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="institutionId">Institution *</Label>
        <Input
          value={`Institution ID: ${user?.institutionId || "Not Available"}`}
          disabled
          className="bg-gray-50"
        />
        <p className="text-sm text-gray-500">
          Faculties will be created under your current institution
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="deanId">Dean (Optional)</Label>
        <Select
          value={watch("deanId")}
          onValueChange={(value) => setValue("deanId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a dean for this faculty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No dean assigned</SelectItem>
            {availableDeans.map((deanUser) => (
              <SelectItem key={deanUser.id} value={deanUser.id.toString()}>
                {deanUser.firstName} {deanUser.lastName} ({deanUser.email})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Select a lecturer or faculty admin to serve as dean
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register("description")}
          placeholder="Enter faculty description (optional)"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Faculty"}
        </Button>
      </div>
    </form>
  );
};



