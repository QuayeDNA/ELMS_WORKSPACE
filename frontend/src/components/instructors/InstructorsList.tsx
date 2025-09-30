import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { useInstructors } from '@/hooks/useInstructors';
import { InstructorFilters } from '@/types/instructor';
import { usePermissions } from '@/hooks/usePermissions';
import { Search, Filter, Plus, Download, BarChart3, Users } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface InstructorsListProps {
  initialFilters?: InstructorFilters;
}

export const InstructorsList: React.FC<InstructorsListProps> = ({ initialFilters = {} }) => {
  const [filters, setFilters] = useState<InstructorFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    instructors,
    loading,
    error,
    pagination,
    fetchInstructors,
    exportInstructors,
    permissions,
  } = useInstructors(initialFilters);

  const { canViewInstructorStats } = usePermissions();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters.search]);

  useEffect(() => {
    fetchInstructors(filters);
  }, [filters, fetchInstructors]);

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 }));
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters(prev => ({ ...prev, sortBy, sortOrder, page: 1 }));
  };

  const handleExport = async (format: 'csv' | 'excel' = 'csv') => {
    try {
      const blob = await exportInstructors(filters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `instructors-export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const clearFilters = () => {
    setFilters({ page: 1, limit: filters.limit });
    setSearchQuery('');
  };

  const formatAcademicRank = (rank: string) => {
    return rank.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatEmploymentStatus = (status: string) => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchInstructors(filters)}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Instructors</h1>
          <p className="text-gray-600">
            {pagination?.total || 0} instructors found
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canViewInstructorStats && (
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistics
            </Button>
          )}
          {permissions.canExport && (
            <Select onValueChange={(value) => handleExport(value as 'csv' | 'excel')}>
              <SelectTrigger className="w-32">
                <Download className="h-4 w-4 mr-2" />
                <span>Export</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
              </SelectContent>
            </Select>
          )}
          {permissions.canCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Instructor
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search instructors by name, employee ID, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {Object.keys(filters).length > 2 && (
            <span className="ml-1 bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              {Object.keys(filters).length - 2}
            </span>
          )}
        </Button>
        {Object.keys(filters).length > 2 && (
          <Button variant="ghost" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Sort by:</span>
        <Select 
          value={filters.sortBy || 'createdAt'}
          onValueChange={(value) => handleSortChange(value, filters.sortOrder || 'desc')}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Created Date</SelectItem>
            <SelectItem value="firstName">First Name</SelectItem>
            <SelectItem value="lastName">Last Name</SelectItem>
            <SelectItem value="employeeId">Employee ID</SelectItem>
            <SelectItem value="academicRank">Academic Rank</SelectItem>
            <SelectItem value="experience">Experience</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filters.sortOrder || 'desc'}
          onValueChange={(value) => handleSortChange(filters.sortBy || 'createdAt', value as 'asc' | 'desc')}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">Ascending</SelectItem>
            <SelectItem value="desc">Descending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Instructors Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="animate-pulse"><div className="bg-gray-200 h-56 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-56 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-56 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-56 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-56 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-56 rounded-lg"></div></div>
        </div>
      ) : instructors.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No instructors found</p>
          {permissions.canCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Instructor
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {instructor.user.title && `${instructor.user.title} `}
                    {instructor.user.firstName} {instructor.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{instructor.employeeId}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  instructor.employmentStatus === 'ACTIVE' 
                    ? 'bg-green-100 text-green-800' 
                    : instructor.employmentStatus === 'ON_LEAVE'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {formatEmploymentStatus(instructor.employmentStatus)}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Rank:</span>
                  <span>{formatAcademicRank(instructor.academicRank)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Department:</span>
                  <span className="truncate ml-2">
                    {instructor.user.department?.name || 'Unassigned'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span>{instructor.experience} years</span>
                </div>
                {instructor.specialization && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Specialization:</span>
                    <span className="truncate ml-2">{instructor.specialization}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="truncate ml-2">{instructor.user.email}</span>
                </div>
                {instructor.officeLocation && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Office:</span>
                    <span>{instructor.officeLocation}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Users className="h-4 w-4 mr-1" />
                  View
                </Button>
                {permissions.canUpdate && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                )}
                {permissions.canAssignDepartments && (
                  <Button variant="outline" size="sm">
                    Assign
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Items per page:</span>
            <Select 
              value={String(filters.limit || 10)}
              onValueChange={(value) => handleLimitChange(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination?.page - 1)}
              disabled={!pagination?.hasPrev}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination?.page || 1} of {pagination?.totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination?.page + 1)}
              disabled={!pagination?.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};



