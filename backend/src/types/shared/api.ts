// ========================================
// SHARED API RESPONSE TYPES
// ========================================

/**
 * Standard API Response wrapper for all endpoints
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  errors?: Record<string, string[]>;
}

/**
 * Standard Error structure
 */
export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
  errors?: Record<string, string[]>;
}

// ========================================
// PAGINATION TYPES
// ========================================

/**
 * Standard pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Standard pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Standard paginated list response structure
 */
export interface PaginatedListResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Standard paginated response wrapper
 */
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  error?: ApiError;
  errors?: Record<string, string[]>;
}

// ========================================
// CONVENIENCE TYPES FOR COMMON PATTERNS
// ========================================

/**
 * Generic list response for simple collections without pagination
 */
export interface ListResponse<T> {
  data: T[];
  total: number;
}

/**
 * Standard success response for operations that don't return data
 */
export interface SuccessResponse {
  success: true;
  message: string;
}

/**
 * Standard error response
 */
export interface ErrorResponse {
  success: false;
  message: string;
  error?: ApiError;
  errors?: Record<string, string[]>;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Helper to create a standard paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  message: string = 'Data retrieved successfully'
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
}

/**
 * Helper to create a standard success response
 */
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Operation completed successfully'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data
  };
}

/**
 * Helper to create a standard error response
 */
export function createErrorResponse(
  message: string,
  error?: ApiError,
  errors?: Record<string, string[]>
): ErrorResponse {
  return {
    success: false,
    message,
    error,
    errors
  };
}

/**
 * Helper to calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}
