import { useState, useEffect } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  QrCode,
  MapPin,
  Clock,
  User,
  Package,
  CheckCircle,
  AlertCircle,
  Truck,
  Download,
  Upload,
  BarChart3
} from 'lucide-react'

interface Script {
  id: string
  qrCode: string
  studentId: string
  studentName: string
  studentNumber: string
  examId: string
  examTitle: string
  examDate: string
  venue: string
  status: 'generated' | 'distributed' | 'collected' | 'verified' | 'scanned' | 'dispatched' | 'received' | 'graded' | 'returned'
  currentHandler?: string
  currentLocation?: string
  createdAt: string
  lastUpdated: string
  movements: ScriptMovement[]
  incidents: number
}

interface ScriptMovement {
  id: string
  timestamp: string
  fromLocation: string
  toLocation: string
  handler: string
  status: string
  notes?: string
}

export const ScriptManagement = () => {
  const [scripts, setScripts] = useState<Script[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [examFilter, setExamFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedScript, setSelectedScript] = useState<Script | null>(null)
  const [showTrackingModal, setShowTrackingModal] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockScripts: Script[] = [
      {
        id: 'SCR-001',
        qrCode: 'QR-CS-MID-001-2024',
        studentId: 'STU-001',
        studentName: 'John Doe',
        studentNumber: '2024001',
        examId: 'EXM-CS-001',
        examTitle: 'Computer Science Mid-Term',
        examDate: '2024-09-15',
        venue: 'Computer Lab 1',
        status: 'collected',
        currentHandler: 'Prof. Smith',
        currentLocation: 'Faculty Office',
        createdAt: '2024-09-15T08:00:00Z',
        lastUpdated: '2024-09-15T11:30:00Z',
        movements: [
          {
            id: 'MOV-001',
            timestamp: '2024-09-15T08:00:00Z',
            fromLocation: 'Print Center',
            toLocation: 'Computer Lab 1',
            handler: 'Admin Staff',
            status: 'distributed'
          },
          {
            id: 'MOV-002',
            timestamp: '2024-09-15T11:30:00Z',
            fromLocation: 'Computer Lab 1',
            toLocation: 'Faculty Office',
            handler: 'Prof. Smith',
            status: 'collected'
          }
        ],
        incidents: 0
      },
      {
        id: 'SCR-002',
        qrCode: 'QR-MATH-FIN-002-2024',
        studentId: 'STU-002',
        studentName: 'Sarah Wilson',
        studentNumber: '2024002',
        examId: 'EXM-MATH-002',
        examTitle: 'Mathematics Final',
        examDate: '2024-09-20',
        venue: 'Exam Hall A',
        status: 'graded',
        currentHandler: 'Dr. Johnson',
        currentLocation: 'Marking Center',
        createdAt: '2024-09-20T08:00:00Z',
        lastUpdated: '2024-09-21T16:45:00Z',
        movements: [
          {
            id: 'MOV-003',
            timestamp: '2024-09-20T08:00:00Z',
            fromLocation: 'Print Center',
            toLocation: 'Exam Hall A',
            handler: 'Invigilator Team',
            status: 'distributed'
          },
          {
            id: 'MOV-004',
            timestamp: '2024-09-20T11:00:00Z',
            fromLocation: 'Exam Hall A',
            toLocation: 'Collection Point',
            handler: 'Script Handler',
            status: 'collected'
          },
          {
            id: 'MOV-005',
            timestamp: '2024-09-20T14:00:00Z',
            fromLocation: 'Collection Point',
            toLocation: 'Marking Center',
            handler: 'Dr. Johnson',
            status: 'dispatched'
          }
        ],
        incidents: 0
      },
      {
        id: 'SCR-003',
        qrCode: 'QR-PHY-QZ-003-2024',
        studentId: 'STU-003',
        studentName: 'Michael Brown',
        studentNumber: '2024003',
        examId: 'EXM-PHY-003',
        examTitle: 'Physics Quiz',
        examDate: '2024-09-10',
        venue: 'Physics Lab',
        status: 'verified',
        currentHandler: 'Lab Assistant',
        currentLocation: 'Physics Lab',
        createdAt: '2024-09-10T08:00:00Z',
        lastUpdated: '2024-09-10T10:15:00Z',
        movements: [
          {
            id: 'MOV-006',
            timestamp: '2024-09-10T08:00:00Z',
            fromLocation: 'Print Center',
            toLocation: 'Physics Lab',
            handler: 'Lab Assistant',
            status: 'distributed'
          },
          {
            id: 'MOV-007',
            timestamp: '2024-09-10T10:15:00Z',
            fromLocation: 'Physics Lab',
            toLocation: 'Physics Lab Storage',
            handler: 'Lab Assistant',
            status: 'collected',
            notes: 'All scripts accounted for'
          }
        ],
        incidents: 1
      }
    ]
    
    setTimeout(() => {
      setScripts(mockScripts)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'distributed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'collected': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'verified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'scanned': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400'
      case 'dispatched': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'received': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400'
      case 'graded': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'returned': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated': return <FileText className="h-4 w-4 text-gray-600" />
      case 'distributed': return <Package className="h-4 w-4 text-blue-600" />
      case 'collected': return <CheckCircle className="h-4 w-4 text-yellow-600" />
      case 'verified': return <CheckCircle className="h-4 w-4 text-purple-600" />
      case 'scanned': return <QrCode className="h-4 w-4 text-indigo-600" />
      case 'dispatched': return <Truck className="h-4 w-4 text-orange-600" />
      case 'received': return <Package className="h-4 w-4 text-cyan-600" />
      case 'graded': return <BarChart3 className="h-4 w-4 text-green-600" />
      case 'returned': return <CheckCircle className="h-4 w-4 text-emerald-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.qrCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.examTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || script.status === statusFilter
    const matchesExam = examFilter === 'all' || script.examId === examFilter
    return matchesSearch && matchesStatus && matchesExam
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const openTrackingModal = (script: Script) => {
    setSelectedScript(script)
    setShowTrackingModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Script Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage exam scripts throughout their lifecycle</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <QrCode className="h-4 w-4" />
            <span>Scan Script</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Generate Scripts</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Scripts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{scripts.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Transit</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {scripts.filter(s => ['distributed', 'collected', 'dispatched'].includes(s.status)).length}
              </p>
            </div>
            <Truck className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Graded</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {scripts.filter(s => s.status === 'graded').length}
              </p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Incidents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {scripts.reduce((sum, script) => sum + script.incidents, 0)}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Returned</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {scripts.filter(s => s.status === 'returned').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search scripts, students, or QR codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="generated">Generated</option>
              <option value="distributed">Distributed</option>
              <option value="collected">Collected</option>
              <option value="verified">Verified</option>
              <option value="scanned">Scanned</option>
              <option value="dispatched">Dispatched</option>
              <option value="received">Received</option>
              <option value="graded">Graded</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Exams</option>
              <option value="EXM-CS-001">Computer Science Mid-Term</option>
              <option value="EXM-MATH-002">Mathematics Final</option>
              <option value="EXM-PHY-003">Physics Quiz</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
              <Upload className="h-4 w-4" />
              <span>Bulk Update</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scripts Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Script Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student & Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status & Handler
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location & Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredScripts.map((script) => (
                <tr key={script.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {script.id}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2">
                        <QrCode className="h-4 w-4" />
                        <span>{script.qrCode}</span>
                      </div>
                      {script.incidents > 0 && (
                        <div className="text-xs text-red-600 dark:text-red-400 flex items-center space-x-1 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>{script.incidents} incident(s)</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {script.studentName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        #{script.studentNumber}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {script.examTitle}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {script.venue} • {script.examDate}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(script.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(script.status)}`}>
                          {script.status.charAt(0).toUpperCase() + script.status.slice(1)}
                        </span>
                      </div>
                      {script.currentHandler && (
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{script.currentHandler}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {script.currentLocation && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{script.currentLocation}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Updated: {formatDate(script.lastUpdated)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openTrackingModal(script)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                        <MapPin className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredScripts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No scripts found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || examFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No scripts have been generated yet.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {showTrackingModal && selectedScript && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Script Tracking: {selectedScript.id}
              </h3>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Student</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedScript.studentName} (#{selectedScript.studentNumber})
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Exam</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedScript.examTitle}
                  </p>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Movement History</h4>
                <div className="space-y-3">
                  {selectedScript.movements.map((movement, index) => (
                    <div key={movement.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {movement.fromLocation} → {movement.toLocation}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(movement.status)}`}>
                            {movement.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Handler: {movement.handler}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(movement.timestamp)}
                        </div>
                        {movement.notes && (
                          <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                            Note: {movement.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
