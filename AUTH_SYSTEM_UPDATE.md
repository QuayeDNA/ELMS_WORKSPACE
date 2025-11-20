# Frontend Auth System Update

## Overview
Updated the frontend authentication system to use **secure HTTP cookies** instead of localStorage and properly handle **multi-role authentication** with enhanced role guards and routing.

## Changes Made

### 1. Cookie-Based Storage (Security Enhancement)

#### Before (localStorage):
```typescript
localStorage.setItem('token', token);
```

#### After (Secure Cookies):
```typescript
Cookies.set('elms_auth_token', token, {
  secure: true, // HTTPS only in production
  sameSite: 'strict', // CSRF protection
  expires: 7 // 7 days if remember me
});
```

**Benefits:**
- ✅ **HTTP-only option** (can be enabled server-side for even better security)
- ✅ **Automatic expiration** handling
- ✅ **CSRF protection** with sameSite: 'strict'
- ✅ **Secure flag** for HTTPS
- ✅ **Better for SSR** compatibility
- ✅ **Path-specific** cookies

### 2. Enhanced Storage Service

**New Features:**
- `hasValidSession()` - Check if user has valid auth session
- `getRememberMe()` - Retrieve remember me preference
- Cookie configuration with security flags
- Proper expiration handling (7 days for remembered sessions, session-only otherwise)

**Cookie Keys:**
```typescript
{
  TOKEN: 'elms_auth_token',
  REFRESH_TOKEN: 'elms_refresh_token',
  USER: 'elms_user_data',
  REMEMBER_ME: 'elms_remember_me',
}
```

### 3. Improved Role-Based Access Control

#### Multi-Role Support
The system now properly checks:
1. **Primary role** (`user.role`)
2. **Additional roles** (`user.roleProfiles[]`)
3. **Active roles only** (`roleProfile.isActive === true`)

#### hasRole() Function
```typescript
hasRole(roles: UserRole | UserRole[]): boolean {
  // Check primary role
  if (roles.includes(user.role)) return true;

  // Check roleProfiles
  return user.roleProfiles?.some(rp =>
    rp.isActive && roles.includes(rp.role)
  );
}
```

### 4. Enhanced ProtectedRoute Component

**New Features:**
- Detailed console logging for debugging
- State preservation on redirect
- Better loading states
- Account status validation
- Multi-role checking

**Example Usage:**
```tsx
<ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
  <AdminDashboard />
</ProtectedRoute>
```

**Debug Logs:**
```
[ProtectedRoute] Not authenticated, redirecting to login
[ProtectedRoute] User account not active: SUSPENDED
[ProtectedRoute] Access denied - Required roles: [ADMIN, SUPER_ADMIN]
[ProtectedRoute] User role: LECTURER
```

### 5. Enhanced RoleGuard Component

**New Features:**
- Detailed error messages showing user's current role
- Display of additional roles from roleProfiles
- Visual alert with required vs current roles
- Better UX with icons and formatting

**Example Output:**
```
╔════════════════════════════════════════╗
║ 🛡️ Access Denied                      ║
╠════════════════════════════════════════╣
║ Your role: STUDENT                     ║
║ Additional roles: None                 ║
║ Required: ADMIN or SUPER_ADMIN         ║
╚════════════════════════════════════════╝
```

### 6. Backend Alignment

The frontend now properly aligns with backend JWT structure:

**Backend JWT Payload:**
```typescript
{
  userId: number,
  email: string,
  primaryRole: UserRole,
  permissions: Permission[],
  institutionId?: number,
  facultyId?: number,
  departmentId?: number
}
```

**Frontend User Object:**
```typescript
{
  id: number,
  email: string,
  role: UserRole, // Primary role
  roleProfiles: RoleProfile[], // All roles
  // ... other fields
}
```

## Migration Guide

### For Existing Code

1. **Update route protections:**
```typescript
// OLD
<ProtectedRoute requiredRoles={['ADMIN']}>

// NEW (with TypeScript enum)
<ProtectedRoute requiredRoles={[UserRole.ADMIN]}>
```

2. **Check roles programmatically:**
```typescript
// OLD
if (user.role === 'ADMIN') { ... }

// NEW (checks all roles)
if (hasRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])) { ... }
```

3. **Access role metadata:**
```typescript
// Get student ID from roleProfile metadata
const studentMetadata = getRoleMetadata(UserRole.STUDENT);
const studentId = studentMetadata?.studentId;
```

## Security Best Practices

### Current Implementation ✅
- ✅ Cookies with secure flag (HTTPS only)
- ✅ SameSite='strict' for CSRF protection
- ✅ Automatic token refresh
- ✅ Role-based access control
- ✅ Permission-based access control

### Future Enhancements 🔄
- [ ] HTTP-only cookies (requires backend support)
- [ ] Token fingerprinting
- [ ] Device tracking
- [ ] Session management dashboard
- [ ] Multi-factor authentication

## Testing Guide

### Test Scenarios

1. **Login with Remember Me:**
```typescript
await login({
  email: 'admin@tughana.edu.gh',
  password: 'Password123!',
  rememberMe: true
});
// Cookies should persist for 7 days
```

2. **Login without Remember Me:**
```typescript
await login({
  email: 'admin@tughana.edu.gh',
  password: 'Password123!',
  rememberMe: false
});
// Cookies should be session-only
```

3. **Role Checking:**
```typescript
// User with ADMIN role should access admin routes
// User with STUDENT role should be redirected to /unauthorized
```

4. **Token Refresh:**
```typescript
// Tokens auto-refresh every 15 minutes
// Check console for: "Auto-refreshing token..."
```

5. **Multi-Role Access:**
```typescript
// User with multiple roleProfiles should access routes for ANY of their roles
```

## Common Issues & Solutions

### Issue: "Unauthorized" page after login

**Cause:** Role mismatch between route requirements and user role

**Solution:**
1. Check console logs for role details
2. Verify user has correct role in database
3. Check route's `requiredRoles` prop

```typescript
// Debug in console
console.log('User role:', user.role);
console.log('User roleProfiles:', user.roleProfiles);
console.log('Required roles:', requiredRoles);
```

### Issue: Cookies not persisting

**Cause:** Browser security settings or incorrect cookie configuration

**Solution:**
1. Check browser allows cookies
2. Verify `secure` flag matches protocol (HTTP vs HTTPS)
3. Check cookie expiration

```typescript
// Debug cookies
console.log('All cookies:', Cookies.get());
console.log('Auth token:', storageService.getToken());
```

### Issue: Token refresh failing

**Cause:** Refresh token expired or invalid

**Solution:**
1. Check refresh token expiration (30 days)
2. Verify refresh token is stored correctly
3. Check backend /refresh endpoint

```typescript
// Debug refresh token
const refreshToken = storageService.getRefreshToken();
console.log('Refresh token exists:', !!refreshToken);
```

## API Integration

### Login Flow
```
1. User submits credentials
2. Frontend sends POST /api/auth/login
3. Backend returns: { token, refreshToken, user, roles }
4. Frontend stores in cookies:
   - elms_auth_token (7 days or session)
   - elms_refresh_token (30 days or session)
   - elms_user_data (7 days or session)
5. Frontend initializes auth state
6. User redirected to appropriate dashboard
```

### Auto-Refresh Flow
```
1. Timer triggers every 15 minutes
2. Frontend sends POST /api/auth/refresh with refreshToken
3. Backend returns new { token }
4. Frontend updates token in cookie
5. Axios interceptor uses new token for subsequent requests
```

### Logout Flow
```
1. User clicks logout
2. Frontend sends POST /api/auth/logout (optional)
3. Frontend clears all cookies:
   - elms_auth_token
   - elms_refresh_token
   - elms_user_data
4. Frontend redirects to /login
```

## Role Hierarchy

```
SUPER_ADMIN
    ├─ ADMIN
    │   ├─ FACULTY_ADMIN
    │   │   ├─ DEAN
    │   │   └─ EXAMS_OFFICER
    │   ├─ HOD
    │   └─ SCRIPT_HANDLER
    ├─ INVIGILATOR
    ├─ LECTURER
    └─ STUDENT
```

## Permissions Matrix

| Role | Manage Users | Manage Exams | Grade Scripts | View Reports |
|------|-------------|--------------|---------------|--------------|
| SUPER_ADMIN | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ❌ | ✅ |
| EXAMS_OFFICER | ❌ | ✅ | ❌ | ✅ |
| LECTURER | ❌ | ✅ (own) | ✅ (own) | ✅ (own) |
| STUDENT | ❌ | ❌ | ❌ | ✅ (own) |

## Dependencies

### New Dependencies
- `js-cookie` (v3.0.5) - Cookie management library
- `@types/js-cookie` (v3.0.6) - TypeScript types for js-cookie

### Existing Dependencies
- `zustand` - State management
- `react-router-dom` - Routing
- `axios` - HTTP client

## Files Modified

1. ✅ `frontend/src/services/storage.service.ts` - Cookie-based storage
2. ✅ `frontend/src/stores/auth.store.ts` - Updated to use cookies
3. ✅ `frontend/src/components/auth/ProtectedRoute.tsx` - Enhanced role checking
4. ✅ `frontend/src/components/auth/RoleGuard.tsx` - Better error messages
5. ✅ `frontend/src/contexts/AuthContext.tsx` - Improved hasRole logic

## Next Steps

1. **Test all role-based routes** with different user roles
2. **Verify cookie security** in production (HTTPS)
3. **Monitor token refresh** in console
4. **Update route definitions** to use UserRole enum
5. **Add role switching UI** for users with multiple roles

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify user role in database matches route requirements
3. Test with fresh login (clear cookies)
4. Check backend JWT payload structure
