import React, { useState } from 'react'
import { Bell, Check, Trash2, Settings, Filter } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { ScrollArea } from '../components/ui/scroll-area'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'

// Notification types
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  priority: 'low' | 'medium' | 'high'
  timestamp: Date
  read: boolean
  category: string
  actionUrl?: string
}

// Mock notification data - in real app, this would come from API
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'System Maintenance Scheduled',
    message: 'The system will undergo maintenance on Sunday, 2:00 AM - 4:00 AM UTC. Some services may be unavailable.',
    type: 'warning',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    category: 'System'
  },
  {
    id: '2',
    title: 'New Exam Results Available',
    message: 'Results for Mathematics Exam 2024 have been published. Check your dashboard for details.',
    type: 'success',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
    category: 'Academic'
  },
  {
    id: '3',
    title: 'Profile Update Required',
    message: 'Please update your profile information before the end of this week.',
    type: 'info',
    priority: 'low',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    category: 'Profile'
  },
  {
    id: '4',
    title: 'Security Alert',
    message: 'Unusual login activity detected. Please verify your account security.',
    type: 'error',
    priority: 'high',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: false,
    category: 'Security'
  },
  {
    id: '5',
    title: 'New Course Material Available',
    message: 'Advanced Database Design course materials have been updated.',
    type: 'info',
    priority: 'medium',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    category: 'Academic'
  }
]

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Get unique categories
  const categories = Array.from(new Set(notifications.map(n => n.category)))

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    const matchesReadFilter = filter === 'all' ||
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read)

    const matchesCategoryFilter = categoryFilter === 'all' || notification.category === categoryFilter

    return matchesReadFilter && matchesCategoryFilter
  })

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  // Get notification type styles
  const getNotificationStyles = (type: string, priority: string, read: boolean) => {
    const baseStyles = read ? 'opacity-60' : 'opacity-100'

    let typeStyles = ''
    switch (type) {
      case 'success':
        typeStyles = 'border-green-500/20 bg-green-500/5'
        break
      case 'warning':
        typeStyles = 'border-yellow-500/20 bg-yellow-500/5'
        break
      case 'error':
        typeStyles = 'border-red-500/20 bg-red-500/5'
        break
      default:
        typeStyles = 'border-blue-500/20 bg-blue-500/5'
    }

    let priorityStyles = ''
    switch (priority) {
      case 'high':
        priorityStyles = 'border-l-4 border-l-red-500'
        break
      case 'medium':
        priorityStyles = 'border-l-4 border-l-yellow-500'
        break
      case 'low':
        priorityStyles = 'border-l-4 border-l-blue-500'
        break
    }

    return `${baseStyles} ${typeStyles} ${priorityStyles}`
  }

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Stay updated with important system notifications and updates
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Mark All Read</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setFilter('all')}>
                  All Notifications
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('unread')}>
                  Unread Only
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('read')}>
                  Read Only
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <Bell className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <Bell className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {notifications.filter(n => n.priority === 'high').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter by Category</CardTitle>
            <CardDescription>
              Select a category to filter notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {filter === 'all' ? 'All Notifications' :
               filter === 'unread' ? 'Unread Notifications' : 'Read Notifications'}
              {categoryFilter !== 'all' && ` - ${categoryFilter}`}
            </CardTitle>
            <CardDescription>
              {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No notifications found
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {filter === 'unread' ? 'You have no unread notifications.' :
                       filter === 'read' ? 'You have no read notifications.' :
                       'You have no notifications at the moment.'}
                    </p>
                  </div>
                ) : (
                  filteredNotifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`
                        p-4 rounded-lg border transition-all duration-200 hover:shadow-md
                        ${getNotificationStyles(notification.type, notification.priority, notification.read)}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                              {notification.title}
                            </h4>
                            <Badge variant={getPriorityBadgeVariant(notification.priority)} className="text-xs">
                              {notification.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {notification.category}
                            </Badge>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                          </div>

                          <p className="text-slate-700 dark:text-slate-300 mb-3 leading-relaxed">
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {formatTimestamp(notification.timestamp)}
                            </span>

                            <div className="flex items-center space-x-2">
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Mark Read
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {index < filteredNotifications.length - 1 && (
                        <div className="border-t border-slate-200 dark:border-slate-700 mt-4" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
