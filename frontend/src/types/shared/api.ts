// ========================================
// CENTRALIZED API RESPONSE TYPES
// ========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: ApiError;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T>
  extends ApiResponse<{
    data: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {}

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
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
