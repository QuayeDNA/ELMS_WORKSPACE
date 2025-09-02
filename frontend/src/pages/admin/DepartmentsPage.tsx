import { Plus, Search, Filter, MoreHorizontal, Building2 } from 'lucide-react';

export function DepartmentsPage() {
  const departments = [
    { id: 1, name: 'Computer Science', code: 'CS', head: 'Prof. John Williams', faculty: 12, students: 245, courses: 18, status: 'Active' },
    { id: 2, name: 'Mathematics', code: 'MATH', head: 'Dr. Sarah Johnson', faculty: 8, students: 156, courses: 14, status: 'Active' },
    { id: 3, name: 'Physics', code: 'PHYS', head: 'Prof. Michael Brown', faculty: 10, students: 189, courses: 16, status: 'Active' },
    { id: 4, name: 'Engineering', code: 'ENG', head: 'Dr. Lisa Chen', faculty: 15, students: 312, courses: 22, status: 'Active' },
    { id: 5, name: 'Chemistry', code: 'CHEM', head: 'Prof. David Miller', faculty: 9, students: 167, courses: 13, status: 'Active' },
    { id: 6, name: 'Biology', code: 'BIO', head: 'Dr. Emily Davis', faculty: 11, students: 203, courses: 15, status: 'Under Review' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage academic departments and their structure</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Departments</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Departments</p>
              <p className="text-2xl font-bold text-gray-900">7</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Faculty</p>
              <p className="text-2xl font-bold text-gray-900">65</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Building2 className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">1,272</p>
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
              placeholder="Search departments..."
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
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department Head</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Faculty</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Courses</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                        {dept.code}
                      </div>
                      <span className="ml-3 font-medium text-gray-900">{dept.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {dept.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{dept.head}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.faculty}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.students}</td>
                  <td className="py-3 px-4 text-gray-600">{dept.courses}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dept.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      dept.status === 'Under Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dept.status}
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
