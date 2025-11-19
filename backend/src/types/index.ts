// ========================================
// CENTRAL TYPE EXPORTS
// Import types from this file in services/controllers
// ========================================

// Core Auth & User Types
export * from './auth';
export * from './user';

// RoleProfile System (New)
export * from './roleProfile';

// Role-Specific Types
export * from './student';
export * from './instructor';

// DTO Transformers
export * from '../utils/dtoTransformers';

// Re-export Prisma types for convenience
export { UserRole, UserStatus, Prisma } from '@prisma/client';
