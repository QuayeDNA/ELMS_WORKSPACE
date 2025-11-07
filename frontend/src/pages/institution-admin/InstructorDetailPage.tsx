import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useInstructorById,
  useInstructorWorkload,
} from "@/hooks/useInstructors";
import { usePermissions } from "@/hooks/usePermissions";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Users,
  BookOpen,
  Clock,
} from "lucide-react";

const InstructorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const instructorId = parseInt(id || "0");

  const { instructor, loading, error } = useInstructorById(instructorId);
  const { workload } = useInstructorWorkload(instructorId);
  const permissions = usePermissions();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !instructor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Instructor Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate("/admin/instructors")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Instructors
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "ON_LEAVE":
        return "bg-yellow-100 text-yellow-800";
      case "RETIRED":
        return "bg-gray-100 text-gray-800";
      case "TERMINATED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case "FULL_TIME":
        return "bg-blue-100 text-blue-800";
      case "PART_TIME":
        return "bg-purple-100 text-purple-800";
      case "CONTRACT":
        return "bg-orange-100 text-orange-800";
      case "VISITING":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/instructors")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {instructor.user.firstName} {instructor.user.lastName}
            </h1>
            <p className="text-gray-600">Staff ID: {instructor.staffId}</p>
          </div>
        </div>
        {permissions.canUpdateInstructors && (
          <Button
            onClick={() => navigate(`/admin/instructors/${instructorId}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Instructor
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <p className="text-gray-900">
                    {instructor.user.title} {instructor.user.firstName}{" "}
                    {instructor.user.middleName} {instructor.user.lastName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    {instructor.user.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    {instructor.user.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Date of Birth
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {instructor.user.dateOfBirth
                      ? new Date(
                          instructor.user.dateOfBirth
                        ).toLocaleDateString()
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Gender
                  </label>
                  <p className="text-gray-900">
                    {instructor.user.gender || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nationality
                  </label>
                  <p className="text-gray-900">
                    {instructor.user.nationality || "Not specified"}
                  </p>
                </div>
              </div>
              {instructor.user.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {instructor.user.address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Academic Rank
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    {instructor.academicRank || "Not assigned"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Specialization
                  </label>
                  <p className="text-gray-900">
                    {instructor.specialization || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Highest Qualification
                  </label>
                  <p className="text-gray-900">
                    {instructor.highestQualification || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Hire Date
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {instructor.hireDate
                      ? new Date(instructor.hireDate).toLocaleDateString()
                      : "Not specified"}
                  </p>
                </div>
              </div>
              {instructor.researchInterests && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Research Interests
                  </label>
                  <p className="text-gray-900">
                    {instructor.researchInterests}
                  </p>
                </div>
              )}
              {instructor.biography && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Biography
                  </label>
                  <p className="text-gray-900">{instructor.biography}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employment Type
                  </label>
                  <Badge
                    className={getEmploymentTypeColor(
                      instructor.employmentType
                    )}
                  >
                    {instructor.employmentType.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Employment Status
                  </label>
                  <Badge
                    className={getStatusColor(instructor.employmentStatus)}
                  >
                    {instructor.employmentStatus.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Office Location
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {instructor.officeLocation || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Office Hours
                  </label>
                  <p className="text-gray-900 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {instructor.officeHours || "Not specified"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Department & Institution */}
          <Card>
            <CardHeader>
              <CardTitle>Affiliation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {instructor.user.department ? (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Department
                  </label>
                  <p className="text-gray-900 font-medium">
                    {instructor.user.department.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {instructor.user.department.code}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No department assigned</p>
              )}
              <Separator />
              {instructor.user.department?.faculty && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Faculty
                  </label>
                  <p className="text-gray-900 font-medium">
                    {instructor.user.department.faculty.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {instructor.user.department.faculty.code}
                  </p>
                </div>
              )}
              <Separator />
              {instructor.user.department?.faculty?.institution && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Institution
                  </label>
                  <p className="text-gray-900 font-medium">
                    {instructor.user.department.faculty.institution.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {instructor.user.department.faculty.institution.code}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workload Summary */}
          {workload && (
            <Card>
              <CardHeader>
                <CardTitle>Workload Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Courses Assigned
                  </span>
                  <span className="font-medium">
                    {workload.coursesAssigned}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Students Enrolled
                  </span>
                  <span className="font-medium">
                    {workload.studentsEnrolled}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Contact Hours
                  </span>
                  <span className="font-medium">{workload.contactHours}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Can Create Exams</span>
                <Badge
                  variant={instructor.canCreateExams ? "default" : "secondary"}
                >
                  {instructor.canCreateExams ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Can Grade Scripts</span>
                <Badge
                  variant={instructor.canGradeScripts ? "default" : "secondary"}
                >
                  {instructor.canGradeScripts ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Can View Results</span>
                <Badge
                  variant={instructor.canViewResults ? "default" : "secondary"}
                >
                  {instructor.canViewResults ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Can Teach Courses</span>
                <Badge
                  variant={instructor.canTeachCourses ? "default" : "secondary"}
                >
                  {instructor.canTeachCourses ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InstructorDetailPage;
