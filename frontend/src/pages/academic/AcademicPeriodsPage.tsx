import React from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { academicService } from '@/services/academic.service';
import { AcademicPeriodList } from '@/components/academic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, RefreshCw, Clock, TrendingUp, Calendar, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export const AcademicPeriodsPage: React.FC = () => {
  // ✅ Fetch all academic periods
  const {
    data: periodsData,
    loading: periodsLoading,
    error: periodsError,
    execute: refetch,
  } = useApiRequest(() => academicService.getAcademicPeriods(), [], {
    immediate: true,
  });

  // ✅ Fetch statistics
  const { data: statsData, loading: statsLoading } = useApiRequest(
    () => academicService.getAcademicPeriodStats(),
    [],
    { immediate: true }
  );

  // ✅ Fetch current period
  const { data: currentPeriodData } = useApiRequest(
    () => academicService.getCurrentAcademicPeriod(),
    [],
    { immediate: true }
  );

  // ⏳ TODO: Implement create period
  const handleCreate = () => {
    toast.info('Create Academic Period functionality - Coming Soon!');
  };

  const periods = periodsData || [];
  const stats = statsData;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Periods</h1>
          <p className="text-muted-foreground">
            Manage registration, lectures, and examination periods
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Period
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {!statsLoading && stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Academic Years</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalAcademicYears}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Semesters</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.overview.totalSemesters}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Year</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.current.academicYear?.yearCode || 'None'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.current.semester?.name || 'None'}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Current Period Highlight */}
      {currentPeriodData && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Current Academic Period</CardTitle>
              </div>
              <Badge>Active</Badge>
            </div>
            <CardDescription>
              {currentPeriodData.semester?.name} •{' '}
              {currentPeriodData.semester?.academicYear.yearCode}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Registration</p>
                <p className="text-sm font-semibold">
                  {currentPeriodData.isRegistrationOpen ? (
                    <span className="text-green-600">Open</span>
                  ) : (
                    <span className="text-gray-500">Closed</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Add/Drop</p>
                <p className="text-sm font-semibold">
                  {currentPeriodData.isAddDropOpen ? (
                    <span className="text-green-600">Open</span>
                  ) : (
                    <span className="text-gray-500">Closed</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Credit Range</p>
                <p className="text-sm font-semibold">
                  {currentPeriodData.minCreditsPerStudent} -{' '}
                  {currentPeriodData.maxCreditsPerStudent}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Exam Date</p>
                <p className="text-sm font-semibold">
                  {new Date(currentPeriodData.examStartDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {periodsError && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{periodsError}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {periodsLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Periods List */}
      {!periodsLoading && !periodsError && (
        <AcademicPeriodList
          periods={periods}
          onSelectPeriod={(period) => toast.info(`Selected: ${period.semester?.name}`)}
          emptyMessage="No academic periods configured yet."
        />
      )}
    </div>
  );
};

export default AcademicPeriodsPage;
