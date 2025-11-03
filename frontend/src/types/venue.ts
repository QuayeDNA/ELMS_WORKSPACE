export interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  institutionId: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  institution?: {
    id: number;
    name: string;
  };

  rooms?: Room[];
  exams?: any[];
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  venueId: number;
  createdAt: string;
  updatedAt: string;

  // Relations
  venue?: {
    id: number;
    name: string;
    location: string;
  };

  exams?: any[];
}

export interface CreateVenueRequest {
  name: string;
  location: string;
  capacity: number;
  institutionId: number;
}

export interface UpdateVenueRequest {
  name?: string;
  location?: string;
  capacity?: number;
}

export interface CreateRoomRequest {
  name: string;
  capacity: number;
  venueId: number;
}

export interface UpdateRoomRequest {
  name?: string;
  capacity?: number;
}

export interface VenueQuery {
  institutionId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoomQuery {
  venueId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VenueWithRooms extends Venue {
  rooms: Room[];
  roomCount: number;
  examCount: number;
}

export interface RoomWithDetails extends Room {
  venue: {
    id: number;
    name: string;
    location: string;
  };
  examCount: number;
}
