import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Building2, TrendingUp, TrendingDown, Activity, Grid3x3, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/stat-card";

// Import our modular components
import {
  InstitutionTable,
  InstitutionCard,
  InstitutionFilters,
  InstitutionAnalytics,
  InstitutionAnalyticsData,
  InstitutionForm,
} from "@/components/institutions";

// Import types and services
import {
  Institution,
  InstitutionFilters as IFilters,
  DEFAULT_INSTITUTION_FILTERS,
  InstitutionFormData,
  AdminFormData,
  InstitutionStatus,
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

  const handleFiltersChange = (newFilters: IFilters) => {
    setFilters(newFilters);
  };

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

  const handleFormSubmit = async (
    institutionData: InstitutionFormData,
    adminData?: AdminFormData
  ) => {
    try {
      setFormState((prev) => ({ ...prev, loading: true }));

      if (formState.mode === "create-with-admin" && adminData) {
        // Create institution with admin
        const requestData = institutionService.transformFormToWithAdminRequest(
          institutionData,
          adminData
        );
        await institutionService.createInstitutionWithAdmin(requestData);
      } else if (formState.mode === "edit" && formState.editingInstitution) {
        // Update existing institution
        const requestData =
          institutionService.transformFormToRequest(institutionData);
        await institutionService.updateInstitution(
          formState.editingInstitution.id,
          requestData
        );
      } else {
        // Create institution without admin
        const requestData =
          institutionService.transformFormToRequest(institutionData);
        await institutionService.createInstitution(requestData);
      }

      // Close form and refresh data
      setFormState({
        isOpen: false,
        mode: "create",
        editingInstitution: null,
        loading: false,
      });
      fetchInstitutions();
      fetchAnalytics();
    } catch (error) {
      console.error("Failed to save institution:", error);
      setFormState((prev) => ({ ...prev, loading: false }));
      alert("Failed to save institution. Please try again.");
    }
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

  const renderInstitutionsContent = () => {
    if (state.error) {
      return (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
              <Activity className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Institutions</h3>
            <p className="text-red-700 mb-4">{state.error}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 animate-pulse">
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
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
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Institutions Found</h3>
            <p className="text-gray-600 mb-4">
              {filters.search || filters.type !== 'ALL' || filters.status !== 'ALL'
                ? 'Try adjusting your filters to find what you\'re looking for.'
                : 'Get started by creating your first institution.'}
            </p>
            {(filters.search || filters.type !== 'ALL' || filters.status !== 'ALL') && (
              <Button onClick={handleClearFilters} variant="outline">
                Clear Filters
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Institutions"
              value={analyticsState.data.totalInstitutions?.toString() || "0"}
              icon={Building2}
              trend={{
                value: 12,
                label: "vs last month",
              }}
            />
            <StatCard
              title="Active"
              value={analyticsState.data.activeInstitutions?.toString() || "0"}
              icon={TrendingUp}
              trend={{
                value: 8,
                label: "vs last month",
              }}
            />
            <StatCard
              title="Inactive"
              value={analyticsState.data.inactiveInstitutions?.toString() || "0"}
              icon={TrendingDown}
              trend={{
                value: -2,
                label: "vs last month",
              }}
            />
            <StatCard
              title="Pending"
              value={analyticsState.data.pendingInstitutions?.toString() || "0"}
              icon={Activity}
              trend={{
                value: 3,
                label: "vs last month",
              }}
            />
          </div>
        )}

        {/* View Mode Selector */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{state.pagination.total}</span> institution{state.pagination.total !== 1 ? 's' : ''} found
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  Showing <span className="font-medium text-foreground">{(state.pagination.page - 1) * 10 + 1}</span> to{" "}
                  <span className="font-medium text-foreground">{Math.min(state.pagination.page * 10, state.pagination.total)}</span> of{" "}
                  <span className="font-medium text-foreground">{state.pagination.total}</span> results
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (state.pagination.hasPrev) handlePageChange(state.pagination.page - 1);
                        }}
                        className={!state.pagination.hasPrev ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>

                    {Array.from({ length: Math.min(state.pagination.totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                            isActive={page === state.pagination.page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {state.pagination.totalPages > 5 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (state.pagination.hasNext) handlePageChange(state.pagination.page + 1);
                        }}
                        className={!state.pagination.hasNext ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Institutions</h1>
          <p className="text-muted-foreground mt-1">
            Manage educational institutions and their administrators
          </p>
        </div>
        <Button
          className="gap-2 shadow-sm"
          onClick={handleAddInstitution}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Institution</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <Tabs defaultValue="institutions" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="institutions">All Institutions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Insights</TabsTrigger>
        </TabsList>

        {/* All Institutions Tab */}
        <TabsContent value="institutions" className="space-y-6">
          <InstitutionFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
            loading={state.loading}
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {formState.mode === "edit"
                ? "Edit Institution"
                : formState.mode === "create-with-admin"
                ? "Create Institution with Admin"
                : "Create Institution"}
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
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={formState.loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstitutionsPage;



