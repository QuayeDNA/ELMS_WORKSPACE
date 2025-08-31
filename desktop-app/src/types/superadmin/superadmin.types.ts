// Super Admin related types
export interface SuperAdminUser {
  id: string
  email: string
  role: 'SUPER_ADMIN'
  profile: {
    firstName: string
    lastName: string
  }
  permissions: string[]
  createdAt: Date
  updatedAt: Date
}

export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  memory: {
    used: number
    total: number
  }
  cpu: {
    usage: number
  }
  database: {
    status: 'connected' | 'disconnected'
    responseTime: number
  }
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  timestamp: Date
  details: Record<string, unknown>
  ipAddress: string
}

export interface SystemConfig {
  maintenance: {
    enabled: boolean
    message: string
  }
  notifications: {
    email: boolean
    sms: boolean
  }
  security: {
    sessionTimeout: number
    passwordPolicy: {
      minLength: number
      requireSpecialChars: boolean
      requireNumbers: boolean
    }
  }
}
