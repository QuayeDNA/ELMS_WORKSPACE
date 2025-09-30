export function ScriptGeneratorPage() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Generate Scripts</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Generate QR Scripts
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">QR Code Generation</h3>
          <p className="text-gray-600 mb-4">
            Generate unique QR codes for examination scripts to enable digital tracking throughout the exam process.
          </p>
          <div className="text-sm text-gray-500">
            🏷️ Features: Bulk generation, custom prefixes, batch management, and export options.
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Script Management</h3>
          <p className="text-gray-600 mb-4">
            Manage script templates, formats, and distribution settings for different exam types.
          </p>
          <div className="text-sm text-gray-500">
            📄 Features: Template management, format customization, and distribution tracking.
          </div>
        </div>
      </div>
    </div>
  );
}



