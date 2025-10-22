import React from 'react';
import { AcademicPeriod } from '@/types/academic';
import { AcademicPeriodCard } from './AcademicPeriodCard';
import { Card, CardContent } from '@/components/ui/card';

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
  if (!periods || periods.length === 0) {
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
      {periods.map((period) => (
        <div key={period.id} onClick={() => onSelectPeriod?.(period)}>
          <AcademicPeriodCard period={period} />
        </div>
      ))}
    </div>
  );
};
