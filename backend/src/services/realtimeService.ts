import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import {
  RealtimeChannel,
  RealtimeEvent,
  SocketUser,
  RoomSubscription,
} from '../types/realtime';

/**
 * Real-time Service using Socket.IO
 * Handles WebSocket connections, room management, and event broadcasting
 */
class RealtimeService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<number, Set<string>> = new Map();

  /**
   * Initialize Socket.IO server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.io.on('connection', this.handleConnection.bind(this));

    console.log('✅ Real-time service initialized');
  }

  /**
   * Handle new socket connection
   */
  private handleConnection(socket: Socket): void {
    console.log(`🔌 New connection: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', (data: { userId: number; institutionId: number; role: string; token: string }) => {
      this.authenticateUser(socket, data);
    });

    // Handle room subscriptions
    socket.on('subscribe', (data: { rooms: string[] }) => {
      this.subscribeToRooms(socket, data.rooms);
    });

    socket.on('unsubscribe', (data: { rooms: string[] }) => {
      this.unsubscribeFromRooms(socket, data.rooms);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
  }

  /**
   * Authenticate user and store connection info
   */
  private authenticateUser(
    socket: Socket,
    data: { userId: number; institutionId: number; role: string; token: string }
  ): void {
    // TODO: Verify token here if needed
    const { userId, institutionId, role } = data;

    const user: SocketUser = {
      userId,
      institutionId,
      role,
      socketId: socket.id,
    };

    this.connectedUsers.set(socket.id, user);

    // Track multiple sockets per user
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    // Auto-subscribe to user's institution room
    socket.join(`institution:${institutionId}`);
    socket.join(`user:${userId}`);

    console.log(`✅ User authenticated: ${userId} (${role}) - Socket: ${socket.id}`);

    socket.emit('authenticated', {
      success: true,
      userId,
      institutionId,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Subscribe socket to rooms
   */
  private subscribeToRooms(socket: Socket, rooms: string[]): void {
    rooms.forEach((room) => {
      socket.join(room);
      console.log(`📍 Socket ${socket.id} subscribed to room: ${room}`);
    });

    socket.emit('subscribed', { rooms, timestamp: new Date().toISOString() });
  }

  /**
   * Unsubscribe socket from rooms
   */
  private unsubscribeFromRooms(socket: Socket, rooms: string[]): void {
    rooms.forEach((room) => {
      socket.leave(room);
      console.log(`📍 Socket ${socket.id} unsubscribed from room: ${room}`);
    });

    socket.emit('unsubscribed', { rooms, timestamp: new Date().toISOString() });
  }

  /**
   * Handle socket disconnection
   */
  private handleDisconnection(socket: Socket): void {
    const user = this.connectedUsers.get(socket.id);

    if (user) {
      const userSocketSet = this.userSockets.get(user.userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(user.userId);
        }
      }
      this.connectedUsers.delete(socket.id);
      console.log(`❌ User disconnected: ${user.userId} - Socket: ${socket.id}`);
    } else {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    }
  }

  /**
   * Emit event to specific room
   */
  emitToRoom<T = unknown>(room: string, event: RealtimeEvent<T>): void {
    if (!this.io) {
      console.error('❌ Socket.IO not initialized');
      return;
    }

    this.io.to(room).emit(event.channel, event);
    console.log(`📤 Emitted to room ${room}:`, event.channel, event.event);
  }

  /**
   * Emit event to specific user (all their sockets)
   */
  emitToUser<T = unknown>(userId: number, event: RealtimeEvent<T>): void {
    const room = `user:${userId}`;
    this.emitToRoom(room, event);
  }

  /**
   * Emit event to institution
   */
  emitToInstitution<T = unknown>(institutionId: number, event: RealtimeEvent<T>): void {
    const room = `institution:${institutionId}`;
    this.emitToRoom(room, event);
  }

  /**
   * Emit event to multiple rooms
   */
  emitToRooms<T = unknown>(rooms: string[], event: RealtimeEvent<T>): void {
    rooms.forEach((room) => this.emitToRoom(room, event));
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast<T = unknown>(event: RealtimeEvent<T>): void {
    if (!this.io) {
      console.error('❌ Socket.IO not initialized');
      return;
    }

    this.io.emit(event.channel, event);
    console.log(`📡 Broadcasted:`, event.channel, event.event);
  }

  /**
   * Get connected user info
   */
  getConnectedUser(socketId: string): SocketUser | undefined {
    return this.connectedUsers.get(socketId);
  }

  /**
   * Get all sockets for a user
   */
  getUserSockets(userId: number): string[] {
    return Array.from(this.userSockets.get(userId) || []);
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: number): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Get connected users count
   */
  getConnectedUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get Socket.IO instance (for advanced use)
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();
