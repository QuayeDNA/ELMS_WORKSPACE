import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FacultyViewProps } from "@/types/shared";
import { Calendar, Building, Users } from "lucide-react";

export const FacultyView: React.FC<FacultyViewProps> = ({
  faculty,
  onClose,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{faculty.name}</h2>
          <p className="text-gray-600">Faculty Details</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Faculty Name</p>
              <p className="text-lg">{faculty.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Faculty Code</p>
              <p className="text-lg">
                <Badge variant="outline">{faculty.code}</Badge>
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Institution</p>
              <p className="text-lg">{faculty.institution?.name}</p>
              {faculty.institution?.type && (
                <p className="text-sm text-gray-600">
                  {faculty.institution.type}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Dean</p>
              {faculty.dean ? (
                <div>
                  <p className="text-lg">
                    {faculty.dean.firstName} {faculty.dean.lastName}
                  </p>
                  <p className="text-sm text-gray-600">{faculty.dean.email}</p>
                  {faculty.dean.title && (
                    <p className="text-sm text-gray-600">
                      {faculty.dean.title}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-lg text-gray-500">Not assigned</p>
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Established Year
              </p>
              <p className="text-lg">{faculty.establishedYear || "N/A"}</p>
            </div>
          </div>

          {faculty.description && (
            <div>
              <p className="text-sm font-medium text-gray-700">Description</p>
              <p className="text-lg mt-1">{faculty.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {faculty._count?.departments || 0}
              </div>
              <div className="text-sm text-gray-600">Departments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {faculty._count?.users || 0}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {faculty._count?.exams || 0}
              </div>
              <div className="text-sm text-gray-600">Exams</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Departments */}
      {faculty.departments && faculty.departments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Departments ({faculty.departments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {faculty.departments.map((department) => (
                <div
                  key={department.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{department.name}</p>
                    <p className="text-sm text-gray-600">
                      Code: {department.code}
                    </p>
                    {department.hod && (
                      <p className="text-sm text-gray-600">
                        HOD: {department.hod.firstName}{" "}
                        {department.hod.lastName}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>{department._count?.users || 0} users</p>
                    <p>{department._count?.courses || 0} courses</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Created</p>
              <p className="text-lg">
                {faculty.createdAt
                  ? new Date(faculty.createdAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Updated</p>
              <p className="text-lg">
                {faculty.updatedAt
                  ? new Date(faculty.updatedAt).toLocaleDateString()
                  : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dean Information */}
      {faculty.dean && (
        <Card>
          <CardHeader>
            <CardTitle>Faculty Dean</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-medium">
                  {faculty.dean.firstName} {faculty.dean.lastName}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};



