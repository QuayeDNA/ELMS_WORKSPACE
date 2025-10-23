import { useState } from 'react';
import { Plus, Calendar, Grid3x3, Table2, RefreshCw } from 'lucide-react';
import { useApiRequest } from '@/hooks/useApiRequest';
import { academicService } from '@/services/academic.service';
import { AcademicYear } from '@/types/academic';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { SearchAndFilter } from '@/components/shared/SearchAndFilter';
import { AcademicYearDetailView } from '@/components/academic/AcademicYearDetailView';
import { AcademicYearForm } from '@/components/academic/AcademicYearForm';
import { AcademicYearCard } from '@/components/academic/AcademicYearCard';
import { AcademicYearTable } from '@/components/academic/AcademicYearTable';
import { useAuthStore } from '@/stores/auth.store';

/**
 * Academic Calendar Page
 *
 * Consolidated page for managing Academic Years, Semesters, and Academic Periods
 * Replaces the previous scattered pages (AcademicYearsPage, SemestersPage, AcademicPeriodsPage)
 *
 * Features:
 * - List/Grid view of academic years
 * - Current year highlighting
 * - Detailed year view with semesters and periods
 * - Integrated forms for creating/editing
 * - Quick actions for calendar management
 */
export default function AcademicCalendarPage() {
  // Get user's institution ID
  const { user } = useAuthStore();
  const institutionId = user?.institutionId;

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [selectedYearId, setSelectedYearId] = useState<number | null>(null);
  const [showYearForm, setShowYearForm] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  // Fetch academic years - filtered by institution
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
        institutionId, // Filter by user's institution
      }),
    [page, searchTerm, sortOrder, institutionId],
    { immediate: true }
  );

  // Fetch current academic year - filtered by institution
  const { data: currentYearData } = useApiRequest(
    () => academicService.getCurrentAcademicYear(institutionId),
    [institutionId],
    { immediate: true }
  );

  const academicYears = academicYearsData?.data || [];
  const pagination = academicYearsData?.pagination;

  // Handlers
  const handleCreateYear = () => {
    setEditingYear(null);
    setShowYearForm(true);
  };

  const handleEditYear = (year: AcademicYear) => {
    setEditingYear(year);
    setShowYearForm(true);
  };

  const handleDeleteYear = async (yearId: number) => {
    try {
      await academicService.deleteAcademicYear(yearId);
      toast.success('Academic year deleted successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to delete academic year');
      console.error(error);
    }
  };

  const handleSetCurrentYear = async (yearId: number) => {
    try {
      await academicService.setCurrentAcademicYear(yearId);
      toast.success('Current academic year updated');
      refetch();
    } catch (error) {
      toast.error('Failed to set current year');
      console.error(error);
    }
  };

  const handleViewDetails = (yearId: number) => {
    setSelectedYearId(yearId);
  };

  const handleFormSuccess = () => {
    setShowYearForm(false);
    setEditingYear(null);
    refetch();
    toast.success(editingYear ? 'Academic year updated' : 'Academic year created');
  };

  const handleFormCancel = () => {
    setShowYearForm(false);
    setEditingYear(null);
  };

  // Render loading state
  if (loading && !academicYears.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : (
          <Skeleton className="h-96" />
        )}
      </div>
    );
  }

  // Render error state
  if (error && !academicYears.length) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <Calendar className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="font-semibold text-lg">Error Loading Academic Calendar</h3>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Academic Calendar</h1>
          <p className="text-muted-foreground">
            Manage academic years, semesters, and period configurations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateYear} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Academic Year
          </Button>
        </div>
      </div>

      {/* Current Year Highlight */}
      {currentYearData && (
        <Card className="border-primary bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">Current Academic Year</h3>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {currentYearData.yearCode} • {new Date(currentYearData.startDate).toLocaleDateString()} -{' '}
                    {new Date(currentYearData.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(currentYearData.id)}
              >
                View Details
              </Button>
            </div>
          </CardHeader>
          {currentYearData.semesters && currentYearData.semesters.length > 0 && (
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">{currentYearData.semesters.length}</span>
                semester{currentYearData.semesters.length !== 1 ? 's' : ''} configured
                {currentYearData.semesters.some(s => s.isCurrent) && (
                  <>
                    {' '}
                    • Current:{' '}
                    <span className="font-medium text-foreground">
                      {currentYearData.semesters.find(s => s.isCurrent)?.name}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Filters and Search */}
      <SearchAndFilter
        searchPlaceholder="Search academic years..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        sortOptions={[
          { label: 'Newest First', value: 'desc' },
          { label: 'Oldest First', value: 'asc' },
        ]}
        sortValue={sortOrder}
        onSortChange={(value) => setSortOrder(value as 'asc' | 'desc')}
        rightContent={
          <div className="flex gap-1 border rounded-lg p-1 bg-muted/50">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="gap-2"
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="gap-2"
            >
              <Table2 className="h-4 w-4" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
        }
      />

      {/* Results Count */}
      {pagination && (
        <div className="text-sm text-muted-foreground">
          Showing <span className="font-medium text-foreground">{academicYears.length}</span> of{' '}
          <span className="font-medium text-foreground">{pagination.total}</span> academic years
        </div>
      )}

      {/* Content: Grid or Table View */}
      {academicYears.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="p-4 bg-muted rounded-full">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">No Academic Years Found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {searchTerm
                    ? 'Try adjusting your search terms'
                    : 'Get started by creating your first academic year'}
                </p>
              </div>
              {!searchTerm && (
                <Button onClick={handleCreateYear}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Academic Year
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {academicYears.map((year) => (
            <AcademicYearCard
              key={year.id}
              year={year}
              onView={() => handleViewDetails(year.id)}
              onEdit={() => handleEditYear(year)}
              onDelete={() => handleDeleteYear(year.id)}
              onSetCurrent={() => handleSetCurrentYear(year.id)}
              isCurrent={year.id === currentYearData?.id}
            />
          ))}
        </div>
      ) : (
        <AcademicYearTable
          years={academicYears}
          currentYearId={currentYearData?.id}
          onView={handleViewDetails}
          onEdit={handleEditYear}
          onDelete={handleDeleteYear}
          onSetCurrent={handleSetCurrentYear}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={!pagination.hasPrev}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!pagination.hasNext}
          >
            Next
          </Button>
        </div>
      )}

      {/* Academic Year Detail View (Modal/Drawer) */}
      {selectedYearId && (
        <AcademicYearDetailView
          yearId={selectedYearId}
          open={selectedYearId !== null}
          onClose={() => setSelectedYearId(null)}
          onRefresh={refetch}
        />
      )}

      {/* Academic Year Form (Create/Edit) */}
      {showYearForm && (
        <AcademicYearForm
          academicYear={editingYear || undefined}
          open={showYearForm}
          onSuccess={handleFormSuccess}
          onClose={handleFormCancel}
        />
      )}
    </div>
  );
}
