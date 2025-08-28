# SuperAdmin Module - Reorganized Structure

A comprehensive TypeScript module for superadmin functionality in the ELMS system, properly organized with clear separation of concerns.

## New Structure

The module has been reorganized from a single folder with mixed files to a proper layered architecture:

```
src/
├── superadmin.ts                    # Main module entry point
├── services/
│   └── superadmin/
│       ├── index.ts                 # Service exports
│       └── superadmin.service.ts    # API client (renamed from api.ts)
├── hooks/
│   └── superadmin/
│       ├── index.ts                 # Hook exports
│       └── useSuperAdmin.ts         # React hooks (renamed from hooks.ts)
├── stores/
│   ├── authStore.ts                 # Main authentication store
│   └── superadminStore.ts           # Superadmin data store (renamed from store.ts)
└── types/
    └── superadmin/
        ├── index.ts                 # Type exports
        └── superadmin.types.ts      # TypeScript interfaces (renamed from types.ts)
```

## Key Improvements

### 1. **Proper File Organization**
- **Services**: API clients and business logic
- **Hooks**: React hooks for data fetching and state management
- **Stores**: Zustand stores for global state
- **Types**: TypeScript interfaces and type definitions

### 2. **Unified Authentication**
- Removed duplicate token management
- Superadmin store now integrates with main auth store
- Single source of truth for authentication state

### 3. **Better Naming Convention**
- `api.ts` → `superadmin.service.ts`
- `hooks.ts` → `useSuperAdmin.ts`
- `store.ts` → `superadminStore.ts`
- `types.ts` → `superadmin.types.ts`

### 4. **Clean Imports**
- Main entry point: `import { ... } from '@/superadmin'`
- Individual imports available when needed

## Usage

### Basic Import (Recommended)

```typescript
import {
  superAdminApi,
  useSuperAdminStore,
  useInstitutions,
  useCreateUser
} from '@/superadmin';
```

### Individual Component Imports

```typescript
// For services
import { superAdminApi } from '@/services/superadmin';

// For hooks
import { useInstitutions } from '@/hooks/superadmin';

// For stores
import { useSuperAdminStore } from '@/stores/superadminStore';

// For types
import type { Institution, User } from '@/types/superadmin';
```

### Authentication Integration

The superadmin module now automatically uses the token from the main auth store:

```typescript
import { useAuthStore } from '@/stores/authStore';
import { useSuperAdminStore } from '@/superadmin';

function SuperAdminDashboard() {
  const { isAuthenticated, token } = useAuthStore();
  const { fetchInstitutions, institutions } = useSuperAdminStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchInstitutions(); // Automatically uses token from auth store
    }
  }, [isAuthenticated, token]);

  return (
    <div>
      {institutions.map(inst => (
        <div key={inst.id}>{inst.name}</div>
      ))}
    </div>
  );
}
```

## API Integration

All API calls now automatically include the authentication token from the main auth store:

```typescript
// No need to manually set tokens
const institutions = await superAdminApi.getInstitutions();
// Token is automatically included from auth store
```

## Migration Guide

### From Old Structure

```typescript
// Old way
import { superAdminApi } from '@/modules/superadmin';

// New way
import { superAdminApi } from '@/superadmin';
// or
import { superAdminApi } from '@/services/superadmin';
```

### Token Management

```typescript
// Old way - manual token management
superAdminApi.setToken('your-token');

// New way - automatic from auth store
// No manual token setting needed
```

## Best Practices

1. **Use Main Entry Point**: Import from `@/superadmin` for most use cases
2. **Individual Imports**: Use specific paths when you only need part of the module
3. **Authentication**: Ensure users are authenticated before using superadmin features
4. **Error Handling**: Use try/catch blocks and check for `ApiError` instances
5. **Loading States**: Utilize loading states from stores for better UX

## Architecture Benefits

- **Separation of Concerns**: Clear boundaries between services, hooks, stores, and types
- **Maintainability**: Easier to find and modify specific functionality
- **Scalability**: Easy to add new features without affecting existing code
- **Type Safety**: Comprehensive TypeScript support throughout
- **Testing**: Each layer can be tested independently

## Integration with Existing Code

The reorganized module maintains backward compatibility while providing better structure. Existing code using the old paths will need to be updated to use the new import paths.
