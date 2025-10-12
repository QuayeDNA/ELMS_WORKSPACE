// ========================================
// SHARED QUERY TYPES
// ========================================

import { PaginationQuery } from './api';

/**
 * Base query interface that all resource queries should extend
 */
export interface BaseQuery extends PaginationQuery {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Query interface for resources that belong to an institution
 */
export interface InstitutionalQuery extends BaseQuery {
  institutionId?: number;
}

/**
 * Query interface for resources that belong to a faculty
 */
export interface FacultyQuery extends InstitutionalQuery {
  facultyId?: number;
}

/**
 * Query interface for resources that belong to a department
 */
export interface DepartmentalQuery extends FacultyQuery {
  departmentId?: number;
}

/**
 * Query interface for resources with status filtering
 */
export interface StatusQuery extends BaseQuery {
  status?: string;
}

/**
 * Query interface for resources with active/inactive filtering
 */
export interface ActiveQuery extends BaseQuery {
  isActive?: boolean;
}

/**
 * Query interface for date range filtering
 */
export interface DateRangeQuery extends BaseQuery {
  startDate?: Date;
  endDate?: Date;
  dateField?: string; // Which date field to filter on (e.g., 'createdAt', 'examDate')
}

/**
 * Common filter for user-related resources
 */
export interface UserQuery extends DepartmentalQuery, StatusQuery {
  role?: string;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'role' | 'createdAt' | 'lastLogin';
}

/**
 * Default query parameters
 */
export const DEFAULT_QUERY: Required<Pick<BaseQuery, 'page' | 'limit' | 'sortOrder'>> = {
  page: 1,
  limit: 10,
  sortOrder: 'desc'
} as const;

/**
 * Maximum allowed limit for pagination
 */
export const MAX_LIMIT = 100;

/**
 * Helper function to normalize and validate query parameters
 */
export function normalizeQuery<T extends BaseQuery>(query: T): T & typeof DEFAULT_QUERY {
  return {
    ...query,
    page: Math.max(1, query.page || DEFAULT_QUERY.page),
    limit: Math.min(MAX_LIMIT, Math.max(1, query.limit || DEFAULT_QUERY.limit)),
    sortOrder: query.sortOrder || DEFAULT_QUERY.sortOrder,
    search: query.search?.trim() || undefined
  };
}
