# React Query DevTools Guide

## Overview
React Query DevTools is now enabled in your ELMS project for development debugging and monitoring.

## How to Access

### 1. DevTools Panel
When you run your frontend in development mode, you'll see a **floating React Query icon** (flower/atom logo) in the bottom-right corner of your browser.

**Click the icon** to open the DevTools panel.

### 2. DevTools Features

#### **Queries Tab** (Main View)
- **All Queries**: Lists all queries with their keys and status
- **Status Colors**:
  - 🟢 Green (fresh) - Data is fresh, no refetch needed
  - 🟡 Yellow (fetching) - Currently loading data
  - 🔵 Blue (stale) - Data is stale, will refetch on focus
  - 🔴 Red (error) - Query failed
  - ⚪ Gray (inactive) - Query not mounted

#### **Query Details**
Click any query to see:
- **Data**: Current cached data (JSON format)
- **Query Key**: Unique identifier for the query
- **Status**: fresh, stale, fetching, error, etc.
- **Observers**: How many components are watching this query
- **Last Updated**: When data was last fetched
- **Data Updated At**: Timestamp

#### **Actions Panel**
- **Refetch**: Manually trigger a query refetch
- **Invalidate**: Mark query as stale (will refetch on next use)
- **Reset**: Clear query error state
- **Remove**: Delete query from cache

#### **Mutations Tab**
- View all mutations (POST, PUT, DELETE operations)
- See mutation status and variables
- Track mutation timing

## Practical Usage in Your ELMS Project

### 1. Student Dashboard Debugging
```typescript
// Your code: pages/student/StudentDashboard.tsx
const { data: studentProfile } = useQuery({
  queryKey: ['studentProfile', user?.id],
  queryFn: () => studentService.getStudentByUserId(user!.id)
});
```

**In DevTools:**
- Query Key: `['studentProfile', 1]`
- See the transformed Student data
- Check if `studentId`, `level`, `programId` are correct
- Verify roleProfile transformation worked

### 2. Course Registration Monitoring
```typescript
const registerMutation = useMutation({
  mutationFn: (data) => registrationService.registerForCourses(data)
});
```

**In DevTools:**
- Mutations Tab → See registration status
- View mutation variables (course IDs, student ID)
- Track success/error states

### 3. Authentication State
```typescript
// Check auth queries
queryKey: ['currentUser']
```

**In DevTools:**
- Verify user object has `roleProfiles` array
- Check `isPrimary` flags
- Inspect metadata for student/instructor data

### 4. Cache Inspection
When debugging issues like "data not updating":
1. Open DevTools
2. Find the query (e.g., `['students', filters]`)
3. Check "Last Updated" timestamp
4. Click **Refetch** to manually update
5. Compare old vs new data

### 5. Performance Monitoring
- **Data Explorer**: See how much data is cached
- **Query Timing**: Identify slow queries
- **Stale Queries**: Find queries that refetch too often

## Common Scenarios

### Scenario 1: "Student data not showing"
1. Open DevTools → Queries Tab
2. Search for `studentProfile`
3. Check Status (should be green/success)
4. Inspect Data → verify structure
5. If error, check error message

### Scenario 2: "Login not persisting"
1. Look for `currentUser` query
2. Check if query is being removed (cache cleared)
3. Verify staleTime and cacheTime settings

### Scenario 3: "Course list outdated"
1. Find `courses` query
2. Check "Last Updated" time
3. Click **Invalidate** to force refetch
4. Or click **Refetch** to update immediately

### Scenario 4: "Mutation not working"
1. Mutations Tab
2. Find your mutation (e.g., `registerForCourses`)
3. Check variables sent
4. View error response if failed

## Configuration (Already Set)

Your current setup in `main.tsx`:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,              // Retry failed queries 3 times
      staleTime: 5 * 60 * 1000, // Data fresh for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch when tab focused
    },
  },
});
```

## DevTools-Only Features (Development)

The DevTools **only appear in development mode** and are automatically excluded from production builds. No performance impact on production!

## Tips for ELMS Development

### 1. Student Module Testing
- After registration: Check `['studentProfile', userId]` has correct data
- Verify `studentId`, `indexNumber`, `programId` in cache
- Ensure roleProfile transformation worked correctly

### 2. Real-time Updates
- When WebSocket updates arrive, watch queries invalidate
- See cache updates happen in real-time
- Track which components re-render

### 3. Auth Flow Debugging
- Login → Check `currentUser` query appears
- Logout → Verify queries are cleared
- Role switching → Watch roleProfile updates

### 4. Optimistic Updates
- Trigger mutation (e.g., register for course)
- See optimistic update in cache immediately
- Watch it revert if mutation fails

## Keyboard Shortcuts
- **Toggle DevTools**: Click the floating icon
- **Close**: Click outside panel or click icon again
- **Expand/Collapse**: Click query rows

## Additional Resources

**Official Docs**: https://tanstack.com/query/latest/docs/devtools

**Your Queries to Monitor**:
- `['studentProfile', userId]` - Student dashboard data
- `['courses', filters]` - Available courses
- `['registeredCourses', studentId]` - Enrolled courses
- `['exams', filters]` - Exam schedules
- `['currentUser']` - Authentication state
- `['programs', institutionId]` - Academic programs

## Troubleshooting with DevTools

### Issue: Data not loading
1. Check query status (error? fetching?)
2. Inspect error message
3. Verify queryKey is correct
4. Check if queryFn is defined

### Issue: Data outdated
1. Check "Last Updated" timestamp
2. Verify staleTime setting (5 min default)
3. Manually refetch or invalidate

### Issue: Too many refetches
1. Monitor query in DevTools
2. Count refetch frequency
3. Adjust staleTime if needed
4. Check refetchOnWindowFocus setting

---

**Enjoy debugging with React Query DevTools! 🎉**

The floating icon will appear in the bottom-right corner when you run `npm run dev` in the frontend.
