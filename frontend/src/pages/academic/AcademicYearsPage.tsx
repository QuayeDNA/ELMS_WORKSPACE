import React, { useState } from 'react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { academicService } from '@/services/academic.service';
import { AcademicYear } from '@/types/academic';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const AcademicYearsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ✅ IMPLEMENTED: Fetch academic years with pagination
  const {
    data: academicYearsData,
    loading,
    error,
    execute: refetch,
  } = useApiRequest(
    () =>
      academicService.getAcademicYears({
        page,
        limit: 12,
        search: searchTerm,
        sortBy: 'createdAt',
        sortOrder,
      }),
    [page, searchTerm, sortOrder],
    { immediate: true }
  );

  // ✅ IMPLEMENTED: Fetch current academic year
  const { data: currentYearData } = useApiRequest(
    () => academicService.getCurrentAcademicYear(),
    [],
    { immediate: true }
  );

  // ⏳ TODO: Implement create academic year
  const handleCreate = () => {
    toast.info('Create Academic Year functionality - Coming Soon!', {
      description: 'Service method ready, form component pending implementation.',
    });
  };

  // Handle year selection for details view
  const handleSelectYear = (year: AcademicYear) => {
    toast.info(`Selected: ${year.yearCode}`, {
      description: 'Detail view - Coming Soon!',
    });
  };

  const academicYears = academicYearsData?.data || [];
  const pagination = academicYearsData?.pagination;

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Years</h1>
          <p className="text-muted-foreground">
            Manage and view all academic year periods
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleCreate} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Year
          </Button>
        </div>
      </div>

      {/* Current Academic Year Highlight */}
      {currentYearData && (
        <Card className="border-primary">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <CardTitle>Current Academic Year</CardTitle>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{currentYearData.yearCode}</p>
                <p className="text-sm text-muted-foreground">
                  {currentYearData.institution?.name}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>
                  {new Date(currentYearData.startDate).toLocaleDateString()} -{' '}
                  {new Date(currentYearData.endDate).toLocaleDateString()}
                </p>
                <p className="mt-1">
                  {currentYearData.semesters?.length || 0} semesters
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter academic years</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by year code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={sortOrder}
              onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Sort order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Academic Years List */}
      {!loading && !error && (
        <>
          {/* Academic Years Grid */}
          {academicYears.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">
                  No academic years found. Create one to get started.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {academicYears.map((year) => (
                <Card
                  key={year.id}
                  className="cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => handleSelectYear(year)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{year.yearCode}</CardTitle>
                        <CardDescription className="mt-1">
                          {year.institution?.name || 'N/A'}
                        </CardDescription>
                      </div>
                      {currentYearData?.id === year.id && (
                        <Badge variant="default">Current</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Start Date</span>
                        <span className="font-medium">
                          {new Date(year.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">End Date</span>
                        <span className="font-medium">
                          {new Date(year.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Semesters</span>
                        <Badge variant="secondary">
                          {year.semesters?.length || 0}
                        </Badge>
                      </div>
                      {year.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                          {year.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {academicYears.length} of {pagination.total} results
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AcademicYearsPage;
