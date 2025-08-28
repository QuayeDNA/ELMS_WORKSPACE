// SuperAdmin Module Exports
// This module provides a comprehensive superadmin API utility with services, hooks, types, and state management

// Export types
export * from './types';

// Export API client
export { superAdminApi, SuperAdminApiClient } from './api';

// Export React hooks
export * from './hooks';

// Export Zustand store
export { useSuperAdminStore } from './store';

// Export individual components for specific use cases
export type {
  Institution,
  User,
  AuditLog,
  AnalyticsData,
  SystemOverview,
  SystemHealth,
  ConfigurationItem,
  SuperAdminState
} from './types';

export {
  ApiError
} from './api';
