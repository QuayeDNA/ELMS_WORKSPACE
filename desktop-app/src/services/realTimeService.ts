// Real-time WebSocket service for ELMS
// This simulates real-time functionality until backend Socket.IO is implemented

import React from 'react';

export interface SocketEvent {
  type: string;
  data: any;
  timestamp: Date;
}

export interface NotificationEvent {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  category: 'script' | 'exam' | 'incident' | 'system' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface MetricsUpdate {
  scriptsProcessed: number;
  activeUsers: number;
  ongoingExams: number;
  activeIncidents: number;
  systemUptime: number;
  serverLoad: number;
  databaseConnections: number;
  networkStatus: 'healthy' | 'warning' | 'critical';
  lastUpdated: Date;
}

class RealTimeService {
  private eventListeners: Map<string, ((event: SocketEvent) => void)[]> = new Map();
  private isConnected: boolean = false;
  private connectionInterval: NodeJS.Timeout | null = null;
  private simulationInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.connect();
  }

  // Simulate WebSocket connection
  connect(): void {
    this.isConnected = true;
    console.log('✅ ELMS Real-time Service Connected');

    // Emit connection event
    this.emit('connection', { status: 'connected', timestamp: new Date() });

    // Start simulating real-time events
    this.startEventSimulation();

    // Simulate occasional disconnections for testing
    this.connectionInterval = setInterval(() => {
      if (Math.random() > 0.95) { // 5% chance of disconnection
        this.disconnect();
        setTimeout(() => this.connect(), 2000);
      }
    }, 30000);
  }

  disconnect(): void {
    this.isConnected = false;
    console.log('❌ ELMS Real-time Service Disconnected');
    
    if (this.connectionInterval) {
      clearInterval(this.connectionInterval);
      this.connectionInterval = null;
    }

    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }

    this.emit('disconnection', { status: 'disconnected', timestamp: new Date() });
  }

  // Event subscription
  on(eventType: string, callback: (event: SocketEvent) => void): () => void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(eventType);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  // Emit events to listeners
  private emit(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const event: SocketEvent = {
        type: eventType,
        data,
        timestamp: new Date()
      };
      
      listeners.forEach(callback => callback(event));
    }
  }

  // Start simulating real-time events
  private startEventSimulation(): void {
    this.simulationInterval = setInterval(() => {
      if (!this.isConnected) return;

      // Simulate different types of events
      const eventTypes = [
        'script:scanned',
        'script:moved',
        'exam:started',
        'exam:ended',
        'incident:created',
        'incident:resolved',
        'user:login',
        'user:logout',
        'system:metrics_update',
        'notification:new'
      ];

      const randomEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      
      switch (randomEvent) {
        case 'script:scanned':
          this.emit('script:scanned', {
            scriptId: `SCR-${Date.now()}`,
            batchId: `BATCH-${Math.floor(Math.random() * 100)}`,
            location: 'Verification Station',
            operator: 'John Doe'
          });
          break;

        case 'script:moved':
          this.emit('script:moved', {
            scriptId: `SCR-${Date.now()}`,
            fromLocation: 'Collection Point',
            toLocation: 'Grading Station',
            operator: 'Jane Smith'
          });
          break;

        case 'exam:started':
          this.emit('exam:started', {
            examId: `EXAM-${Date.now()}`,
            examName: 'Computer Science Final',
            venue: 'Hall A',
            participants: Math.floor(Math.random() * 200) + 50
          });
          break;

        case 'incident:created':
          this.emit('incident:created', {
            incidentId: `INC-${Date.now()}`,
            type: 'equipment_failure',
            severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            location: 'Scanner Station 2'
          });
          break;

        case 'system:metrics_update':
          this.emit('system:metrics_update', this.generateRandomMetrics());
          break;

        case 'notification:new':
          this.emit('notification:new', this.generateRandomNotification());
          break;
      }
    }, 5000); // Every 5 seconds
  }

  // Generate random metrics for simulation
  private generateRandomMetrics(): MetricsUpdate {
    return {
      scriptsProcessed: Math.floor(Math.random() * 2000) + 1000,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      ongoingExams: Math.floor(Math.random() * 10),
      activeIncidents: Math.floor(Math.random() * 5),
      systemUptime: 99.5 + Math.random() * 0.5,
      serverLoad: Math.floor(Math.random() * 100),
      databaseConnections: Math.floor(Math.random() * 100) + 20,
      networkStatus: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)] as any,
      lastUpdated: new Date()
    };
  }

  // Generate random notification for simulation
  private generateRandomNotification(): NotificationEvent {
    const types: NotificationEvent['type'][] = ['info', 'success', 'warning', 'error'];
    const categories: NotificationEvent['category'][] = ['script', 'exam', 'incident', 'system', 'user'];
    const priorities: NotificationEvent['priority'][] = ['low', 'medium', 'high', 'critical'];

    const notifications = [
      {
        title: 'Script Verification Complete',
        message: 'Batch SCR-2025-001 has been successfully verified and is ready for distribution.',
        category: 'script' as const
      },
      {
        title: 'New Exam Session Started',
        message: 'Physics 101 examination has commenced in Hall B with 156 participants.',
        category: 'exam' as const
      },
      {
        title: 'Security Alert',
        message: 'Unauthorized access attempt detected from IP 192.168.1.100.',
        category: 'system' as const
      },
      {
        title: 'Equipment Malfunction',
        message: 'QR code scanner at Station 3 requires immediate maintenance.',
        category: 'incident' as const
      },
      {
        title: 'User Access Granted',
        message: 'New invigilator account activated for Dr. Johnson.',
        category: 'user' as const
      }
    ];

    const randomNotification = notifications[Math.floor(Math.random() * notifications.length)];

    return {
      id: `notif-${Date.now()}`,
      type: types[Math.floor(Math.random() * types.length)],
      title: randomNotification.title,
      message: randomNotification.message,
      category: randomNotification.category,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      timestamp: new Date()
    };
  }

  // Check connection status
  isConnectionActive(): boolean {
    return this.isConnected;
  }

  // Manual event emission for testing
  emitTestEvent(eventType: string, data: any): void {
    this.emit(eventType, data);
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.eventListeners.clear();
  }
}

// Singleton instance
export const realTimeService = new RealTimeService();

// React hook for easy integration
export const useRealTime = (eventType: string, callback: (event: SocketEvent) => void) => {
  React.useEffect(() => {
    const unsubscribe = realTimeService.on(eventType, callback);
    return unsubscribe;
  }, [eventType, callback]);
};

// React hook for connection status
export const useConnectionStatus = () => {
  const [isConnected, setIsConnected] = React.useState(realTimeService.isConnectionActive());

  React.useEffect(() => {
    const handleConnection = () => setIsConnected(true);
    const handleDisconnection = () => setIsConnected(false);

    const unsubscribeConnect = realTimeService.on('connection', handleConnection);
    const unsubscribeDisconnect = realTimeService.on('disconnection', handleDisconnection);

    return () => {
      unsubscribeConnect();
      unsubscribeDisconnect();
    };
  }, []);

  return isConnected;
};

export default realTimeService;
