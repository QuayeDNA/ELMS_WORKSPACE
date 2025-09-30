import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Users, Eye, Mail } from "lucide-react";

interface DepartmentInstructor {
  id: number;
  employeeId: string;
  academicRank: string;
  specialization?: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  coursesCount?: number;
}

interface DepartmentInstructorsListProps {
  instructors: DepartmentInstructor[];
  onViewInstructor?: (instructor: DepartmentInstructor) => void;
}

export const DepartmentInstructorsList: React.FC<
  DepartmentInstructorsListProps
> = ({ instructors, onViewInstructor }) => {
  if (instructors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Department Lecturers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No lecturers found for this department.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Department Lecturers ({instructors.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {instructors.map((instructor) => (
            <div
              key={instructor.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {instructor.user.firstName} {instructor.user.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {instructor.employeeId} • {instructor.academicRank}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{instructor.academicRank}</Badge>
                    {instructor.specialization && (
                      <Badge variant="secondary">
                        {instructor.specialization}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {instructor.user.email}
                  </div>
                  {instructor.coursesCount !== undefined && (
                    <div>
                      {instructor.coursesCount} course
                      {instructor.coursesCount !== 1 ? "s" : ""} assigned
                    </div>
                  )}
                </div>
              </div>
              {onViewInstructor && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewInstructor(instructor)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};



