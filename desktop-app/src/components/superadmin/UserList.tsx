import React, { useState, useMemo } from 'react';
import { UserSummary, GetUsersRequest, InstitutionResponse } from '@/types/superadmin/users/user-management-types';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select';
import { Card, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/ui/table';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Mail,
  Loader2
} from 'lucide-react';

interface UserListProps {
  users: UserSummary[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onSearch: (searchTerm: string) => void;
  onFiltersChange: (filters: Partial<GetUsersRequest>) => void;
  onUpdateStatus: (userId: string, status: 'ACTIVE' | 'INACTIVE') => void;
  selectedInstitutionId?: string;
  institutions: InstitutionResponse[];
  onInstitutionSelect: (institutionId: string | undefined) => void;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  loading,
  pagination,
  onPageChange,
  onSearch,
  onFiltersChange,
  onUpdateStatus,
  selectedInstitutionId,
  institutions,
  onInstitutionSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Get unique departments from users
  const departments = useMemo(() => {
    const depts = new Set<string>();
    users.forEach(user => {
      if (user.profile?.department) {
        depts.add(user.profile.department);
      }
    });
    return Array.from(depts).sort();
  }, [users]);

  // Get unique roles from users
  const roles = useMemo(() => {
    const roleSet = new Set<string>();
    users.forEach(user => {
      if (user.role) {
        roleSet.add(user.role);
      }
    });
    return Array.from(roleSet).sort();
  }, [users]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  const handleFiltersChange = () => {
    const filters: Partial<GetUsersRequest> = {};

    if (roleFilter !== 'all') filters.role = roleFilter;
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (departmentFilter !== 'all') filters.department = departmentFilter;

    onFiltersChange(filters);
  };

  const handleStatusUpdate = async (userId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    try {
      await onUpdateStatus(userId, newStatus);
    } catch (err) {
      console.error('Failed to update user status:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      examiner: 'bg-blue-100 text-blue-800',
      student: 'bg-green-100 text-green-800',
      invigilator: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {pagination.total} total users
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, or ID..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Institution Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={selectedInstitutionId || 'all'}
                onValueChange={(value) => onInstitutionSelect(value === 'all' ? undefined : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Institutions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutions.map((institution) => (
                    <SelectItem key={institution.id} value={institution.id}>
                      {institution.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Role Filter */}
            <div className="w-full lg:w-32">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="w-full lg:w-32">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="w-full lg:w-40">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply Filters Button */}
            <Button onClick={handleFiltersChange} variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="pt-6">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No users found</h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' || departmentFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No users match the current criteria'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.profile?.avatar} />
                            <AvatarFallback>
                              {user.profile?.firstName?.[0] || user.email[0].toUpperCase()}
                              {user.profile?.lastName?.[0] || ''}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>
                      <TableCell>
                        {user.profile?.department || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {user.lastActivityAt ? formatDate(user.lastActivityAt) : 'Never'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusUpdate(
                            user.id,
                            user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                          )}
                          disabled={loading}
                        >
                          {user.status === 'ACTIVE' ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} users
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(
                  pagination.totalPages - 4,
                  pagination.page - 2
                )) + i;

                if (pageNum > pagination.totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || loading}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
