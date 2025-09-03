import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  Eye,
  Building2,
  Users,
  GraduationCap,
  Filter
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/Alert';

import { departmentService } from '@/services/department.service';
import { facultyService } from '@/services/faculty.service';
import { useAuth } from '@/hooks/useAuth';
import { Department } from '@/types/department';
import DepartmentCreate from '@/components/department/DepartmentCreate';
// import DepartmentEdit from '@/components/department/DepartmentEdit';
// import DepartmentView from '@/components/department/DepartmentView';

// Temporary placeholder components
const DepartmentEdit = ({ department, onSuccess, onCancel }: any) => (
  <div className="p-4">
    <h3>Edit {department.name}</h3>
    <p>Edit form will be implemented here...</p>
    <div className="flex gap-2 mt-4">
      <button onClick={onCancel} className="px-4 py-2 border rounded">Cancel</button>
      <button onClick={onSuccess} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
    </div>
  </div>
);

const DepartmentView = ({ department, onClose }: any) => (
  <div className="p-4">
    <h3>{department.name}</h3>
    <p>Department details will be shown here...</p>
    <button onClick={onClose} className="px-4 py-2 border rounded mt-4">Close</button>
  </div>
);

const DepartmentsPage: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('ALL_FACULTIES');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL_STATUS');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [viewingDepartment, setViewingDepartment] = useState<Department | null>(null);

  // Determine scope based on user role
  const getQueryParams = () => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      isActive?: boolean;
      institutionId?: number;
      facultyId?: number;
    } = {
      page: currentPage,
      limit: 10,
      search: search || undefined,
      isActive: selectedStatus === 'ALL_STATUS' ? undefined : selectedStatus === 'ACTIVE'
    };

    if (user?.role === 'ADMIN' && user.institutionId) {
      params.institutionId = user.institutionId;
    } else if (user?.role === 'FACULTY_ADMIN' && user.facultyId) {
      params.facultyId = user.facultyId;
    }

    if (selectedFaculty !== 'ALL_FACULTIES') {
      params.facultyId = parseInt(selectedFaculty);
    }

    return params;
  };

  // Fetch departments with role-based scoping
  const { data: departmentsData, isLoading: isDepartmentsLoading, refetch: refetchDepartments } = useQuery({
    queryKey: ['departments', getQueryParams()],
    queryFn: () => departmentService.getDepartments(getQueryParams())
  });

  // Fetch department statistics
  const { data: statsData } = useQuery({
    queryKey: ['department-stats', user?.institutionId, user?.facultyId],
    queryFn: () => {
      const institutionId = user?.role === 'ADMIN' ? user.institutionId : undefined;
      const facultyId = user?.role === 'FACULTY_ADMIN' ? user.facultyId : undefined;
      return departmentService.getDepartmentStats(facultyId, institutionId);
    }
  });

  // Fetch faculties for filter (only if user can see multiple faculties)
  const { data: facultiesData } = useQuery({
    queryKey: ['faculties-for-filter'],
    queryFn: async () => {
      if (user?.role === 'SUPER_ADMIN') {
        return await facultyService.getFaculties({});
      } else if (user?.role === 'ADMIN' && user.institutionId) {
        return await facultyService.getFacultiesByInstitution(user.institutionId);
      }
      return { data: { faculties: [] } };
    },
    enabled: user?.role !== 'FACULTY_ADMIN'
  });

  const handleDelete = async (department: Department) => {
    if (window.confirm(`Are you sure you want to delete ${department.name}?`)) {
      try {
        await departmentService.deleteDepartment(department.id);
        refetchDepartments();
      } catch (error) {
        console.error('Error deleting department:', error);
      }
    }
  };

  const canManageDepartments = () => {
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'FACULTY_ADMIN';
  };

  const canCreateDepartments = () => {
    return user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN' || user?.role === 'FACULTY_ADMIN';
  };

  if (isDepartmentsLoading) {
    return <div className="flex items-center justify-center h-64">Loading departments...</div>;
  }

  const departments = departmentsData?.data?.departments || [];
  const pagination = departmentsData?.data?.pagination;
  const stats = statsData?.data;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Departments</h1>
          <p className="text-muted-foreground">
            Manage academic departments and their information
          </p>
        </div>
        {canCreateDepartments() && (
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DepartmentCreate 
                onSuccess={() => {
                  setIsCreateOpen(false);
                  refetchDepartments();
                }}
                onCancel={() => setIsCreateOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDepartments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Departments</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeDepartments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrograms}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search departments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {user?.role !== 'FACULTY_ADMIN' && facultiesData?.data?.faculties && facultiesData.data.faculties.length > 0 && (
              <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_FACULTIES">All Faculties</SelectItem>
                  {facultiesData.data.faculties.map((faculty: { id: number; name: string }) => (
                    <SelectItem key={faculty.id} value={faculty.id.toString()}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_STATUS">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
          <CardDescription>
            {pagination && `Showing ${departments.length} of ${pagination.total} departments`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <Alert>
              <AlertDescription>
                No departments found. {canCreateDepartments() && "Click 'Add Department' to create your first department."}
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Department</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Programs</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department: Department) => (
                  <TableRow key={department.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{department.name}</div>
                        {department.headOfDepartment && (
                          <div className="text-sm text-muted-foreground">
                            Head: {department.headOfDepartment}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{department.code}</TableCell>
                    <TableCell>
                      {department.faculty?.name}
                    </TableCell>
                    <TableCell>{department._count?.programs || 0}</TableCell>
                    <TableCell>{department._count?.students || 0}</TableCell>
                    <TableCell>
                      <Badge variant={department.isActive ? "default" : "secondary"}>
                        {department.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setViewingDepartment(department)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canManageDepartments() && (
                            <>
                              <DropdownMenuItem
                                onClick={() => setEditingDepartment(department)}
                              >
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(department)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Department Dialog */}
      {editingDepartment && (
        <Dialog open={!!editingDepartment} onOpenChange={() => setEditingDepartment(null)}>
          <DialogContent className="max-w-2xl">
            <DepartmentEdit
              department={editingDepartment}
              onSuccess={() => {
                setEditingDepartment(null);
                refetchDepartments();
              }}
              onCancel={() => setEditingDepartment(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Department Dialog */}
      {viewingDepartment && (
        <Dialog open={!!viewingDepartment} onOpenChange={() => setViewingDepartment(null)}>
          <DialogContent className="max-w-4xl">
            <DepartmentView
              department={viewingDepartment}
              onClose={() => setViewingDepartment(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DepartmentsPage;
