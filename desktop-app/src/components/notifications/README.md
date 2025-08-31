# Notification Dropdown Component

A modern, responsive notification dropdown component built with shadcn/ui and Tailwind CSS for the ELMS desktop application.

## Features

- 🎨 **Modern Design**: Clean, consistent design using shadcn/ui components
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- 🎯 **Priority-based**: Visual indicators for different notification priorities
- 🔄 **Real-time Updates**: Support for marking notifications as read/unread
- 🗑️ **Easy Management**: Delete individual notifications or mark all as read
- 🌙 **Dark Mode**: Full dark mode support
- ⚡ **Performance**: Optimized with proper React patterns

## Installation

The component uses the following shadcn/ui components:
- `dropdown-menu`
- `scroll-area`
- `button`
- `badge`

Install them if not already available:

```bash
npx shadcn@latest add dropdown-menu scroll-area button badge
```

## Usage

### Basic Usage

```tsx
import { NotificationDropdown } from '@/components/notifications';

const MyComponent = () => {
  const [notifications, setNotifications] = useState([]);

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleDelete = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationDropdown
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onDelete={handleDelete}
    />
  );
};
```

### Advanced Usage with All Callbacks

```tsx
import { NotificationDropdown } from '@/components/notifications';

const MyComponent = () => {
  const [notifications, setNotifications] = useState([]);

  const handleMarkAsRead = (id) => {
    // Mark single notification as read
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = () => {
    // Mark all notifications as read
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const handleDelete = (id) => {
    // Delete a notification
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleViewAll = () => {
    // Navigate to full notifications page
    navigate('/notifications');
  };

  return (
    <NotificationDropdown
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onDelete={handleDelete}
      onViewAll={handleViewAll}
      className="custom-class"
    />
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `notifications` | `Notification[]` | ✅ | Array of notification objects |
| `onMarkAsRead` | `(id: string) => void` | ❌ | Callback when marking a notification as read |
| `onMarkAllAsRead` | `() => void` | ❌ | Callback when marking all notifications as read |
| `onDelete` | `(id: string) => void` | ❌ | Callback when deleting a notification |
| `onViewAll` | `() => void` | ❌ | Callback when clicking "View All Notifications" |
| `className` | `string` | ❌ | Additional CSS classes for the trigger button |

## Notification Object Structure

```typescript
interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'script' | 'exam' | 'incident' | 'system' | 'user';
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
```

## Styling

The component uses Tailwind CSS classes and follows the app's design system:

- **Colors**: Uses slate color palette with proper dark mode support
- **Icons**: Lucide React icons for consistent iconography
- **Spacing**: Consistent padding and margins using Tailwind spacing scale
- **Typography**: Proper text hierarchy with responsive font sizes
- **Animations**: Smooth transitions and hover effects

## Responsive Design

- **Desktop**: Full dropdown with scrollable content
- **Mobile**: Optimized layout with touch-friendly interactions
- **Tablet**: Adaptive layout that works on medium screens

## Accessibility

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and roles
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets WCAG guidelines

## Demo

To see the component in action, use the `NotificationDropdownDemo` component:

```tsx
import { NotificationDropdownDemo } from '@/components/notifications';

// Render the demo component
<NotificationDropdownDemo />
```

## Integration with Existing Code

The component is designed to work seamlessly with the existing `NotificationCenter` component. You can use both components in different parts of your application:

- Use `NotificationDropdown` for compact header notifications
- Use `NotificationCenter` for full-screen notification management

## Customization

The component can be customized by:

1. **Styling**: Modify the Tailwind classes in the component
2. **Icons**: Replace Lucide icons with custom ones
3. **Layout**: Adjust the dropdown content structure
4. **Behavior**: Add custom callbacks and interactions

## Dependencies

- React 18+
- Tailwind CSS
- shadcn/ui components
- Lucide React icons
- Radix UI primitives (via shadcn/ui)
