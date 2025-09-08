import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useStudents } from '@/hooks/useStudents';
import { StudentFilters } from '@/types/student';
import { usePermissions } from '@/hooks/usePermissions';
import { Search, Filter, Plus, Download, Upload, BarChart3 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StudentsListProps {
  initialFilters?: StudentFilters;
}

export const StudentsList: React.FC<StudentsListProps> = ({ initialFilters = {} }) => {
  const [filters, setFilters] = useState<StudentFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    students,
    loading,
    error,
    pagination,
    fetchStudents,
    exportStudents,
    permissions,
  } = useStudents(initialFilters);

  const { canViewStudentStats } = usePermissions();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters(prev => ({ ...prev, search: searchQuery, page: 1 }));
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters.search]);

  useEffect(() => {
    fetchStudents(filters);
  }, [filters, fetchStudents]);

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
      const blob = await exportStudents(filters, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `students-export.${format}`;
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => fetchStudents(filters)}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-gray-600">
            {pagination.total} students found
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canViewStudentStats && (
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
          {permissions.canBulkImport && (
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          )}
          {permissions.canCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students by name, student ID, or email..."
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
            <SelectItem value="studentId">Student ID</SelectItem>
            <SelectItem value="level">Academic Level</SelectItem>
            <SelectItem value="cgpa">CGPA</SelectItem>
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

      {/* Students Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="animate-pulse"><div className="bg-gray-200 h-48 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-48 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-48 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-48 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-48 rounded-lg"></div></div>
          <div className="animate-pulse"><div className="bg-gray-200 h-48 rounded-lg"></div></div>
        </div>
      ) : students.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No students found</p>
          {permissions.canCreate && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Student
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white p-6 rounded-lg shadow border hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {student.user.firstName} {student.user.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{student.studentId}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.enrollmentStatus === 'ENROLLED' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {student.enrollmentStatus}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Program:</span>
                  <span>{student.program.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Level:</span>
                  <span>Level {student.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CGPA:</span>
                  <span>{student.cgpa || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="truncate ml-2">{student.user.email}</span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View
                </Button>
                {permissions.canUpdate && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Edit
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={!pagination.hasPrev}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={!pagination.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
