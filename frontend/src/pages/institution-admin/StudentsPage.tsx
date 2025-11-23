import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Download,
  Upload,
  Filter,
  Search,
  RefreshCw,
  Users,
  GraduationCap,
  AlertCircle,
  Grid,
  List,
  Settings,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Student Components
import {
  StudentDetails,
  StudentForm,
  DeleteStudentDialog,
} from "@/components/students";

// Services & Types
import { studentService } from "@/services/student.service";
import {
  Student,
  StudentFilters,
  CreateStudentRequest,
  UpdateStudentRequest,
  StudentsResponse,
  BackendStudentStats,
} from "@/types/student";

// Constants
import {
  API_CONFIG,
  STUDENT_CONSTANTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  ROUTES,
  STORAGE_KEYS,
} from "@/constants";

interface StudentPageProps {
  mode: "view" | "create" | "list";
}

interface ViewMode {
  type: "grid" | "table";
  label: string;
  icon: React.ReactNode;
}

const VIEW_MODES: ViewMode[] = [
  { type: "table", label: "Table View", icon: <List className="w-4 h-4" /> },
  { type: "grid", label: "Grid View", icon: <Grid className="w-4 h-4" /> },
];

/**
 * Redesigned Students Page Component
 * Uses centralized constants and proper component architecture
 */
const StudentsPage: React.FC<StudentPageProps> = ({ mode }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Local State
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Data State
  const [student, setStudent] = useState<Student | null>(null);
  const [studentsData, setStudentsData] = useState<StudentsResponse | null>(null);
  const [stats, setStats] = useState<BackendStudentStats | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [studentError, setStudentError] = useState<Error | null>(null);
  const [studentsError, setStudentsError] = useState<Error | null>(null);

  // Filters State with Constants
  const [filters, setFilters] = useState<StudentFilters>(() => {
    const savedFilters = studentService.loadFilters();
    return (
      savedFilters || {
        page: API_CONFIG.PAGINATION.DEFAULT_PAGE,
        limit: API_CONFIG.PAGINATION.DEFAULT_LIMIT,
        search: "",
        enrollmentStatus: undefined,
        academicStatus: undefined,
        programId: undefined,
        level: undefined,
        semester: undefined,
        academicYear: "",
        sortBy: "firstName",
        sortOrder: "asc",
      }
    );
  });

  // Save filters when they change
  useEffect(() => {
    studentService.saveFilters(filters);
  }, [filters]);

  // Load view mode from localStorage
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem(
        STORAGE_KEYS.STUDENTS_VIEW_MODE
      );
      if (
        savedViewMode &&
        (savedViewMode === "grid" || savedViewMode === "table")
      ) {
        setViewMode(savedViewMode);
      }
    } catch (error) {
      console.warn("Failed to load view mode from localStorage:", error);
    }
  }, []);

  // Save view mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS_VIEW_MODE, viewMode);
    } catch (error) {
      console.warn("Failed to save view mode to localStorage:", error);
    }
  }, [viewMode]);

  // Fetch Single Student (for view mode)
  useEffect(() => {
    if (mode === "view" && id) {
      setIsLoadingStudent(true);
      setStudentError(null);
      studentService.getStudentById(Number(id))
        .then((data) => {
          setStudent(data);
          setIsLoadingStudent(false);
        })
        .catch((error) => {
          setStudentError(error);
          setIsLoadingStudent(false);
        });
    }
  }, [mode, id]);

  // Fetch Students List (for list mode)
  const fetchStudents = useCallback(() => {
    if (mode === "list") {
      setIsLoadingStudents(true);
      setStudentsError(null);
      studentService.getStudents(filters)
        .then((data) => {
          setStudentsData(data);
          setIsLoadingStudents(false);
        })
        .catch((error) => {
          setStudentsError(error);
          setIsLoadingStudents(false);
        });
    }
  }, [mode, filters]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Fetch Student Statistics
  useEffect(() => {
    if (mode === "list") {
      studentService.getStudentStats(filters)
        .then((data) => setStats(data))
        .catch((error) => console.error("Failed to load stats:", error));
    }
  }, [mode, filters]);

  // Refetch function for manual refresh
  const refetchStudents = useCallback(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Mutations
  const updateMutation = useMutation({
    mutationFn: async (data: { studentId: number; updateData: UpdateStudentRequest }) => {
      return await studentService.updateStudent(data.studentId, data.updateData);
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.STUDENT.UPDATED);
      setIsEditDialogOpen(false);
      fetchStudents();
      if (mode === "view" && id) {
        studentService.getStudentById(Number(id)).then(setStudent);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || ERROR_MESSAGES.SERVER);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (studentId: number) => {
      return await studentService.deleteStudent(studentId);
    },
    onSuccess: () => {
      toast.success(SUCCESS_MESSAGES.STUDENT.DELETED);
      setSelectedStudent(null);
      if (mode === "view") {
        navigate(ROUTES.STUDENTS.BASE);
      } else {
        fetchStudents();
      }
    },
    onError: (error: any) => {
      toast.error(error.message || ERROR_MESSAGES.SERVER);
    },
  });

  // Handlers
  const handleCreate = useCallback(
    async (
      data: CreateStudentRequest | UpdateStudentRequest
    ): Promise<void> => {
      try {
        // Type guard to ensure we have CreateStudentRequest for creation
        if (
          "user" in data &&
          "profile" in data &&
          data.user &&
          "password" in data.user
        ) {
          await studentService.createStudent(data as CreateStudentRequest);
          toast.success(SUCCESS_MESSAGES.STUDENT.CREATED);
          navigate(ROUTES.STUDENTS.BASE);
          fetchStudents();
        }
      } catch (error: any) {
        toast.error(error.message || ERROR_MESSAGES.SERVER);
      }
    },
    [navigate, fetchStudents]
  );

  const handleUpdate = useCallback(
    async (
      data: CreateStudentRequest | UpdateStudentRequest
    ): Promise<void> => {
      if (student) {
        updateMutation.mutate({
          studentId: student.id,
          updateData: data as UpdateStudentRequest
        });
      }
    },
    [student, updateMutation]
  );

  const handleDelete = useCallback((studentToDelete: Student) => {
    setSelectedStudent(studentToDelete);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (selectedStudent) {
      deleteMutation.mutate(selectedStudent.id);
    }
  }, [selectedStudent, deleteMutation]);

  const handleEdit = useCallback((studentToEdit: Student) => {
    setSelectedStudent(studentToEdit);
    setIsEditDialogOpen(true);
  }, []);

  const handleFilterChange = useCallback(
    (key: keyof StudentFilters, value: string | number | undefined) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
        page: API_CONFIG.PAGINATION.DEFAULT_PAGE, // Reset to first page
      }));
    },
    []
  );

  const handleSearch = useCallback(
    (searchTerm: string) => {
      handleFilterChange("search", searchTerm);
    },
    [handleFilterChange]
  );

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: API_CONFIG.PAGINATION.DEFAULT_PAGE,
      limit: API_CONFIG.PAGINATION.DEFAULT_LIMIT,
      search: "",
      enrollmentStatus: undefined,
      academicStatus: undefined,
      programId: undefined,
      level: undefined,
      semester: undefined,
      academicYear: "",
      sortBy: "firstName",
      sortOrder: "asc",
    });
    studentService.clearFilters();
  }, []);

  // Memoized computed values
  const totalStudents = useMemo(
    () => studentsData?.pagination?.total ?? 0,
    [studentsData]
  );
  const totalPages = useMemo(
    () => studentsData?.pagination?.totalPages ?? 1,
    [studentsData]
  );
  const currentPage = useMemo(
    () => studentsData?.pagination?.page ?? 1,
    [studentsData]
  );

  // Helper function to get enrollment status badge variant
  const getEnrollmentStatusVariant = (status: string) => {
    switch (status) {
      case STUDENT_CONSTANTS.ENROLLMENT_STATUS.ACTIVE:
        return "default";
      case STUDENT_CONSTANTS.ENROLLMENT_STATUS.SUSPENDED:
        return "destructive";
      case STUDENT_CONSTANTS.ENROLLMENT_STATUS.GRADUATED:
        return "secondary";
      default:
        return "outline";
    }
  };

  // Helper function to get academic status badge variant
  const getAcademicStatusVariant = (status: string) => {
    switch (status) {
      case STUDENT_CONSTANTS.ACADEMIC_STATUS.GOOD_STANDING:
        return "default";
      case STUDENT_CONSTANTS.ACADEMIC_STATUS.HONORS:
      case STUDENT_CONSTANTS.ACADEMIC_STATUS.DEAN_LIST:
        return "secondary";
      case STUDENT_CONSTANTS.ACADEMIC_STATUS.PROBATION:
        return "destructive";
      default:
        return "outline";
    }
  };

  // Helper function to get student initials
  const getStudentInitials = (student: Student) => {
    return `${student.firstName.charAt(0)}${student.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  // Render functions for different modes
  const renderCreateMode = () => (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(ROUTES.STUDENTS.BASE)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Students
        </Button>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Student
          </h1>
          <p className="text-muted-foreground">
            Add a new student to the system with all required information.
          </p>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-6">
          <StudentForm
            onSubmit={handleCreate}
            onCancel={() => navigate(ROUTES.STUDENTS.BASE)}
            loading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );

  const renderViewMode = () => {
    if (!student) return null;

    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.STUDENTS.BASE)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Students
          </Button>
        </div>

        <StudentDetails
          student={student}
          onEdit={handleEdit}
          onDelete={() => handleDelete(student)}
          canEdit={true}
          canDelete={true}
        />

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update student information and academic details.
              </DialogDescription>
            </DialogHeader>
            <StudentForm
              student={selectedStudent || student}
              onSubmit={handleUpdate}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <DeleteStudentDialog
          student={selectedStudent || student}
          onConfirm={confirmDelete}
          isDeleting={deleteMutation.isPending}
        />
      </div>
    );
  };

  // Loading State
  if (isLoadingStudent || isLoadingStudents) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading students...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (studentError || studentsError) {
    const error = studentError || studentsError;
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Error Loading Data
          </h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : ERROR_MESSAGES.NETWORK}
          </p>
          <div className="space-x-2">
            <Button onClick={() => window.location.reload()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
            <Button onClick={() => navigate(ROUTES.ADMIN.BASE)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  // CREATE MODE
  if (mode === "create") {
    return renderCreateMode();
  }

  // VIEW MODE
  if (mode === "view" && student) {
    return renderViewMode();
  }

  // LIST MODE
  if (mode === "list") {
    return (
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground">
                Manage student records and academic information
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchStudents()}
                disabled={isLoadingStudents}
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isLoadingStudents ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </Button>
              <Button onClick={() => navigate(ROUTES.STUDENTS.CREATE)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/admin/students/bulk-registration')}
              >
                <Users className="w-4 h-4 mr-2" />
                Bulk Registration
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.overview.total || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    All registered students
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Students
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.overview.active || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently enrolled
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Suspended Students
                  </CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.overview.suspended || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Suspended enrollments
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Graduates
                  </CardTitle>
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.overview.graduated || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completed programs
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Level Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Distribution by Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byLevel?.map((levelData) => (
                      <div
                        key={levelData.level}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span className="font-medium">Level {levelData.level}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{levelData._count}</div>
                          <div className="text-xs text-muted-foreground">
                            {((levelData._count / (stats.overview.total || 1)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>

              {/* Enrollment Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">
                    Enrollment Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.byEnrollmentStatus?.map((statusData) => (
                      <div
                        key={statusData.enrollmentStatus}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              (statusData.enrollmentStatus === 'ACTIVE'
                                ? 'bg-green-500'
                                : statusData.enrollmentStatus === 'SUSPENDED'
                                ? 'bg-red-500'
                                : 'bg-gray-500')
                            }`}
                          ></div>
                          <span className="font-medium capitalize">
                            {statusData.enrollmentStatus.toLowerCase().replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{statusData._count}</div>
                          <div className="text-xs text-muted-foreground">
                            {((statusData._count / (stats.overview.total || 1)) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    )) || []}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Filters and Controls */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students by name, email, or student ID..."
                    value={filters.search || ""}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center space-x-2">
                {/* Quick Filters */}
                <Select
                  value={filters.enrollmentStatus || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "enrollmentStatus",
                      value === "all" ? undefined : value
                    )
                  }
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(STUDENT_CONSTANTS.ENROLLMENT_STATUS).map(
                      ([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key.replace("_", " ")}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.level?.toString() || "all"}
                  onValueChange={(value) =>
                    handleFilterChange(
                      "level",
                      value === "all" ? undefined : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {STUDENT_CONSTANTS.LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Advanced Filters Dialog */}
                <Dialog
                  open={isFilterDialogOpen}
                  onOpenChange={setIsFilterDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Advanced Filters</DialogTitle>
                      <DialogDescription>
                        Filter students by additional criteria
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Academic Status */}
                      <div>
                        <Label>Academic Status</Label>
                        <Select
                          value={filters.academicStatus || "all"}
                          onValueChange={(value) =>
                            handleFilterChange(
                              "academicStatus",
                              value === "all" ? undefined : value
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {Object.entries(
                              STUDENT_CONSTANTS.ACADEMIC_STATUS
                            ).map(([key, value]) => (
                              <SelectItem key={key} value={value}>
                                {key.replace("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Semester */}
                      <div>
                        <Label>Semester</Label>
                        <Select
                          value={filters.semester?.toString() || "all"}
                          onValueChange={(value) =>
                            handleFilterChange(
                              "semester",
                              value === "all" ? undefined : parseInt(value)
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select semester" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {STUDENT_CONSTANTS.SEMESTERS.map((semester) => (
                              <SelectItem
                                key={semester.value}
                                value={semester.value}
                              >
                                {semester.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Academic Year */}
                      <div>
                        <Label>Academic Year</Label>
                        <Input
                          placeholder="e.g., 2023/2024"
                          value={filters.academicYear || ""}
                          onChange={(e) =>
                            handleFilterChange("academicYear", e.target.value)
                          }
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={clearFilters}>
                          Clear All
                        </Button>
                        <Button onClick={() => setIsFilterDialogOpen(false)}>
                          Apply Filters
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* View Toggle */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      {VIEW_MODES.find((v) => v.type === viewMode)?.icon}
                      <span className="ml-2 hidden sm:inline">View</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>View Mode</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {VIEW_MODES.map((mode) => (
                      <DropdownMenuItem
                        key={mode.type}
                        onClick={() => setViewMode(mode.type)}
                        className={viewMode === mode.type ? "bg-muted" : ""}
                      >
                        {mode.icon}
                        <span className="ml-2">{mode.label}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Export/Import */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Download className="w-4 h-4 mr-2" />
                      Export Students
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Students
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        {isLoadingStudents ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin mr-2" />
                <span>Loading students...</span>
              </div>
            </CardContent>
          </Card>
        ) : studentsData && studentsData.data && studentsData.data.length > 0 ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Records</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * filters.limit! + 1} to{" "}
                  {Math.min(currentPage * filters.limit!, totalStudents)} of{" "}
                  {totalStudents} students
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {viewMode === "table" ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Program</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Academic Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.data.map((student: Student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={``}
                                alt={getStudentInitials(student)}
                              />
                              <AvatarFallback className="text-xs">
                                {getStudentInitials(student)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {student.studentId}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {student.program?.name || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {student.program?.department.name || "N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {student.level}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getEnrollmentStatusVariant(
                              student.enrollmentStatus
                            )}
                          >
                            {student.enrollmentStatus.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getAcademicStatusVariant(
                              student.academicStatus
                            )}
                          >
                            {student.academicStatus.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  navigate(
                                    ROUTES.STUDENTS.VIEW(student.id.toString())
                                  )
                                }
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEdit(student)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(student)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studentsData.data.map((student: Student) => (
                      <Card
                        key={student.id}
                        className="hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={``}
                                  alt={getStudentInitials(student)}
                                />
                                <AvatarFallback>
                                  {getStudentInitials(student)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {student.firstName}{" "}
                                  {student.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground font-mono">
                                  {student.studentId}
                                </p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    navigate(
                                      ROUTES.STUDENTS.VIEW(
                                        student.id.toString()
                                      )
                                    )
                                  }
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEdit(student)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDelete(student)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">
                                {student.program?.name || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {student.program?.department.name || "N/A"}
                              </p>
                            </div>

                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                Level {student.level}
                              </Badge>
                              <div className="text-xs text-muted-foreground">
                                Semester {student.semester}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              <Badge
                                variant={getEnrollmentStatusVariant(
                                  student.enrollmentStatus
                                )}
                                className="text-xs"
                              >
                                {student.enrollmentStatus.replace("_", " ")}
                              </Badge>
                              <Badge
                                variant={getAcademicStatusVariant(
                                  student.academicStatus
                                )}
                                className="text-xs"
                              >
                                {student.academicStatus.replace("_", " ")}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* No Data State */}
        {studentsData &&
          !isLoadingStudents &&
          (!studentsData.data || studentsData.data.length === 0) && (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No students found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {filters.search || filters.enrollmentStatus || filters.level
                    ? "Try adjusting your filters or search terms."
                    : "Get started by adding your first student."}
                </p>
                <div className="space-x-2">
                  {(filters.search ||
                    filters.enrollmentStatus ||
                    filters.level) && (
                    <Button variant="outline" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  <Button onClick={() => navigate(ROUTES.STUDENTS.CREATE)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update student information and academic details.
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <StudentForm
                student={selectedStudent}
                onSubmit={handleUpdate}
                onCancel={() => setIsEditDialogOpen(false)}
                loading={updateMutation.isPending}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        {selectedStudent && (
          <DeleteStudentDialog
            student={selectedStudent}
            onConfirm={confirmDelete}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </div>
    );
  }

  return null;
};

export default StudentsPage;



