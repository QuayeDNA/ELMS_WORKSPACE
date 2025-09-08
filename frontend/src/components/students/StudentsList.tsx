import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudents } from '@/hooks/useStudents';
import { StudentFilters, Student } from '@/types/student';
import { usePermissions } from '@/hooks/usePermissions';
import { StudentDetails } from './StudentDetails';
import { DeleteStudentDialog } from './DeleteStudentDialog';
import { Search, Filter, Plus, Download, Upload, BarChart3, Eye, Edit, Trash2, User } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface StudentsListProps {
  initialFilters?: StudentFilters;
}

export const StudentsList: React.FC<StudentsListProps> = ({ initialFilters = {} }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StudentFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

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

  // Simple search handler without complex dependencies
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery !== (filters.search || '')) {
        const newFilters = { ...filters, search: searchQuery, page: 1 };
        setFilters(newFilters);
        fetchStudents(newFilters);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]); // Only depend on searchQuery to avoid infinite loops

  // Handle filter changes manually through user actions (page, search, etc.)
  // The useStudents hook handles the initial fetch

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchStudents(newFilters);
  };

  const handleLimitChange = (limit: number) => {
    const newFilters = { ...filters, limit, page: 1 };
    setFilters(newFilters);
    fetchStudents(newFilters);
  };

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
    setFilters(newFilters);
    fetchStudents(newFilters);
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

  // New handlers for component integration
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailsDialogOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    navigate(`/students/${student.id}/edit`);
  };

  const handleDeleteStudent = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (studentToDelete) {
      try {
        // Delete functionality will be handled by the mutation in the parent component
        setIsDeleteDialogOpen(false);
        setStudentToDelete(null);
        fetchStudents(filters); // Refresh the list
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleCreateStudent = () => {
    navigate('/students/new');
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
            {pagination?.total || 0} students found
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
            <Button onClick={handleCreateStudent}>
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
            <Button onClick={handleCreateStudent}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Student
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {student.user.firstName} {student.user.lastName}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{student.studentId}</p>
                    </div>
                  </div>
                  <Badge variant={student.enrollmentStatus === 'ENROLLED' ? 'default' : 'secondary'}>
                    {student.enrollmentStatus}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Program:</span>
                    <p className="font-medium truncate">{student.program.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Level:</span>
                    <p className="font-medium">Level {student.level}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">CGPA:</span>
                    <p className="font-medium">{student.cgpa?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className="font-medium">{student.academicStatus.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-600 truncate">{student.user.email}</p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleViewStudent(student)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  {permissions.canUpdate && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditStudent(student)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                  {permissions.canDelete && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteStudent(student)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
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

      {/* Student Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <StudentDetails
              student={selectedStudent}
              onEdit={() => {
                setIsDetailsDialogOpen(false);
                handleEditStudent(selectedStudent);
              }}
              onDelete={() => {
                setIsDetailsDialogOpen(false);
                handleDeleteStudent(selectedStudent);
              }}
              canEdit={permissions.canUpdate}
              canDelete={permissions.canDelete}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {studentToDelete && (
        <DeleteStudentDialog
          student={studentToDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={loading}
        />
      )}
    </div>
  );
};
