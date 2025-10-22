import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Semester } from '@/types/academic';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface SemesterCardProps {
  semester: Semester;
  onClick?: () => void;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({ semester, onClick }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        semester.isCurrent ? 'border-primary' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg font-semibold">{semester.name}</CardTitle>
            {semester.academicYear && (
              <p className="text-sm text-muted-foreground">
                {semester.academicYear.yearCode}
                {semester.academicYear.institution && (
                  <span className="text-xs"> • {semester.academicYear.institution.name}</span>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {semester.isCurrent && (
              <Badge variant="default">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Current
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              Semester {semester.semesterNumber}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Duration */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>
              {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
            </span>
          </div>

          {/* Created */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
            <span>Created {formatDate(semester.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SemesterListProps {
  semesters: Semester[];
  onSelectSemester?: (semester: Semester) => void;
  emptyMessage?: string;
}

export const SemesterList: React.FC<SemesterListProps> = ({
  semesters,
  onSelectSemester,
  emptyMessage = 'No semesters found',
}) => {
  if (semesters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {semesters.map((semester) => (
        <SemesterCard
          key={semester.id}
          semester={semester}
          onClick={() => onSelectSemester?.(semester)}
        />
      ))}
    </div>
  );
};

export default SemesterCard;
