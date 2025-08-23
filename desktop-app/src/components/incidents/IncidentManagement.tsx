import { useState, useEffect } from 'react'
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface Incident {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  category: 'technical' | 'security' | 'user_issue' | 'system' | 'network'
  reportedBy: string
  reportedAt: string
  assignedTo?: string
  resolvedAt?: string
  location?: string
  examId?: string
  examTitle?: string
}

export const IncidentManagement = () => {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockIncidents: Incident[] = [
      {
        id: '1',
        title: 'Network connectivity issues in Lab 3',
        description: 'Students reporting intermittent internet connectivity during Computer Science exam',
        severity: 'high',
        status: 'in_progress',
        category: 'network',
        reportedBy: 'Prof. Smith',
        reportedAt: '2024-08-22T14:30:00Z',
        assignedTo: 'IT Support Team',
        location: 'Computer Lab 3',
        examId: 'exam-123',
        examTitle: 'Computer Science Mid-Term'
      },
      {
        id: '2',
        title: 'Student authentication failure',
        description: 'Multiple students unable to log into exam system',
        severity: 'critical',
        status: 'open',
        category: 'technical',
        reportedBy: 'Dr. Johnson',
        reportedAt: '2024-08-22T13:15:00Z',
        location: 'Exam Hall A',
        examId: 'exam-124',
        examTitle: 'Mathematics Final'
      },
      {
        id: '3',
        title: 'Suspicious activity detected',
        description: 'Unusual access patterns detected from IP range 192.168.1.50-60',
        severity: 'medium',
        status: 'resolved',
        category: 'security',
        reportedBy: 'Security System',
        reportedAt: '2024-08-22T10:45:00Z',
        assignedTo: 'Security Team',
        resolvedAt: '2024-08-22T12:00:00Z'
      },
      {
        id: '4',
        title: 'Power outage in Building B',
        description: 'Temporary power loss affecting backup systems',
        severity: 'low',
        status: 'closed',
        category: 'system',
        reportedBy: 'Facility Manager',
        reportedAt: '2024-08-21T16:20:00Z',
        resolvedAt: '2024-08-21T17:30:00Z',
        location: 'Building B - All Floors'
      },
      {
        id: '5',
        title: 'Student unable to submit answers',
        description: 'Technical issue preventing exam submission',
        severity: 'high',
        status: 'resolved',
        category: 'user_issue',
        reportedBy: 'Sarah Wilson',
        reportedAt: '2024-08-22T11:20:00Z',
        assignedTo: 'Technical Support',
        resolvedAt: '2024-08-22T11:45:00Z',
        examId: 'exam-125',
        examTitle: 'Physics Quiz'
      }
    ]
    
    setTimeout(() => {
      setIncidents(mockIncidents)
      setLoading(false)
    }, 1000)
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'closed': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <XCircle className="h-4 w-4 text-red-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <Info className="h-4 w-4 text-blue-600" />
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Info className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSeverity = severityFilter === 'all' || incident.severity === severityFilter
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter
    return matchesSearch && matchesSeverity && matchesStatus
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Incident Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and resolve system incidents</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Report Incident</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Incidents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{incidents.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {incidents.filter(i => i.status === 'open' || i.status === 'in_progress').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {incidents.filter(i => i.status === 'resolved').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Critical</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {incidents.filter(i => i.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
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
              placeholder="Search incidents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Incident
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Severity & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reporter & Assignment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Location & Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Timeline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredIncidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {incident.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {incident.description}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Category: {incident.category.replace('_', ' ')}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(incident.severity)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(incident.severity)}`}>
                          {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(incident.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident.status)}`}>
                          {incident.status.replace('_', ' ').charAt(0).toUpperCase() + incident.status.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{incident.reportedBy}</span>
                      </div>
                      {incident.assignedTo && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Assigned to: {incident.assignedTo}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {incident.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-900 dark:text-white">{incident.location}</span>
                        </div>
                      )}
                      {incident.examTitle && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Exam: {incident.examTitle}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 dark:text-white">
                        Reported: {formatDate(incident.reportedAt)}
                      </div>
                      {incident.resolvedAt && (
                        <div className="text-sm text-green-600 dark:text-green-400">
                          Resolved: {formatDate(incident.resolvedAt)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredIncidents.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No incidents found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || severityFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No incidents have been reported yet.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
