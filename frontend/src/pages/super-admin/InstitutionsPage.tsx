import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, TrendingUp, TrendingDown, Activity, Grid3x3, Table2, Building, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchAndFilter, FilterGroup, SortOption } from "@/components/shared/SearchAndFilter";

// Import our modular components
import {
  InstitutionTable,
  InstitutionCard,
  InstitutionAnalytics,
  InstitutionAnalyticsData,
  InstitutionForm,
} from "@/components/institutions";

// Import types and services
import {
  Institution,
  InstitutionFilters as IFilters,
  DEFAULT_INSTITUTION_FILTERS,
  InstitutionStatus,
  InstitutionType,
  INSTITUTION_TYPE_OPTIONS,
  INSTITUTION_STATUS_OPTIONS,
} from "@/types/institution";
import { institutionService } from "@/services/institution.service";

// ========================================
// INTERFACE DEFINITIONS
// ========================================

interface InstitutionsPageState {
  institutions: Institution[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface FormState {
  isOpen: boolean;
  mode: "create" | "edit" | "create-with-admin";
  editingInstitution: Institution | null;
  loading: boolean;
}

interface AnalyticsState {
  data: InstitutionAnalyticsData | null;
  loading: boolean;
  error: string | null;
}

// ========================================
// MAIN COMPONENT
// ========================================

export function InstitutionsPage() {
  // ========================================
  // HOOKS
  // ========================================

  const navigate = useNavigate();

  const [state, setState] = useState<InstitutionsPageState>({
    institutions: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      hasNext: false,
      hasPrev: false,
    },
  });

  const [filters, setFilters] = useState<IFilters>(DEFAULT_INSTITUTION_FILTERS);

  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    mode: "create",
    editingInstitution: null,
    loading: false,
  });

  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    data: null,
    loading: false,
    error: null,
  });

  const [actionLoading, setActionLoading] = useState<{[key: number]: boolean}>({});
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchInstitutions = async (newFilters?: IFilters, page?: number) => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      const queryFilters = newFilters || filters;
      const queryPage = page || state.pagination.page;

      const response = await institutionService.getInstitutions({
        page: queryPage,
        limit: 10,
        search: queryFilters.search || undefined,
        type: queryFilters.type !== "ALL" ? queryFilters.type : undefined,
        status: queryFilters.status !== "ALL" ? queryFilters.status : undefined,
        sortBy: queryFilters.sortBy,
        sortOrder: queryFilters.sortOrder,
      });

      if (response.success && response.data) {
        const data = response.data;

        setState((prev) => ({
          ...prev,
          institutions: data.institutions || [],
          pagination: {
            page: data.page || 1,
            totalPages: data.totalPages || 1,
            total: data.total || 0,
            hasNext: data.hasNext || false,
            hasPrev: data.hasPrev || false,
          },
          loading: false,
        }));
      } else {
        throw new Error(response.message || "Failed to fetch institutions");
      }
    } catch (error) {
      console.error("Failed to fetch institutions:", error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch institutions",
      }));
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsState((prev) => ({ ...prev, loading: true, error: null }));

      const response = await institutionService.getOverallAnalytics();
      const stats = response.data;

      if (stats) {
        // Use the API response directly since it matches our interface
        const analyticsData: InstitutionAnalyticsData = {
          totalInstitutions: stats.totalInstitutions,
          activeInstitutions: stats.activeInstitutions,
          inactiveInstitutions: stats.inactiveInstitutions,
          pendingInstitutions: stats.pendingInstitutions,
          institutionsByType: stats.institutionsByType,
          recentInstitutions: stats.recentInstitutions,
        };

        setAnalyticsState((prev) => ({
          ...prev,
          data: analyticsData,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setAnalyticsState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch analytics",
      }));
    }
  };

  // ========================================
  // EFFECT HOOKS
  // ========================================

  useEffect(() => {
    // Fetch institutions whenever filters change (including initial load)
    fetchInstitutions(filters, 1);
    // Fetch analytics on initial load
    if (filters === DEFAULT_INSTITUTION_FILTERS) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // ========================================
  // EVENT HANDLERS
  // ========================================

  const handleClearFilters = () => {
    setFilters(DEFAULT_INSTITUTION_FILTERS);
  };

  const handleViewInstitution = (institution: Institution) => {
    navigate(`/institutions/${institution.id}`);
  };

  const handleEditInstitution = (institution: Institution) => {
    setFormState({
      isOpen: true,
      mode: "edit",
      editingInstitution: institution,
      loading: false,
    });
  };

  const handleAddInstitution = () => {
    setFormState({
      isOpen: true,
      mode: "create-with-admin",
      editingInstitution: null,
      loading: false,
    });
  };

  const handleFormCancel = () => {
    setFormState({
      isOpen: false,
      mode: "create",
      editingInstitution: null,
      loading: false,
    });
  };

  const handleDeleteInstitution = async (institution: Institution) => {
    if (!confirm(`Are you sure you want to delete "${institution.name}"?`)) {
      return;
    }

    try {
      await institutionService.deleteInstitution(institution.id);
      fetchInstitutions(); // Refresh data
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error("Failed to delete institution:", error);
      alert("Failed to delete institution. Please try again.");
    }
  };

  const handleActivateInstitution = async (id: number) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await institutionService.updateInstitution(id, {
        status: InstitutionStatus.ACTIVE,
      });
      fetchInstitutions(); // Refresh the list
      fetchAnalytics(); // Refresh analytics
      // Find institution name for success message
      const institution = state.institutions.find(inst => inst.id === id);
      alert(`Institution "${institution?.name || 'Unknown'}" has been activated successfully!`);
    } catch (error) {
      console.error("Failed to activate institution:", error);
      alert("Failed to activate institution. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeactivateInstitution = async (id: number) => {
    try {
      setActionLoading(prev => ({ ...prev, [id]: true }));
      await institutionService.updateInstitution(id, {
        status: InstitutionStatus.INACTIVE,
      });
      fetchInstitutions(); // Refresh the list
      fetchAnalytics(); // Refresh analytics
      // Find institution name for success message
      const institution = state.institutions.find(inst => inst.id === id);
      alert(`Institution "${institution?.name || 'Unknown'}" has been deactivated successfully!`);
    } catch (error) {
      console.error("Failed to deactivate institution:", error);
      alert("Failed to deactivate institution. Please try again.");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const handlePageChange = (page: number) => {
    fetchInstitutions(filters, page);
  };

  // ========================================
  // RENDER HELPERS
  // ========================================

  // Prepare sort options for SearchAndFilter
  const sortOptions: SortOption[] = [
    { label: 'Name (A-Z)', value: 'name-asc' },
    { label: 'Name (Z-A)', value: 'name-desc' },
    { label: 'Code (A-Z)', value: 'code-asc' },
    { label: 'Code (Z-A)', value: 'code-desc' },
    { label: 'Newest First', value: 'createdAt-desc' },
    { label: 'Oldest First', value: 'createdAt-asc' },
    { label: 'Recently Updated', value: 'updatedAt-desc' },
  ];

  // Prepare filter groups for SearchAndFilter
  const filterGroups: FilterGroup[] = [
    {
      id: 'type',
      label: 'Institution Type',
      type: 'select',
      options: [
        { label: 'All Types', value: 'ALL' },
        ...INSTITUTION_TYPE_OPTIONS.map(opt => ({
          label: opt.label,
          value: opt.value,
        })),
      ],
      value: filters.type,
      onChange: (value) => {
        setFilters({
          ...filters,
          type: value === 'ALL' ? 'ALL' : (value as InstitutionType),
        });
      },
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Statuses', value: 'ALL' },
        ...INSTITUTION_STATUS_OPTIONS.map(opt => ({
          label: opt.label,
          value: opt.value,
        })),
      ],
      value: filters.status,
      onChange: (value) => {
        setFilters({
          ...filters,
          status: value === 'ALL' ? 'ALL' : (value as InstitutionStatus),
        });
      },
    },
  ];

  const handleSearchChange = (value: string) => {
    setFilters({ ...filters, search: value });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as ['name' | 'code' | 'createdAt' | 'updatedAt', 'asc' | 'desc'];
    setFilters({ ...filters, sortBy, sortOrder });
  };

  const renderInstitutionsContent = () => {
    if (state.error) {
      return (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Activity className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Error Loading Institutions</h3>
            <p className="text-red-700 mb-6 max-w-md mx-auto">{state.error}</p>
            <Button onClick={() => fetchInstitutions()} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (state.loading) {
      return (
        <div className="space-y-6">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (state.institutions.length === 0) {
      return (
        <Card className="border-dashed border-2">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-blue-600 mb-4">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Institutions Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filters.search || filters.type !== 'ALL' || filters.status !== 'ALL'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Get started by creating your first institution.'}
            </p>
            {(filters.search || filters.type !== 'ALL' || filters.status !== 'ALL') ? (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
              </Button>
            ) : (
              <Button onClick={handleAddInstitution} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Institution
              </Button>
            )}
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Quick Stats */}
        {analyticsState.data && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Institutions</p>
                    <p className="text-3xl font-bold text-blue-900 mt-2">
                      {analyticsState.data.totalInstitutions || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs text-blue-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>12% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">Active</p>
                    <p className="text-3xl font-bold text-green-900 mt-2">
                      {analyticsState.data.activeInstitutions || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-linear-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs text-green-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>8% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">Inactive</p>
                    <p className="text-3xl font-bold text-amber-900 mt-2">
                      {analyticsState.data.inactiveInstitutions || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs text-amber-600">
                  <TrendingDown className="h-3 w-3" />
                  <span>2% vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600">Pending</p>
                    <p className="text-3xl font-bold text-purple-900 mt-2">
                      {analyticsState.data.pendingInstitutions || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-lg bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex items-center gap-1 mt-4 text-xs text-purple-600">
                  <TrendingUp className="h-3 w-3" />
                  <span>3 new this week</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* View Mode Selector and Results Count */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{state.institutions.length}</span> of{" "}
                <span className="font-semibold text-foreground">{state.pagination.total}</span> institution{state.pagination.total !== 1 ? 's' : ''}
              </div>
              <div className="flex gap-1 border rounded-lg p-1 bg-muted/50">
                <Button
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className="gap-2"
                >
                  <Table2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Table</span>
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="gap-2"
                >
                  <Grid3x3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Grid</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Area */}
        {viewMode === 'table' ? (
          <InstitutionTable
            institutions={state.institutions}
            loading={state.loading}
            onView={handleViewInstitution}
            onEdit={handleEditInstitution}
            onDelete={handleDeleteInstitution}
            onActivate={handleActivateInstitution}
            onDeactivate={handleDeactivateInstitution}
            actionLoading={actionLoading}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.institutions.map((institution) => (
              <InstitutionCard
                key={institution.id}
                institution={institution}
                onView={handleViewInstitution}
                onEdit={handleEditInstitution}
                onDelete={handleDeleteInstitution}
                onToggleStatus={(inst) => {
                  if (inst.status === InstitutionStatus.ACTIVE) {
                    handleDeactivateInstitution(inst.id);
                  } else {
                    handleActivateInstitution(inst.id);
                  }
                }}
                compact
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {state.pagination.totalPages > 1 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{state.pagination.page}</span> of{" "}
                  <span className="font-semibold text-foreground">{state.pagination.totalPages}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(state.pagination.page - 1)}
                    disabled={!state.pagination.hasPrev}
                    className="gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(state.pagination.totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={page === state.pagination.page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          className="min-w-10"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    {state.pagination.totalPages > 5 && (
                      <span className="flex items-center px-2 text-muted-foreground">...</span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(state.pagination.page + 1)}
                    disabled={!state.pagination.hasNext}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // ========================================
  // MAIN RENDER
  // ========================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Building className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Institutions</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage educational institutions and their administrators
              </p>
            </div>
          </div>
          <Button
            className="gap-2 shadow-sm bg-blue-600 hover:bg-blue-700"
            onClick={handleAddInstitution}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Institution</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="institutions" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="institutions" className="gap-2">
            <Building2 className="h-4 w-4" />
            All Institutions
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <Activity className="h-4 w-4" />
            Analytics & Insights
          </TabsTrigger>
        </TabsList>

        {/* All Institutions Tab */}
        <TabsContent value="institutions" className="space-y-6">
          {/* Search and Filter */}
          <SearchAndFilter
            searchPlaceholder="Search institutions by name, code, or city..."
            searchValue={filters.search}
            onSearchChange={handleSearchChange}
            showSearch={true}
            sortOptions={sortOptions}
            sortValue={`${filters.sortBy}-${filters.sortOrder}`}
            onSortChange={handleSortChange}
            showSort={true}
            sortLabel="Sort by"
            filterGroups={filterGroups}
            showFilters={true}
            filterLabel="Filters"
            onClearAll={handleClearFilters}
            showClearAll={true}
          />

          {renderInstitutionsContent()}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <InstitutionAnalytics
            data={
              analyticsState.data || {
                totalInstitutions: 0,
                activeInstitutions: 0,
                inactiveInstitutions: 0,
                pendingInstitutions: 0,
                institutionsByType: {
                  UNIVERSITY: 0,
                  TECHNICAL_UNIVERSITY: 0,
                  POLYTECHNIC: 0,
                  COLLEGE: 0,
                  INSTITUTE: 0,
                  OTHER: 0,
                },
                recentInstitutions: [],
              }
            }
            loading={analyticsState.loading}
          />
        </TabsContent>
      </Tabs>

      {/* Institution Form Dialog */}
      <Dialog
        open={formState.isOpen}
        onOpenChange={(open) => !open && handleFormCancel()}
      >
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <ScrollArea className="max-h-[calc(90vh-180px)]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  {formState.mode === "edit" ? (
                    <Building2 className="h-5 w-5 text-white" />
                  ) : (
                    <Plus className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <div className="text-xl font-bold">
                    {formState.mode === "edit"
                      ? "Edit Institution"
                      : formState.mode === "create-with-admin"
                      ? "Create Institution with Admin"
                      : "Create Institution"}
                  </div>
                  <DialogDescription>
                    {formState.mode === "edit"
                      ? "Update institution details and settings"
                      : "Add a new institution to the system"}
                  </DialogDescription>
                </div>
              </DialogTitle>
            </DialogHeader>
            <InstitutionForm
              mode={formState.mode}
              initialData={
                formState.editingInstitution
                  ? institutionService.institutionToFormData(
                      formState.editingInstitution
                    )
                  : undefined
              }
              institutionId={formState.editingInstitution?.id}
              onSuccess={() => {
                setFormState({
                  isOpen: false,
                  mode: "create",
                  editingInstitution: null,
                  loading: false,
                });
                fetchInstitutions();
                fetchAnalytics();
              }}
              onCancel={handleFormCancel}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstitutionsPage;



