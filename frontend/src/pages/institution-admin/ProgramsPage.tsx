import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { SearchAndFilter } from "@/components/shared/SearchAndFilter";
import { programService } from "@/services/program.service";
import { Program } from "@/types/shared/program";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import ProgramCreate from "@/components/program/ProgramCreate";
import ProgramEdit from "@/components/program/ProgramEdit";
import { toast } from "sonner";

const ProgramsPage: React.FC = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<
    Array<{
      id: number;
      name: string;
      code: string;
      faculty?: { id: number; name: string; code: string };
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalStudents: 0,
    totalCourses: 0,
  });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | undefined>(
    undefined
  );

  const loadPrograms = useCallback(async () => {
    try {
      setLoading(true);
      const query = {
        page: currentPage,
        limit: 100, // Get all programs to group by department
        search: searchTerm || undefined,
        departmentId: selectedDepartment === "all" || !selectedDepartment
          ? undefined
          : parseInt(selectedDepartment),
      };

      console.log('Fetching programs with query:', query);
      const response = await programService.getPrograms(query);
      console.log('Programs response:', response);

      // Handle the response structure from backend
      const programsData = response?.data || [];
      setPrograms(programsData);
      setTotalPages(response?.pagination?.totalPages || 1);

      // Extract unique departments from program data
      const uniqueDepartments = Array.from(
        new Map(
          programsData
            .filter((program: Program) => program.department)
            .map((program: Program) => [program.department!.id, program.department!])
        ).values()
      );
      setDepartments(uniqueDepartments as Array<{
        id: number;
        name: string;
        code: string;
        faculty?: { id: number; name: string; code: string };
      }>);

      // Calculate stats directly from the loaded data
      const total = response?.pagination?.total || programsData.length;
      const active = programsData.filter((p: Program) => p.isActive).length;
      const totalStudents = programsData.reduce(
        (sum: number, p: Program) => sum + (p.stats?.totalStudents || 0),
        0
      );
      const totalCourses = programsData.reduce(
        (sum: number, p: Program) => sum + (p.stats?.totalCourses || 0),
        0
      );

      setStats({
        total,
        active,
        totalStudents,
        totalCourses,
      });
    } catch (error) {
      console.error("Error loading programs:", error);
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedDepartment]);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this program? This action cannot be undone.")) {
      try {
        await programService.deleteProgram(id);
        toast.success("Program deleted successfully");
        loadPrograms();
      } catch (error) {
        console.error("Error deleting program:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to delete program";
        toast.error(errorMessage);
      }
    }
  };

  const handleCreateSuccess = () => {
    toast.success("Program created successfully");
    loadPrograms();
  };

  const handleEditSuccess = () => {
    toast.success("Program updated successfully");
    loadPrograms();
  };

  const handleEdit = (program: Program) => {
    setSelectedProgram(program);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Programs</h1>
            <p className="text-muted-foreground mt-1">Manage academic programs and degrees</p>
          </div>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Program
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-blue-600/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Programs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  All programs
                </div>
              </div>
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute inset-0 bg-linear-to-br from-green-500/10 to-green-600/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Active Programs</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Currently running
                </div>
              </div>
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 to-purple-600/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalStudents}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" />
                  Enrolled students
                </div>
              </div>
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-linear-to-br from-purple-500 to-purple-600 shadow-lg">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
          <div className="absolute inset-0 bg-linear-to-br from-amber-500/10 to-amber-600/5" />
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <BookOpen className="h-3 w-3 mr-1" />
                  Course offerings
                </div>
              </div>
              <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-linear-to-br from-amber-500 to-amber-600 shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <SearchAndFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            searchPlaceholder="Search programs by name or code..."
            sortOptions={[
              { label: "Name (A-Z)", value: "name-asc" },
              { label: "Name (Z-A)", value: "name-desc" },
              { label: "Code (A-Z)", value: "code-asc" },
              { label: "Code (Z-A)", value: "code-desc" },
              { label: "Newest First", value: "createdAt-desc" },
              { label: "Oldest First", value: "createdAt-asc" },
            ]}
            onSortChange={(value) => {
              const [sortBy, sortOrder] = value.split("-");
              console.log("Sort:", sortBy, sortOrder);
            }}
            filterGroups={[
              {
                id: "department",
                label: "Department",
                type: "select",
                options: [
                  { label: "All Departments", value: "all" },
                  ...departments.map((dept) => ({
                    label: dept.name,
                    value: dept.id.toString(),
                  })),
                ],
                value: selectedDepartment,
                onChange: (value) => setSelectedDepartment(value as string),
              },
              {
                id: "status",
                label: "Status",
                type: "select",
                options: [
                  { label: "All Status", value: "all" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ],
                value: "all",
                onChange: (value) => console.log("Status:", value),
              },
            ]}
          />
        </CardContent>
      </Card>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-100">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                Programs List
              </CardTitle>
              <CardDescription className="mt-2">
                {loading ? "Loading..." : `Showing ${programs.length} of ${stats.total} programs`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
              <p className="mt-4 text-sm text-muted-foreground">Loading programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gray-100">
                <AlertCircle className="h-8 w-8 text-gray-400" />
              </div>
              <p className="mt-4 text-sm font-medium text-gray-900">No programs found</p>
              <p className="text-xs text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Program Name</TableHead>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Level</TableHead>
                    <TableHead className="font-semibold">Duration</TableHead>
                    <TableHead className="font-semibold">Department</TableHead>
                    <TableHead className="font-semibold">Students</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {programs.map((program) => (
                    <TableRow key={program.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{program.name}</p>
                          {program.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">
                              {program.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {program.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {program.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {program.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {program.durationYears} {program.durationYears === 1 ? "year" : "years"}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-gray-900">{program.department?.name || "N/A"}</p>
                          {program.department?.faculty && (
                            <p className="text-xs text-muted-foreground">
                              {program.department.faculty.name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium text-gray-900">
                          {program.stats?.totalStudents || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={program.isActive ? "default" : "secondary"}
                          className={program.isActive ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {program.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(program)}
                            title="Edit program"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(program.id)}
                            title="Delete program"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <>
              <Separator />
              <div className="flex items-center justify-between px-6 py-4">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="h-8"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProgramCreate
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={handleCreateSuccess}
      />

      <ProgramEdit
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        program={selectedProgram}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default ProgramsPage;



