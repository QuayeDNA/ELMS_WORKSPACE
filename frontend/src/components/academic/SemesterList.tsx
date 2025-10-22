import React from 'react';
import { Semester } from '@/types/academic';
import { SemesterCard } from './SemesterCard';
import { Card, CardContent } from '@/components/ui/card';

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
  if (!semesters || semesters.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-40 items-center justify-center">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {semesters.map((semester) => (
        <div key={semester.id} onClick={() => onSelectSemester?.(semester)}>
          <SemesterCard semester={semester} />
        </div>
      ))}
    </div>
  );
};
