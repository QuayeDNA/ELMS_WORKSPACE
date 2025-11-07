import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle, FileText, Edit, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { SearchAndFilter, FilterGroup, SortOption } from '@/components/shared/SearchAndFilter';
import { CreateTimetableForm } from '@/components/exams/CreateTimetableForm';
import {
  examTimetableService,
  ExamTimetable,
  ExamTimetableStatus,
  TimetableApprovalStatus,
  TimetableQuery,
} from '@/services/examTimetable.service';
import { academicService } from '@/services/academic.service';
import type { Semester } from '@/types/academic';
import { format } from 'date-fns';

export default function ExamTimetableListPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [timetables, setTimetables] = useState<ExamTimetable[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingSemesters, setLoadingSemesters] = useState(true);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Filter state
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all');
  const [publishedFilter, setPublishedFilter] = useState('all');
  const [sortValue, setSortValue] = useState('createdAt-desc');

  // Sort options
  const sortOptions: SortOption[] = [
    { value: 'createdAt-desc', label: 'Newest First' },
    { value: 'createdAt-asc', label: 'Oldest First' },
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'startDate-asc', label: 'Start Date (Earliest)' },
    { value: 'startDate-desc', label: 'Start Date (Latest)' },
  ];

  // Filter groups
  const filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: (value) => setStatusFilter(value as string),
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: ExamTimetableStatus.DRAFT, label: 'Draft' },
        { value: ExamTimetableStatus.PENDING_APPROVAL, label: 'Pending Approval' },
        { value: ExamTimetableStatus.APPROVED, label: 'Approved' },
        { value: ExamTimetableStatus.PUBLISHED, label: 'Published' },
        { value: ExamTimetableStatus.IN_PROGRESS, label: 'In Progress' },
        { value: ExamTimetableStatus.COMPLETED, label: 'Completed' },
        { value: ExamTimetableStatus.ARCHIVED, label: 'Archived' },
      ],
    },
    {
      id: 'approvalStatus',
      label: 'Approval Status',
      type: 'select',
      value: approvalStatusFilter,
      onChange: (value) => setApprovalStatusFilter(value as string),
      options: [
        { value: 'all', label: 'All' },
        { value: TimetableApprovalStatus.NOT_SUBMITTED, label: 'Not Submitted' },
        { value: TimetableApprovalStatus.PENDING, label: 'Pending' },
        { value: TimetableApprovalStatus.APPROVED, label: 'Approved' },
        { value: TimetableApprovalStatus.REJECTED, label: 'Rejected' },
        { value: TimetableApprovalStatus.REVISION_REQUIRED, label: 'Revision Required' },
      ],
    },
    {
      id: 'isPublished',
      label: 'Published',
      type: 'select',
      value: publishedFilter,
      onChange: (value) => setPublishedFilter(value as string),
      options: [
        { value: 'all', label: 'All' },
        { value: 'true', label: 'Published' },
        { value: 'false', label: 'Not Published' },
      ],
    },
  ];

  const fetchTimetables = async (overrides: Partial<TimetableQuery> = {}) => {
    try {
      setLoading(true);
      const institutionId = user?.institutionId;

      // Build query from filter state
      const [sortBy, sortOrder] = sortValue.split('-');
      const query: TimetableQuery = {
        institutionId,
        page: 1,
        limit: 10,
        search: searchValue || undefined,
        status: statusFilter && statusFilter !== 'all' ? (statusFilter as ExamTimetableStatus) : undefined,
        approvalStatus: approvalStatusFilter && approvalStatusFilter !== 'all' ? (approvalStatusFilter as TimetableApprovalStatus) : undefined,
        isPublished: publishedFilter && publishedFilter !== 'all' ? publishedFilter === 'true' : undefined,
        sortBy: sortBy as TimetableQuery['sortBy'],
        sortOrder: sortOrder as 'asc' | 'desc',
        ...overrides,
      };

      const response = await examTimetableService.getTimetables(query);

      console.log('📊 Timetables Response:', response);
      console.log('📊 Response.data:', response.data);
      console.log('📊 Is array?', Array.isArray(response.data));

      if (response.success && Array.isArray(response.data)) {
        console.log('✅ Setting timetables:', response.data);
        setTimetables(response.data);
        setPagination(response.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      } else {
        console.log('❌ Invalid response structure, setting empty array');
        // Handle empty or invalid response
        setTimetables([]);
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching timetables:', error);
      toast.error('Failed to load exam timetables');
      // Set empty state on error
      setTimetables([]);
      setPagination({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSemesters = async () => {
    try {
      setLoadingSemesters(true);
      const response = await academicService.getSemesters({
        institutionId: user?.institutionId, // Critical: Filter by user's institution for data isolation
        page: 1,
        limit: 100,
        sortBy: 'semesterNumber',
        sortOrder: 'desc', // Get most recent semesters first
      });

      if (response.data && Array.isArray(response.data.data)) {
        setSemesters(response.data.data);
        // Auto-select current semester or most recent
        const currentSemester = response.data.data.find((s) => s.isCurrent);
        if (currentSemester) {
          setSelectedSemester(currentSemester);
        } else if (response.data.data.length > 0) {
          setSelectedSemester(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching semesters:', error);
      toast.error('Failed to load semesters');
    } finally {
      setLoadingSemesters(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
    fetchTimetables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loadingSemesters) {
      fetchTimetables();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, statusFilter, approvalStatusFilter, publishedFilter, sortValue]);

  const handlePageChange = (newPage: number) => {
    fetchTimetables({ page: newPage, limit: pagination.limit });
  };

  const handleCreateSuccess = (timetableId: number) => {
    // Refresh the list
    fetchTimetables();
    // Navigate to the detail page
    navigate(`/admin/exams/${timetableId}`);
  };

  const getStatusBadge = (status: ExamTimetableStatus) => {
    type StatusConfigType = {
      variant: 'secondary' | 'default' | 'destructive';
      icon: React.ElementType;
    };

    const statusConfig: Record<string, StatusConfigType> = {
      [ExamTimetableStatus.DRAFT]: { variant: 'secondary', icon: FileText },
      [ExamTimetableStatus.PENDING_APPROVAL]: { variant: 'default', icon: Clock },
      [ExamTimetableStatus.APPROVED]: { variant: 'default', icon: CheckCircle },
      [ExamTimetableStatus.PUBLISHED]: { variant: 'default', icon: CheckCircle },
      [ExamTimetableStatus.IN_PROGRESS]: { variant: 'default', icon: Clock },
      [ExamTimetableStatus.COMPLETED]: { variant: 'default', icon: CheckCircle },
      [ExamTimetableStatus.ARCHIVED]: { variant: 'secondary', icon: FileText },
    };

    const config = statusConfig[status] || statusConfig[ExamTimetableStatus.DRAFT];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getApprovalBadge = (approvalStatus: TimetableApprovalStatus) => {
    type StatusConfigType = {
      variant: 'secondary' | 'default' | 'destructive';
      icon: React.ElementType;
    };

    const statusConfig: Record<string, StatusConfigType> = {
      [TimetableApprovalStatus.NOT_SUBMITTED]: { variant: 'secondary', icon: FileText },
      [TimetableApprovalStatus.PENDING]: { variant: 'default', icon: Clock },
      [TimetableApprovalStatus.APPROVED]: { variant: 'default', icon: CheckCircle },
      [TimetableApprovalStatus.REJECTED]: { variant: 'destructive', icon: XCircle },
      [TimetableApprovalStatus.REVISION_REQUIRED]: { variant: 'default', icon: AlertCircle },
    };

    const config = statusConfig[approvalStatus] || statusConfig[TimetableApprovalStatus.NOT_SUBMITTED];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {approvalStatus.replace(/_/g, ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exam Timetables</h1>
          <p className="text-muted-foreground mt-1">
            Manage exam schedules and timetables for your institution
          </p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => setCreateFormOpen(true)}
          disabled={!selectedSemester}
        >
          <Plus className="h-5 w-5" />
          Create Timetable
        </Button>
      </div>

      {/* Semester Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Semester</CardTitle>
          <CardDescription>
            Choose a semester to view and manage its exam timetables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <Select
                value={selectedSemester?.id.toString()}
                onValueChange={(value) => {
                  const semester = semesters.find((s) => s.id.toString() === value);
                  setSelectedSemester(semester || null);
                }}
                disabled={loadingSemesters || semesters.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={loadingSemesters ? 'Loading semesters...' : 'Select a semester'} />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{semester.name}</span>
                        {semester.academicYear && (
                          <span className="text-muted-foreground text-sm">
                            ({semester.academicYear.yearCode})
                          </span>
                        )}
                        {semester.isCurrent && (
                          <Badge variant="default" className="ml-2">Current</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSemester && (
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-muted-foreground">Academic Year: </span>
                  <span className="font-medium">{selectedSemester.academicYear?.yearCode}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Period: </span>
                  <span className="font-medium">
                    {format(new Date(selectedSemester.startDate), 'MMM d, yyyy')} - {' '}
                    {format(new Date(selectedSemester.endDate), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            )}
          </div>
          {semesters.length === 0 && !loadingSemesters && (
            <p className="text-sm text-muted-foreground mt-2">
              No semesters found. Please create an academic year and semester first.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <SearchAndFilter
        searchPlaceholder="Search timetables..."
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={setSortValue}
        filterGroups={filterGroups}
        onClearAll={() => {
          setSearchValue('');
          setStatusFilter('all');
          setApprovalStatusFilter('all');
          setPublishedFilter('all');
          setSortValue('createdAt-desc');
        }}
      />

      {/* Timetables Grid */}
      {timetables.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No timetables found</h3>
            <p className="text-muted-foreground text-center mb-6">
              Get started by creating your first exam timetable
            </p>
            <Button className="gap-2" onClick={() => setCreateFormOpen(true)}>
              <Plus className="h-4 w-4" />
              Create Timetable
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {timetables.map((timetable) => (
              <Card key={timetable.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{timetable.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {timetable.academicYear?.yearCode} - {timetable.semester?.name}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    {getStatusBadge(timetable.status)}
                    {getApprovalBadge(timetable.approvalStatus)}
                    {timetable.isPublished && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Published
                      </Badge>
                    )}
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(timetable.startDate), 'MMM dd, yyyy')} -{' '}
                      {format(new Date(timetable.endDate), 'MMM dd, yyyy')}
                    </span>
                  </div>

                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-2xl font-bold">{timetable.totalExams}</p>
                      <p className="text-xs text-muted-foreground">Total Exams</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">{timetable.totalConflicts}</p>
                      <p className="text-xs text-muted-foreground">Conflicts</p>
                    </div>
                  </div>

                  {/* Description */}
                  {timetable.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {timetable.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 gap-2"
                      onClick={() => navigate(`/admin/exams/${timetable.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate(`/admin/exams/${timetable.id}?edit=true`)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Create Timetable Form */}
      <CreateTimetableForm
        open={createFormOpen}
        onOpenChange={setCreateFormOpen}
        onSuccess={handleCreateSuccess}
        preselectedSemester={selectedSemester}
      />
    </div>
  );
}
