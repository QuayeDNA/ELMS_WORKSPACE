import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { UserCheck, Eye, Mail } from "lucide-react";

interface DepartmentStudent {
  id: number;
  userId: number;
  studentId: string;
  indexNumber?: string;
  level: number;
  semester: number;
  enrollmentStatus: string;
  academicStatus: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  program?: {
    id: number;
    name: string;
    code: string;
  };
}

interface DepartmentStudentsListProps {
  students: DepartmentStudent[];
  onViewStudent?: (student: DepartmentStudent) => void;
}

export const DepartmentStudentsList: React.FC<DepartmentStudentsListProps> = ({
  students,
  onViewStudent,
}) => {
  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Enrolled Students
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No students found for this department.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Enrolled Students ({students.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {student.user.firstName} {student.user.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {student.studentId}
                      {student.indexNumber && ` • ${student.indexNumber}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">Level {student.level}</Badge>
                    <Badge variant="secondary">
                      Semester {student.semester}
                    </Badge>
                    <Badge
                      variant={
                        student.enrollmentStatus === "ACTIVE"
                          ? "default"
                          : "destructive"
                      }
                    >
                      {student.enrollmentStatus}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {student.user.email}
                  </div>
                  {student.program && (
                    <div>
                      Program: {student.program.name} ({student.program.code})
                    </div>
                  )}
                </div>
              </div>
              {onViewStudent && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewStudent(student)}
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



