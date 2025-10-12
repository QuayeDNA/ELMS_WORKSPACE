// ========================================
// CENTRALIZED API RESPONSE TYPES
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Standard paginated response structure matching backend
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
  errors?: Record<string, string[]>;
}

// ========================================
// COMMON PAGINATION TYPES
// ========================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  total: number;
  hasNext: boolean;
  hasPrev: boolean;
}
