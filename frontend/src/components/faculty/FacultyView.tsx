import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Faculty } from '@/types/faculty';
import { Calendar, Building, Users } from 'lucide-react';

interface FacultyViewProps {
  faculty: Faculty;
  onClose: () => void;
}

export const FacultyView: React.FC<FacultyViewProps> = ({ faculty, onClose }) => {
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
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Established Year</p>
              <p className="text-lg">{faculty.establishedYear || 'N/A'}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="text-sm text-gray-600">Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                {faculty.createdAt ? new Date(faculty.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Last Updated</p>
              <p className="text-lg">
                {faculty.updatedAt ? new Date(faculty.updatedAt).toLocaleDateString() : 'N/A'}
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
                <p className="font-medium">{faculty.dean.firstName} {faculty.dean.lastName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
