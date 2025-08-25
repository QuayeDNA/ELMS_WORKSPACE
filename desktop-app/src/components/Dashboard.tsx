import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { 
  Monitor, 
  Users, 
  BookOpen, 
  AlertTriangle, 
  BarChart3, 
  Settings,
  LogOut,
  Bell,
  Search,
  FileText,
  Calendar,
  MapPin
} from 'lucide-react'
import { realTimeService } from '../services/realTimeService'
import useCachedQuery from '../hooks/useCachedQuery'

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  section: string
}

interface OverviewStats {
  activeExams: number
  scriptsProcessed: number
  openIncidents: number
  systemHealth: string
}

const navigationItems: NavigationItem[] = [
  { id: 'overview', label: 'Overview', icon: Monitor, section: 'dashboard' },
  { id: 'exams', label: 'Exam Management', icon: BookOpen, section: 'exams' },
  { id: 'scripts', label: 'Script Tracking', icon: FileText, section: 'scripts' },
  { id: 'incidents', label: 'Incident Management', icon: AlertTriangle, section: 'incidents' },
  { id: 'users', label: 'User Management', icon: Users, section: 'users' },
  { id: 'venues', label: 'Venue Management', icon: MapPin, section: 'venues' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'analytics' },
  { id: 'schedule', label: 'Scheduling', icon: Calendar, section: 'schedule' },
]

export const Dashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuthStore((state) => ({
    user: state.user,
    logout: state.logout
  }))

  // Example fetcher - replace with real API client
  const fetchOverview = async () => {
    return {
      activeExams: 12,
      scriptsProcessed: 2847,
      openIncidents: 3,
      systemHealth: '98.5%'
    }
  }

  const { data: overview, loading: overviewLoading } = useCachedQuery<OverviewStats>('overview:stats', fetchOverview)

  const handleLogout = () => {
    logout()
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Exams</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{overviewLoading ? '—' : overview?.activeExams ?? '—'}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">↑ 2 from yesterday</p>
                  </div>
                  <BookOpen className="h-10 w-10 text-blue-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Scripts Processed</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{overviewLoading ? '—' : overview?.scriptsProcessed ?? '—'}</p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">↑ 12% this week</p>
                  </div>
                  <FileText className="h-10 w-10 text-green-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Open Incidents</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{overviewLoading ? '—' : overview?.openIncidents ?? '—'}</p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">2 require attention</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">System Health</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{overviewLoading ? '—' : overview?.systemHealth ?? '—'}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">All systems operational</p>
                  </div>
                  <Monitor className="h-10 w-10 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">Exam session started - Computer Science 101</span>
                    <span className="text-gray-500 text-xs">2 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">Scripts collected - Batch #A234</span>
                    <span className="text-gray-500 text-xs">15 min ago</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">Incident reported - Room 205</span>
                    <span className="text-gray-500 text-xs">1 hour ago</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Upcoming Exams</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Mathematics 201</p>
                      <p className="text-sm text-gray-500">Room 105 • 2:00 PM</p>
                    </div>
                    <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded">Today</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Physics 301</p>
                      <p className="text-sm text-gray-500">Room 201 • 9:00 AM</p>
                    </div>
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">Tomorrow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} section is coming soon...
            </p>
            <button 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              onClick={() => setActiveSection('overview')}
            >
              Back to Overview
            </button>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">ELMS Admin</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Exams Logistics</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.profile?.firstName?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.profile?.firstName} {user?.profile?.lastName}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {activeSection === 'overview' ? 'Dashboard Overview' : navigationItems.find(item => item.id === activeSection)?.label}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-64 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}
