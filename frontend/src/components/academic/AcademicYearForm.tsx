import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AcademicYear } from '@/types/academic';
import { academicService } from '@/services/academic.service';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/auth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

// Form schema with validation
const academicYearSchema = z.object({
  yearCode: z
    .string()
    .min(1, 'Year code is required')
    .regex(/^\d{4}\/\d{4}$/, 'Year code must be in format YYYY/YYYY (e.g., 2024/2025)'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isCurrent: z.boolean().optional(),
  institutionId: z.number().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
});

type AcademicYearFormData = z.infer<typeof academicYearSchema>;

interface AcademicYearFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  academicYear?: AcademicYear;
}

export function AcademicYearForm({ open, onClose, onSuccess, academicYear }: AcademicYearFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCurrentWarning, setShowCurrentWarning] = useState(false);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isEditing = !!academicYear;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<AcademicYearFormData>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      yearCode: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      institutionId: user?.institutionId,
    },
  });

  // Watch dates to auto-generate year code
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const isCurrent = watch('isCurrent');

  // Auto-generate year code from dates
  useEffect(() => {
    if (startDate && endDate && !isEditing) {
      const startYear = new Date(startDate).getFullYear();
      const endYear = new Date(endDate).getFullYear();

      // Only auto-generate if years are different (typical academic year pattern)
      if (endYear > startYear) {
        const suggestedCode = `${startYear}/${endYear}`;
        setValue('yearCode', suggestedCode);
      }
    }
  }, [startDate, endDate, setValue, isEditing]);

  // Show warning when marking as current
  useEffect(() => {
    if (isCurrent && (!isEditing || !academicYear?.isCurrent)) {
      setShowCurrentWarning(true);
    } else {
      setShowCurrentWarning(false);
    }
  }, [isCurrent, isEditing, academicYear]);

  // Load existing data when editing
  useEffect(() => {
    if (open && academicYear) {
      reset({
        yearCode: academicYear.yearCode,
        startDate: academicYear.startDate.split('T')[0],
        endDate: academicYear.endDate.split('T')[0],
        isCurrent: academicYear.isCurrent,
        institutionId: academicYear.institutionId,
      });
    } else if (open && !academicYear) {
      reset({
        yearCode: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        institutionId: user?.institutionId,
      });
    }
  }, [open, academicYear, reset, user]);

  const onSubmit = async (data: AcademicYearFormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        yearCode: data.yearCode,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent || false,
        institutionId: isSuperAdmin ? data.institutionId : user?.institutionId,
      };

      if (isEditing && academicYear) {
        await academicService.updateAcademicYear(academicYear.id, payload);
        toast.success('Academic year updated successfully');
      } else {
        await academicService.createAcademicYear(payload);
        toast.success('Academic year created successfully');
      }

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error('Error saving academic year:', error);
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to save academic year';
      toast.error(errorMessage || 'Failed to save academic year');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setShowCurrentWarning(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Academic Year' : 'Create New Academic Year'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the academic year information below.'
              : 'Create a new academic year. This will be the container for semesters and academic periods.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Year Code */}
          <div className="space-y-2">
            <Label htmlFor="yearCode">
              Year Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="yearCode"
              placeholder="e.g., 2024/2025"
              {...register('yearCode')}
            />
            <p className="text-xs text-muted-foreground">
              Format: YYYY/YYYY (auto-generated from dates)
            </p>
            {errors.yearCode && (
              <p className="text-xs text-destructive">{errors.yearCode.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-xs text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                End Date <span className="text-destructive">*</span>
              </Label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && (
                <p className="text-xs text-destructive">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Institution (Super Admin Only) */}
          {isSuperAdmin && (
            <div className="space-y-2">
              <Label htmlFor="institutionId">Institution</Label>
              <Select
                value={watch('institutionId')?.toString()}
                onValueChange={(value) => setValue('institutionId', parseInt(value))}
              >
                <SelectTrigger id="institutionId">
                  <SelectValue placeholder="Select institution" />
                </SelectTrigger>
                <SelectContent>
                  {/* TODO: Load institutions from API */}
                  <SelectItem value={user?.institutionId?.toString() || '1'}>
                    {user?.institutionName || 'Default Institution'}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only Super Admins can select institution
              </p>
            </div>
          )}

          {/* Set as Current */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="isCurrent" {...register('isCurrent')} />
              <Label htmlFor="isCurrent" className="text-sm font-normal cursor-pointer">
                Set as current academic year
              </Label>
            </div>

            {showCurrentWarning && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-yellow-800">
                  <p className="font-medium mb-1">Warning: Setting as Current Year</p>
                  <p>
                    This will mark the new year as the current academic year. The previously
                    current year (if any) will be automatically unmarked. This affects which
                    semesters and periods are considered active.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
