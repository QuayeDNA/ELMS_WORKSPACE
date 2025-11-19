# React Query Configuration Guide

## ✅ What Was Done

### 1. **React Query DevTools Configured** (`main.tsx`)
```typescript
<ReactQueryDevtools
  initialIsOpen={false}           // Closed by default
  position="bottom-right"         // Position on screen
  buttonPosition="bottom-right"   // Toggle button position
/>
```

### 2. **Query Client Configuration**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,                    // Retry failed queries 3 times
      staleTime: 5 * 60 * 1000,   // Data fresh for 5 minutes
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      refetchOnMount: true,        // Refetch when component mounts
      refetchOnReconnect: true,    // Refetch when reconnecting
    },
    mutations: {
      retry: 1,                    // Retry failed mutations once
    },
  },
})
```

### 3. **SuperAdminDashboard Updated**
Now uses React Query for:
- **System stats** (`/api/super-admin/stats`)
- **Current user profile** (`/api/auth/profile`)

**Query Keys:**
- `['superAdminStats']` - Dashboard statistics
- `['currentUser', userId]` - User profile

## 📊 How to Use React Query DevTools

### **Opening DevTools**
1. Look for the **React Query flower/atom icon** in the bottom-right corner
2. Click it to open the panel
3. You'll see all active queries and mutations

### **What You'll See**

#### **Dashboard Queries:**
```
Query: ['superAdminStats']
Status: success | loading | error
Data: { institutionsCount: 0, usersCount: 1, activeUsersCount: 1 }
```

```
Query: ['currentUser', 1]
Status: success
Data: { id: 1, email: "admin@elms.com", role: "SUPER_ADMIN", ... }
```

#### **Student Dashboard Queries:**
```
Query: ['studentProfile', 1]
Query: ['currentSemester']
Query: ['availableCourses', filters]
Query: ['studentRegistration', studentId]
```

### **DevTools Features**

#### **1. Query Inspector**
- Click any query to see:
  - Current data
  - Query status
  - Last updated time
  - Number of observers

#### **2. Manual Actions**
- **Refetch**: Manually trigger data refresh
- **Invalidate**: Mark as stale (will refetch)
- **Reset**: Clear error state
- **Remove**: Delete from cache

#### **3. Status Colors**
- 🟢 **Green (fresh)**: Data is fresh
- 🟡 **Yellow (fetching)**: Loading data
- 🔵 **Blue (stale)**: Needs refetch
- 🔴 **Red (error)**: Query failed
- ⚪ **Gray (inactive)**: Not mounted

## 🔧 Adding React Query to New Components

### **Example: Fetch Data**
```typescript
import { useQuery } from '@tanstack/react-query';
import { apiService } from '@/services/api';

function MyComponent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData', userId],
    queryFn: async () => {
      const response = await apiService.get('/api/my-endpoint');
      return response.data;
    },
    staleTime: 60000, // Optional: 1 minute
    enabled: !!userId, // Optional: only run if userId exists
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data}</div>;
}
```

### **Example: Mutation (POST/PUT/DELETE)**
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

function MyComponent() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiService.post('/api/create', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['myData'] });
    },
  });

  const handleSubmit = () => {
    mutation.mutate({ name: 'Test' });
  };

  return (
    <button onClick={handleSubmit} disabled={mutation.isPending}>
      {mutation.isPending ? 'Creating...' : 'Create'}
    </button>
  );
}
```

## 🎯 Query Key Patterns

### **Good Practices:**
```typescript
// User-specific data
['user', userId]
['userProfile', userId]

// List with filters
['students', { level: 1, semester: 1 }]
['courses', { programId: 5 }]

// Nested resources
['institution', institutionId, 'faculties']
['faculty', facultyId, 'departments']

// Detail pages
['student', studentId]
['course', courseId]
```

### **Why Query Keys Matter:**
- **Caching**: Same key = same cache
- **Invalidation**: Target specific data to refetch
- **Organization**: Easy to find in DevTools

## 🔄 Invalidation Examples

### **After Creating Data:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['students'] });
}
```

### **After Updating:**
```typescript
onSuccess: () => {
  // Invalidate list
  queryClient.invalidateQueries({ queryKey: ['students'] });
  // Invalidate specific student
  queryClient.invalidateQueries({ queryKey: ['student', studentId] });
}
```

### **After Deleting:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['students'] });
  queryClient.removeQueries({ queryKey: ['student', studentId] });
}
```

## 🚀 Performance Tips

### **1. Stale Time Configuration**
```typescript
staleTime: 5 * 60 * 1000  // 5 minutes - data rarely changes
staleTime: 30 * 1000      // 30 seconds - data changes often
staleTime: Infinity       // Never stale - static data
```

### **2. Enable/Disable Queries**
```typescript
enabled: !!userId  // Only fetch if userId exists
enabled: isOpen    // Only fetch when modal is open
```

### **3. Parallel Queries**
```typescript
// Both queries run in parallel automatically
const query1 = useQuery({ queryKey: ['data1'], ... });
const query2 = useQuery({ queryKey: ['data2'], ... });
```

### **4. Dependent Queries**
```typescript
const { data: user } = useQuery({ queryKey: ['user'] });
const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  enabled: !!user?.id, // Only run after user is loaded
});
```

## 🐛 Debugging with DevTools

### **Scenario 1: Data Not Updating**
1. Open DevTools
2. Find the query (e.g., `['students']`)
3. Check "Last Updated" timestamp
4. Click **Refetch** to manually update
5. If still not updating, check staleTime setting

### **Scenario 2: Query Not Running**
1. Check if `enabled: false` in query config
2. Verify query key is correct
3. Check if component is mounted
4. Look for errors in DevTools

### **Scenario 3: Multiple Refetches**
1. Monitor query in DevTools
2. Count refetch frequency
3. Check refetchOnWindowFocus, refetchOnMount settings
4. Adjust staleTime if needed

## 📦 Current Setup Summary

**Files Modified:**
- ✅ `main.tsx` - Query client + DevTools configured
- ✅ `SuperAdminDashboard.tsx` - Using React Query

**Queries Added:**
- `['superAdminStats']` - Dashboard stats
- `['currentUser', userId]` - User profile

**Default Settings:**
- Retry: 3 attempts for queries, 1 for mutations
- Stale Time: 5 minutes
- No refetch on window focus
- Refetch on mount and reconnect

**DevTools:**
- Position: Bottom-right corner
- Initially closed
- Available in development only

## 🎓 Next Steps

1. **Test DevTools**: Login and check bottom-right corner for icon
2. **Monitor Queries**: Watch SuperAdminDashboard queries in action
3. **Add More Queries**: Update other components to use React Query
4. **Optimize**: Adjust staleTime based on data change frequency

---

**React Query is now fully integrated! 🎉**

The DevTools will show all API calls made with `useQuery` and `useMutation`.
