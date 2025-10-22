import { useState } from 'react';
import { Calendar, Clock, BookOpen, FileCheck, Trophy, Edit, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AcademicPeriod } from '@/types/academic';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { academicService } from '@/services/academic.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AcademicPeriodCalendarProps {
  period: AcademicPeriod;
  semesterId: number;
}

export function AcademicPeriodCalendar({ period, semesterId }: AcademicPeriodCalendarProps) {
  const navigate = useNavigate();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCurrentPhase = () => {
    const now = new Date();
    const regStart = new Date(period.registrationStartDate);
    const regEnd = new Date(period.registrationEndDate);
    const addDropStart = period.addDropStartDate ? new Date(period.addDropStartDate) : null;
    const addDropEnd = period.addDropEndDate ? new Date(period.addDropEndDate) : null;
    const lectureStart = new Date(period.lectureStartDate);
    const lectureEnd = new Date(period.lectureEndDate);
    const examStart = new Date(period.examStartDate);
    const examEnd = new Date(period.examEndDate);

    if (now < regStart) return 'before_registration';
    if (now >= regStart && now <= regEnd) return 'registration';
    if (addDropStart && addDropEnd && now >= addDropStart && now <= addDropEnd) return 'add_drop';
    if (now >= lectureStart && now <= lectureEnd) return 'lectures';
    if (now >= examStart && now <= examEnd) return 'exams';
    return 'completed';
  };

  const currentPhase = getCurrentPhase();

  const handleToggleRegistration = async () => {
    setActionLoading('registration');
    try {
      if (period.isRegistrationOpen) {
        await academicService.closeRegistration(period.id);
        toast.success('Registration closed');
      } else {
        await academicService.openRegistration(period.id);
        toast.success('Registration opened');
      }
      window.location.reload(); // Refresh to get updated data
    } catch (error) {
      toast.error('Failed to toggle registration');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAddDrop = async () => {
    setActionLoading('add_drop');
    try {
      if (period.isAddDropOpen) {
        await academicService.closeAddDrop(period.id);
        toast.success('Add/Drop closed');
      } else {
        await academicService.openAddDrop(period.id);
        toast.success('Add/Drop opened');
      }
      window.location.reload();
    } catch (error) {
      toast.error('Failed to toggle add/drop');
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadExamTimetable = () => {
    // Navigate to exam timetable page with pre-filled dates
    navigate('/admin/exams/timetable', {
      state: {
        semesterId,
        examStartDate: period.examStartDate,
        examEndDate: period.examEndDate,
      },
    });
  };

  const phases = [
    {
      id: 'registration',
      label: 'Registration',
      icon: Calendar,
      start: period.registrationStartDate,
      end: period.registrationEndDate,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      active: currentPhase === 'registration',
      isOpen: period.isRegistrationOpen,
    },
    {
      id: 'add_drop',
      label: 'Add/Drop',
      icon: Clock,
      start: period.addDropStartDate,
      end: period.addDropEndDate,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      active: currentPhase === 'add_drop',
      isOpen: period.isAddDropOpen,
      optional: true,
    },
    {
      id: 'lectures',
      label: 'Lectures',
      icon: BookOpen,
      start: period.lectureStartDate,
      end: period.lectureEndDate,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      active: currentPhase === 'lectures',
    },
    {
      id: 'exams',
      label: 'Exams',
      icon: FileCheck,
      start: period.examStartDate,
      end: period.examEndDate,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      active: currentPhase === 'exams',
    },
    {
      id: 'results',
      label: 'Results',
      icon: Trophy,
      start: period.resultsReleaseDate,
      end: null,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      active: currentPhase === 'completed',
      optional: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Visual Timeline */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Academic Calendar Timeline</h4>
          <Badge variant="outline" className="text-xs">
            Phase: {currentPhase.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="relative">
          {/* Timeline Bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden flex">
            {phases.map((phase, index) => {
              if (phase.optional && !phase.start) return null;
              return (
                <div
                  key={phase.id}
                  className={cn(
                    'transition-all',
                    phase.color,
                    phase.active && 'animate-pulse'
                  )}
                  style={{ flex: 1 }}
                />
              );
            })}
          </div>

          {/* Timeline Progress Indicator */}
          {currentPhase !== 'before_registration' && currentPhase !== 'completed' && (
            <div className="absolute top-0 left-0 h-2 bg-primary/50 rounded-full transition-all" />
          )}
        </div>

        {/* Phase Details */}
        <div className="grid grid-cols-1 gap-3">
          {phases.map((phase) => {
            if (phase.optional && !phase.start) return null;

            const Icon = phase.icon;

            return (
              <div
                key={phase.id}
                className={cn(
                  'p-3 rounded-lg border-2 transition-all',
                  phase.active
                    ? `${phase.bgColor} border-current ${phase.textColor}`
                    : 'bg-muted/30 border-transparent'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn('p-2 rounded-lg', phase.active ? phase.bgColor : 'bg-muted')}>
                      <Icon className={cn('h-4 w-4', phase.active && phase.textColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm">{phase.label}</h5>
                        {phase.active && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                        {phase.isOpen !== undefined && (
                          <Badge
                            variant={phase.isOpen ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {phase.isOpen ? 'Open' : 'Closed'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(phase.start!)}
                        {phase.end && ` - ${formatDate(phase.end)}`}
                        {!phase.end && ' onwards'}
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  {phase.id === 'registration' && (
                    <Button
                      size="sm"
                      variant={period.isRegistrationOpen ? 'destructive' : 'default'}
                      onClick={handleToggleRegistration}
                      disabled={actionLoading === 'registration'}
                    >
                      {actionLoading === 'registration'
                        ? 'Loading...'
                        : period.isRegistrationOpen
                        ? 'Close'
                        : 'Open'}
                    </Button>
                  )}

                  {phase.id === 'add_drop' && phase.start && (
                    <Button
                      size="sm"
                      variant={period.isAddDropOpen ? 'destructive' : 'default'}
                      onClick={handleToggleAddDrop}
                      disabled={actionLoading === 'add_drop'}
                    >
                      {actionLoading === 'add_drop'
                        ? 'Loading...'
                        : period.isAddDropOpen
                        ? 'Close'
                        : 'Open'}
                    </Button>
                  )}

                  {phase.id === 'exams' && (
                    <Button size="sm" variant="outline" onClick={handleUploadExamTimetable}>
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Timetable
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Configuration Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Credit Range</span>
            <span className="font-medium">
              {period.minCreditsPerStudent} - {period.maxCreditsPerStudent} credits
            </span>
          </div>

          {period.lateRegistrationFee && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Late Registration Fee</span>
              <span className="font-medium">${period.lateRegistrationFee}</span>
            </div>
          )}

          {period.notes && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs mb-1">Notes:</p>
              <p className="text-xs">{period.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
