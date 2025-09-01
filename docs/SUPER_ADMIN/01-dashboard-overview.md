# 📊 Dashboard & Overview

## Overview

The Super Admin Dashboard provides a comprehensive real-time view of the entire ELMS ecosystem across all institutions. It serves as the central command center for system-wide monitoring and quick actions.

## Core Features

### 1. System Overview Metrics

```typescript
interface SystemOverview {
  totalInstitutions: number;
  activeInstitutions: number;
  totalUsers: number;
  activeUsers: number;
  systemHealth: HealthStatus;
  uptime: number;
  criticalAlerts: Alert[];
}

enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  MAINTENANCE = 'maintenance'
}
```

### 2. Real-Time Metrics

```typescript
interface RealTimeMetrics {
  concurrentUsers: number;
  apiRequestRate: number;
  averageResponseTime: number;
  systemLoad: {
    cpu: number;
    memory: number;
    database: number;
    storage: number;
  };
  errorRates: {
    rate5xx: number;
    rate4xx: number;
    totalErrors: number;
  };
}
```

### 3. Quick Actions Panel

```typescript
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action: string;
  permissions: string[];
}

const quickActions: QuickAction[] = [
  {
    id: 'create-institution',
    title: 'Create Institution',
    description: 'Add a new educational institution',
    icon: 'plus-circle',
    action: '/superadmin/institutions/create',
    permissions: ['institution.create']
  },
  {
    id: 'system-health',
    title: 'System Health Check',
    description: 'Run comprehensive system diagnostics',
    icon: 'activity',
    action: '/superadmin/system/health-check',
    permissions: ['system.monitor']
  },
  {
    id: 'backup-system',
    title: 'Backup System',
    description: 'Initiate system-wide backup',
    icon: 'download',
    action: '/superadmin/system/backup',
    permissions: ['system.backup']
  }
];
```

## API Endpoints

### GET /api/v1/superadmin/dashboard/overview

Retrieves system overview metrics.

**Response:**
```typescript
{
  data: SystemOverview;
  success: boolean;
  timestamp: string;
}
```

### GET /api/v1/superadmin/dashboard/metrics/realtime

Retrieves real-time system metrics.

**Response:**
```typescript
{
  data: RealTimeMetrics;
  success: boolean;
  timestamp: string;
}
```

### GET /api/v1/superadmin/dashboard/alerts

Retrieves active system alerts.

**Query Parameters:**
- `severity`: Filter by alert severity
- `limit`: Number of alerts to return (default: 10)
- `offset`: Pagination offset

**Response:**
```typescript
{
  data: {
    alerts: Alert[];
    total: number;
    hasMore: boolean;
  };
  success: boolean;
}
```

## Implementation Details

### Controller Structure

```typescript
// backend/src/controllers/superadmin/dashboard/dashboard.controller.ts
export class DashboardController {
  async getOverview(req: Request, res: Response): Promise<Response>;
  async getRealTimeMetrics(req: Request, res: Response): Promise<Response>;
  async getAlerts(req: Request, res: Response): Promise<Response>;
  async getQuickActions(req: Request, res: Response): Promise<Response>;
}
```

### Service Layer

```typescript
// backend/src/services/superadmin/dashboard/dashboard.service.ts
export class DashboardService {
  async getSystemOverview(): Promise<SystemOverview>;
  async getRealTimeMetrics(): Promise<RealTimeMetrics>;
  async getActiveAlerts(filters: AlertFilters): Promise<PaginatedAlerts>;
  async getSystemHealth(): Promise<HealthStatus>;
}
```

## Database Schema

### System Metrics Table

```sql
CREATE TABLE system_metrics (
  id SERIAL PRIMARY KEY,
  metric_type VARCHAR(50) NOT NULL,
  metric_value JSONB NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_system_metrics_type_timestamp ON system_metrics(metric_type, timestamp);
```

### Alerts Table

```sql
CREATE TABLE system_alerts (
  id SERIAL PRIMARY KEY,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source VARCHAR(100) NOT NULL,
  metadata JSONB,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Caching Strategy

### Redis Cache Keys

```typescript
const CACHE_KEYS = {
  SYSTEM_OVERVIEW: 'superadmin:dashboard:overview',
  REAL_TIME_METRICS: 'superadmin:dashboard:metrics',
  ACTIVE_ALERTS: 'superadmin:dashboard:alerts',
  SYSTEM_HEALTH: 'superadmin:dashboard:health'
};

const CACHE_TTL = {
  OVERVIEW: 300, // 5 minutes
  METRICS: 30,   // 30 seconds
  ALERTS: 60,    // 1 minute
  HEALTH: 120    // 2 minutes
};
```

## WebSocket Real-Time Updates

### Socket Events

```typescript
interface DashboardSocketEvents {
  'metrics:update': RealTimeMetrics;
  'alert:new': Alert;
  'alert:resolved': { alertId: string };
  'system:health': HealthStatus;
}
```

### Implementation

```typescript
// Real-time metrics broadcasting
setInterval(() => {
  const metrics = await dashboardService.getRealTimeMetrics();
  io.to('superadmin-dashboard').emit('metrics:update', metrics);
}, 30000); // Every 30 seconds
```

## Security Considerations

### Access Control

```typescript
const requiredPermissions = {
  overview: ['dashboard.view'],
  metrics: ['dashboard.view', 'system.monitor'],
  alerts: ['dashboard.view', 'alerts.view'],
  quickActions: ['dashboard.view']
};
```

### Rate Limiting

```typescript
// Rate limiting for dashboard endpoints
const dashboardLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  message: 'Too many dashboard requests'
});
```

## Performance Optimizations

### Data Aggregation

- Use database views for complex metric calculations
- Implement background jobs for heavy analytics
- Cache frequently accessed data with appropriate TTL
- Use connection pooling for database queries

### Query Optimization

```sql
-- Optimized query for system overview
CREATE MATERIALIZED VIEW system_overview_view AS
SELECT 
  COUNT(DISTINCT i.id) as total_institutions,
  COUNT(DISTINCT CASE WHEN i.status = 'active' THEN i.id END) as active_institutions,
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN u.last_login > NOW() - INTERVAL '24 hours' THEN u.id END) as active_users
FROM institutions i
LEFT JOIN users u ON u.institution_id = i.id;

-- Refresh materialized view every hour
CREATE OR REPLACE FUNCTION refresh_system_overview()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW system_overview_view;
END;
$$ LANGUAGE plpgsql;
```

## Error Handling

### Custom Error Types

```typescript
export class DashboardError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'DashboardError';
  }
}

export const DASHBOARD_ERRORS = {
  METRICS_UNAVAILABLE: new DashboardError(
    'System metrics temporarily unavailable',
    'METRICS_UNAVAILABLE',
    503
  ),
  INVALID_TIME_RANGE: new DashboardError(
    'Invalid time range specified',
    'INVALID_TIME_RANGE',
    400
  )
};
```

## Testing Strategy

### Unit Tests

```typescript
describe('DashboardService', () => {
  describe('getSystemOverview', () => {
    it('should return valid system overview', async () => {
      const overview = await dashboardService.getSystemOverview();
      expect(overview).toMatchSchema(SystemOverviewSchema);
    });
  });
});
```

### Integration Tests

```typescript
describe('Dashboard API', () => {
  it('GET /api/v1/superadmin/dashboard/overview', async () => {
    const response = await request(app)
      .get('/api/v1/superadmin/dashboard/overview')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    
    expect(response.body.data).toHaveProperty('totalInstitutions');
    expect(response.body.data).toHaveProperty('systemHealth');
  });
});
```

## Implementation Status

- ✅ TypeScript interfaces and types defined
- ✅ Service layer implementation complete
- ✅ Controller implementation complete
- ✅ Routes with validation and middleware complete
- ✅ Database schema updated (migration pending)
- ✅ Authentication and authorization middleware
- 🚧 Database migration (requires database connection)
- ⏳ WebSocket integration (planned)
- ⏳ Caching implementation with Redis (implemented in service)
- ⏳ Frontend integration (future)

## Files Created/Updated

### Backend Structure
```
backend/src/
├── types/superadmin/dashboard/
│   └── dashboard.types.ts              ✅ Complete type definitions
├── services/superadmin/dashboard/
│   └── dashboard.service.ts            ✅ Complete business logic
├── controllers/superadmin/dashboard/
│   └── dashboard.controller.ts         ✅ Complete HTTP handlers
└── routes/superadmin/dashboard/
    └── dashboard.routes.ts             ✅ Complete route definitions

backend/src/routes/superadmin/
└── index.ts                            ✅ Main super admin routes

backend/prisma/
└── schema.prisma                       ✅ Updated with SystemMetric and SystemAlert models
```

### API Endpoints Implemented

- ✅ `GET /api/v1/superadmin/dashboard/overview` - System overview
- ✅ `GET /api/v1/superadmin/dashboard/metrics/realtime` - Real-time metrics
- ✅ `GET /api/v1/superadmin/dashboard/alerts` - System alerts with filtering
- ✅ `GET /api/v1/superadmin/dashboard/quick-actions` - Available actions
- ✅ `POST /api/v1/superadmin/dashboard/alerts/:id/resolve` - Resolve alert
- ✅ `POST /api/v1/superadmin/dashboard/alerts` - Create alert

### Security Features Implemented

- ✅ Super admin role authentication required
- ✅ Permission-based access control
- ✅ Input validation with express-validator
- ✅ Comprehensive error handling
- ✅ Audit logging for all operations

## Next Steps

1. Implement DashboardController with all endpoints
2. Create DashboardService with business logic
3. Set up database views and indexes
4. Implement caching layer
5. Add WebSocket real-time updates
6. Create comprehensive test suite
