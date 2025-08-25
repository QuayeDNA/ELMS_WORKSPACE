// React import not required with the current JSX transform
import { 
  Monitor, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  Award
} from 'lucide-react'
import RealTimeDashboard from './realtime/RealTimeDashboard'

export const DashboardContent = () => {
  // Mock data - replace with actual API calls
  const stats = {
    activeExams: 12,
    totalUsers: 1234,
    incidents: 3,
    systemHealth: 98,
    completedExams: 89,
    avgScore: 78.5
  }

  const recentExams = [
    { id: 1, name: 'Computer Science Mid-Term', status: 'Active', participants: 145, date: '2024-09-15' },
    { id: 2, name: 'Mathematics Final', status: 'Upcoming', participants: 120, date: '2024-09-20' },
    { id: 3, name: 'Physics Quiz', status: 'Completed', participants: 89, date: '2024-09-10' }
  ]

  const recentActivity = [
    { id: 1, action: 'New exam created', user: 'Dr. Smith', time: '2 hours ago' },
    { id: 2, action: 'Student registered', user: 'John Doe', time: '3 hours ago' },
    { id: 3, action: 'Exam completed', user: 'Prof. Johnson', time: '5 hours ago' },
    { id: 4, action: 'Incident reported', user: 'System Monitor', time: '1 day ago' }
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome to ELMS Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Monitor your exam logistics and system performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Exams</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.activeExams}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% from last month</span>
              </div>
            </div>
            <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% from last month</span>
              </div>
            </div>
            <Users className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Open Incidents</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.incidents}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-sm text-red-600">+2 since yesterday</span>
              </div>
            </div>
            <AlertTriangle className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.systemHealth}%</p>
              <div className="flex items-center mt-2">
                <Monitor className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">All systems operational</span>
              </div>
            </div>
            <Monitor className="h-12 w-12 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Average Score</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.avgScore}%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed Exams</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{stats.completedExams}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Duration</span>
              </div>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">95 min</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Exams</h3>
          <div className="space-y-3">
            {recentExams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{exam.participants} participants</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    exam.status === 'Active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                    exam.status === 'Upcoming' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                  }`}>
                    {exam.status}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">{exam.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">by {activity.user} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-time Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Real-time System Monitor</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">Live updates every 3 seconds</span>
        </div>
        <RealTimeDashboard />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Create Exam</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Start a new examination</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Add User</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Register new user</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">View Reports</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Generate analytics</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
            <Calendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Schedule Exam</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Plan upcoming tests</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
