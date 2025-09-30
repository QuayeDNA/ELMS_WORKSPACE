import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Award, CheckCircle } from "lucide-react";
import { Enrollment } from "@/types/course";

interface EnrollmentCardProps {
  enrollment: Enrollment;
  onClick?: () => void;
}

export const EnrollmentCard: React.FC<EnrollmentCardProps> = ({
  enrollment,
  onClick,
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "enrolled":
        return "bg-green-100 text-green-800";
      case "dropped":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "deferred":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return "bg-gray-100 text-gray-800";

    // Assuming a simple grading scale
    const gradeNum = parseFloat(grade);
    if (gradeNum >= 3.5) return "bg-green-100 text-green-800";
    if (gradeNum >= 2.5) return "bg-yellow-100 text-yellow-800";
    if (gradeNum >= 1.5) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base font-semibold">
            {enrollment.student.user.firstName}{" "}
            {enrollment.student.user.lastName}
          </CardTitle>
          <Badge className={getStatusColor(enrollment.status)}>
            {enrollment.status}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          {enrollment.student.studentId}
          {enrollment.student.indexNumber &&
            ` (${enrollment.student.indexNumber})`}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Enrollment Date */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="h-4 w-4" />
          <span>
            Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
          </span>
        </div>

        {/* Grade */}
        {enrollment.grade && (
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-gray-600" />
            <span>Grade: </span>
            <Badge className={getGradeColor(enrollment.grade)}>
              {enrollment.grade}
              {enrollment.gradePoints && ` (${enrollment.gradePoints} pts)`}
            </Badge>
          </div>
        )}

        {/* Attendance */}
        {enrollment.attendancePercentage !== undefined && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle className="h-4 w-4" />
            <span>Attendance: {enrollment.attendancePercentage}%</span>
          </div>
        )}

        {/* Status-specific styling */}
        {enrollment.status.toLowerCase() === "completed" && (
          <div className="pt-2 border-t">
            <div className="text-xs text-green-600 font-medium">
              ✓ Course completed successfully
            </div>
          </div>
        )}

        {enrollment.status.toLowerCase() === "dropped" && (
          <div className="pt-2 border-t">
            <div className="text-xs text-red-600 font-medium">
              ✗ Student withdrew from course
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};



