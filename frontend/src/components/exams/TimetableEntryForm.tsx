import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  ExamTimetableEntry,
  CreateTimetableEntryData,
} from '@/services/examTimetable.service';
import { courseService } from '@/services/course.service';
import { Course } from '@/types/course';

// ========================================
// VALIDATION SCHEMA
// ========================================

const entryFormSchema = z.object({
  courseId: z.number().min(1, 'Course is required'),
  examDate: z.date(),
  startTime: z.string().min(1, 'Start time is required'),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  venueId: z.number().optional(),
  level: z.number().optional(),
  notes: z.string().optional(),
  specialRequirements: z.string().optional(),
});

type EntryFormValues = z.infer<typeof entryFormSchema>;

// ========================================
// TYPES
// ========================================

interface TimetableEntryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetableId: number;
  timetableStartDate: Date;
  timetableEndDate: Date;
  defaultDuration: number;
  institutionId: number;
  entry?: ExamTimetableEntry | null;
  onSubmit: (data: CreateTimetableEntryData) => Promise<void>;
}

// ========================================
// COMPONENT
// ========================================

export const TimetableEntryForm: React.FC<TimetableEntryFormProps> = ({
  open,
  onOpenChange,
  timetableStartDate,
  timetableEndDate,
  defaultDuration,
  institutionId,
  entry,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const isEdit = !!entry;

  // Form setup
  const form = useForm<EntryFormValues>({
    resolver: zodResolver(entryFormSchema),
    defaultValues: {
      courseId: entry?.courseId,
      examDate: entry ? new Date(entry.examDate) : undefined,
      startTime: entry ? format(new Date(entry.startTime), 'HH:mm') : '09:00',
      duration: entry?.duration || defaultDuration,
      venueId: entry?.venueId,
      level: entry?.level,
      notes: entry?.notes || '',
      specialRequirements: entry?.specialRequirements || '',
    },
  });

  // ========================================
  // DATA LOADING
  // ========================================

  // Load courses for the institution
  const loadCourses = useCallback(async () => {
    try {
      setLoadingCourses(true);
      const response = await courseService.getCourses({
        institutionId,
        limit: 1000, // Load all courses for selection
        isActive: true,
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Failed to load courses. Please try again.');
    } finally {
      setLoadingCourses(false);
    }
  }, [institutionId]);

  useEffect(() => {
    if (open) {
      loadCourses();
    }
  }, [open, loadCourses]);

  // ========================================
  // FORM HANDLERS
  // ========================================

  const handleSubmit = async (values: EntryFormValues) => {
    try {
      setLoading(true);

      // Combine date and time
      const examDate = values.examDate;
      const [hours, minutes] = values.startTime.split(':').map(Number);
      const startTime = new Date(examDate);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + values.duration);

      const data: CreateTimetableEntryData = {
        courseId: values.courseId,
        programIds: [], // Will be populated from course
        level: values.level,
        examDate: examDate.toISOString(),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: values.duration,
        venueId: values.venueId || 1, // Temporary: use a default venue
        roomIds: [],
        invigilatorIds: [],
        notes: values.notes,
        specialRequirements: values.specialRequirements,
      };

      await onSubmit(data);

      toast.success(`Entry ${isEdit ? 'updated' : 'created'} successfully`);

      form.reset();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error('Error submitting entry:', error);
      toast.error(
        error instanceof Error ? error.message : `Failed to ${isEdit ? 'update' : 'create'} entry`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit' : 'Add'} Exam Entry</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update the exam entry details below.'
              : 'Add a new exam entry to the timetable.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Course Selection */}
            <FormField
              control={form.control}
              name="courseId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course *</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value?.toString() || ''}
                    disabled={loadingCourses}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCourses ? 'Loading...' : 'Select course'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the course for this exam
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date & Time Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Exam Date */}
              <FormField
                control={form.control}
                name="examDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Exam Date *</FormLabel>
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
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < timetableStartDate || date > timetableEndDate
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="time"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration & Level Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Duration */}
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={15}
                        step={15}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Default: {defaultDuration} minutes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Level */}
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Level (Optional)</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString() || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="100">100 Level</SelectItem>
                        <SelectItem value="200">200 Level</SelectItem>
                        <SelectItem value="300">300 Level</SelectItem>
                        <SelectItem value="400">400 Level</SelectItem>
                        <SelectItem value="500">500 Level</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this exam"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Special Requirements */}
            <FormField
              control={form.control}
              name="specialRequirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Requirements (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Calculator required, Extra time for special needs students"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Update' : 'Create'} Entry
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
