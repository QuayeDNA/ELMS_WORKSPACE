import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExamTimetable, UpdateTimetableData } from '@/services/examTimetable.service';

const editTimetableSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date(),
  allowOverlaps: z.boolean(),
  autoResolveConflicts: z.boolean(),
  defaultExamDuration: z.number().min(30, 'Duration must be at least 30 minutes').max(480, 'Duration must be less than 8 hours'),
}).refine((data) => {
  const startDate = data.startDate;
  const endDate = data.endDate;
  return endDate >= startDate;
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type EditTimetableFormData = z.infer<typeof editTimetableSchema>;

interface TimetableEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timetable: ExamTimetable;
  onSubmit: (data: UpdateTimetableData) => Promise<void>;
  loading?: boolean;
}

export function TimetableEditDialog({
  open,
  onOpenChange,
  timetable,
  onSubmit,
  loading = false,
}: TimetableEditDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditTimetableFormData>({
    resolver: zodResolver(editTimetableSchema),
    defaultValues: {
      title: timetable.title || '',
      description: timetable.description || '',
      startDate: timetable.startDate ? new Date(timetable.startDate) : new Date(),
      endDate: timetable.endDate ? new Date(timetable.endDate) : new Date(),
      allowOverlaps: timetable.allowOverlaps || false,
      autoResolveConflicts: timetable.autoResolveConflicts || false,
      defaultExamDuration: timetable.defaultExamDuration || 180,
    },
  });

  const allowOverlaps = watch('allowOverlaps');
  const autoResolveConflicts = watch('autoResolveConflicts');

  const handleFormSubmit = async (data: EditTimetableFormData) => {
    const updateData: UpdateTimetableData = {
      title: data.title,
      description: data.description || undefined,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
      allowOverlaps: data.allowOverlaps,
      autoResolveConflicts: data.autoResolveConflicts,
      defaultExamDuration: data.defaultExamDuration,
    };

    await onSubmit(updateData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      reset({
        title: timetable.title || '',
        description: timetable.description || '',
        startDate: timetable.startDate ? new Date(timetable.startDate) : new Date(),
        endDate: timetable.endDate ? new Date(timetable.endDate) : new Date(),
        allowOverlaps: timetable.allowOverlaps || false,
        autoResolveConflicts: timetable.autoResolveConflicts || false,
        defaultExamDuration: timetable.defaultExamDuration || 180,
      });
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Timetable</DialogTitle>
          <DialogDescription>
            Update the timetable details and configuration settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter timetable title"
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter timetable description (optional)"
                rows={3}
                className={errors.description ? 'border-destructive' : ''}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Date Range</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !watch('startDate') && 'text-muted-foreground'
                      )}
                    >
                      {watch('startDate') ? (
                        format(watch('startDate'), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch('startDate')}
                      onSelect={(date) => setValue('startDate', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.startDate && (
                  <p className="text-sm text-destructive">{errors.startDate.message}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !watch('endDate') && 'text-muted-foreground'
                      )}
                    >
                      {watch('endDate') ? (
                        format(watch('endDate'), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watch('endDate')}
                      onSelect={(date) => setValue('endDate', date || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.endDate && (
                  <p className="text-sm text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Configuration</h3>

            <div className="grid gap-2">
              <Label htmlFor="defaultExamDuration">Default Exam Duration (minutes) *</Label>
              <Input
                id="defaultExamDuration"
                type="number"
                min="30"
                max="480"
                {...register('defaultExamDuration', { valueAsNumber: true })}
                className={errors.defaultExamDuration ? 'border-destructive' : ''}
              />
              {errors.defaultExamDuration && (
                <p className="text-sm text-destructive">{errors.defaultExamDuration.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowOverlaps"
                  checked={allowOverlaps}
                  onCheckedChange={(checked) => setValue('allowOverlaps', checked as boolean)}
                />
                <Label htmlFor="allowOverlaps" className="text-sm font-normal">
                  Allow overlapping exams
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoResolveConflicts"
                  checked={autoResolveConflicts}
                  onCheckedChange={(checked) => setValue('autoResolveConflicts', checked as boolean)}
                />
                <Label htmlFor="autoResolveConflicts" className="text-sm font-normal">
                  Automatically resolve scheduling conflicts
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Timetable
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
