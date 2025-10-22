import React from 'react';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { AcademicPeriod } from '@/types/academic';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface AcademicPeriodCardProps {
  period: AcademicPeriod;
  onClick?: () => void;
}

export const AcademicPeriodCard: React.FC<AcademicPeriodCardProps> = ({
  period,
  onClick,
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        period.isActive ? 'border-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold">
              {period.semester?.name || 'Academic Period'}
            </CardTitle>
            {period.semester && (
              <p className="text-sm text-muted-foreground">
                {period.semester.academicYear.yearCode}
                {period.semester.academicYear.institution && (
                  <span className="text-xs">
                    {' '}
                    • {period.semester.academicYear.institution.name}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {period.isActive && (
              <Badge variant="default">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Registration Status */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center text-xs">
              {period.isRegistrationOpen ? (
                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="mr-1 h-3 w-3 text-gray-400" />
              )}
              <span className="text-muted-foreground">Registration</span>
            </div>
            <div className="flex items-center text-xs">
              {period.isAddDropOpen ? (
                <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <XCircle className="mr-1 h-3 w-3 text-gray-400" />
              )}
              <span className="text-muted-foreground">Add/Drop</span>
            </div>
          </div>

          {/* Key Dates */}
          <div className="space-y-1 border-t pt-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration:</span>
              <span className="font-medium">
                {formatDate(period.registrationStartDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lectures:</span>
              <span className="font-medium">
                {formatDate(period.lectureStartDate)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exams:</span>
              <span className="font-medium">
                {formatDate(period.examStartDate)}
              </span>
            </div>
          </div>

          {/* Credit Limits */}
          <div className="flex items-center justify-between border-t pt-2 text-xs">
            <span className="text-muted-foreground">Credit Limits:</span>
            <span className="font-medium">
              {period.minCreditsPerStudent} - {period.maxCreditsPerStudent}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface AcademicPeriodListProps {
  periods: AcademicPeriod[];
  onSelectPeriod?: (period: AcademicPeriod) => void;
  emptyMessage?: string;
}

export const AcademicPeriodList: React.FC<AcademicPeriodListProps> = ({
  periods,
  onSelectPeriod,
  emptyMessage = 'No academic periods found',
}) => {
  if (periods.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {periods.map((period) => (
        <AcademicPeriodCard
          key={period.id}
          period={period}
          onClick={() => onSelectPeriod?.(period)}
        />
      ))}
    </div>
  );
};

export default AcademicPeriodCard;
