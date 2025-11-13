import React, { useState } from 'react';
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  X,
  Users,
  Mail,
  Shield,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { userService } from '@/services/user.service';
import { User, UserQuery, USER_ROLES, USER_STATUSES, UserRole, UserStatus } from '@/types/user';
import { UserCreate } from './UserCreate';
import { UserEdit } from './UserEdit';
import { UserView } from './UserView';
import { cn } from '@/lib/utils';

interface UserListProps {
  institutionId?: number;
  facultyId?: number;
  departmentId?: number;
}

export const UserList: React.FC<UserListProps> = ({ institutionId, facultyId, departmentId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemsPerPage = 10;

  // Build query parameters
  const query = React.useMemo<UserQuery>(() => ({
    page: currentPage,
    limit: 10,
    search: searchTerm || undefined,
    institutionId: institutionId,
    facultyId: facultyId,
    departmentId: departmentId,
    role: selectedRole && selectedRole !== 'all' ? (selectedRole as UserRole) : undefined,
    status: selectedStatus && selectedStatus !== 'all' ? (selectedStatus as UserStatus) : undefined,
  }), [currentPage, searchTerm, selectedRole, selectedStatus, institutionId, facultyId, departmentId]);

  // Fetch users
  const fetchUsers = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers(query);
      if (response.success && response.data) {
        setUsers(response.data);
        setTotal(response.pagination.total);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Delete user handler
  const handleDelete = async (id: number) => {
    try {
      await userService.deleteUser(id);
      await fetchUsers(); // Refresh the list
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchUsers();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRole('all');
    setSelectedStatus('all');
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || (selectedRole && selectedRole !== 'all') || (selectedStatus && selectedStatus !== 'all');

  // Pagination
  const totalPages = Math.ceil(total / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, total);

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'destructive';
      case UserRole.ADMIN:
        return 'default';
      case UserRole.FACULTY_ADMIN:
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'default';
      case UserStatus.INACTIVE:
        return 'secondary';
      case UserStatus.SUSPENDED:
        return 'destructive';
      case UserStatus.PENDING_VERIFICATION:
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar with Add Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name, email, or institution..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 h-11"
                />
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="w-full sm:w-auto">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add New User
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                      </div>
                      Create New User
                    </DialogTitle>
                    <DialogDescription className="text-base">
                      Fill in the details below to create a new user account. Required fields are marked with an asterisk (*).
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
                    <UserCreate
                      onSuccess={handleCreateSuccess}
                      onCancel={() => setIsCreateDialogOpen(false)}
                      institutionId={institutionId}
                    />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "w-full sm:w-auto",
                  showFilters && "bg-blue-50 border-blue-200"
                )}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="default" className="ml-2 h-5 px-2">
                    {[searchTerm, selectedRole !== 'all', selectedStatus !== 'all'].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <>
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Role</Label>
                    <Select value={selectedRole} onValueChange={(value) => {
                      setSelectedRole(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              {role.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select value={selectedStatus} onValueChange={(value) => {
                      setSelectedStatus(value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {USER_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      disabled={!hasActiveFilters}
                      className="w-full h-11"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Users Directory</CardTitle>
              <CardDescription className="mt-1">
                {total > 0 ? (
                  <span>
                    Showing <span className="font-medium text-gray-900">{startIndex}</span> to{' '}
                    <span className="font-medium text-gray-900">{endIndex}</span> of{' '}
                    <span className="font-medium text-gray-900">{total}</span> users
                  </span>
                ) : (
                  'No users found'
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-900">Error Loading Users</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-700 hover:bg-red-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-sm text-gray-600">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-sm text-gray-600 text-center max-w-md mb-6">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search criteria to find what you\'re looking for.'
                  : 'Get started by adding your first user to the system.'}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleClearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                      <TableHead className="font-semibold">User</TableHead>
                      <TableHead className="font-semibold">Contact</TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Institution</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-white font-semibold text-sm">
                                {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {userService.getDisplayName(user)}
                              </p>
                              <p className="text-xs text-gray-500">ID: {user.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="font-medium">
                            {userService.getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(user.status)} className="font-medium">
                            {userService.getStatusLabel(user.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="truncate">{user.institution?.name || 'N/A'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                    Delete User
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-base">
                                    Are you sure you want to delete <strong>{userService.getDisplayName(user)}</strong>?
                                    <br />
                                    <br />
                                    This action cannot be undone and will permanently remove the user account and all associated data.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(user.id)}
                                    className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete User
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {users.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white font-semibold">
                            {user?.firstName?.charAt(0) || 'U'}{user?.lastName?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {userService.getDisplayName(user)}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {userService.getRoleLabel(user.role)}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {userService.getStatusLabel(user.status)}
                      </Badge>
                    </div>

                    {user.institution?.name && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{user.institution.name}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(user)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(user)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="max-w-[calc(100%-2rem)]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                              <AlertCircle className="w-5 h-5 text-red-600" />
                              Delete User
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete <strong>{userService.getDisplayName(user)}</strong>?
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                            <AlertDialogCancel className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 m-0"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>

        {/* Pagination */}
        {total > itemsPerPage && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
                <span className="font-medium text-gray-900">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Edit className="w-5 h-5 text-blue-600" />
              </div>
              Edit User
            </DialogTitle>
            <DialogDescription className="text-base">
              Update the user information below. Changes will be saved when you submit the form.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            {selectedUser && (
              <UserEdit
                user={selectedUser}
                onSuccess={handleEditSuccess}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              User Details
            </DialogTitle>
            <DialogDescription className="text-base">
              View detailed information about the selected user account.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-180px)] pr-4">
            {selectedUser && (
              <UserView
                user={selectedUser}
                onClose={() => setIsViewDialogOpen(false)}
                onEdit={() => {
                  setIsViewDialogOpen(false);
                  setIsEditDialogOpen(true);
                }}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

