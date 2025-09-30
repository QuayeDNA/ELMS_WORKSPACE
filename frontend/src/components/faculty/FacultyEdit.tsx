import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
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
import { FacultyFormData, FacultyEditProps } from "@/types/shared";

const facultySchema = z.object({
  name: z.string().min(1, "Faculty name is required"),
  code: z.string().min(1, "Faculty code is required"),
  institutionId: z.string().min(1, "Institution is required"),
  description: z.string().optional(),
});

type FacultyFormValues = z.infer<typeof facultySchema>;

export const FacultyEdit: React.FC<FacultyEditProps> = ({
  faculty,
  onSuccess,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: faculty.name,
      code: faculty.code,
      institutionId: faculty.institutionId.toString(),
      description: faculty.description || "",
    },
  });

  useEffect(() => {
    setValue("name", faculty.name);
    setValue("code", faculty.code);
    setValue("institutionId", faculty.institutionId.toString());
    setValue("description", faculty.description || "");
  }, [faculty, setValue]);

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
      await facultyService.updateFaculty(faculty.id, requestData);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update faculty");
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
        <Select
          value={faculty.institutionId.toString()}
          onValueChange={(value) => setValue("institutionId", value)}
        >
          <SelectTrigger
            className={errors.institutionId ? "border-red-500" : ""}
          >
            <SelectValue placeholder="Select an institution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={faculty.institutionId.toString()}>
              {faculty.institution?.name || "Current Institution"}
            </SelectItem>
            <SelectItem value="1">Sample University</SelectItem>
            <SelectItem value="2">Tech Institute</SelectItem>
          </SelectContent>
        </Select>
        {errors.institutionId && (
          <p className="text-red-500 text-sm">{errors.institutionId.message}</p>
        )}
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
          {isLoading ? "Updating..." : "Update Faculty"}
        </Button>
      </div>
    </form>
  );
};
