import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface StatItem {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
}

interface CarouselStatCardProps {
  title: string;
  stats: StatItem[];
  autoRotate?: boolean;
  rotateInterval?: number;
  className?: string;
}

export function CarouselStatCard({
  title,
  stats,
  autoRotate = true,
  rotateInterval = 3000,
  className,
}: CarouselStatCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoRotate || isPaused || stats.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % stats.length);
    }, rotateInterval);

    return () => clearInterval(interval);
  }, [autoRotate, rotateInterval, isPaused, stats.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + stats.length) % stats.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % stats.length);
  };

  if (stats.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">-</div>
          <p className="text-xs text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const currentStat = stats[currentIndex];

  return (
    <Card
      className={cn('relative', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {currentStat.icon}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-2xl font-bold transition-all duration-300">
              {currentStat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1 transition-all duration-300">
              {currentStat.description || currentStat.label}
            </p>
          </div>

          {stats.length > 1 && (
            <div className="flex flex-col gap-1 ml-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleNext}
              >
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Indicator Dots */}
        {stats.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {stats.map((_, index) => (
              <button
                key={index}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  index === currentIndex
                    ? 'w-4 bg-primary'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to stat ${index + 1}`}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
