import React from 'react';
import { Department } from '@/types/department';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DepartmentViewProps {
  department: Department;
  onClose: () => void;
}

const DepartmentView: React.FC<DepartmentViewProps> = ({ department, onClose }) => {
  return (
    <div className="p-4">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>{department.name}</span>
          <Badge variant="default">
            {department.type}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="mt-6 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department Code</label>
                <p className="font-mono">{department.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Faculty</label>
                <p>{department.faculty?.name || 'Not assigned'}</p>
              </div>
            </div>

            {department.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p>{department.description}</p>
              </div>
            )}

            {department.hod && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Head of Department</label>
                <p>{`${department.hod.firstName} ${department.hod.lastName}`}</p>
              </div>
            )}

            {department.officeLocation && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Office Location</label>
                <p>{department.officeLocation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        {department.contactInfo && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Contact Details</p>
                <p className="whitespace-pre-line">{department.contactInfo}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {department.stats && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programs</p>
                  <p className="text-2xl font-bold">{department.stats.activePrograms}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Users</p>
                  <p className="text-2xl font-bold">{department.stats.totalUsers}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Courses</p>
                  <p className="text-2xl font-bold">{department.stats.totalCourses}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Lecturers</p>
                  <p className="text-2xl font-bold">{department.stats.totalLecturers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardHeader>
            <CardTitle>Timestamps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created</p>
                <p>{new Date(department.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                <p>{new Date(department.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end mt-6">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default DepartmentView;



