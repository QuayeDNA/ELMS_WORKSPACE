# Academic Pages Integration - Routing & Navigation Update

## Summary
Successfully integrated the academic calendar pages into the application's routing and navigation system.

## Changes Made

### 1. Sidebar Navigation (`Sidebar.tsx`)
**Added:** New "Academic Calendar" section for ADMIN role

```tsx
{
  title: "Academic Calendar",
  icon: School,
  roles: [UserRole.ADMIN],
  items: [
    {
      title: "Academic Years",
      href: "/admin/academic/years",
      icon: LayoutDashboard,
      roles: [UserRole.ADMIN],
      description: "Manage academic years",
    },
    {
      title: "Semesters",
      href: "/admin/academic/semesters",
      icon: BookOpen,
      roles: [UserRole.ADMIN],
      description: "Manage semesters",
    },
    {
      title: "Academic Periods",
      href: "/admin/academic/periods",
      icon: ClipboardCheck,
      roles: [UserRole.ADMIN],
      description: "Manage academic periods",
    },
  ],
}
```

**Position:** Placed between "Academics" and "Examination" sections
**Default State:** Expanded by default (added to `expandedGroups` Set)

### 2. App Routes (`AppRoutes.tsx`)
**Added:** Three new lazy-loaded page components

```tsx
// Academic Pages
const AcademicYearsPage = lazy(() =>
  import("@/pages/academic/AcademicYearsPage").then((module) => ({
    default: module.default,
  }))
);
const SemestersPage = lazy(() =>
  import("@/pages/academic/SemestersPage").then((module) => ({
    default: module.default,
  }))
);
const AcademicPeriodsPage = lazy(() =>
  import("@/pages/academic/AcademicPeriodsPage").then((module) => ({
    default: module.default,
  }))
);
```

**Added:** Three new route definitions

```tsx
{/* Academic Calendar Routes */}
<Route
  path="/admin/academic/years"
  element={
    <AdminLayout>
      <AcademicYearsPage />
    </AdminLayout>
  }
/>
<Route
  path="/admin/academic/semesters"
  element={
    <AdminLayout>
      <SemestersPage />
    </AdminLayout>
  }
/>
<Route
  path="/admin/academic/periods"
  element={
    <AdminLayout>
      <AcademicPeriodsPage />
    </AdminLayout>
  }
/>
```

**Protection:** All routes wrapped in `AdminLayout` (requires `UserRole.ADMIN`)
**Position:** Placed after course routes, before examination routes

### 3. Route Configuration (`routeConfig.ts`)
**Added:** Academic calendar route constants

```tsx
export const ACADEMIC_ROUTES = {
  YEARS: '/admin/academic/years',
  SEMESTERS: '/admin/academic/semesters',
  PERIODS: '/admin/academic/periods',
} as const;
```

**Added:** Access control helper function

```tsx
export function canAccessAcademicCalendar(role: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}
```

## Navigation Flow

### For ADMIN Users:
1. Login → Redirected to `/admin` (Institution Admin Dashboard)
2. Sidebar shows "Academic Calendar" section (expanded by default)
3. Click on any academic page:
   - "Academic Years" → `/admin/academic/years`
   - "Semesters" → `/admin/academic/semesters`
   - "Academic Periods" → `/admin/academic/periods`

### For Other Roles:
- Academic Calendar section **not visible** (role-based filtering)
- Direct URL access **blocked** by `AdminLayout` guard

## URL Structure
```
/admin/academic/
├── years       # AcademicYearsPage - List, search, pagination
├── semesters   # SemestersPage - List, search, filter
└── periods     # AcademicPeriodsPage - List with statistics
```

## Access Control
- **Route Level:** `AdminLayout` wraps all academic routes
- **Component Level:** Pages use `useAuthStore` for user context
- **Navigation Level:** Sidebar filters items by user role
- **Helper Function:** `canAccessAcademicCalendar(role)` for programmatic checks

## Features Enabled
✅ Direct navigation from sidebar menu
✅ Lazy loading for better performance
✅ Protected routes (admin-only access)
✅ Grouped under "Academic Calendar" section
✅ Default expanded state for easy access
✅ Consistent with existing routing patterns
✅ Type-safe route constants available

## Usage Examples

### Navigate programmatically:
```tsx
import { ACADEMIC_ROUTES } from '@/utils/routeConfig';
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate(ACADEMIC_ROUTES.YEARS);
```

### Check access:
```tsx
import { canAccessAcademicCalendar } from '@/utils/routeConfig';
import { useAuthStore } from '@/stores/auth.store';

const { user } = useAuthStore();
const hasAccess = canAccessAcademicCalendar(user.role);
```

### Link to pages:
```tsx
import { Link } from 'react-router-dom';
import { ACADEMIC_ROUTES } from '@/utils/routeConfig';

<Link to={ACADEMIC_ROUTES.SEMESTERS}>View Semesters</Link>
```

## Testing Checklist
- [ ] Login as ADMIN user
- [ ] Verify "Academic Calendar" section appears in sidebar
- [ ] Click "Academic Years" - page loads successfully
- [ ] Click "Semesters" - page loads successfully
- [ ] Click "Academic Periods" - page loads successfully
- [ ] Verify URL updates correctly
- [ ] Verify browser back/forward navigation works
- [ ] Try accessing URLs directly (should work for admins)
- [ ] Login as non-admin user
- [ ] Verify "Academic Calendar" section **not** visible
- [ ] Try direct URL access (should be blocked)

## Next Steps
1. ✅ Routes added and protected
2. ✅ Navigation integrated
3. ✅ Route constants available
4. ⏳ Test with real backend data
5. ⏳ Add breadcrumbs for better UX
6. ⏳ Add "Recently Viewed" academic items
7. ⏳ Consider adding quick actions in dashboard

## Notes
- All pages use lazy loading for optimal performance
- Sidebar section expands by default for easy access
- Routes follow `/admin/academic/*` pattern for consistency
- All academic pages share the same `AdminLayout` wrapper
- Access control enforced at multiple levels (route, layout, component)
