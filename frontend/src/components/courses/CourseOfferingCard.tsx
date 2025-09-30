import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, MapPin, Clock } from "lucide-react";
import { CourseOffering } from "@/types/course";

interface CourseOfferingCardProps {
  offering: CourseOffering;
  onClick?: () => void;
}

export const CourseOfferingCard: React.FC<CourseOfferingCardProps> = ({
  offering,
  onClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "instructor":
        return "bg-blue-100 text-blue-800";
      case "coordinator":
        return "bg-purple-100 text-purple-800";
      case "assistant":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {offering.course.code} - {offering.course.name}
          </CardTitle>
          <Badge className={getStatusColor(offering.status)}>
            {offering.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Semester and Academic Year */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            {offering.semester.name} ({offering.semester.academicYear.yearCode})
          </span>
        </div>

        {/* Enrollment Info */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>
            {offering.currentEnrollment}
            {offering.maxEnrollment && ` / ${offering.maxEnrollment}`} enrolled
          </span>
        </div>

        {/* Classroom and Schedule */}
        {offering.classroom && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{offering.classroom}</span>
          </div>
        )}

        {offering.schedule && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{offering.schedule}</span>
          </div>
        )}

        {/* Primary Lecturer */}
        {offering.primaryLecturer && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-gray-700 mb-1">
              Primary Lecturer:
            </div>
            <div className="text-sm text-gray-600">
              {offering.primaryLecturer.user.title}{" "}
              {offering.primaryLecturer.user.firstName}{" "}
              {offering.primaryLecturer.user.lastName}
              {offering.primaryLecturer.academicRank && (
                <Badge variant="outline" className="ml-2 text-xs">
                  {offering.primaryLecturer.academicRank}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Additional Lecturers */}
        {offering.courseLecturers && offering.courseLecturers.length > 0 && (
          <div className="pt-2 border-t">
            <div className="text-sm font-medium text-gray-700 mb-2">
              Lecturers ({offering.courseLecturers.length}):
            </div>
            <div className="space-y-1">
              {offering.courseLecturers.slice(0, 3).map((lecturer) => (
                <div
                  key={lecturer.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-600">
                    {lecturer.lecturer.user.title}{" "}
                    {lecturer.lecturer.user.firstName}{" "}
                    {lecturer.lecturer.user.lastName}
                  </span>
                  <Badge className={`text-xs ${getRoleColor(lecturer.role)}`}>
                    {lecturer.role}
                  </Badge>
                </div>
              ))}
              {offering.courseLecturers.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{offering.courseLecturers.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};



