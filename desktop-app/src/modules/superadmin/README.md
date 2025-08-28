# SuperAdmin Module

A comprehensive TypeScript module for superadmin functionality in the ELMS system, providing centralized API services, React hooks, state management, and type definitions.

## Overview

This module consolidates all superadmin-related operations including:

- Institution management
- User management
- Audit logging
- System analytics
- Health monitoring
- Configuration management

## Architecture

The module follows a layered architecture:

```plaintext
superadmin/
├── types.ts          # TypeScript interfaces and types
├── api.ts           # API client with singleton pattern
├── hooks.ts         # React hooks for data fetching
├── store.ts         # Zustand state management
└── index.ts         # Module exports
```

## Usage

### Basic Import

```typescript
import { superAdminApi, useSuperAdminStore } from '@/modules/superadmin';
```

### API Client Usage

```typescript
import { superAdminApi } from '@/modules/superadmin';

// Set authentication token
superAdminApi.setToken('your-jwt-token');

// Fetch institutions
const institutions = await superAdminApi.getInstitutions();

// Create a new user
const newUser = await superAdminApi.createUser({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'instructor',
  institutionId: 'inst-123'
});
```

### React Hooks Usage

```typescript
import { useInstitutions, useCreateUser } from '@/modules/superadmin';

function InstitutionsList() {
  const { data: institutions, loading, error } = useInstitutions();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {institutions?.map(inst => (
        <li key={inst.id}>{inst.name}</li>
      ))}
    </ul>
  );
}

function CreateUserForm() {
  const createUser = useCreateUser();

  const handleSubmit = async (userData) => {
    try {
      await createUser.mutateAsync(userData);
      // Success handling
    } catch (error) {
      // Error handling
    }
  };

  return (
    // Your form JSX
  );
}
```

### State Management Usage

```typescript
import { useSuperAdminStore } from '@/modules/superadmin';

function SuperAdminDashboard() {
  const {
    institutions,
    users,
    analytics,
    loading,
    errors,
    fetchInstitutions,
    fetchUsers,
    fetchAnalytics
  } = useSuperAdminStore();

  useEffect(() => {
    fetchInstitutions();
    fetchUsers();
    fetchAnalytics();
  }, []);

  return (
    <div>
      {loading.institutions ? (
        <div>Loading institutions...</div>
      ) : (
        <InstitutionsList data={institutions} />
      )}
    </div>
  );
}
```

## API Endpoints

### Institutions

- `GET /api/superadmin/institutions` - List all institutions
- `POST /api/superadmin/institutions` - Create institution
- `PUT /api/superadmin/institutions/:id` - Update institution
- `DELETE /api/superadmin/institutions/:id` - Delete institution

### Users

- `GET /api/superadmin/users` - List users with pagination/filtering
- `POST /api/superadmin/users` - Create user
- `PUT /api/superadmin/users/:id` - Update user
- `DELETE /api/superadmin/users/:id` - Delete user
- `PATCH /api/superadmin/users/:id/status` - Toggle user status

### Audit Logs

- `GET /api/superadmin/audit-logs` - List audit logs with filtering

### Analytics

- `GET /api/superadmin/analytics` - Get system analytics

### System Health

- `GET /api/superadmin/health` - Get system health status
- `GET /api/superadmin/overview` - Get system overview

### Configuration

- `GET /api/superadmin/configuration` - Get system configuration
- `PUT /api/superadmin/configuration` - Update configuration

## Error Handling

The module includes comprehensive error handling:

```typescript
try {
  const users = await superAdminApi.getUsers();
} catch (error) {
  if (error instanceof ApiError) {
    console.log('API Error:', error.status, error.message);
  } else {
    console.log('Unexpected error:', error);
  }
}
```

## Type Safety

All APIs are fully typed with TypeScript interfaces:

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  institutionId: string;
  password?: string; // Optional for SSO users
}
```

## State Management

The Zustand store provides centralized state management:

```typescript
interface SuperAdminState {
  // Data
  institutions: Institution[];
  users: User[];
  auditLogs: AuditLog[];
  analytics: AnalyticsData | null;
  overview: SystemOverview | null;
  health: SystemHealth | null;

  // Loading states
  loading: {
    institutions: boolean;
    users: boolean;
    auditLogs: boolean;
    analytics: boolean;
    overview: boolean;
    health: boolean;
  };

  // Error states
  errors: {
    institutions: string | null;
    users: string | null;
    auditLogs: string | null;
    analytics: string | null;
    overview: string | null;
    health: string | null;
  };
}
```

## Best Practices

1. **Token Management**: Always set the authentication token before making API calls
2. **Error Handling**: Use try/catch blocks and check for `ApiError` instances
3. **Loading States**: Use the loading states from the store for better UX
4. **Type Safety**: Leverage TypeScript types for better development experience
5. **Caching**: The hooks use built-in caching to prevent unnecessary requests

## Integration with Routes

To integrate with your routing system:

```typescript
import { useInstitutions } from '@/modules/superadmin';

function InstitutionsPage() {
  const { data, loading, error } = useInstitutions();

  // Your component logic
}
```

## Testing

The module is designed to be easily testable:

```typescript
// Mock the API client
jest.mock('@/modules/superadmin', () => ({
  superAdminApi: {
    getInstitutions: jest.fn(),
  },
}));
```
