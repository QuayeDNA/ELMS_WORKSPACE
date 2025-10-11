import { ApiResponse, PaginationQuery, PaginationMeta } from '@/types/shared/api';
import { apiService } from './api';

/**
 * Base Service Class
 * Provides common functionality for all services
 */
export abstract class BaseService {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Build query parameters from an object
   */
  protected buildQueryParams(params: Record<string, unknown>): URLSearchParams {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, String(value));
      }
    });

    return searchParams;
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(path: string, params?: Record<string, unknown>): string {
    if (!params || Object.keys(params).length === 0) {
      return path;
    }

    const queryString = this.buildQueryParams(params).toString();
    return `${path}?${queryString}`;
  }

  /**
   * Get endpoint URL with optional path
   */
  protected getUrl(path = ''): string {
    return path ? `${this.endpoint}${path}` : this.endpoint;
  }

  /**
   * Get URL for specific resource by ID
   */
  protected getByIdUrl(id: number | string): string {
    return `${this.endpoint}/${id}`;
  }

  /**
   * Handle paginated requests
   */
  protected async getPaginated<T>(
    query?: PaginationQuery & Record<string, unknown>
  ): Promise<ApiResponse<{ data: T[]; pagination: PaginationMeta }>> {
    try {
      const url = this.buildUrl(this.endpoint, query);
      return await apiService.get(url);
    } catch (error) {
      console.error(`Error fetching paginated data from ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle single resource fetch
   */
  protected async getById<T>(id: number | string): Promise<ApiResponse<T>> {
    try {
      return await apiService.get<T>(this.getByIdUrl(id));
    } catch (error) {
      console.error(`Error fetching resource ${id} from ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle resource creation
   */
  protected async create<T, D = unknown>(data: D): Promise<ApiResponse<T>> {
    try {
      return await apiService.post<T>(this.endpoint, data);
    } catch (error) {
      console.error(`Error creating resource at ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle resource update
   */
  protected async update<T, D = unknown>(
    id: number | string,
    data: D
  ): Promise<ApiResponse<T>> {
    try {
      return await apiService.put<T>(this.getByIdUrl(id), data);
    } catch (error) {
      console.error(`Error updating resource ${id} at ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle resource deletion
   */
  protected async delete(id: number | string): Promise<ApiResponse<void>> {
    try {
      return await apiService.delete<void>(this.getByIdUrl(id));
    } catch (error) {
      console.error(`Error deleting resource ${id} from ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle export operations
   */
  protected async export(
    filters: Record<string, unknown> = {},
    format: 'csv' | 'excel' = 'csv'
  ): Promise<Blob> {
    try {
      const params = { ...filters, format };
      const url = this.buildUrl(`${this.endpoint}/export`, params);

      const response = await apiService.get<Blob>(url, {
        responseType: 'blob'
      });

      return response.data as Blob;
    } catch (error) {
      console.error(`Error exporting data from ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle bulk operations
   */
  protected async bulkOperation<T, D = unknown>(
    operation: string,
    data: D
  ): Promise<ApiResponse<T>> {
    try {
      return await apiService.post<T>(`${this.endpoint}/${operation}`, data);
    } catch (error) {
      console.error(`Error performing bulk ${operation} at ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Handle statistics/analytics requests
   */
  protected async getStats<T>(
    path = '/stats',
    params?: Record<string, unknown>
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildUrl(`${this.endpoint}${path}`, params);
      return await apiService.get<T>(url);
    } catch (error) {
      console.error(`Error fetching stats from ${this.endpoint}${path}:`, error);
      throw error;
    }
  }

  /**
   * Handle search operations
   */
  protected async search<T>(
    searchTerm: string,
    additionalParams?: Record<string, unknown>
  ): Promise<ApiResponse<T[]>> {
    try {
      const params = { search: searchTerm, limit: 10, ...additionalParams };
      const url = this.buildUrl(this.endpoint, params);
      return await apiService.get<T[]>(url);
    } catch (error) {
      console.error(`Error searching ${this.endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Validate required fields
   */
  protected validateRequired(data: Record<string, unknown>, fields: string[]): void {
    const missing = fields.filter(field => !data[field]);
    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Transform response data if needed
   */
  protected transformResponse<T, R = T>(
    response: ApiResponse<T>,
    transformer?: (data: T) => R
  ): ApiResponse<R> {
    if (!transformer || !response.data) {
      return response as ApiResponse<R>;
    }

    return {
      ...response,
      data: transformer(response.data)
    };
  }
}
