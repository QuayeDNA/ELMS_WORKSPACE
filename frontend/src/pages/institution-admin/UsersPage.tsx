import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Filter,
  X,
  Mail,
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { userService } from "@/services/user.service";
import { useAuthStore } from "@/stores/auth.store";
import { User, UserQuery, UserRole, UserStatus } from "@/types/user";
import { UserCreate } from "@/components/user/UserCreate";
import { UserEdit } from "@/components/user/UserEdit";
import { UserView } from "@/components/user/UserView";
import { cn } from "@/lib/utils";

export function UsersPage() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL_ROLES");
  const [statusFilter, setStatusFilter] = useState<string>("ALL_STATUS");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  const queryClient = useQueryClient();

  // Determine access scope based on user role
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isAdmin = user?.role === UserRole.ADMIN;
  const isFacultyAdmin = user?.role === UserRole.FACULTY_ADMIN;

  // Build query parameters based on role-based access control
  const query: UserQuery = {
    page: currentPage,
    limit: pageSize,
    search: searchTerm || undefined,
    role:
      roleFilter && roleFilter !== "ALL_ROLES"
        ? (roleFilter as UserRole)
        : undefined,
    status:
      statusFilter && statusFilter !== "ALL_STATUS"
        ? (statusFilter as UserStatus)
        : undefined,
    // Institution scoping: Super Admin sees all, Admin sees their institution, Faculty Admin sees their faculty
    institutionId: isSuperAdmin ? undefined : user?.institutionId,
    facultyId: isFacultyAdmin ? user?.facultyId : undefined,
  };

  // Fetch users
  const {
    data: userResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", query],
    queryFn: () => userService.getUsers(query),
    retry: 3,
  });

  // Delete user mutation (Super Admin only)
  const deleteMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const users = userResponse?.data || [];
  const total = userResponse?.pagination?.total || 0;
  const totalPages = userResponse?.pagination?.totalPages || 1;

  // Calculate stats for the current user scope
  const stats = {
    totalUsers: total,
    activeUsers: users.filter((u: User) => u.status === UserStatus.ACTIVE).length,
    pendingUsers: users.filter(
      (u: User) => u.status === UserStatus.PENDING_VERIFICATION
    ).length,
    adminUsers: users.filter((u: User) =>
      [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.FACULTY_ADMIN].includes(
        u.role
      )
    ).length,
  };

  // Role-based permissions
  const canCreateUsers = isSuperAdmin || isAdmin || isFacultyAdmin;
  const canEditUsers = isSuperAdmin || isAdmin || isFacultyAdmin;
  const canDeleteUsers = isSuperAdmin; // Only Super Admin can delete

  const handleCreateUser = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (!canDeleteUsers) return;
    try {
      await deleteMutation.mutateAsync(user.id);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL_ROLES");
    setStatusFilter("ALL_STATUS");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || roleFilter !== "ALL_ROLES" || statusFilter !== "ALL_STATUS";

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800";
      case UserRole.ADMIN:
        return "bg-red-100 text-red-800";
      case UserRole.FACULTY_ADMIN:
        return "bg-orange-100 text-orange-800";
      case UserRole.EXAMS_OFFICER:
        return "bg-yellow-100 text-yellow-800";
      case UserRole.LECTURER:
        return "bg-green-100 text-green-800";
      case UserRole.STUDENT:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return "bg-green-100 text-green-800";
      case UserStatus.INACTIVE:
        return "bg-gray-100 text-gray-800";
      case UserStatus.SUSPENDED:
        return "bg-red-100 text-red-800";
      case UserStatus.PENDING_VERIFICATION:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-600">
                {isSuperAdmin && "Manage all users across institutions"}
                {isAdmin && "Manage users in your institution"}
                {isFacultyAdmin && "Manage users in your faculty"}
              </p>
            </div>
          </div>
        </div>

        {canCreateUsers && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <Button
              onClick={handleCreateUser}
              size="lg"
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              All system users
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.activeUsers}</div>
            <p className="text-xs text-gray-500 mt-1">
              {total > 0 && `${Math.round((stats.activeUsers / total) * 100)}% of total`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <UserX className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pendingUsers}</div>
            <p className="text-xs text-gray-500 mt-1">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Admin Users</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.adminUsers}</div>
            <p className="text-xs text-gray-500 mt-1">System administrators</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters Card */}
      <Card className="border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Search Bar */}
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
                    {[searchTerm, roleFilter !== "ALL_ROLES", statusFilter !== "ALL_STATUS"].filter(Boolean).length}
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
                    <Select
                      value={roleFilter}
                      onValueChange={(value) => {
                        setRoleFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL_ROLES">All Roles</SelectItem>
                        {Object.values(UserRole).map((role) => (
                          <SelectItem key={role} value={role}>
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-gray-400" />
                              {role.replace(/_/g, " ")}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Status</Label>
                    <Select
                      value={statusFilter}
                      onValueChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="All Statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL_STATUS">All Statuses</SelectItem>
                        {Object.values(UserStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status.replace(/_/g, " ")}
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

      {/* Users Table */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Users Directory</CardTitle>
              <CardDescription className="mt-1">
                {total > 0 ? (
                  <span>
                    Showing <span className="font-medium text-gray-900">{(currentPage - 1) * pageSize + 1}</span> to{" "}
                    <span className="font-medium text-gray-900">{Math.min(currentPage * pageSize, total)}</span> of{" "}
                    <span className="font-medium text-gray-900">{total}</span> users
                  </span>
                ) : (
                  "No users found"
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
              <p className="text-sm text-gray-600">Loading users...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-red-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Users</h3>
              <p className="text-sm text-gray-600 text-center max-w-md">
                Unable to load users. Please try again later.
              </p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-sm text-gray-600 text-center max-w-md mb-6">
                {hasActiveFilters
                  ? "Try adjusting your filters or search criteria to find what you're looking for."
                  : "Get started by adding your first user to the system."}
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
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      {isSuperAdmin && <TableHead className="font-semibold">Institution</TableHead>}
                      {(isSuperAdmin || isAdmin) && <TableHead className="font-semibold">Faculty</TableHead>}
                      <TableHead className="font-semibold">Last Login</TableHead>
                      <TableHead className="text-right font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((currentUser: User) => (
                      <TableRow key={currentUser.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-white font-semibold text-sm">
                                {currentUser?.firstName?.charAt(0) || "U"}{currentUser?.lastName?.charAt(0) || "U"}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {userService.getDisplayName(currentUser)}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Mail className="w-3 h-3 shrink-0" />
                                <span className="truncate">{currentUser.email}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(currentUser.role)}>
                            {currentUser.role.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(currentUser.status)}>
                            {currentUser.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                              <span className="truncate">{currentUser.institutionId || "N/A"}</span>
                            </div>
                          </TableCell>
                        )}
                        {(isSuperAdmin || isAdmin) && (
                          <TableCell>
                            <div className="text-sm text-gray-600">{currentUser.facultyId || "N/A"}</div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {currentUser.lastLogin
                              ? new Date(currentUser.lastLogin).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric"
                                })
                              : "Never"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleViewUser(currentUser)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {canEditUsers && (
                                  <DropdownMenuItem onClick={() => handleEditUser(currentUser)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit User
                                  </DropdownMenuItem>
                                )}
                                {canDeleteUsers && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                          className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                          onSelect={(e) => e.preventDefault()}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete User
                                        </DropdownMenuItem>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600" />
                                            Delete User
                                          </AlertDialogTitle>
                                          <AlertDialogDescription className="text-base">
                                            Are you sure you want to delete{" "}
                                            <strong>{userService.getDisplayName(currentUser)}</strong>?
                                            <br />
                                            <br />
                                            This action cannot be undone and will permanently remove the user account
                                            and all associated data.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteUser(currentUser)}
                                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                          >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete User
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {users.map((currentUser: User) => (
                  <div key={currentUser.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white font-semibold">
                            {currentUser?.firstName?.charAt(0) || "U"}{currentUser?.lastName?.charAt(0) || "U"}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">
                            {userService.getDisplayName(currentUser)}
                          </p>
                          <p className="text-sm text-gray-600 truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleViewUser(currentUser)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {canEditUsers && (
                            <DropdownMenuItem onClick={() => handleEditUser(currentUser)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                          )}
                          {canDeleteUsers && (
                            <>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onSelect={(e) => e.preventDefault()}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-[calc(100%-2rem)]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="flex items-center gap-2">
                                      <AlertCircle className="w-5 h-5 text-red-600" />
                                      Delete User
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete{" "}
                                      <strong>{userService.getDisplayName(currentUser)}</strong>? This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                                    <AlertDialogCancel className="w-full sm:w-auto m-0">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteUser(currentUser)}
                                      className="w-full sm:w-auto bg-red-600 hover:bg-red-700 m-0"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge className={getRoleBadgeColor(currentUser.role)}>
                        {currentUser.role.replace(/_/g, " ")}
                      </Badge>
                      <Badge className={getStatusBadgeColor(currentUser.status)}>
                        {currentUser.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    <div className="text-xs text-gray-500">
                      Last login:{" "}
                      {currentUser.lastLogin
                        ? new Date(currentUser.lastLogin).toLocaleDateString()
                        : "Never"}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
                <span className="font-medium text-gray-900">{totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
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

      {/* Dialogs */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["users"] });
              }}
              onCancel={() => setIsCreateDialogOpen(false)}
              institutionId={user?.institutionId}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
                onSuccess={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                  queryClient.invalidateQueries({ queryKey: ["users"] });
                }}
                onCancel={() => {
                  setIsEditDialogOpen(false);
                  setSelectedUser(null);
                }}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

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
                onClose={() => {
                  setIsViewDialogOpen(false);
                  setSelectedUser(null);
                }}
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
}
