import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
  FileText,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { courseService } from "@/services/course.service";
import {
  CourseOfferingCard,
  CourseLecturerCard,
  EnrollmentCard,
} from "@/components/courses";
import {
  Course,
  CourseOffering,
  CourseLecturer,
  Enrollment,
} from "@/types/course";
import { LoadingSpinner } from "@/components/ui/Loading";

const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<Course | null>(null);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [lecturers, setLecturers] = useState<CourseLecturer[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load course details
      const courseResponse = await courseService.getCourseById(parseInt(id!));
      setCourse(courseResponse);

      // In a real implementation, you would load offerings, lecturers, and enrollments
      // For now, we'll show empty arrays
      setOfferings([]);
      setLecturers([]);
      setEnrollments([]);
    } catch (err) {
      console.error("Error loading course data:", err);
      setError("Failed to load course data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id, loadCourseData]);

  const handleEditCourse = () => {
    // Navigate to edit course page (to be implemented)
    console.log("Edit course:", id);
  };

  const handleDeleteCourse = () => {
    // Show delete confirmation dialog (to be implemented)
    console.log("Delete course:", id);
  };

  const handleAddOffering = () => {
    // Navigate to add offering page (to be implemented)
    console.log("Add offering for course:", id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>{error || "Course not found"}</AlertDescription>
        </Alert>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/courses")}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/courses")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {course.code} - {course.name}
            </h1>
            <p className="text-gray-600">
              {course.department?.name} • Level {course.level} •{" "}
              {course.creditHours} credits
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEditCourse}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleDeleteCourse}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-6">
        <Badge variant={course.isActive ? "default" : "secondary"}>
          {course.isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="offerings">
            Offerings ({offerings.length})
          </TabsTrigger>
          <TabsTrigger value="lecturers">
            Lecturers ({lecturers.length})
          </TabsTrigger>
          <TabsTrigger value="enrollments">
            Enrollments ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger value="syllabus">Syllabus</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Code
                  </span>
                  <p className="text-sm text-gray-900">{course.code}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Name
                  </span>
                  <p className="text-sm text-gray-900">{course.name}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Level
                  </span>
                  <p className="text-sm text-gray-900">{course.level}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Type
                  </span>
                  <p className="text-sm text-gray-900">{course.courseType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Credits
                  </span>
                  <p className="text-sm text-gray-900">{course.creditHours}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Contact Hours
                  </span>
                  <p className="text-sm text-gray-900">
                    {course.contactHours || "Not specified"}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Department & Faculty */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Unit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Department
                  </span>
                  <p className="text-sm text-gray-900">
                    {course.department?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Faculty
                  </span>
                  <p className="text-sm text-gray-900">
                    {course.department?.faculty?.name}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Institution
                  </span>
                  <p className="text-sm text-gray-900">
                    {course.department?.faculty?.institution?.name}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Total Enrollments
                  </span>
                  <p className="text-sm text-gray-900">
                    {course.enrollmentCount || 0}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Prerequisites
                  </span>
                  <p className="text-sm text-gray-900">
                    {course.prerequisiteCount || 0}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Co-requisites
                  </span>
                  <p className="text-sm text-gray-900">
                    {course.corequisiteCount || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          {course.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{course.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Learning Outcomes */}
          {course.learningOutcomes && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-700 whitespace-pre-line">
                  {course.learningOutcomes}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Offerings Tab */}
        <TabsContent value="offerings" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Course Offerings</h3>
            <Button onClick={handleAddOffering}>
              <Plus className="h-4 w-4 mr-2" />
              Add Offering
            </Button>
          </div>

          {offerings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Offerings Yet
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  This course hasn't been offered in any semester yet.
                </p>
                <Button onClick={handleAddOffering}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Offering
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {offerings.map((offering) => (
                <CourseOfferingCard
                  key={offering.id}
                  offering={offering}
                  onClick={() => console.log("View offering:", offering.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Lecturers Tab */}
        <TabsContent value="lecturers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Course Lecturers</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Lecturer
            </Button>
          </div>

          {lecturers.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Lecturers Assigned
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  No lecturers have been assigned to teach this course yet.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Lecturer
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lecturers.map((lecturer) => (
                <CourseLecturerCard
                  key={lecturer.id}
                  lecturer={lecturer}
                  onClick={() => console.log("View lecturer:", lecturer.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Student Enrollments</h3>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Enroll Students
            </Button>
          </div>

          {enrollments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Enrollments Yet
                </h3>
                <p className="text-gray-600 text-center mb-4">
                  No students have been enrolled in this course yet.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Enroll Students
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <EnrollmentCard
                  key={enrollment.id}
                  enrollment={enrollment}
                  onClick={() => console.log("View enrollment:", enrollment.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Syllabus Tab */}
        <TabsContent value="syllabus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Course Syllabus
              </CardTitle>
              <CardDescription>
                Detailed course syllabus including topics, schedule, and
                assessment methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Syllabus Content */}
              {course.syllabus ? (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Syllabus</h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {course.syllabus}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No syllabus content available
                </div>
              )}

              <Separator />

              {/* Assessment Methods */}
              {course.assessmentMethods && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Assessment Methods
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {course.assessmentMethods}
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Prerequisites
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {course.prerequisites}
                  </div>
                </div>
              )}

              {/* Co-requisites */}
              {course.corequisites && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Co-requisites
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {course.corequisites}
                  </div>
                </div>
              )}

              {/* Recommended Books */}
              {course.recommendedBooks && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Recommended Books
                  </h4>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {course.recommendedBooks}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourseDetailsPage;
