import React, { useState } from 'react';
import { UserSummary } from '@/types/superadmin/users/user-management-types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  UserCheck,
  UserX,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface BulkActionsProps {
  users?: UserSummary[];
  onBulkUpdate: (userIds: string[], action: 'ACTIVATE' | 'DEACTIVATE') => void;
  loading: boolean;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  users,
  onBulkUpdate,
  loading
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'ACTIVATE' | 'DEACTIVATE'>('ACTIVATE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSelectAll = (checked: boolean) => {
    if (checked && users) {
      setSelectedUsers(users.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleBulkAction = async () => {
    if (selectedUsers.length === 0) return;

    setIsProcessing(true);
    try {
      onBulkUpdate(selectedUsers, bulkAction);
      setSelectedUsers([]);
      setShowConfirmation(false);
    } catch (err) {
      console.error('Failed to perform bulk update:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const getSelectedUsersDetails = () => {
    return users ? users.filter(user => selectedUsers.includes(user.id)) : [];
  };

  const getActionDescription = () => {
    const count = selectedUsers.length;
    const action = bulkAction === 'ACTIVATE' ? 'activate' : 'deactivate';
    return `You are about to ${action} ${count} user${count > 1 ? 's' : ''}.`;
  };

  const getActionIcon = () => {
    return bulkAction === 'ACTIVATE' ? (
      <UserCheck className="h-5 w-5 text-green-600" />
    ) : (
      <UserX className="h-5 w-5 text-red-600" />
    );
  };

  if (!users || users.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No users available</h3>
            <p className="text-sm text-muted-foreground">
              Bulk actions will be available once users are loaded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Bulk Action Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Selection */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedUsers.length === (users?.length || 0) && (users?.length || 0) > 0}
                onCheckedChange={handleSelectAll}
                disabled={loading}
              />
              <label htmlFor="select-all" className="text-sm font-medium">
                Select All ({users?.length || 0} users)
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Action:</span>
              <Select
                value={bulkAction}
                onValueChange={(value: 'ACTIVATE' | 'DEACTIVATE') => setBulkAction(value)}
                disabled={selectedUsers.length === 0}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVATE">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      Activate Users
                    </div>
                  </SelectItem>
                  <SelectItem value="DEACTIVATE">
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-600" />
                      Deactivate Users
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => setShowConfirmation(true)}
              disabled={selectedUsers.length === 0 || loading}
              className="flex items-center gap-2"
            >
              {getActionIcon()}
              Apply to {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''}
            </Button>
          </div>

          {/* Selected Users Summary */}
          {selectedUsers.length > 0 && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Selected Users ({selectedUsers.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {getSelectedUsersDetails().slice(0, 6).map((user) => (
                  <div key={user.id} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>
                      {user.profile?.firstName} {user.profile?.lastName}
                    </span>
                    <span className="text-muted-foreground">({user.email})</span>
                  </div>
                ))}
                {selectedUsers.length > 6 && (
                  <div className="text-sm text-muted-foreground">
                    ...and {selectedUsers.length - 6} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual User Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Individual Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users && users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, checked as boolean)}
                    disabled={loading}
                  />
                  <div>
                    <div className="font-medium">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {user.email} • {user.role} • {user.status}
                    </div>
                    {user.profile?.department && (
                      <div className="text-xs text-muted-foreground">
                        Department: {user.profile.department}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-800 mb-2">Confirm Bulk Action</h3>
                <p className="text-sm text-yellow-700 mb-4">
                  {getActionDescription()}
                </p>
                <p className="text-sm text-yellow-700 mb-4">
                  This action will affect {selectedUsers.length} user account{selectedUsers.length > 1 ? 's' : ''}.
                  {bulkAction === 'DEACTIVATE' && ' Users will lose access to the system until reactivated.'}
                </p>

                <div className="flex gap-3">
                  <Button
                    onClick={handleBulkAction}
                    disabled={isProcessing}
                    className="flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      getActionIcon()
                    )}
                    {bulkAction === 'ACTIVATE' ? 'Activate' : 'Deactivate'} {selectedUsers.length} User{selectedUsers.length > 1 ? 's' : ''}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmation(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success/Error Messages */}
      {isProcessing && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Processing bulk action... Please wait.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
