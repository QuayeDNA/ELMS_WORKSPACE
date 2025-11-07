import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

import { useAuthStore } from '@/stores/auth.store';
import { academicService } from '@/services/academic.service';
import type { AcademicYear, Semester } from '@/types/academic';
import { examTimetableService, CreateTimetableData } from '@/services/examTimetable.service';

// Validation Schema
const createTimetableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  academicYearId: z.number().min(1, 'Academic year is required'),
  semesterId: z.number().min(1, 'Semester is required'),
  startDate: z.date({ message: 'Start date is required' }),
  endDate: z.date({ message: 'End date is required' }),
  defaultExamDuration: z.number().min(30, 'Minimum 30 minutes').max(480, 'Maximum 8 hours'),
  allowOverlaps: z.boolean(),
  autoResolveConflicts: z.boolean(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type CreateTimetableFormValues = z.infer<typeof createTimetableSchema>;

interface CreateTimetableFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (timetableId: number) => void;
  preselectedSemester?: Semester | null;
}

export function CreateTimetableForm({ open, onOpenChange, onSuccess, preselectedSemester }: CreateTimetableFormProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);

  const form = useForm<CreateTimetableFormValues>({
    resolver: zodResolver(createTimetableSchema),
    defaultValues: {
      title: '',
      description: '',
      defaultExamDuration: 180, // 3 hours default
      allowOverlaps: false,
      autoResolveConflicts: true,
    },
  });

  const selectedAcademicYearId = form.watch('academicYearId');

  // Auto-populate form when preselected semester is provided
  useEffect(() => {
    if (open && preselectedSemester) {
      const academicYear = preselectedSemester.academicYear;

      if (academicYear) {
        // Set academic year
        form.setValue('academicYearId', academicYear.id);

        // Set semester
        form.setValue('semesterId', preselectedSemester.id);

        // Auto-fill dates from semester
        const startDate = new Date(preselectedSemester.startDate);
        const endDate = new Date(preselectedSemester.endDate);
        form.setValue('startDate', startDate);
        form.setValue('endDate', endDate);

        // Generate default title
        const defaultTitle = `${academicYear.yearCode} ${preselectedSemester.name} Exam Timetable`;
        form.setValue('title', defaultTitle);

        // Set semesters array so the select shows properly
        setSemesters([preselectedSemester]);
      }
    } else if (open && !preselectedSemester) {
      // Reset form if no preselected semester
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselectedSemester]);

  // Fetch academic years on mount
  useEffect(() => {
    if (open) {
      fetchAcademicYears();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Fetch semesters when academic year changes
  useEffect(() => {
    if (selectedAcademicYearId) {
      fetchSemesters(selectedAcademicYearId);
    } else {
      setSemesters([]);
      form.setValue('semesterId', 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAcademicYearId]);

  const fetchAcademicYears = async () => {
    try {
      setLoadingYears(true);
      const response = await academicService.getAcademicYears({
        institutionId: user?.institutionId,
        page: 1,
        limit: 100,
        sortBy: 'startDate',
        sortOrder: 'desc',
      });

      if (response.data) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
      toast.error('Failed to load academic years');
    } finally {
      setLoadingYears(false);
    }
  };

  const fetchSemesters = async (academicYearId: number) => {
    try {
      setLoadingSemesters(true);
      const response = await academicService.getSemesters({
        academicYearId,
        page: 1,
        limit: 100,
        sortBy: 'semesterNumber',
        sortOrder: 'asc',
      });

      if (response.data) {
        setSemesters(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      toast.error('Failed to load semesters');
    } finally {
      setLoadingSemesters(false);
    }
  };

  const onSubmit = async (values: CreateTimetableFormValues) => {
    if (!user?.institutionId) {
      toast.error('Institution ID not found');
      return;
    }

    try {
      setLoading(true);

      const data: CreateTimetableData = {
        title: values.title,
        description: values.description || undefined,
        academicYearId: values.academicYearId,
        semesterId: values.semesterId,
        institutionId: user.institutionId,
        startDate: format(values.startDate, 'yyyy-MM-dd'),
        endDate: format(values.endDate, 'yyyy-MM-dd'),
        defaultExamDuration: values.defaultExamDuration,
        allowOverlaps: values.allowOverlaps,
        autoResolveConflicts: values.autoResolveConflicts,
      };

      const response = await examTimetableService.createTimetable(data);

      if (response.data) {
        toast.success('Exam timetable created successfully');
        form.reset();
        onOpenChange(false);
        if (onSuccess && response.data.data.id) {
          onSuccess(response.data.data.id);
        }
      }
    } catch (error) {
      console.error('Error creating timetable:', error);
      toast.error('Failed to create exam timetable');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Exam Timetable</DialogTitle>
          <DialogDescription>
            Create a new exam timetable for a specific academic year and semester.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2024/2025 Semester 1 Final Exams"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A descriptive title for this exam timetable
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Optional description or notes about this timetable..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Academic Year and Semester */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year *</FormLabel>
                    <Select
                      disabled={loadingYears || !!preselectedSemester}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingYears ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : academicYears.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">
                            No academic years found
                          </div>
                        ) : (
                          academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id.toString()}>
                              {year.yearCode} ({format(new Date(year.startDate), 'yyyy')} -{' '}
                              {format(new Date(year.endDate), 'yyyy')})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {preselectedSemester && (
                      <FormDescription className="text-xs">
                        Auto-filled from selected semester
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semesterId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester *</FormLabel>
                    <Select
                      disabled={!selectedAcademicYearId || loadingSemesters || !!preselectedSemester}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingSemesters ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : semesters.length === 0 ? (
                          <div className="p-4 text-sm text-muted-foreground">
                            {selectedAcademicYearId
                              ? 'No semesters found'
                              : 'Select an academic year first'}
                          </div>
                        ) : (
                          semesters.map((semester) => (
                            <SelectItem key={semester.id} value={semester.id.toString()}>
                              {semester.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {preselectedSemester && (
                      <FormDescription className="text-xs">
                        Auto-filled from selected semester
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>First day of exam period</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <Calendar className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date('1900-01-01') ||
                            (form.getValues('startDate') && date <= form.getValues('startDate'))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Last day of exam period</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Configuration */}
            <div className="space-y-4 border-t pt-4">
              <h4 className="text-sm font-medium">Configuration</h4>

              <FormField
                control={form.control}
                name="defaultExamDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Exam Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={30}
                        max={480}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Default duration for exams (30-480 minutes)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="allowOverlaps"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow overlapping exams</FormLabel>
                      <FormDescription>
                        Allow students to have multiple exams at the same time
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="autoResolveConflicts"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Auto-resolve conflicts</FormLabel>
                      <FormDescription>
                        Automatically attempt to resolve scheduling conflicts
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Timetable
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
