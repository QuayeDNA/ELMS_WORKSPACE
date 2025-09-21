import { PrismaClient } from "@prisma/client";
import {
  Venue,
  Room,
  CreateVenueData,
  UpdateVenueData,
  CreateRoomData,
  UpdateRoomData,
  VenueQuery,
  RoomQuery,
  VenueWithRooms,
  RoomWithDetails,
} from "../types/venue";

const prisma = new PrismaClient();

export const venueService = {
  // Get all venues with pagination and filtering
  async getVenues(query: VenueQuery) {
    const {
      institutionId,
      page = 1,
      limit = 10,
      search = "",
      sortBy = "name",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (institutionId) {
      where.institutionId = institutionId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.venue.count({ where });

    // Get venues with relations
    const venues = await prisma.venue.findMany({
      where,
      include: {
        institution: true,
        rooms: {
          select: {
            id: true,
            name: true,
            capacity: true,
          },
        },
        _count: {
          select: {
            rooms: true,
            exams: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Transform data to include computed fields
    const transformedVenues = venues.map((venue) => ({
      ...venue,
      roomCount: venue._count.rooms,
      examCount: venue._count.exams,
    }));

    return {
      venues: transformedVenues,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single venue by ID
  async getVenueById(id: number): Promise<VenueWithRooms | null> {
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        institution: true,
        rooms: {
          include: {
            _count: {
              select: {
                exams: true,
              },
            },
          },
        },
        _count: {
          select: {
            rooms: true,
            exams: true,
          },
        },
      },
    });

    if (!venue) {
      return null;
    }

    // Transform rooms to include exam count
    const roomsWithDetails = venue.rooms.map((room) => ({
      ...room,
      examCount: room._count.exams,
    }));

    return {
      ...venue,
      rooms: roomsWithDetails,
      roomCount: venue._count.rooms,
      examCount: venue._count.exams,
    };
  },

  // Create new venue
  async createVenue(data: CreateVenueData): Promise<Venue> {
    // Validate that institution exists
    const institution = await prisma.institution.findUnique({
      where: { id: data.institutionId },
    });

    if (!institution) {
      throw new Error("Institution not found");
    }

    // Validate capacity
    if (data.capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }

    const venue = await prisma.venue.create({
      data,
      include: {
        institution: true,
      },
    });

    return venue;
  },

  // Update venue
  async updateVenue(id: number, data: UpdateVenueData): Promise<Venue> {
    // Get existing venue
    const existingVenue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!existingVenue) {
      throw new Error("Venue not found");
    }

    // Validate capacity if provided
    if (data.capacity !== undefined && data.capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }

    const venue = await prisma.venue.update({
      where: { id },
      data,
      include: {
        institution: true,
      },
    });

    return venue;
  },

  // Delete venue
  async deleteVenue(id: number): Promise<void> {
    // Check if venue has rooms or exams
    const venue = await prisma.venue.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            rooms: true,
            exams: true,
          },
        },
      },
    });

    if (!venue) {
      throw new Error("Venue not found");
    }

    if (venue._count.rooms > 0 || venue._count.exams > 0) {
      throw new Error("Cannot delete venue with existing rooms or exams");
    }

    await prisma.venue.delete({
      where: { id },
    });
  },

  // Get venues by institution
  async getVenuesByInstitution(
    institutionId: number,
    query: Omit<VenueQuery, "institutionId"> = {}
  ) {
    return this.getVenues({ ...query, institutionId });
  },

  // Get all rooms with pagination and filtering
  async getRooms(query: RoomQuery) {
    const {
      venueId,
      page = 1,
      limit = 10,
      search = "",
      sortBy = "name",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (venueId) {
      where.venueId = venueId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { venue: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Get total count
    const total = await prisma.room.count({ where });

    // Get rooms with relations
    const rooms = await prisma.room.findMany({
      where,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        _count: {
          select: {
            exams: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    // Transform data to include computed fields
    const transformedRooms = rooms.map((room) => ({
      ...room,
      examCount: room._count.exams,
    }));

    return {
      rooms: transformedRooms,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  // Get single room by ID
  async getRoomById(id: number): Promise<RoomWithDetails | null> {
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        _count: {
          select: {
            exams: true,
          },
        },
      },
    });

    if (!room) {
      return null;
    }

    return {
      ...room,
      examCount: room._count.exams,
    };
  },

  // Create new room
  async createRoom(data: CreateRoomData): Promise<Room> {
    // Validate that venue exists
    const venue = await prisma.venue.findUnique({
      where: { id: data.venueId },
    });

    if (!venue) {
      throw new Error("Venue not found");
    }

    // Validate capacity
    if (data.capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }

    // Check if room name already exists in this venue
    const existingRoom = await prisma.room.findUnique({
      where: {
        venueId_name: {
          venueId: data.venueId,
          name: data.name,
        },
      },
    });

    if (existingRoom) {
      throw new Error("Room name already exists in this venue");
    }

    const room = await prisma.room.create({
      data,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return room;
  },

  // Update room
  async updateRoom(id: number, data: UpdateRoomData): Promise<Room> {
    // Get existing room
    const existingRoom = await prisma.room.findUnique({
      where: { id },
      include: { venue: true },
    });

    if (!existingRoom) {
      throw new Error("Room not found");
    }

    // Validate capacity if provided
    if (data.capacity !== undefined && data.capacity <= 0) {
      throw new Error("Capacity must be greater than 0");
    }

    // Check name uniqueness if name is being changed
    if (data.name && data.name !== existingRoom.name) {
      const duplicateRoom = await prisma.room.findUnique({
        where: {
          venueId_name: {
            venueId: existingRoom.venueId,
            name: data.name,
          },
        },
      });

      if (duplicateRoom) {
        throw new Error("Room name already exists in this venue");
      }
    }

    const room = await prisma.room.update({
      where: { id },
      data,
      include: {
        venue: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return room;
  },

  // Delete room
  async deleteRoom(id: number): Promise<void> {
    // Check if room has exams
    const room = await prisma.room.findUnique({
      where: { id },
      select: {
        _count: {
          select: {
            exams: true,
          },
        },
      },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    if (room._count.exams > 0) {
      throw new Error("Cannot delete room with existing exams");
    }

    await prisma.room.delete({
      where: { id },
    });
  },

  // Get rooms by venue
  async getRoomsByVenue(
    venueId: number,
    query: Omit<RoomQuery, "venueId"> = {}
  ) {
    return this.getRooms({ ...query, venueId });
  },
};
