export enum UserManagementEvents {
  // Institution Events
  INSTITUTION_CREATED = 'institution:created',
  INSTITUTION_UPDATED = 'institution:updated',
  INSTITUTION_DELETED = 'institution:deleted',

  // User Events
  USER_STATUS_UPDATED = 'user:status:updated',
  USERS_BULK_UPDATED = 'users:bulk:updated',
  USER_ACTIVITY_UPDATED = 'user:activity:updated',

  // System Events
  USER_MANAGEMENT_ERROR = 'user-management:error',
  USER_MANAGEMENT_NOTIFICATION = 'user-management:notification'
}

export interface SocketEventData {
  [UserManagementEvents.INSTITUTION_CREATED]: {
    institution: {
      id: string;
      name: string;
      type: string;
      category: string;
    };
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.INSTITUTION_UPDATED]: {
    institution: {
      id: string;
      name: string;
      type: string;
      category: string;
    };
    changes: Record<string, any>;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.INSTITUTION_DELETED]: {
    institutionId: string;
    institutionName: string;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.USER_STATUS_UPDATED]: {
    userId: string;
    email: string;
    oldStatus: string;
    newStatus: string;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.USERS_BULK_UPDATED]: {
    userIds: string[];
    action: 'ACTIVATE' | 'DEACTIVATE';
    count: number;
    timestamp: string;
    triggeredBy: string;
  };

  [UserManagementEvents.USER_ACTIVITY_UPDATED]: {
    userId: string;
    email: string;
    lastActivityAt: string;
    timestamp: string;
  };

  [UserManagementEvents.USER_MANAGEMENT_ERROR]: {
    message: string;
    code: string;
    timestamp: string;
  };

  [UserManagementEvents.USER_MANAGEMENT_NOTIFICATION]: {
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    timestamp: string;
  };
}

export const USER_MANAGEMENT_ROOMS = {
  SUPERADMIN_DASHBOARD: 'superadmin:dashboard',
  INSTITUTION_ROOM: (institutionId: string) => `institution:${institutionId}`,
  SYSTEM_NOTIFICATIONS: 'system:notifications'
} as const;
