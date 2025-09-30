import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { programService } from "@/services/program.service";
import { departmentService } from "@/services/department.service";
import { ProgramFormProps, ProgramType, ProgramLevel } from "@/types/shared";

const programSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  code: z.string().min(1, "Program code is required"),
  departmentId: z.number().min(1, "Department is required"),
  type: z.enum(["UNDERGRADUATE", "POSTGRADUATE", "DIPLOMA", "CERTIFICATE"], {
    message: "Program type is required",
  }),
  level: z.enum(
    [
      "LEVEL_100",
      "LEVEL_200",
      "LEVEL_300",
      "LEVEL_400",
      "LEVEL_500",
      "LEVEL_600",
      "LEVEL_700",
    ],
    {
      message: "Program level is required",
    }
  ),
  durationYears: z.number().min(1, "Duration is required"),
  creditHours: z.union([z.number(), z.null()]).optional(),
  description: z.union([z.string(), z.null()]).optional(),
  admissionRequirements: z.union([z.string(), z.null()]).optional(),
  isActive: z.boolean().optional(),
});

type ProgramFormValues = z.infer<typeof programSchema>;

const ProgramForm: React.FC<ProgramFormProps> = ({
  mode,
  program,
  onSuccess,
  onCancel,
}) => {
  const [error, setError] = useState<string | null>(null);

  // Fetch departments for the dropdown
  const { data: departmentsResponse } = useQuery({
    queryKey: ["departments"],
    queryFn: () => departmentService.getDepartments({ limit: 100 }),
  });

  const departments = departmentsResponse?.data?.departments || [];

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: program?.name || "",
      code: program?.code || "",
      departmentId: program?.departmentId || 0,
      type: program?.type || "UNDERGRADUATE",
      level: program?.level || "LEVEL_100",
      durationYears: program?.durationYears || 1,
      creditHours: program?.creditHours ?? undefined,
      description: program?.description ?? undefined,
      admissionRequirements: program?.admissionRequirements ?? undefined,
      isActive: program?.isActive ?? true,
    },
  });

  // Update form when program prop changes (for edit mode)
  useEffect(() => {
    if (program) {
      form.reset({
        name: program.name,
        code: program.code,
        departmentId: program.departmentId,
        type: program.type,
        level: program.level,
        durationYears: program.durationYears,
        creditHours: program.creditHours ?? undefined,
        description: program.description ?? undefined,
        admissionRequirements: program.admissionRequirements ?? undefined,
        isActive: program.isActive,
      });
    }
  }, [program, form]);

  // Create program mutation
  const createMutation = useMutation({
    mutationFn: (data: ProgramFormValues) =>
      programService.createProgram({
        name: data.name,
        code: data.code,
        departmentId: data.departmentId,
        type: data.type as ProgramType,
        level: data.level as ProgramLevel,
        durationYears: data.durationYears,
        creditHours: data.creditHours,
        description: data.description,
        admissionRequirements: data.admissionRequirements,
        isActive: data.isActive,
      }),
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error?.message || "Failed to create program");
    },
  });

  // Update program mutation
  const updateMutation = useMutation({
    mutationFn: (data: ProgramFormValues) => {
      if (!program) throw new Error("Program not found");
      return programService.updateProgram(program.id, {
        name: data.name,
        code: data.code,
        type: data.type as ProgramType,
        level: data.level as ProgramLevel,
        durationYears: data.durationYears,
        creditHours: data.creditHours,
        description: data.description,
        admissionRequirements: data.admissionRequirements,
        isActive: data.isActive,
      });
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error: Error) => {
      setError(error?.message || "Failed to update program");
    },
  });

  const onSubmit = (data: ProgramFormValues) => {
    setError(null);
    if (mode === "create") {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle>
          {mode === "create" ? "Create Program" : "Edit Program"}
        </DialogTitle>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter program name" {...field} />
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
                  <FormLabel>Program Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter program code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem
                          key={department.id}
                          value={department.id.toString()}
                        >
                          {department.name}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UNDERGRADUATE">
                        Undergraduate
                      </SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
                      <SelectItem value="DIPLOMA">Diploma</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LEVEL_100">Level 100</SelectItem>
                      <SelectItem value="LEVEL_200">Level 200</SelectItem>
                      <SelectItem value="LEVEL_300">Level 300</SelectItem>
                      <SelectItem value="LEVEL_400">Level 400</SelectItem>
                      <SelectItem value="LEVEL_500">Level 500</SelectItem>
                      <SelectItem value="LEVEL_600">Level 600</SelectItem>
                      <SelectItem value="LEVEL_700">Level 700</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Years)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter duration"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="creditHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credit Hours (Optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter credit hours"
                    {...field}
                    value={field.value ?? ""}
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter program description"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="admissionRequirements"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admission Requirements (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter admission requirements"
                    className="resize-none"
                    {...field}
                    value={field.value ?? ""}
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
              {isLoading
                ? mode === "create"
                  ? "Creating..."
                  : "Updating..."
                : mode === "create"
                  ? "Create Program"
                  : "Update Program"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProgramForm;
