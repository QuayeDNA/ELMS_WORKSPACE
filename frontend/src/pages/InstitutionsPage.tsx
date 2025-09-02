import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Import our modular components
import {
  InstitutionTable,
  InstitutionFilters,
  InstitutionAnalytics,
  InstitutionAnalyticsData,
  InstitutionForm,
} from '@/components/institutions';

// Import types and services
import {
  Institution,
  InstitutionFilters as IFilters,
  DEFAULT_INSTITUTION_FILTERS,
  InstitutionFormData,
  AdminFormData,
} from '@/types/institution';
import { institutionService } from '@/services/institution.service';

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
  mode: 'create' | 'edit' | 'create-with-admin';
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
  // STATE MANAGEMENT
  // ========================================
  
  const [state, setState] = useState<InstitutionsPageState>({
    institutions: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      totalPages: 1,
      total: 0,
      hasNext: false,
      hasPrev: false
    }
  });

  const [filters, setFilters] = useState<IFilters>(DEFAULT_INSTITUTION_FILTERS);

  const [formState, setFormState] = useState<FormState>({
    isOpen: false,
    mode: 'create',
    editingInstitution: null,
    loading: false,
  });

  const [analyticsState, setAnalyticsState] = useState<AnalyticsState>({
    data: null,
    loading: false,
    error: null,
  });

  // ========================================
  // DATA FETCHING
  // ========================================

  const fetchInstitutions = async (newFilters?: IFilters, page?: number) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const queryFilters = newFilters || filters;
      const queryPage = page || state.pagination.page;

      const response = await institutionService.getInstitutions({
        page: queryPage,
        limit: 10,
        search: queryFilters.search || undefined,
        type: queryFilters.type !== 'ALL' ? queryFilters.type : undefined,
        status: queryFilters.status !== 'ALL' ? queryFilters.status : undefined,
        sortBy: queryFilters.sortBy,
        sortOrder: queryFilters.sortOrder
      });

      const data = response.data;

      if (data) {
        setState(prev => ({
          ...prev,
          institutions: data.institutions,
          pagination: {
            page: data.page,
            totalPages: data.totalPages,
            total: data.total,
            hasNext: data.hasNext,
            hasPrev: data.hasPrev
          },
          loading: false
        }));
      }

    } catch (error) {
      console.error('Failed to fetch institutions:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch institutions'
      }));
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsState(prev => ({ ...prev, loading: true, error: null }));

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

        setAnalyticsState(prev => ({
          ...prev,
          data: analyticsData,
          loading: false
        }));
      }

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalyticsState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
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
    console.log('View institution:', institution);
  };

  const handleEditInstitution = (institution: Institution) => {
    setFormState({
      isOpen: true,
      mode: 'edit',
      editingInstitution: institution,
      loading: false,
    });
  };

  const handleAddInstitution = () => {
    setFormState({
      isOpen: true,
      mode: 'create-with-admin',
      editingInstitution: null,
      loading: false,
    });
  };

  const handleFormSubmit = async (institutionData: InstitutionFormData, adminData?: AdminFormData) => {
    try {
      setFormState(prev => ({ ...prev, loading: true }));

      if (formState.mode === 'create-with-admin' && adminData) {
        // Create institution with admin
        const requestData = institutionService.transformFormToWithAdminRequest(institutionData, adminData);
        await institutionService.createInstitutionWithAdmin(requestData);
      } else if (formState.mode === 'edit' && formState.editingInstitution) {
        // Update existing institution
        const requestData = institutionService.transformFormToRequest(institutionData);
        await institutionService.updateInstitution(formState.editingInstitution.id, requestData);
      } else {
        // Create institution without admin
        const requestData = institutionService.transformFormToRequest(institutionData);
        await institutionService.createInstitution(requestData);
      }

      // Close form and refresh data
      setFormState({ isOpen: false, mode: 'create', editingInstitution: null, loading: false });
      fetchInstitutions();
      fetchAnalytics();

    } catch (error) {
      console.error('Failed to save institution:', error);
      setFormState(prev => ({ ...prev, loading: false }));
      alert('Failed to save institution. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setFormState({ isOpen: false, mode: 'create', editingInstitution: null, loading: false });
  };

  const handleDeleteInstitution = async (institution: Institution) => {
    if (!confirm(`Are you sure you want to delete "${institution.name}"?`)) {
      return;
    }

    try {
      await institutionService.deleteInstitution(institution.id);
      console.log(`Institution "${institution.name}" deleted successfully.`);
      fetchInstitutions(); // Refresh data
      fetchAnalytics(); // Refresh analytics
    } catch (error) {
      console.error('Failed to delete institution:', error);
      alert('Failed to delete institution. Please try again.');
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
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{state.error}</p>
            <Button onClick={() => fetchInstitutions()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <InstitutionTable
          institutions={state.institutions}
          loading={state.loading}
          onView={handleViewInstitution}
          onEdit={handleEditInstitution}
          onDelete={handleDeleteInstitution}
        />
        
        {/* Pagination Controls */}
        {state.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {((state.pagination.page - 1) * 10) + 1} to{' '}
              {Math.min(state.pagination.page * 10, state.pagination.total)} of{' '}
              {state.pagination.total} results
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(state.pagination.page - 1);
                    }}
                    className={!state.pagination.hasPrev ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {/* Page numbers */}
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
                      handlePageChange(state.pagination.page + 1);
                    }}
                    className={!state.pagination.hasNext ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Institutions</h1>
          <p className="text-gray-600">Manage educational institutions and their administrators</p>
        </div>
        <Button className="flex items-center gap-2" onClick={handleAddInstitution}>
          <Plus className="h-4 w-4" />
          Add Institution
        </Button>
      </div>

      <Tabs defaultValue="institutions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="institutions">All Institutions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
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
            data={analyticsState.data || {
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
                OTHER: 0
              },
              recentInstitutions: []
            }}
            loading={analyticsState.loading} 
          />
        </TabsContent>
      </Tabs>

      {/* Institution Form Dialog */}
      <Dialog open={formState.isOpen} onOpenChange={(open) => !open && handleFormCancel()}>
        <DialogContent className="min-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {formState.mode === 'edit' 
                ? 'Edit Institution'
                : formState.mode === 'create-with-admin'
                ? 'Create Institution with Admin'
                : 'Create Institution'
              }
            </DialogTitle>
          </DialogHeader>
          <InstitutionForm
            mode={formState.mode}
            initialData={formState.editingInstitution ? 
              institutionService.institutionToFormData(formState.editingInstitution) : 
              undefined
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
