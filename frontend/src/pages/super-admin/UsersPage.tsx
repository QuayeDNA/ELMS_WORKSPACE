import React from 'react';
import { Users } from 'lucide-react';
import { UserList } from '@/components/user';

export const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600">Manage users across all institutions</p>
            </div>
          </div>
        </div>
      </div>

      <UserList />
    </div>
  );
};

