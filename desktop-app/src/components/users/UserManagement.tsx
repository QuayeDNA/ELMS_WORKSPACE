import { useState, useEffect } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  Mail, 
  Phone,
  Shield,
  UserCheck,
  UserX,
  Download,
  Upload
} from 'lucide-react'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'admin' | 'examiner' | 'student' | 'invigilator'
  status: 'active' | 'inactive' | 'suspended' | 'pending'
  institution: string
  department?: string
  lastActive: string
  registeredAt: string
  avatar?: string
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@university.edu',
        phone: '+1234567890',
        role: 'admin',
        status: 'active',
        institution: 'University of Technology',
        department: 'Computer Science',
        lastActive: '2024-08-22T10:30:00Z',
        registeredAt: '2024-01-15T08:00:00Z'
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@university.edu',
        phone: '+1234567891',
        role: 'examiner',
        status: 'active',
        institution: 'University of Technology',
        department: 'Mathematics',
        lastActive: '2024-08-22T09:15:00Z',
        registeredAt: '2024-02-01T10:30:00Z'
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@student.university.edu',
        role: 'student',
        status: 'active',
        institution: 'University of Technology',
        department: 'Computer Science',
        lastActive: '2024-08-22T08:45:00Z',
        registeredAt: '2024-08-01T14:20:00Z'
      },
      {
        id: '4',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@university.edu',
        role: 'invigilator',
        status: 'pending',
        institution: 'University of Technology',
        lastActive: '2024-08-21T16:00:00Z',
        registeredAt: '2024-08-20T11:00:00Z'
      },
      {
        id: '5',
        firstName: 'Robert',
        lastName: 'Wilson',
        email: 'robert.wilson@student.university.edu',
        role: 'student',
        status: 'suspended',
        institution: 'University of Technology',
        department: 'Physics',
        lastActive: '2024-08-15T13:20:00Z',
        registeredAt: '2024-07-10T09:30:00Z'
      }
    ]
    
    setTimeout(() => {
      setUsers(mockUsers)
      setLoading(false)
    }, 1000)
  }, [])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'examiner': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'student': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'invigilator': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and permissions</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Upload className="h-4 w-4" />
            <span>Import Users</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'active').length}
              </p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
            <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
            <UserX className="h-8 w-8 text-orange-600 dark:text-orange-400" />
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="examiner">Examiner</option>
              <option value="student">Student</option>
              <option value="invigilator">Invigilator</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Active
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-white font-medium">
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-900 dark:text-white">{user.email}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      <br />
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">{user.department || 'N/A'}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.institution}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(user.lastActive)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Registered: {formatDate(user.registeredAt)}
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
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No users found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding your first user.'
              }
            </p>
            {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
              <div className="mt-6">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add User</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
