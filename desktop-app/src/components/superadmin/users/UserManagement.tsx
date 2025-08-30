import React, { useState } from 'react';
import { useInstitutions, useUsers, useUserStats } from '@/hooks/superadmin/users/user-management-hooks';
import { InstitutionForm } from './InstitutionForm';
import { UserList } from './UserList';
import { UserStatsDashboard } from './UserStatsDashboard';
import { BulkActions } from './BulkActions';
import {
  Users,
  Building2,
  BarChart3,
  Plus,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';
import { Badge } from '@/ui/badge';
import { InstitutionResponse } from '@/types/superadmin/users/user-management-types';

/**
 * Main User Management Component
 * Orchestrates institutions, users, and statistics with real-time updates
 */
export const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedInstitutionId, setSelectedInstitutionId] = useState<string | undefined>();
  const [showInstitutionForm, setShowInstitutionForm] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<InstitutionResponse | null>(null);

  // Use our custom hooks
  const institutions = useInstitutions();
  const users = useUsers(selectedInstitutionId);
  const stats = useUserStats();

  const handleCreateInstitution = () => {
    setEditingInstitution(null);
    setShowInstitutionForm(true);
  };

  const handleEditInstitution = (institution: InstitutionResponse) => {
    setEditingInstitution(institution);
    setShowInstitutionForm(true);
  };

  const handleInstitutionFormClose = () => {
    setShowInstitutionForm(false);
    setEditingInstitution(null);
  };

  const handleInstitutionSelect = (institutionId: string | undefined) => {
    setSelectedInstitutionId(institutionId);
  };

  if (institutions.loading && institutions.institutions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage institutions, users, and system statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleCreateInstitution}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Institution
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {(institutions.error || users.error || stats.error) && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <h3 className="font-medium text-destructive">Error</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {institutions.error || users.error || stats.error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Institutions</p>
                <p className="text-2xl font-bold">{institutions.institutions.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{users.pagination.total}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.stats?.activeUsers || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Users</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.stats?.pendingUsers || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="institutions" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Institutions
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="bulk-actions" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Bulk Actions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <UserStatsDashboard stats={stats.stats} loading={stats.loading} />
        </TabsContent>

        <TabsContent value="institutions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Institutions</h2>
            <Button onClick={handleCreateInstitution} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Institution
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.institutions.map((institution) => (
              <Card key={institution.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{institution.name}</CardTitle>
                    <Badge variant="secondary">{institution.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <strong>Type:</strong> {institution.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Created:</strong> {new Date(institution.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInstitutionSelect(institution.id)}
                    >
                      View Users
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditInstitution(institution)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserList
            users={users.users}
            loading={users.loading}
            pagination={users.pagination}
            onPageChange={users.changePage}
            onSearch={users.searchUsers}
            onFiltersChange={users.changeFilters}
            onUpdateStatus={users.updateUserStatus}
            selectedInstitutionId={selectedInstitutionId}
            institutions={institutions.institutions}
            onInstitutionSelect={handleInstitutionSelect}
          />
        </TabsContent>

        <TabsContent value="bulk-actions" className="space-y-4">
          <BulkActions
            users={users.users}
            onBulkUpdate={users.bulkUpdateUsers}
            loading={users.loading}
          />
        </TabsContent>
      </Tabs>

      {/* Institution Form Modal */}
      {showInstitutionForm && (
        <InstitutionForm
          institution={editingInstitution}
          onClose={handleInstitutionFormClose}
          onSuccess={() => {
            institutions.fetchInstitutions();
            handleInstitutionFormClose();
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;
