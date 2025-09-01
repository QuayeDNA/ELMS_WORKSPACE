export function StudentsPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Students</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Add Student
        </button>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management</h3>
        <p className="text-gray-600 mb-4">
          Manage student enrollment, profiles, and academic records.
        </p>
        <div className="text-sm text-gray-500">
          👨‍🎓 Coming soon - Student registration, enrollment management, profile updates, and bulk import.
        </div>
      </div>
    </div>
  );
}
