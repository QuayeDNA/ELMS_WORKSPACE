import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Student, CreateStudentRequest, UpdateStudentRequest } from '@/types/student';
import { studentService } from '@/services/student.service';
import { StudentDetails } from '@/components/students/StudentDetails';
import { StudentForm } from '@/components/students/StudentForm';
import { DeleteStudentDialog } from '@/components/students/DeleteStudentDialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit, Plus, Users, GraduationCap, TrendingUp, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface StudentPageProps {
  mode: 'view' | 'create' | 'list';
}

const StudentsPage: React.FC<StudentPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters] = useState({
    enrollmentStatus: undefined,
    academicStatus: undefined,
    programId: 0,
    level: 0
  });

  // Fetch single student for view mode
  const { data: student, isLoading: isLoadingStudent, error: studentError } = useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(Number(id!)),
    enabled: mode === 'view' && !!id,
  });

  // Fetch students list for list mode
  const { data: studentsData, isLoading: isLoadingStudents, error: studentsError } = useQuery({
    queryKey: ['students', currentPage, searchTerm, filters],
    queryFn: () => studentService.getStudents({
      page: currentPage,
      limit: 20,
      search: searchTerm,
      ...filters
    }),
    enabled: mode === 'list',
  });

  // Fetch student stats for dashboard
  const { data: stats } = useQuery({
    queryKey: ['students', 'stats'],
    queryFn: () => studentService.getStudentStats(),
    enabled: mode === 'list',
  });

  // Update student mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentService.updateStudent(Number(id), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setIsEditDialogOpen(false);
      toast.success('Student updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update student');
    },
  });

  // Delete student mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentService.deleteStudent(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student deleted successfully');
      navigate('/students');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete student');
    },
  });

  // Create student mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateStudentRequest) => studentService.createStudent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student created successfully');
      navigate('/students');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create student');
    },
  });

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  const handleDelete = () => {
    if (id) {
      deleteMutation.mutate(id);
    }
  };

  const handleUpdate = async (data: Record<string, unknown>): Promise<void> => {
    if (id) {
      await updateMutation.mutateAsync({ id, data: data as unknown as UpdateStudentRequest });
    }
  };

  const handleCreate = async (data: Record<string, unknown>): Promise<void> => {
    await createMutation.mutateAsync(data as unknown as CreateStudentRequest);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Render loading state
  if (isLoadingStudent || isLoadingStudents) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  // Render error state
  if (studentError || studentsError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">
            {studentError instanceof Error ? studentError.message : studentsError instanceof Error ? studentsError.message : 'An error occurred'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Render create mode
  if (mode === 'create') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/students')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
          <h1 className="text-3xl font-bold">Create New Student</h1>
          <p className="text-gray-600">Add a new student to the system</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <StudentForm
              onSubmit={handleCreate}
              onCancel={() => navigate('/students')}
              loading={createMutation.isPending}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render view mode
  if (mode === 'view' && student) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/students')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
        </div>

        <StudentDetails
          student={student}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={true}
          canDelete={true}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
            </DialogHeader>
            <StudentForm
              student={student}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <DeleteStudentDialog
          student={student}
          onConfirm={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    );
  }

  // Render list mode
  if (mode === 'list') {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Students</h1>
              <p className="text-gray-600">Manage student records and information</p>
            </div>
            <Button onClick={() => navigate('/students/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Button>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalStudents}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enrolled</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeStudents}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Graduated</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.graduatedStudents}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.enrollmentByProgram?.length || 0}</div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Students Table */}
        {studentsData && (
          <Card>
            <CardHeader>
              <CardTitle>Student Records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  {/* Add filter components here */}
                </div>

                {/* Students List */}
                <div className="space-y-2">
                  {studentsData.data.map((student: Student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {student.user.firstName.charAt(0)}{student.user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">
                            {student.user.firstName} {student.user.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.studentId} • {student.program.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.enrollmentStatus === 'ENROLLED' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {student.enrollmentStatus}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/students/${student.id}/edit`);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {studentsData.pagination.totalPages > 1 && (
                  <div className="flex justify-center gap-2 pt-4">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="px-3 py-2 text-sm">
                      Page {currentPage} of {studentsData.pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === studentsData.pagination.totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return null;
};

export default StudentsPage;
