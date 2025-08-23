import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Clock, 
  Users, 
  Calendar,
  FileText,
  Settings
} from 'lucide-react'

interface Exam {
  id: string
  title: string
  subject: string
  date: string
  duration: number
  totalQuestions: number
  maxScore: number
  status: 'draft' | 'published' | 'active' | 'completed' | 'archived'
  participants: number
  createdBy: string
  institution: string
}

export const ExamManagement = () => {
  const [exams, setExams] = useState<Exam[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockExams: Exam[] = [
      {
        id: '1',
        title: 'Computer Science Mid-Term Examination',
        subject: 'Computer Science',
        date: '2024-09-15',
        duration: 120,
        totalQuestions: 50,
        maxScore: 100,
        status: 'published',
        participants: 145,
        createdBy: 'Dr. Smith',
        institution: 'University of Technology'
      },
      {
        id: '2',
        title: 'Mathematics Final Exam',
        subject: 'Mathematics',
        date: '2024-09-20',
        duration: 180,
        totalQuestions: 75,
        maxScore: 150,
        status: 'draft',
        participants: 0,
        createdBy: 'Prof. Johnson',
        institution: 'University of Technology'
      },
      {
        id: '3',
        title: 'Physics Quiz - Mechanics',
        subject: 'Physics',
        date: '2024-09-10',
        duration: 60,
        totalQuestions: 25,
        maxScore: 50,
        status: 'completed',
        participants: 89,
        createdBy: 'Dr. Williams',
        institution: 'University of Technology'
      }
    ]
    
    setTimeout(() => {
      setExams(mockExams)
      setLoading(false)
    }, 1000)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'published': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'completed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || exam.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, manage, and monitor examinations</p>
        </div>
        <button className="mt-4 sm:mt-0 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
          <Plus className="h-4 w-4" />
          <span>Create New Exam</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{exams.length}</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Exams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {exams.filter(e => e.status === 'active' || e.status === 'published').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {exams.reduce((sum, exam) => sum + exam.participants, 0)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {exams.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exams Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Exam Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {exam.subject} • {exam.totalQuestions} questions • {exam.maxScore} points
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        Created by {exam.createdBy}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">{exam.date}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{exam.duration} minutes</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(exam.status)}`}>
                      {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-900 dark:text-white">{exam.participants}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                        <Settings className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No exams found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first exam.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <div className="mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Create New Exam</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
