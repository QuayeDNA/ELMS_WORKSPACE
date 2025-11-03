import { BaseService } from './base.service';
import { apiService } from './api';
import { ApiResponse, PaginatedResponse } from '@/types/shared/api';
import { API_ENDPOINTS } from '@/utils/constants';
import {
  Venue,
  Room,
  CreateVenueRequest,
  UpdateVenueRequest,
  CreateRoomRequest,
  UpdateRoomRequest,
  VenueQuery,
  RoomQuery,
  VenueWithRooms,
  RoomWithDetails,
} from '@/types/venue';

/**
 * Venue Service
 * Handles all venue and room-related API operations
 */
class VenueService extends BaseService {
  constructor() {
    super(API_ENDPOINTS.VENUES.BASE);
  }

  // ========================================
  // VENUE OPERATIONS
  // ========================================

  /**
   * Get all venues with pagination and filtering
   */
  async getVenues(query?: VenueQuery): Promise<PaginatedResponse<Venue>> {
    const queryWithRecord = query ? { ...query } as Record<string, unknown> : undefined;
    const response = await this.getPaginated<Venue>(queryWithRecord);
    return response;
  }

  /**
   * Get single venue by ID
   */
  async getVenueById(id: number): Promise<ApiResponse<VenueWithRooms>> {
    return this.getById<VenueWithRooms>(id);
  }

  /**
   * Create new venue
   */
  async createVenue(data: CreateVenueRequest): Promise<ApiResponse<Venue>> {
    this.validateRequired(data as unknown as Record<string, unknown>, [
      'name',
      'location',
      'capacity',
      'institutionId',
    ]);
    return this.create<Venue, CreateVenueRequest>(data);
  }

  /**
   * Update venue
   */
  async updateVenue(
    id: number,
    data: UpdateVenueRequest
  ): Promise<ApiResponse<Venue>> {
    return this.update<Venue, UpdateVenueRequest>(id, data);
  }

  /**
   * Delete venue
   */
  async deleteVenue(id: number): Promise<ApiResponse<void>> {
    return this.delete(id);
  }

  /**
   * Get venues by institution
   */
  async getVenuesByInstitution(
    institutionId: number,
    query?: Omit<VenueQuery, 'institutionId'>
  ): Promise<PaginatedResponse<Venue>> {
    const response = await apiService.get<PaginatedResponse<Venue>>(
      API_ENDPOINTS.VENUES.BY_INSTITUTION(institutionId),
      query as Record<string, unknown>
    );
    return response.data || {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }

  // ========================================
  // ROOM OPERATIONS
  // ========================================

  /**
   * Get all rooms with pagination and filtering
   */
  async getRooms(query?: RoomQuery): Promise<PaginatedResponse<Room>> {
    const response = await apiService.get<PaginatedResponse<Room>>(
      API_ENDPOINTS.VENUES.ROOMS_ALL,
      query as Record<string, unknown>
    );
    return response.data || {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }

  /**
   * Get single room by ID
   */
  async getRoomById(id: number): Promise<ApiResponse<RoomWithDetails>> {
    const response = await apiService.get<RoomWithDetails>(
      API_ENDPOINTS.VENUES.ROOM_BY_ID(id)
    );
    return response;
  }

  /**
   * Create new room
   */
  async createRoom(
    venueId: number,
    data: Omit<CreateRoomRequest, 'venueId'>
  ): Promise<ApiResponse<Room>> {
    this.validateRequired(data as unknown as Record<string, unknown>, ['name', 'capacity']);
    const requestData = { ...data, venueId };
    const response = await apiService.post<Room>(
      API_ENDPOINTS.VENUES.ROOMS(venueId),
      requestData
    );
    return response;
  }

  /**
   * Update room
   */
  async updateRoom(
    id: number,
    data: UpdateRoomRequest
  ): Promise<ApiResponse<Room>> {
    const response = await apiService.put<Room>(
      API_ENDPOINTS.VENUES.ROOM_BY_ID(id),
      data
    );
    return response;
  }

  /**
   * Delete room
   */
  async deleteRoom(id: number): Promise<ApiResponse<void>> {
    const response = await apiService.delete<void>(
      API_ENDPOINTS.VENUES.ROOM_BY_ID(id)
    );
    return response;
  }

  /**
   * Get rooms by venue
   */
  async getRoomsByVenue(
    venueId: number,
    query?: Omit<RoomQuery, 'venueId'>
  ): Promise<PaginatedResponse<Room>> {
    const response = await apiService.get<PaginatedResponse<Room>>(
      API_ENDPOINTS.VENUES.ROOMS(venueId),
      query as Record<string, unknown>
    );
    return response.data || {
      success: true,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
    };
  }
}

export const venueService = new VenueService();
