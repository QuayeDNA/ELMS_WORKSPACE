// SuperAdmin Module - Main Entry Point
// This module provides a comprehensive superadmin API utility with services, hooks, types, and state management

// Export services
export * from './services/superadmin';

// Export hooks
export * from './hooks/superadmin';

// Export store
export { useSuperAdminStore } from './stores/superadminStore';

// Export types
export * from './types/superadmin';

// Convenience re-exports for common usage
export { superAdminApi, SuperAdminApiClient } from './services/superadmin';
export { useSuperAdminStore as useSuperAdmin } from './stores/superadminStore';
