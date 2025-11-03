import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Semester, AcademicPeriod } from '@/types/academic';
import { academicService } from '@/services/academic.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Form schema with validation
const semesterSchema = z.object({
  semesterNumber: z.number().min(1, 'Semester number must be at least 1'),
  name: z.string().min(1, 'Semester name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isCurrent: z.boolean().optional(),
  // Academic Period fields (integrated)
  registrationStartDate: z.string().min(1, 'Registration start date is required'),
  registrationEndDate: z.string().min(1, 'Registration end date is required'),
  addDropStartDate: z.string().optional(),
  addDropEndDate: z.string().optional(),
  lectureStartDate: z.string().min(1, 'Lecture start date is required'),
  lectureEndDate: z.string().min(1, 'Lecture end date is required'),
  examStartDate: z.string().min(1, 'Exam start date is required'),
  examEndDate: z.string().min(1, 'Exam end date is required'),
  resultsReleaseDate: z.string().optional(),
  minCreditsPerStudent: z.number().min(1, 'Minimum credits must be at least 1'),
  maxCreditsPerStudent: z.number().min(1, 'Maximum credits must be at least 1'),
  lateRegistrationFee: z.number().optional(),
  notes: z.string().optional(),
}).refine((data) => new Date(data.endDate) > new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
}).refine((data) => new Date(data.registrationEndDate) > new Date(data.registrationStartDate), {
  message: 'Registration end date must be after start date',
  path: ['registrationEndDate'],
}).refine((data) => {
  if (data.addDropStartDate && data.addDropEndDate) {
    return new Date(data.addDropEndDate) > new Date(data.addDropStartDate);
  }
  return true;
}, {
  message: 'Add/Drop end date must be after start date',
  path: ['addDropEndDate'],
}).refine((data) => new Date(data.lectureEndDate) > new Date(data.lectureStartDate), {
  message: 'Lecture end date must be after start date',
  path: ['lectureEndDate'],
}).refine((data) => new Date(data.examEndDate) > new Date(data.examStartDate), {
  message: 'Exam end date must be after start date',
  path: ['examEndDate'],
}).refine((data) => data.maxCreditsPerStudent >= data.minCreditsPerStudent, {
  message: 'Maximum credits must be greater than or equal to minimum credits',
  path: ['maxCreditsPerStudent'],
});

type SemesterFormData = z.infer<typeof semesterSchema>;

interface SemesterFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  academicYearId: number;
  semester?: Semester;
  existingPeriod?: AcademicPeriod;
}

export function SemesterForm({
  open,
  onClose,
  onSuccess,
  academicYearId,
  semester,
  existingPeriod,
}: SemesterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [periodExpanded, setPeriodExpanded] = useState(true);
  const isEditing = !!semester;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<SemesterFormData>({
    resolver: zodResolver(semesterSchema),
    defaultValues: {
      semesterNumber: 1,
      isCurrent: false,
      minCreditsPerStudent: 12,
      maxCreditsPerStudent: 18,
    },
  });

  // Watch semester dates to auto-populate lecture dates
  const semesterStartDate = watch('startDate');
  const semesterEndDate = watch('endDate');

  // Auto-populate lecture dates when semester dates change
  useEffect(() => {
    if (semesterStartDate && !watch('lectureStartDate')) {
      setValue('lectureStartDate', semesterStartDate);
    }
    if (semesterEndDate && !watch('lectureEndDate')) {
      setValue('lectureEndDate', semesterEndDate);
    }
  }, [semesterStartDate, semesterEndDate, setValue, watch]);

  // Load existing data when editing
  useEffect(() => {
    if (open && semester) {
      reset({
        semesterNumber: semester.semesterNumber,
        name: semester.name,
        startDate: semester.startDate.split('T')[0],
        endDate: semester.endDate.split('T')[0],
        isCurrent: semester.isCurrent,
        // Period data if exists
        registrationStartDate: existingPeriod?.registrationStartDate.split('T')[0] || '',
        registrationEndDate: existingPeriod?.registrationEndDate.split('T')[0] || '',
        addDropStartDate: existingPeriod?.addDropStartDate?.split('T')[0] || '',
        addDropEndDate: existingPeriod?.addDropEndDate?.split('T')[0] || '',
        lectureStartDate: existingPeriod?.lectureStartDate.split('T')[0] || semester.startDate.split('T')[0],
        lectureEndDate: existingPeriod?.lectureEndDate.split('T')[0] || semester.endDate.split('T')[0],
        examStartDate: existingPeriod?.examStartDate.split('T')[0] || '',
        examEndDate: existingPeriod?.examEndDate.split('T')[0] || '',
        resultsReleaseDate: existingPeriod?.resultsReleaseDate?.split('T')[0] || '',
        minCreditsPerStudent: existingPeriod?.minCreditsPerStudent || 12,
        maxCreditsPerStudent: existingPeriod?.maxCreditsPerStudent || 18,
        lateRegistrationFee: existingPeriod?.lateRegistrationFee || undefined,
        notes: existingPeriod?.notes || '',
      });
    } else if (open && !semester) {
      reset({
        semesterNumber: 1,
        name: '',
        startDate: '',
        endDate: '',
        isCurrent: false,
        registrationStartDate: '',
        registrationEndDate: '',
        addDropStartDate: '',
        addDropEndDate: '',
        lectureStartDate: '',
        lectureEndDate: '',
        examStartDate: '',
        examEndDate: '',
        resultsReleaseDate: '',
        minCreditsPerStudent: 12,
        maxCreditsPerStudent: 18,
        lateRegistrationFee: undefined,
        notes: '',
      });
    }
  }, [open, semester, existingPeriod, reset]);

  const onSubmit = async (data: SemesterFormData) => {
    setIsSubmitting(true);
    try {
      // Step 1: Create or update semester
      let semesterId: number;

      const semesterData = {
        semesterNumber: data.semesterNumber,
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        isCurrent: data.isCurrent || false,
        academicYearId,
      };

      if (isEditing && semester) {
        await academicService.updateSemester(semester.id, semesterData);
        semesterId = semester.id;
        toast.success('Semester updated successfully');
      } else {
        const response = await academicService.createSemester(semesterData);
        const createdId = response.data?.id;

        if (!createdId) {
          throw new Error('Failed to create semester: No ID returned');
        }

        semesterId = createdId;
        toast.success('Semester created successfully');
      }

      // Step 2: Create or update academic period
      const periodData = {
        semesterId,
        registrationStartDate: data.registrationStartDate,
        registrationEndDate: data.registrationEndDate,
        addDropStartDate: data.addDropStartDate || null,
        addDropEndDate: data.addDropEndDate || null,
        lectureStartDate: data.lectureStartDate,
        lectureEndDate: data.lectureEndDate,
        examStartDate: data.examStartDate,
        examEndDate: data.examEndDate,
        resultsReleaseDate: data.resultsReleaseDate || null,
        minCreditsPerStudent: data.minCreditsPerStudent,
        maxCreditsPerStudent: data.maxCreditsPerStudent,
        lateRegistrationFee: data.lateRegistrationFee || null,
        notes: data.notes || null,
      };

      if (existingPeriod) {
        await academicService.updateAcademicPeriod(existingPeriod.id, periodData);
        toast.success('Academic period updated successfully');
      } else {
        await academicService.createAcademicPeriod(periodData);
        toast.success('Academic period created successfully');
      }

      onSuccess();
      handleClose();
    } catch (error: unknown) {
      console.error('Error saving semester:', error);
      const errorMessage = error instanceof Error && 'response' in error
        ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
        : 'Failed to save semester and academic period';
      toast.error(errorMessage || 'Failed to save semester and academic period');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Semester & Academic Period' : 'Create New Semester & Academic Period'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Semester Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Semester Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semesterNumber">
                  Semester Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="semesterNumber"
                  type="number"
                  min="1"
                  {...register('semesterNumber', { valueAsNumber: true })}
                />
                {errors.semesterNumber && (
                  <p className="text-xs text-destructive">{errors.semesterNumber.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">
                  Semester Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Fall 2024"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
            </div>

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

            <div className="flex items-center space-x-2">
              <Checkbox id="isCurrent" {...register('isCurrent')} />
              <Label htmlFor="isCurrent" className="text-sm font-normal cursor-pointer">
                Set as current semester
              </Label>
            </div>
          </div>

          {/* Academic Period Configuration */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => setPeriodExpanded(!periodExpanded)}
              className="flex items-center justify-between w-full font-semibold text-sm border-b pb-2 hover:text-primary transition-colors"
            >
              <span>Academic Period Configuration</span>
              {periodExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {periodExpanded && (
              <div className="space-y-4 pl-2">
                {/* Registration Period */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-green-700">Registration Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="registrationStartDate">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="registrationStartDate"
                        type="date"
                        {...register('registrationStartDate')}
                      />
                      {errors.registrationStartDate && (
                        <p className="text-xs text-destructive">{errors.registrationStartDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="registrationEndDate">
                        End Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="registrationEndDate"
                        type="date"
                        {...register('registrationEndDate')}
                      />
                      {errors.registrationEndDate && (
                        <p className="text-xs text-destructive">{errors.registrationEndDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Add/Drop Period (Optional) */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-yellow-700">Add/Drop Period (Optional)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="addDropStartDate">Start Date</Label>
                      <Input
                        id="addDropStartDate"
                        type="date"
                        {...register('addDropStartDate')}
                      />
                      {errors.addDropStartDate && (
                        <p className="text-xs text-destructive">{errors.addDropStartDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="addDropEndDate">End Date</Label>
                      <Input id="addDropEndDate" type="date" {...register('addDropEndDate')} />
                      {errors.addDropEndDate && (
                        <p className="text-xs text-destructive">{errors.addDropEndDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lecture Period */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-blue-700">Lecture Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lectureStartDate">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lectureStartDate"
                        type="date"
                        {...register('lectureStartDate')}
                      />
                      {errors.lectureStartDate && (
                        <p className="text-xs text-destructive">{errors.lectureStartDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lectureEndDate">
                        End Date <span className="text-destructive">*</span>
                      </Label>
                      <Input id="lectureEndDate" type="date" {...register('lectureEndDate')} />
                      {errors.lectureEndDate && (
                        <p className="text-xs text-destructive">{errors.lectureEndDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Exam Period */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-red-700">Exam Period</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="examStartDate">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input id="examStartDate" type="date" {...register('examStartDate')} />
                      {errors.examStartDate && (
                        <p className="text-xs text-destructive">{errors.examStartDate.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="examEndDate">
                        End Date <span className="text-destructive">*</span>
                      </Label>
                      <Input id="examEndDate" type="date" {...register('examEndDate')} />
                      {errors.examEndDate && (
                        <p className="text-xs text-destructive">{errors.examEndDate.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Results Release Date */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-purple-700">Results Release (Optional)</h4>
                  <div className="space-y-2">
                    <Label htmlFor="resultsReleaseDate">Release Date</Label>
                    <Input
                      id="resultsReleaseDate"
                      type="date"
                      {...register('resultsReleaseDate')}
                    />
                    {errors.resultsReleaseDate && (
                      <p className="text-xs text-destructive">{errors.resultsReleaseDate.message}</p>
                    )}
                  </div>
                </div>

                {/* Credit Configuration */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Credit Configuration</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minCreditsPerStudent">
                        Min Credits <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="minCreditsPerStudent"
                        type="number"
                        min="1"
                        {...register('minCreditsPerStudent', { valueAsNumber: true })}
                      />
                      {errors.minCreditsPerStudent && (
                        <p className="text-xs text-destructive">{errors.minCreditsPerStudent.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxCreditsPerStudent">
                        Max Credits <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="maxCreditsPerStudent"
                        type="number"
                        min="1"
                        {...register('maxCreditsPerStudent', { valueAsNumber: true })}
                      />
                      {errors.maxCreditsPerStudent && (
                        <p className="text-xs text-destructive">{errors.maxCreditsPerStudent.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lateRegistrationFee">Late Fee ($)</Label>
                      <Input
                        id="lateRegistrationFee"
                        type="number"
                        min="0"
                        step="0.01"
                        {...register('lateRegistrationFee', { valueAsNumber: true })}
                      />
                      {errors.lateRegistrationFee && (
                        <p className="text-xs text-destructive">{errors.lateRegistrationFee.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional notes or instructions..."
                    rows={3}
                    {...register('notes')}
                  />
                  {errors.notes && (
                    <p className="text-xs text-destructive">{errors.notes.message}</p>
                  )}
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
