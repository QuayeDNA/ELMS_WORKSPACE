export interface Venue {
  id: number;
  name: string;
  location: string;
  capacity: number;
  institutionId: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  institution?: {
    id: number;
    name: string;
  };

  rooms?: Room[];
  exams?: any[]; // Will be properly typed when exam types are available
}

export interface Room {
  id: number;
  name: string;
  capacity: number;
  venueId: number;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  venue?: {
    id: number;
    name: string;
    location: string;
  };

  exams?: any[]; // Will be properly typed when exam types are available
}

export interface CreateVenueData {
  name: string;
  location: string;
  capacity: number;
  institutionId: number;
}

export interface UpdateVenueData {
  name?: string;
  location?: string;
  capacity?: number;
}

export interface CreateRoomData {
  name: string;
  capacity: number;
  venueId: number;
}

export interface UpdateRoomData {
  name?: string;
  capacity?: number;
}

export interface VenueQuery {
  institutionId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface RoomQuery {
  venueId?: number;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
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
