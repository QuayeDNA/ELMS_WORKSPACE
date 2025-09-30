import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, GraduationCap, Briefcase } from "lucide-react";
import { CourseLecturer } from "@/types/course";

interface CourseLecturerCardProps {
  lecturer: CourseLecturer;
  onClick?: () => void;
}

export const CourseLecturerCard: React.FC<CourseLecturerCardProps> = ({
  lecturer,
  onClick,
}) => {
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

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case "coordinator":
        return <GraduationCap className="h-4 w-4" />;
      case "assistant":
        return <Briefcase className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
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
            {lecturer.lecturer.user.title} {lecturer.lecturer.user.firstName}{" "}
            {lecturer.lecturer.user.lastName}
          </CardTitle>
          <Badge className={getRoleColor(lecturer.role)}>
            {getRoleIcon(lecturer.role)}
            <span className="ml-1">{lecturer.role}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Academic Rank */}
        {lecturer.lecturer.academicRank && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="h-4 w-4" />
            <span>{lecturer.lecturer.academicRank}</span>
          </div>
        )}

        {/* Specialization */}
        {lecturer.lecturer.specialization && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="h-4 w-4" />
            <span>{lecturer.lecturer.specialization}</span>
          </div>
        )}

        {/* Assignment Date */}
        <div className="pt-2 border-t">
          <div className="text-xs text-gray-500">
            Assigned: {new Date(lecturer.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
