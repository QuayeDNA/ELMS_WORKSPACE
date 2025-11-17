import React, { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { RealtimeChannel, RealtimeEvent, RealtimeContextValue, RealtimeSubscription } from '../types/realtime';
import { ExamLogisticsEvent, ExamLogisticsWebSocketData } from '../types/examLogistics';
import { useAuthStore } from '../stores/auth.store';
import { toast } from 'sonner';

export const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

interface RealtimeProviderProps {
  children: React.ReactNode;
}

export const RealtimeProvider: React.FC<RealtimeProviderProps> = ({ children }) => {
  const { user } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const subscriptionsRef = useRef<Map<string, Set<(event: RealtimeEvent) => void>>>(new Map());
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Handle incoming events
  const handleEvent = useCallback((event: RealtimeEvent) => {
    console.log('📨 Received event:', event.channel, event.event, event.payload);

    // Get handlers for this channel + event combination
    const channelEventKey = `${event.channel}:${event.event}`;
    const channelKey = event.channel;

    // Call specific event handlers
    const eventHandlers = subscriptionsRef.current.get(channelEventKey);
    if (eventHandlers) {
      eventHandlers.forEach((handler) => handler(event));
    }

    // Call general channel handlers (subscribed to all events in channel)
    const channelHandlers = subscriptionsRef.current.get(channelKey);
    if (channelHandlers) {
      channelHandlers.forEach((handler) => handler(event));
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user) {
      // User not authenticated, disconnect if connected
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('token'), // or however you store your JWT
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: maxReconnectAttempts,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ WebSocket connected:', socketInstance.id);
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;

      // Authenticate with user data
      socketInstance.emit('authenticate', {
        userId: user.id,
        institutionId: user.institutionId,
        role: user.role,
        token: localStorage.getItem('token'),
      });
    });

    socketInstance.on('authenticated', (data) => {
      console.log('✅ Authenticated with server:', data);
      toast.success('Real-time updates connected');
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      setIsConnected(false);

      if (reason === 'io server disconnect') {
        // Server disconnected, manually reconnect
        socketInstance.connect();
      }
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      reconnectAttemptsRef.current++;

      if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
        toast.error('Failed to connect to real-time updates');
      }
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log('🔄 Reconnected after', attemptNumber, 'attempts');
      toast.success('Real-time updates reconnected');
    });

    socketInstance.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after max attempts');
      toast.error('Unable to connect to real-time updates');
    });

    // Listen to all channels
    Object.values(RealtimeChannel).forEach((channel) => {
      socketInstance.on(channel, (event: RealtimeEvent) => {
        handleEvent(event);
      });
    });

    // Listen to exam logistics events specifically
    Object.values(ExamLogisticsEvent).forEach((event) => {
      socketInstance.on(event, (data: ExamLogisticsWebSocketData) => {
        // Convert to RealtimeEvent format for consistency
        const realtimeEvent: RealtimeEvent = {
          channel: RealtimeChannel.EXAM_LOGISTICS,
          event: event,
          payload: data,
          timestamp: new Date().toISOString()
        };
        handleEvent(realtimeEvent);
      });
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, handleEvent]);

  // Subscribe to events
  const subscribe = useCallback(
    (subscription: RealtimeSubscription): (() => void) => {
      const key = subscription.event
        ? `${subscription.channel}:${subscription.event}`
        : subscription.channel;

      if (!subscriptionsRef.current.has(key)) {
        subscriptionsRef.current.set(key, new Set());
      }

      subscriptionsRef.current.get(key)!.add(subscription.handler);

      console.log('🎧 Subscribed to:', key);

      // Return unsubscribe function
      return () => {
        const handlers = subscriptionsRef.current.get(key);
        if (handlers) {
          handlers.delete(subscription.handler);
          if (handlers.size === 0) {
            subscriptionsRef.current.delete(key);
          }
        }
        console.log('🔇 Unsubscribed from:', key);
      };
    },
    []
  );

  // Unsubscribe from events
  const unsubscribe = useCallback((subscription: RealtimeSubscription) => {
    const key = subscription.event
      ? `${subscription.channel}:${subscription.event}`
      : subscription.channel;

    const handlers = subscriptionsRef.current.get(key);
    if (handlers) {
      handlers.delete(subscription.handler);
      if (handlers.size === 0) {
        subscriptionsRef.current.delete(key);
      }
    }

    console.log('🔇 Unsubscribed from:', key);
  }, []);

  // Join a room
  const joinRoom = useCallback(
    (room: string) => {
      if (socket && isConnected) {
        socket.emit('subscribe', { rooms: [room] });
        console.log('📍 Joined room:', room);
      }
    },
    [socket, isConnected]
  );

  // Leave a room
  const leaveRoom = useCallback(
    (room: string) => {
      if (socket && isConnected) {
        socket.emit('unsubscribe', { rooms: [room] });
        console.log('📍 Left room:', room);
      }
    },
    [socket, isConnected]
  );

  const value: RealtimeContextValue = {
    isConnected,
    subscribe,
    unsubscribe,
    joinRoom,
    leaveRoom,
  };

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};
