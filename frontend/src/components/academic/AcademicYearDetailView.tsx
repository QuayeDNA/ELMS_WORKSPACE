import { useState } from 'react';
import { X, Plus, Calendar, Edit, Trash2, Check, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { academicService } from '@/services/academic.service';
import { AcademicYear, Semester, AcademicPeriod } from '@/types/academic';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';
import { AcademicPeriodCalendar } from './AcademicPeriodCalendar';
import { SemesterForm } from './SemesterForm';

interface AcademicYearDetailViewProps {
  yearId: number;
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export function AcademicYearDetailView({
  yearId,
  open,
  onClose,
  onRefresh,
}: AcademicYearDetailViewProps) {
  const [showSemesterForm, setShowSemesterForm] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  // Fetch academic year details
  const {
    data: yearData,
    loading: yearLoading,
    error: yearError,
    execute: refetchYear,
  } = useApiRequest(
    () => academicService.getAcademicYearById(yearId),
    [yearId],
    { immediate: open }
  );

  // Fetch semesters for this year
  const {
    data: semestersData,
    loading: semestersLoading,
    execute: refetchSemesters,
  } = useApiRequest(
    () => academicService.getSemesters({ academicYearId: yearId, limit: 50 }),
    [yearId],
    { immediate: open }
  );

  const year = yearData;
  const semesters = semestersData?.data || [];

  const handleClose = () => {
    onClose();
    setShowSemesterForm(false);
    setEditingSemester(null);
  };

  const handleAddSemester = () => {
    setEditingSemester(null);
    setShowSemesterForm(true);
  };

  const handleEditSemester = (semester: Semester) => {
    setEditingSemester(semester);
    setShowSemesterForm(true);
  };

  const handleDeleteSemester = async (semesterId: number) => {
    if (!confirm('Are you sure you want to delete this semester?')) return;

    try {
      await academicService.deleteSemester(semesterId);
      toast.success('Semester deleted successfully');
      refetchSemesters();
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete semester');
      console.error(error);
    }
  };

  const handleSetCurrentSemester = async (semesterId: number) => {
    try {
      await academicService.setCurrentSemester(semesterId);
      toast.success('Current semester updated');
      refetchSemesters();
      onRefresh();
    } catch (error) {
      toast.error('Failed to set current semester');
      console.error(error);
    }
  };

  const handleSemesterFormSuccess = () => {
    setShowSemesterForm(false);
    setEditingSemester(null);
    refetchSemesters();
    refetchYear();
    onRefresh();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Sheet open={open} onOpenChange={handleClose}>
        <SheetContent className="sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  Academic Year: {year?.yearCode || 'Loading...'}
                  {year?.isCurrent && (
                    <Badge variant="default" className="text-xs">
                      Current
                    </Badge>
                  )}
                </div>
              </div>
            </SheetTitle>
            <SheetDescription>
              Manage semesters and academic calendar configurations
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Year Information */}
            {yearLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : yearError ? (
              <div className="p-4 border border-destructive rounded-lg text-destructive text-sm">
                Failed to load academic year details
              </div>
            ) : year ? (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="text-sm font-medium">
                    {formatDate(year.startDate)} - {formatDate(year.endDate)}
                  </span>
                </div>
                {year.institution && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Institution</span>
                    <span className="text-sm font-medium">{year.institution.name}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Semesters</span>
                  <span className="text-sm font-medium">{semesters.length}</span>
                </div>
              </div>
            ) : null}

            {/* Semesters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Semesters & Calendar</h3>
                <Button size="sm" onClick={handleAddSemester}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Semester
                </Button>
              </div>

              {semestersLoading ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : semesters.length === 0 ? (
                <div className="text-center py-12 border rounded-lg border-dashed">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">
                    No semesters configured yet
                  </p>
                  <Button size="sm" onClick={handleAddSemester}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Semester
                  </Button>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-3">
                  {semesters.map((semester) => (
                    <SemesterItem
                      key={semester.id}
                      semester={semester}
                      onEdit={() => handleEditSemester(semester)}
                      onDelete={() => handleDeleteSemester(semester.id)}
                      onSetCurrent={() => handleSetCurrentSemester(semester.id)}
                    />
                  ))}
                </Accordion>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Semester Form Modal */}
      {showSemesterForm && (
        <SemesterForm
          semester={editingSemester}
          academicYearId={yearId}
          open={showSemesterForm}
          onSuccess={handleSemesterFormSuccess}
          onCancel={() => {
            setShowSemesterForm(false);
            setEditingSemester(null);
          }}
        />
      )}
    </>
  );
}

interface SemesterItemProps {
  semester: Semester;
  onEdit: () => void;
  onDelete: () => void;
  onSetCurrent: () => void;
}

function SemesterItem({ semester, onEdit, onDelete, onSetCurrent }: SemesterItemProps) {
  const [expanded, setExpanded] = useState(false);

  // Fetch academic period for this semester
  const { data: periodData, loading: periodLoading } = useApiRequest(
    () => academicService.getAcademicPeriodBySemester(semester.id),
    [semester.id],
    { immediate: expanded }
  );

  const period = periodData;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <AccordionItem value={semester.id.toString()} className="border rounded-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-muted rounded-lg">
              <Calendar className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold">
                  Semester {semester.semesterNumber}: {semester.name}
                </h4>
                {semester.isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            {!semester.isCurrent && (
              <Button variant="ghost" size="sm" onClick={onSetCurrent}>
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
            <AccordionTrigger className="hover:no-underline" onClick={() => setExpanded(!expanded)}>
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </AccordionTrigger>
          </div>
        </div>
      </div>

      <AccordionContent>
        <div className="px-4 pb-4 pt-2 border-t">
          {periodLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : period ? (
            <AcademicPeriodCalendar period={period} semesterId={semester.id} />
          ) : (
            <div className="text-center py-8 border rounded-lg border-dashed">
              <p className="text-sm text-muted-foreground mb-2">
                No academic period configured
              </p>
              <Button size="sm" variant="outline" onClick={onEdit}>
                Configure Calendar
              </Button>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
