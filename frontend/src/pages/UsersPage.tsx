import React from 'react';
import { UserList } from '@/components/user';

export const UsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage users across all institutions</p>
        </div>
      </div>

      <UserList />
    </div>
  );
};



