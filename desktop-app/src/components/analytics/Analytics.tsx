import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  BookOpen, 
  AlertTriangle,
  Clock,
  Award,
  Target,
  Activity
} from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalExams: number
    totalUsers: number
    totalIncidents: number
    averageScore: number
    examCompletionRate: number
    userGrowth: number
  }
  examStats: {
    upcomingExams: number
    activeExams: number
    completedExams: number
    draftExams: number
  }
  userStats: {
    admins: number
    examiners: number
    students: number
    invigilators: number
  }
  performanceMetrics: {
    avgExamDuration: number
    avgParticipation: number
    systemUptime: number
    errorRate: number
  }
  recentActivity: Array<{
    id: string
    type: 'exam_created' | 'user_registered' | 'exam_completed' | 'incident_reported'
    description: string
    timestamp: string
    user: string
  }>
}

export const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockData: AnalyticsData = {
      overview: {
        totalExams: 127,
        totalUsers: 1234,
        totalIncidents: 8,
        averageScore: 78.5,
        examCompletionRate: 94.2,
        userGrowth: 12.5
      },
      examStats: {
        upcomingExams: 15,
        activeExams: 3,
        completedExams: 89,
        draftExams: 20
      },
      userStats: {
        admins: 5,
        examiners: 45,
        students: 1150,
        invigilators: 34
      },
      performanceMetrics: {
        avgExamDuration: 95,
        avgParticipation: 87.3,
        systemUptime: 99.8,
        errorRate: 0.2
      },
      recentActivity: [
        {
          id: '1',
          type: 'exam_created',
          description: 'New Computer Science exam created',
          timestamp: '2024-08-22T10:30:00Z',
          user: 'Dr. Smith'
        },
        {
          id: '2',
          type: 'user_registered',
          description: 'New student registered',
          timestamp: '2024-08-22T09:15:00Z',
          user: 'Emily Johnson'
        },
        {
          id: '3',
          type: 'exam_completed',
          description: 'Mathematics Final Exam completed',
          timestamp: '2024-08-22T08:45:00Z',
          user: 'Prof. Williams'
        },
        {
          id: '4',
          type: 'incident_reported',
          description: 'Network connectivity issue reported',
          timestamp: '2024-08-21T16:20:00Z',
          user: 'System Monitor'
        }
      ]
    }
    
    setTimeout(() => {
      setAnalyticsData(mockData)
      setLoading(false)
    }, 1000)
  }, [timeframe])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exam_created': return <BookOpen className="h-4 w-4 text-blue-600" />
      case 'user_registered': return <Users className="h-4 w-4 text-green-600" />
      case 'exam_completed': return <Award className="h-4 w-4 text-purple-600" />
      case 'incident_reported': return <AlertTriangle className="h-4 w-4 text-red-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No analytics data available</h3>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor system performance and user activity</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Exams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.totalExams}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analyticsData.overview.userGrowth}%</span>
              </div>
            </div>
            <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.totalUsers}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analyticsData.overview.userGrowth}%</span>
              </div>
            </div>
            <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.averageScore}%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+2.3%</span>
              </div>
            </div>
            <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.overview.examCompletionRate}%</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">-0.5%</span>
              </div>
            </div>
            <Target className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Charts and Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Statistics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Exam Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.examStats.upcomingExams}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.examStats.activeExams}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.examStats.completedExams}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Draft</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.examStats.draftExams}</span>
            </div>
          </div>
        </div>

        {/* User Distribution */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Admins</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.userStats.admins}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Examiners</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.userStats.examiners}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Students</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.userStats.students}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Invigilators</span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{analyticsData.userStats.invigilators}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.performanceMetrics.avgExamDuration}min</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Exam Duration</p>
          </div>
          <div className="text-center">
            <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.performanceMetrics.avgParticipation}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Avg Participation</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.performanceMetrics.systemUptime}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">System Uptime</p>
          </div>
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.performanceMetrics.errorRate}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {analyticsData.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              {getActivityIcon(activity.type)}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.description}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  by {activity.user} • {formatDate(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
