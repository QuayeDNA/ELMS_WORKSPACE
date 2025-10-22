import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle, MoreVertical, Edit, Trash2, Check, Eye } from 'lucide-react';
import { AcademicYear } from '@/types/academic';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface AcademicYearCardProps {
  academicYear?: AcademicYear; // Legacy prop
  year?: AcademicYear; // New prop
  isCurrent?: boolean;
  onClick?: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetCurrent?: () => void;
}

export const AcademicYearCard: React.FC<AcademicYearCardProps> = ({
  academicYear,
  year,
  isCurrent: isCurrentProp,
  onClick,
  onView,
  onEdit,
  onDelete,
  onSetCurrent,
}) => {
  // Support both prop names for backwards compatibility
  const yearData = year || academicYear;
  if (!yearData) return null;

  const isCurrentYear = isCurrentProp !== undefined ? isCurrentProp : yearData.isCurrent;
  const hasActions = onEdit || onDelete || onSetCurrent;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const semesterCount = yearData.semesters?.length || 0;
  const handleCardClick = () => {
    if (onView) {
      onView();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md group',
        isCurrentYear && 'border-primary bg-primary/5'
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold">
              {yearData.yearCode}
            </CardTitle>
            {yearData.institution && (
              <p className="text-sm text-muted-foreground">
                {yearData.institution.name}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isCurrentYear && (
              <Badge variant="default" className="text-xs">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Current
              </Badge>
            )}
            {hasActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onView && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onSetCurrent && !isCurrentYear && (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onSetCurrent();
                    }}>
                      <Check className="h-4 w-4 mr-2" />
                      Set as Current
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Duration */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>
              {formatDate(yearData.startDate)} -{' '}
              {formatDate(yearData.endDate)}
            </span>
          </div>

          {/* Semesters */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              {semesterCount} {semesterCount === 1 ? 'Semester' : 'Semesters'}
            </span>
          </div>

          {/* Semesters List */}
          {yearData.semesters && yearData.semesters.length > 0 && (
            <div className="mt-3 space-y-1 border-t pt-3">
              <p className="text-xs font-medium text-muted-foreground">Semesters:</p>
              {yearData.semesters.map((semester) => (
                <div
                  key={semester.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span>{semester.name}</span>
                  {semester.isCurrent && (
                    <Badge variant="outline" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface AcademicYearListProps {
  academicYears: AcademicYear[];
  onSelectYear?: (year: AcademicYear) => void;
  emptyMessage?: string;
}

export const AcademicYearList: React.FC<AcademicYearListProps> = ({
  academicYears,
  onSelectYear,
  emptyMessage = 'No academic years found',
}) => {
  if (academicYears.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {academicYears.map((year) => (
        <AcademicYearCard
          key={year.id}
          academicYear={year}
          onClick={() => onSelectYear?.(year)}
        />
      ))}
    </div>
  );
};

export default AcademicYearCard;
