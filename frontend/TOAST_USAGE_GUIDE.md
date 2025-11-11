# Toast Notification Usage Guide (Sonner)

The application now uses **Sonner** for toast notifications, which provides a cleaner and more modern toast system.

## Basic Usage

### Import
```typescript
import { toast } from 'sonner';
```

### Success Toast
```typescript
toast.success('Operation completed successfully!');
```

### Error Toast
```typescript
toast.error('Something went wrong!');
```

### Info Toast
```typescript
toast.info('Here is some information');
```

### Warning Toast
```typescript
toast.warning('Warning: Please be careful');
```

### Loading Toast
```typescript
const toastId = toast.loading('Loading...');
// Later, dismiss it
toast.dismiss(toastId);
```

### Promise Toast (Auto handles loading/success/error)
```typescript
toast.promise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded successfully!',
    error: 'Failed to load data',
  }
);
```

### Custom Toast with Actions
```typescript
toast('New message', {
  action: {
    label: 'View',
    onClick: () => console.log('View clicked'),
  },
});
```

### Toast with Duration
```typescript
toast.success('This will disappear after 5 seconds', {
  duration: 5000, // 5 seconds
});
```

## Setup

The `<Toaster />` component is already added to `App.tsx` at the root level. No additional setup is required.

## Examples in the Codebase

See `ScriptSubmissionOversightPage.tsx` for real-world usage examples:

```typescript
// Success toast
toast.success(data.message || 'Batch scripts created successfully');

// Error toast
toast.error(error.message || 'Failed to create batch scripts');
```

## Migration from Old Toast System

**Old Way (Custom Hook):**
```typescript
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();
toast({
  title: 'Success',
  description: 'Operation completed',
  variant: 'default',
});
```

**New Way (Sonner):**
```typescript
import { toast } from 'sonner';

toast.success('Operation completed');
```

## Benefits of Sonner

- ✅ Simpler API
- ✅ Better animations
- ✅ Automatic positioning
- ✅ Promise support
- ✅ No custom hook needed
- ✅ Better TypeScript support
- ✅ Smaller bundle size
