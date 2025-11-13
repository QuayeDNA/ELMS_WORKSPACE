# Enhanced Authentication System Documentation

## Overview

The ELMS authentication system has been upgraded with:
- **Automatic Token Refresh** - Tokens are automatically refreshed every 15 minutes
- **Secure Token Storage** - Tokens stored in localStorage with proper cleanup
- **Auth Context** - Centralized auth state management with React Context
- **Role-Based Access Control (RBAC)** - Fine-grained permission system
- **Protected Routes** - Easy route protection with hooks and components
- **Error Handling** - Proper 401/403 error handling with auto-retry

---

## Architecture

### 1. **Auth Store** (`stores/auth.store.ts`)
- Zustand store for global auth state
- Handles login, logout, registration
- **Automatic token refresh every 15 minutes**
- Persists auth state to localStorage
- Syncs with storage service

### 2. **Auth Context** (`contexts/AuthContext.tsx`)
- React Context wrapper for auth state
- Provides helper functions: `hasRole()`, `hasPermission()`, `isUserActive()`
- Initializes auth on app mount
- Must wrap app in `<AuthProvider>`

### 3. **API Service** (`services/api.ts`)
- Axios instance with interceptors
- **Automatic token injection** in requests
- **Smart token refresh** on 401 errors
- Queues requests during token refresh
- Redirects to login on refresh failure

### 4. **Storage Service** (`services/storage.service.ts`)
- Manages localStorage for auth data
- Methods for token, refreshToken, user storage
- Clean separation of concerns

---

## Usage

### Basic Setup (Already Done)

```tsx
// App.tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Your app */}
      </AuthProvider>
    </Router>
  );
}
```

### Using Auth in Components

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasRole, hasPermission, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login</div>;
  }

  return (
    <div>
      <h1>Welcome {user?.firstName}</h1>

      {/* Check role */}
      {hasRole('ADMIN') && <AdminPanel />}

      {/* Check multiple roles */}
      {hasRole(['ADMIN', 'SUPER_ADMIN']) && <SuperAdminPanel />}

      {/* Check permission */}
      {hasPermission('manage_users') && <UserManagement />}

      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Routes - Method 1: Component

```tsx
import { ProtectedRoute } from '@/components/auth';

// Basic protection (requires authentication)
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// Role-based protection
<Route
  path="/admin"
  element={
    <ProtectedRoute requiredRoles={['ADMIN', 'SUPER_ADMIN']}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

// Permission-based protection
<Route
  path="/users"
  element={
    <ProtectedRoute requiredPermission="manage_users">
      <UserManagement />
    </ProtectedRoute>
  }
/>
```

### Protecting Routes - Method 2: Hook

```tsx
import { useAuthGuard } from '@/hooks/useAuthGuard';

function AdminPage() {
  // Protect entire component
  useAuthGuard({
    requiredRoles: ['ADMIN', 'SUPER_ADMIN'],
    requireActive: true
  });

  return <div>Admin Content</div>;
}
```

---

## Role-Based Permissions

### Available Roles

```typescript
enum UserRole {
  SUPER_ADMIN      // Full system access
  ADMIN            // Institution admin
  FACULTY_ADMIN    // Faculty management
  DEAN             // Faculty dean
  HOD              // Head of department
  EXAMS_OFFICER    // Exam scheduling & management
  SCRIPT_HANDLER   // Script handling
  INVIGILATOR      // Exam invigilation
  LECTURER         // Teaching & grading
  STUDENT          // Student access
}
```

### Role Permissions Map

```typescript
const rolePermissions = {
  SUPER_ADMIN: ['*'], // All permissions

  ADMIN: [
    'manage_users',
    'manage_institutions',
    'manage_faculties',
    'view_analytics',
  ],

  FACULTY_ADMIN: [
    'manage_departments',
    'create_exams',
    'manage_officers',
    'view_faculty_data',
  ],

  EXAMS_OFFICER: [
    'schedule_exams',
    'manage_incidents',
    'assign_invigilators',
    'manage_venues',
  ],

  LECTURER: [
    'create_exams',
    'grade_scripts',
    'view_results',
    'teach_courses',
  ],

  STUDENT: [
    'view_results',
    'register_courses',
    'view_timetable',
  ],
};
```

### Custom Permission Checks

```tsx
// In component
const canManageUsers = hasPermission('manage_users');
const isAdmin = hasRole(['ADMIN', 'SUPER_ADMIN']);

// Conditional rendering
{canManageUsers && <UserManagement />}
{isAdmin && <AdminTools />}
```

---

## Token Refresh System

### Automatic Refresh
- Tokens are automatically refreshed **every 15 minutes**
- Starts when user logs in
- Stops when user logs out
- Runs in background (no user interaction needed)

### Manual Refresh
```tsx
import { useAuthStore } from '@/stores/auth.store';

const { refreshAuthToken } = useAuthStore();

// Manually trigger refresh
const success = await refreshAuthToken();
```

### Refresh on 401 Errors
- API interceptor automatically catches 401 errors
- Attempts to refresh token
- Retries original request with new token
- Queues multiple requests during refresh
- Logs out user if refresh fails

---

## API Request Flow

1. **Request Initiated**
   ```
   User -> API Call -> Request Interceptor
   ```

2. **Token Injection**
   ```
   Request Interceptor -> Add Authorization Header -> Send Request
   ```

3. **Response Handling**
   ```
   Response <- Server
   ```

4. **Error Handling (401)**
   ```
   401 Error -> Check if token refresh in progress
   -> If yes: Queue request
   -> If no: Attempt token refresh
   -> If refresh success: Retry request with new token
   -> If refresh fails: Logout & redirect to login
   ```

---

## Auth State Flow

```
App Mount
  └─> AuthProvider initialized
      └─> initializeAuth() called
          ├─> Check localStorage for tokens
          ├─> Validate token with API (getCurrentUser)
          ├─> If valid: Set authenticated state
          ├─> If invalid: Try refresh token
          └─> If refresh fails: Clear auth & redirect
```

---

## Security Features

### 1. **Token Security**
- Tokens stored in localStorage (XSS protection via CSP)
- Automatic cleanup on logout
- Secure HTTP-only cookies for refresh tokens (backend)

### 2. **Request Security**
- Bearer token authentication
- Automatic token injection
- Token refresh on expiry

### 3. **Route Protection**
- Unauthenticated users redirected to login
- Role-based access control
- Permission-based access control
- Suspended account detection

### 4. **Error Handling**
- Graceful 401 handling with retry
- Automatic logout on auth failure
- User-friendly error messages

---

## Common Patterns

### Login Flow
```tsx
import { useAuthStore } from '@/stores/auth.store';

function LoginPage() {
  const { login, isLoading, error } = useAuthStore();

  const handleLogin = async (data) => {
    try {
      await login(data);
      // Auto-redirect handled by routing
    } catch (err) {
      // Error handled in store
    }
  };
}
```

### Logout Flow
```tsx
const { logout } = useAuthStore();

const handleLogout = async () => {
  await logout();
  // Redirects to login automatically
};
```

### Check Auth Status
```tsx
const { user, isAuthenticated, isLoading } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (!isAuthenticated) return <LoginPrompt />;
return <DashboardContent />;
```

### Profile Update
```tsx
const { updateUser, getCurrentUser } = useAuthStore();

// After profile update
await updateUser(updatedUserData);

// Or refresh from server
await getCurrentUser();
```

---

## Error Pages

### Unauthorized (403)
- Route: `/unauthorized`
- Component: `UnauthorizedPage`
- Shows when user lacks required role/permission

### Account Suspended
- Route: `/account-suspended`
- Component: `AccountSuspendedPage`
- Shows when user status is not ACTIVE

---

## Testing Auth

### Test Login
```bash
Email: admin@elms.com
Password: Admin@123
```

### Test Role Access
1. Login as Super Admin
2. Navigate to protected routes
3. Check permission-based features
4. Test logout

### Test Token Refresh
1. Login
2. Wait 15+ minutes (or modify `TOKEN_REFRESH_INTERVAL` to 1 minute for testing)
3. Check browser console for "Auto-refreshing token..." message
4. Verify API calls still work

### Test 401 Handling
1. Login
2. Manually clear token from localStorage
3. Make API call
4. Should auto-refresh and retry

---

## Troubleshooting

### "User not authenticated" on page refresh
- Check if `initializeAuth()` is called in App.tsx
- Verify tokens exist in localStorage
- Check browser console for errors

### Token refresh not working
- Verify refresh token exists in localStorage
- Check backend `/api/auth/refresh` endpoint
- Verify refresh token hasn't expired

### Protected route not working
- Ensure `<AuthProvider>` wraps routes
- Check role/permission spelling
- Verify user has correct role in database

### API calls fail with 401
- Check if token is being sent (Network tab)
- Verify token format is correct
- Check backend JWT validation

---

## Best Practices

1. **Always use `<AuthProvider>`** - Wrap your app
2. **Use hooks over direct store access** - Prefer `useAuth()` over `useAuthStore()`
3. **Check auth before rendering** - Use `ProtectedRoute` or `useAuthGuard`
4. **Handle loading states** - Check `isLoading` before rendering
5. **Clear errors** - Call `clearError()` after displaying
6. **Logout on critical errors** - Force logout on security issues
7. **Don't store sensitive data** - Keep tokens in localStorage only
8. **Test role permissions** - Verify RBAC works correctly

---

## Migration from Old Auth

If upgrading from previous auth implementation:

1. ✅ Replace `useAuthStore` with `useAuth` in components
2. ✅ Wrap App with `<AuthProvider>`
3. ✅ Update route protection to use `<ProtectedRoute>`
4. ✅ Test login/logout flow
5. ✅ Test token refresh
6. ✅ Verify role-based access

---

## Status: ✅ Production Ready

All auth features are implemented and tested:
- ✅ Login/Logout
- ✅ Registration
- ✅ Token Management
- ✅ Automatic Token Refresh
- ✅ Role-Based Access Control
- ✅ Permission System
- ✅ Protected Routes
- ✅ Error Handling
- ✅ Auth Context
- ✅ Storage Management

**Last Updated:** November 13, 2025
