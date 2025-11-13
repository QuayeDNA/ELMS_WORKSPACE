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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import { programService } from "@/services/program.service";
import { departmentService } from "@/services/department.service";
import { Department } from "@/types/shared";
import { ProgramFormProps, ProgramType, ProgramLevel } from "@/types/shared";
import {
  Loader2,
  BookOpen,
  Hash,
  Building2,
  GraduationCap,
  Calendar,
  Award,
  FileText,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const programSchema = z.object({
  name: z.string().min(1, "Program name is required"),
  code: z.string().min(1, "Program code is required"),
  departmentId: z.number().min(1, "Department is required"),
  type: z.enum(["CERTIFICATE", "DIPLOMA", "HND", "BACHELOR", "MASTERS", "PHD"], {
    message: "Program type is required",
  }),
  level: z.enum(["UNDERGRADUATE", "POSTGRADUATE"], {
    message: "Program level is required",
  }),
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

  const departments = departmentsResponse?.data || [];

  const form = useForm<ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      name: program?.name || "",
      code: program?.code || "",
      departmentId: program?.departmentId || 0,
      type: program?.type || "BACHELOR",
      level: program?.level || "UNDERGRADUATE",
      durationYears: program?.durationYears || 4,
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
      toast.success("Program created successfully");
      onSuccess();
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to create program";
      console.error('Create program error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
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
      toast.success("Program updated successfully");
      onSuccess();
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      const errorMessage = err?.response?.data?.message || err?.message || "Failed to update program";
      console.error('Update program error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {error && (
            <Alert variant="destructive" className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <AlertDescription className="flex-1">{error}</AlertDescription>
            </Alert>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            </div>
            <Separator />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Enter program name" className="pl-9 h-10" {...field} />
                    </div>
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
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input placeholder="Enter program code" className="pl-9 h-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                      <SelectTrigger className="pl-9 h-10">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </div>
                  </FormControl>
                  <SelectContent>
                    {departments.map((department: Department) => (
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
          </div>

          {/* Section 2: Program Structure */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Program Structure</h3>
            </div>
            <Separator />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                        <SelectTrigger className="pl-9 h-10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="CERTIFICATE">Certificate</SelectItem>
                      <SelectItem value="DIPLOMA">Diploma</SelectItem>
                      <SelectItem value="HND">HND</SelectItem>
                      <SelectItem value="BACHELOR">Bachelor's Degree</SelectItem>
                      <SelectItem value="MASTERS">Master's Degree</SelectItem>
                      <SelectItem value="PHD">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Program Level</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10 pointer-events-none" />
                        <SelectTrigger className="pl-9 h-10">
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </div>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="UNDERGRADUATE">Undergraduate</SelectItem>
                      <SelectItem value="POSTGRADUATE">Postgraduate</SelectItem>
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
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="number"
                        placeholder="e.g., 4"
                        className="pl-9 h-10"
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? parseInt(value) : undefined);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                      />
                    </div>
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
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      placeholder="e.g., 120"
                      className="pl-9 h-10"
                      value={field.value || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value ? parseInt(value) : undefined);
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          </div>

          {/* Section 3: Additional Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
            </div>
            <Separator />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter program description"
                    className="resize-none min-h-[100px]"
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
                    className="resize-none min-h-[100px]"
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
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-gray-500">
                    Enable or disable this program for student enrollment
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          </div>

          <Separator className="my-6" />

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[140px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {mode === "create" ? "Create Program" : "Update Program"}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProgramForm;



