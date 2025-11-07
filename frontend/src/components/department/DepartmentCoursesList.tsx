import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Eye } from "lucide-react";

interface DepartmentCourse {
  id: number;
  name: string;
  code: string;
  level: number;
  courseType: string;
  creditHours: number;
  isActive: boolean;
  programCourses?: {
    program: {
      id: number;
      name: string;
      code: string;
    };
    level: number;
    semester: number;
    isRequired: boolean;
  }[];
}

interface DepartmentCoursesListProps {
  courses: DepartmentCourse[];
  onViewCourse?: (course: DepartmentCourse) => void;
}

export const DepartmentCoursesList: React.FC<DepartmentCoursesListProps> = ({
  courses,
  onViewCourse,
}) => {
  if (courses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Courses Offered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No courses found for this department.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Courses Offered ({courses.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium">{course.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{course.courseType}</Badge>
                    <Badge variant="secondary">Level {course.level}</Badge>
                    {course.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Credits: {course.creditHours}
                  {course.programCourses &&
                    course.programCourses.length > 0 && (
                      <span className="ml-4">
                        Offered in {course.programCourses.length} program
                        {course.programCourses.length > 1 ? "s" : ""}
                      </span>
                    )}
                </div>
              </div>
              {onViewCourse && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewCourse(course)}
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



