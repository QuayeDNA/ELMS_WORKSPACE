import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { departmentService } from "@/services/department.service";
import { DepartmentProgramsList } from "@/components/department/DepartmentProgramsList";
import { DepartmentCoursesList } from "@/components/department/DepartmentCoursesList";
import { DepartmentInstructorsList } from "@/components/department/DepartmentInstructorsList";
import { DepartmentStudentsList } from "@/components/department/DepartmentStudentsList";
import {
  DepartmentCoursesResponse,
  DepartmentDetails,
} from "@/types/shared/department";
import { Program } from "@/types/shared/program";

const DepartmentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const departmentId = parseInt(id || "0");

  // Fetch department details
  const {
    data: departmentResponse,
    isLoading: departmentLoading,
    error: departmentError,
  } = useQuery({
    queryKey: ["department", departmentId],
    queryFn: () => departmentService.getDepartmentById(departmentId),
    enabled: !!departmentId,
  });

  // Fetch programs
  const { data: programsResponse, isLoading: programsLoading } = useQuery({
    queryKey: ["department-programs", departmentId],
    queryFn: () => departmentService.getDepartmentPrograms(departmentId),
    enabled: !!departmentId,
  });

  // Fetch courses
  const { data: coursesResponse, isLoading: coursesLoading } = useQuery({
    queryKey: ["department-courses", departmentId],
    queryFn: () => departmentService.getDepartmentCourses(departmentId),
    enabled: !!departmentId,
  });

  // Fetch instructors
  const { data: instructorsResponse, isLoading: instructorsLoading } = useQuery(
    {
      queryKey: ["department-instructors", departmentId],
      queryFn: () => departmentService.getDepartmentInstructors(departmentId),
      enabled: !!departmentId,
    }
  );

  // Fetch students
  const { data: studentsResponse, isLoading: studentsLoading } = useQuery({
    queryKey: ["department-students", departmentId],
    queryFn: () => departmentService.getDepartmentStudents(departmentId),
    enabled: !!departmentId,
  });

  const department = departmentResponse?.data;
  const programs = programsResponse?.data?.programs || [];
  const courses = (coursesResponse as DepartmentCoursesResponse)?.courses || [];
  const instructors = instructorsResponse?.instructors || [];
  const students = studentsResponse?.students || [];

  const handleViewProgram = (program: Program) => {
    // TODO: Navigate to program details page
    console.log("View program:", program);
  };

  const handleViewCourse = (course: DepartmentDetails["courses"][0]) => {
    // TODO: Navigate to course details page
    console.log("View course:", course);
  };

  const handleViewInstructor = (
    instructor: DepartmentDetails["instructors"][0]
  ) => {
    // TODO: Navigate to instructor details page
    console.log("View instructor:", instructor);
  };

  const handleViewStudent = (student: {
    id: number;
    userId: number;
    studentId: string;
    indexNumber?: string;
    level: number;
    semester: number;
    enrollmentStatus: string;
    academicStatus: string;
    user: { id: number; email: string; firstName: string; lastName: string };
    program?: { id: number; name: string; code: string };
  }) => {
    // TODO: Navigate to student details page
    console.log("View student:", student);
  };

  if (departmentLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="h-8 w-64 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (departmentError || !department) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load department details. Please try again.
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/departments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Departments
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/departments")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building2 className="h-8 w-8" />
              {department.name}
            </h1>
            <p className="text-muted-foreground">{department.code}</p>
          </div>
        </div>
        <Badge variant="default" className="text-lg px-3 py-1">
          {department.type}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Programs</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programsLoading ? (
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              ) : (
                programs.length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {coursesLoading ? (
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              ) : (
                courses.length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecturers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {instructorsLoading ? (
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              ) : (
                instructors.length
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentsLoading ? (
                <div className="h-8 w-8 bg-muted rounded animate-pulse" />
              ) : (
                students.length
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Department Code
                </label>
                <p className="font-mono">{department.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Faculty
                </label>
                <p>{department.faculty?.name || "Not assigned"}</p>
              </div>
            </div>

            {department.hod && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Head of Department
                </label>
                <p>{`${department.hod.firstName} ${department.hod.lastName}`}</p>
              </div>
            )}

            {department.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p>{department.description}</p>
              </div>
            )}

            {department.officeLocation && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Office Location
                </label>
                <p>{department.officeLocation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {department.stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Active Programs
                    </p>
                    <p className="text-2xl font-bold">
                      {department.stats.activePrograms}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Users
                    </p>
                    <p className="text-2xl font-bold">
                      {department.stats.totalUsers}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Courses
                    </p>
                    <p className="text-2xl font-bold">
                      {department.stats.totalCourses}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Lecturers
                    </p>
                    <p className="text-2xl font-bold">
                      {department.stats.totalLecturers}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No statistics available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Programs */}
      <DepartmentProgramsList
        programs={programs}
        onViewProgram={handleViewProgram}
      />

      {/* Courses */}
      <DepartmentCoursesList
        courses={courses}
        onViewCourse={handleViewCourse}
      />

      {/* Instructors */}
      <DepartmentInstructorsList
        instructors={instructors}
        onViewInstructor={handleViewInstructor}
      />

      {/* Students */}
      <DepartmentStudentsList
        students={students}
        onViewStudent={handleViewStudent}
      />
    </div>
  );
};

export default DepartmentDetailsPage;



