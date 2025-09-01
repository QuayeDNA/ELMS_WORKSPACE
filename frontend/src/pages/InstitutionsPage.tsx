import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import our modular components
import {
  InstitutionTable,
  InstitutionFilters,
  InstitutionAnalytics,
} from '@/components/institutions';

// Import types and services
import {
  Institution,
  InstitutionFilters as IFilters,
  DEFAULT_INSTITUTION_FILTERS,
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

  // ========================================
  // EFFECT HOOKS
  // ========================================

  useEffect(() => {
    // Fetch institutions whenever filters change (including initial load)
    fetchInstitutions(filters, 1);
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
    console.log('Edit institution:', institution);
  };

  const handleDeleteInstitution = async (institution: Institution) => {
    if (!confirm(`Are you sure you want to delete "${institution.name}"?`)) {
      return;
    }

    try {
      await institutionService.deleteInstitution(institution.id);
      console.log(`Institution "${institution.name}" deleted successfully.`);
      fetchInstitutions(); // Refresh data
    } catch (error) {
      console.error('Failed to delete institution:', error);
      alert('Failed to delete institution. Please try again.');
    }
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
      <InstitutionTable
        institutions={state.institutions}
        loading={state.loading}
        onView={handleViewInstitution}
        onEdit={handleEditInstitution}
        onDelete={handleDeleteInstitution}
      />
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
        <Button className="flex items-center gap-2">
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
            data={{
              total: state.pagination.total,
              active: 0,
              inactive: 0,
              pending: 0,
              suspended: 0,
              byType: {
                UNIVERSITY: 0,
                TECHNICAL_UNIVERSITY: 0,
                POLYTECHNIC: 0,
                COLLEGE: 0,
                INSTITUTE: 0,
                OTHER: 0
              },
              recentlyCreated: 0,
              recentlyUpdated: 0
            }}
            loading={state.loading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default InstitutionsPage;
