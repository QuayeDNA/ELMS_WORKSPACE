import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, USER_ROLES, USER_STATUSES, GENDERS } from '@/types/user';
import { Calendar, Mail, Phone, MapPin, Building, Users, GraduationCap } from 'lucide-react';

interface UserViewProps {
  user: User;
  onEdit: () => void;
  onClose: () => void;
}

export const UserView: React.FC<UserViewProps> = ({ user, onEdit, onClose }) => {
  const getRoleLabel = (role: string) => {
    const roleObj = USER_ROLES.find(r => r.value === role);
    return roleObj?.label || role;
  };

  const getStatusLabel = (status: string) => {
    const statusObj = USER_STATUSES.find(s => s.value === status);
    return statusObj?.label || status;
  };

  const getGenderLabel = (gender?: string) => {
    if (!gender) return 'Not specified';
    const genderObj = GENDERS.find(g => g.value === gender);
    return genderObj?.label || gender;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {user.title ? `${user.title} ` : ''}{user.firstName} {user.middleName ? `${user.middleName} ` : ''}{user.lastName}
          </h2>
          <p className="text-gray-600">User ID: {user.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            Edit User
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Status and Role Badges */}
      <div className="flex gap-2">
        <Badge variant={user.status === 'ACTIVE' ? 'default' : 'secondary'}>
          {getStatusLabel(user.status)}
        </Badge>
        <Badge variant="outline">
          {getRoleLabel(user.role)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">First Name</span>
                <p className="text-sm text-gray-900">{user.firstName}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Name</span>
                <p className="text-sm text-gray-900">{user.lastName}</p>
              </div>
            </div>

            {user.middleName && (
              <div>
                <span className="text-sm font-medium text-gray-500">Middle Name</span>
                <p className="text-sm text-gray-900">{user.middleName}</p>
              </div>
            )}

            {user.title && (
              <div>
                <span className="text-sm font-medium text-gray-500">Title</span>
                <p className="text-sm text-gray-900">{user.title}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-500">Gender</span>
                <p className="text-sm text-gray-900">{getGenderLabel(user.gender)}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Date of Birth</span>
                <p className="text-sm text-gray-900">{formatDate(user.dateOfBirth)}</p>
              </div>
            </div>

            {user.nationality && (
              <div>
                <span className="text-sm font-medium text-gray-500">Nationality</span>
                <p className="text-sm text-gray-900">{user.nationality}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-sm text-gray-900">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone</span>
                  <p className="text-sm text-gray-900">{user.phone}</p>
                </div>
              </div>
            )}

            {user.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Address</span>
                  <p className="text-sm text-gray-900 whitespace-pre-line">{user.address}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Organizational Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Organizational Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.institution && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Institution</span>
                  <p className="text-sm text-gray-900">{user.institution.name}</p>
                </div>
              </div>
            )}

            {user.faculty && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Faculty</span>
                  <p className="text-sm text-gray-900">{user.faculty.name}</p>
                </div>
              </div>
            )}

            {user.department && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-500">Department</span>
                  <p className="text-sm text-gray-900">{user.department.name}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500">Role</span>
              <p className="text-sm text-gray-900">{getRoleLabel(user.role)}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-500">Status</span>
              <p className="text-sm text-gray-900">{getStatusLabel(user.status)}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-500">Created At</span>
              <p className="text-sm text-gray-900">{formatDate(user.createdAt)}</p>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-500">Last Updated</span>
              <p className="text-sm text-gray-900">{formatDate(user.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {user.createdAt && user.updatedAt && (
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-500">Created:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(user.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-500">Updated:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(user.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
