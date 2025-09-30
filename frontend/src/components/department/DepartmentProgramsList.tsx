import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Program } from "@/types/shared/program";
import { Eye, GraduationCap } from "lucide-react";

interface DepartmentProgramsListProps {
  programs: Program[];
  onViewProgram?: (program: Program) => void;
}

export const DepartmentProgramsList: React.FC<DepartmentProgramsListProps> = ({
  programs,
  onViewProgram,
}) => {
  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Programs Offered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No programs found for this department.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Programs Offered ({programs.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="font-medium">{program.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {program.code}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{program.type}</Badge>
                    <Badge variant="secondary">{program.level}</Badge>
                    {program.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Duration: {program.durationYears} years • Credits:{" "}
                  {program.creditHours || "N/A"}
                </div>
              </div>
              {onViewProgram && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewProgram(program)}
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



