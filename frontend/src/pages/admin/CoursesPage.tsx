import { Plus, Search, Filter, MoreHorizontal, BookOpen } from 'lucide-react';

export function CoursesPage() {
  const courses = [
    { id: 1, code: 'CS101', name: 'Introduction to Computer Science', department: 'Computer Science', instructor: 'Prof. John Williams', credits: 3, students: 45, semester: 'Fall 2025', status: 'Active' },
    { id: 2, code: 'MATH201', name: 'Calculus II', department: 'Mathematics', instructor: 'Dr. Sarah Johnson', credits: 4, students: 38, semester: 'Fall 2025', status: 'Active' },
    { id: 3, code: 'PHYS301', name: 'Quantum Physics', department: 'Physics', instructor: 'Prof. Michael Brown', credits: 3, students: 22, semester: 'Fall 2025', status: 'Active' },
    { id: 4, code: 'ENG150', name: 'Engineering Design', department: 'Engineering', instructor: 'Dr. Lisa Chen', credits: 3, students: 55, semester: 'Fall 2025', status: 'On Hold' },
    { id: 5, code: 'CHEM110', name: 'General Chemistry', department: 'Chemistry', instructor: 'Prof. David Miller', credits: 4, students: 42, semester: 'Fall 2025', status: 'Active' },
    { id: 6, code: 'BIO200', name: 'Cell Biology', department: 'Biology', instructor: 'Dr. Emily Davis', credits: 3, students: 35, semester: 'Fall 2025', status: 'Active' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600">Manage course catalog and schedules</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Courses</p>
              <p className="text-2xl font-bold text-gray-900">142</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">On Hold</p>
              <p className="text-2xl font-bold text-gray-900">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Enrollments</p>
              <p className="text-2xl font-bold text-gray-900">3,245</p>
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
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">All Departments</option>
            <option value="cs">Computer Science</option>
            <option value="math">Mathematics</option>
            <option value="phys">Physics</option>
            <option value="eng">Engineering</option>
            <option value="chem">Chemistry</option>
            <option value="bio">Biology</option>
          </select>
          <button className="border px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Course</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Instructor</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Credits</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Students</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Semester</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{course.code}</div>
                      <div className="text-sm text-gray-600">{course.name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{course.department}</td>
                  <td className="py-3 px-4 text-gray-600">{course.instructor}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {course.credits} credits
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{course.students}</td>
                  <td className="py-3 px-4 text-gray-600">{course.semester}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      course.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      course.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.status}
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
