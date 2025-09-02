import { UserPlus, Search, Filter, MoreHorizontal } from 'lucide-react';

export function UsersPage() {
  const users = [
    { id: 1, name: 'John Doe', email: 'john.doe@university.edu', role: 'Faculty', department: 'Computer Science', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@university.edu', role: 'Student', department: 'Mathematics', status: 'Active' },
    { id: 3, name: 'Prof. Williams', email: 'williams@university.edu', role: 'Faculty', department: 'Physics', status: 'Active' },
    { id: 4, name: 'Sarah Johnson', email: 'sarah.j@university.edu', role: 'Staff', department: 'Administration', status: 'Inactive' },
    { id: 5, name: 'Mike Chen', email: 'mike.chen@university.edu', role: 'Student', department: 'Engineering', status: 'Active' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage all users in the system</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="border px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="ml-3 font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Faculty' ? 'bg-green-100 text-green-800' :
                      user.role === 'Student' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{user.department}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Showing 1 to 5 of 5 results</span>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Previous</button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
