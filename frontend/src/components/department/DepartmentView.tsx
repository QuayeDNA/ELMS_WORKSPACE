import React from 'react';
import { Department } from '@/types/department';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
          <Badge variant={department.isActive ? "default" : "secondary"}>
            {department.isActive ? "Active" : "Inactive"}
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
                <p>{department.faculty?.name}</p>
              </div>
            </div>
            
            {department.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p>{department.description}</p>
              </div>
            )}
            
            {department.headOfDepartment && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Head of Department</label>
                <p>{department.headOfDepartment}</p>
              </div>
            )}
            
            {department.establishedYear && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Established Year</label>
                <p>{department.establishedYear}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        {(department.contactEmail || department.contactPhone || department.website) && (
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {department.contactEmail && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p>{department.contactEmail}</p>
                </div>
              )}
              
              {department.contactPhone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p>{department.contactPhone}</p>
                </div>
              )}
              
              {department.website && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Website</label>
                  <p>
                    <a 
                      href={department.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {department.website}
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Statistics */}
        {department._count && (
          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Programs</label>
                  <p className="text-2xl font-bold">{department._count.programs}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Students</label>
                  <p className="text-2xl font-bold">{department._count.students}</p>
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
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p>{new Date(department.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
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
