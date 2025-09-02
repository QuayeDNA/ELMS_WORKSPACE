import { Plus, Search, Filter, MoreHorizontal, Users } from 'lucide-react';

export function FacultyPage() {
  const faculty = [
    { id: 1, name: 'Prof. John Williams', email: 'j.williams@university.edu', department: 'Computer Science', position: 'Professor', courses: 3, status: 'Active' },
    { id: 2, name: 'Dr. Sarah Johnson', email: 's.johnson@university.edu', department: 'Mathematics', position: 'Associate Professor', courses: 2, status: 'Active' },
    { id: 3, name: 'Prof. Michael Brown', email: 'm.brown@university.edu', department: 'Physics', position: 'Professor', courses: 4, status: 'Active' },
    { id: 4, name: 'Dr. Lisa Chen', email: 'l.chen@university.edu', department: 'Engineering', position: 'Assistant Professor', courses: 2, status: 'On Leave' },
    { id: 5, name: 'Prof. David Miller', email: 'd.miller@university.edu', department: 'Chemistry', position: 'Professor', courses: 3, status: 'Active' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty</h1>
          <p className="text-gray-600">Manage faculty members and their assignments</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Faculty
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-900">24</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Faculty</p>
              <p className="text-2xl font-bold text-gray-900">22</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Leave</p>
              <p className="text-2xl font-bold text-gray-900">2</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Departments</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Position</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Courses</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {faculty.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.split(' ')[1]?.charAt(0) || member.name.charAt(0)}
                      </div>
                      <span className="ml-3 font-medium text-gray-900">{member.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.email}</td>
                  <td className="py-3 px-4 text-gray-600">{member.department}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {member.position}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{member.courses}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      member.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {member.status}
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
    </div>
  );
}
