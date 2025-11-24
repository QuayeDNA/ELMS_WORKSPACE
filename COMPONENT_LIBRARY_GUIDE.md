# ELMS Mobile Component Library Usage Guide

## Quick Start

Import components from the central UI library:

```typescript
import {
  Button,
  Card,
  Typography,
  Input,
  Badge,
  Alert,
  // ... and more
} from '@/components/ui';
```

---

## Components

### Button

Primary action button with variants, sizes, and loading state.

```tsx
import { Button } from '@/components/ui';

// Default primary button
<Button onPress={() => console.log('Clicked')}>
  Submit
</Button>

// With variants
<Button variant="outline">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="success">Confirm</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With loading state
<Button loading disabled>Processing...</Button>

// With icons
<Button leftIcon="checkmark" rightIcon="arrow-forward">
  Continue
</Button>
```

**Props:**
- `variant`: 'default' | 'outline' | 'ghost' | 'destructive' | 'success'
- `size`: 'sm' | 'md' | 'lg' | 'icon'
- `loading`: boolean
- `leftIcon`, `rightIcon`: Ionicons name

---

### Card

Surface container with header, content, and footer.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card variant="elevated">
  <CardHeader>
    <Typography variant="titleMedium">Session Details</Typography>
  </CardHeader>

  <CardContent>
    <Typography>Course: CE201</Typography>
    <Typography>Students: 45</Typography>
  </CardContent>

  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

**Props:**
- `variant`: 'default' | 'outlined' | 'elevated'

---

### Typography

Text component with Material Design 3 variants.

```tsx
import { Typography, Heading, Title, Body, Label } from '@/components/ui';

// Using variants
<Typography variant="headlineLarge">Main Heading</Typography>
<Typography variant="bodyMedium" color="secondary">Description</Typography>

// Using convenience components
<Heading level={1}>Page Title</Heading>
<Title size="lg">Section Title</Title>
<Body size="md">Body text goes here</Body>
<Label size="sm">Input Label</Label>
```

**Props:**
- `variant`: 12 MD3 variants (displayLarge → labelSmall)
- `color`: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning'

---

### Input

Form input with label, validation, and password toggle.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
  error={errors.email}
  helperText="We'll never share your email"
/>

// Password input with toggle
<Input
  label="Password"
  secureTextEntry
  leftIcon="lock-closed"
/>

// With icons
<Input
  leftIcon="search"
  placeholder="Search students..."
/>
```

**Props:**
- `label`: string
- `error`: string (shows red border + error text)
- `helperText`: string
- `leftIcon`, `rightIcon`: Ionicons name
- `secureTextEntry`: boolean (shows eye toggle)

---

### Badge

Status and role indicators.

```tsx
import { Badge, RoleBadge } from '@/components/ui';

// Status badges
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Cancelled</Badge>

// Size variants
<Badge size="sm">Small</Badge>
<Badge size="lg">Large</Badge>

// Role badges
<RoleBadge role="LECTURER" />
<RoleBadge role="INVIGILATOR" />
<RoleBadge role="HOD" />
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `role`: User role for RoleBadge

---

### Alert

Contextual notifications with icons.

```tsx
import { Alert } from '@/components/ui';

<Alert variant="info" title="Information">
  Session starts at 9:00 AM
</Alert>

<Alert variant="success">
  Script submitted successfully
</Alert>

<Alert
  variant="error"
  dismissible
  onDismiss={() => setShowAlert(false)}
>
  Failed to scan QR code
</Alert>
```

**Props:**
- `variant`: 'info' | 'success' | 'warning' | 'error'
- `title`: string (optional header)
- `dismissible`: boolean
- `onDismiss`: function

---

### ListItem

Touchable row for scrollable lists.

```tsx
import { ListItem } from '@/components/ui';

<ListItem
  title="CE201 - Data Structures"
  subtitle="Hall A • 45 students"
  description="Today at 9:00 AM"
  leftIcon="document-text"
  leftIconColor="#2563eb"
  showChevron
  onPress={() => navigation.navigate('SessionDetails')}
/>

// With custom right element
<ListItem
  title="John Doe"
  subtitle="Index: 123456"
  rightElement={<Badge variant="success">Registered</Badge>}
/>
```

**Props:**
- `title`: string (required)
- `subtitle`, `description`: string
- `leftIcon`, `rightIcon`: Ionicons name
- `rightElement`: React node
- `showChevron`: boolean
- `variant`: 'default' | 'compact'

---

### FAB (Floating Action Button)

Primary action button with elevation.

```tsx
import { FAB } from '@/components/ui';

<FAB
  icon="camera"
  onPress={() => startScanning()}
  style={{ position: 'absolute', bottom: 16, right: 16 }}
/>

// With variants
<FAB icon="add" variant="success" />
<FAB icon="close" variant="error" size="md" />
```

**Props:**
- `icon`: Ionicons name (required)
- `variant`: 'primary' | 'secondary' | 'success' | 'error'
- `size`: 'md' | 'lg'
- `loading`: boolean

---

### Avatar

User profile image with fallback initials.

```tsx
import { Avatar, AvatarGroup } from '@/components/ui';

<Avatar
  src="https://example.com/avatar.jpg"
  name="John Doe"
  size="lg"
/>

// Without image (shows initials)
<Avatar name="Jane Smith" />

// Avatar group with overlap
<AvatarGroup
  avatars={[
    { name: "John Doe", src: "..." },
    { name: "Jane Smith" },
    { name: "Bob Wilson" },
  ]}
  max={3}
/>
```

**Props:**
- `src`: string | null
- `name`: string (for initials)
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
- `variant`: 'circle' | 'square'

---

### Divider

Separator with optional label.

```tsx
import { Divider } from '@/components/ui';

// Simple horizontal divider
<Divider />

// With label
<Divider label="OR" labelPosition="center" />

// Vertical divider
<Divider orientation="vertical" />

// Dashed variant
<Divider variant="dashed" thickness="medium" />
```

**Props:**
- `orientation`: 'horizontal' | 'vertical'
- `variant`: 'solid' | 'dashed'
- `thickness`: 'thin' | 'medium' | 'thick'
- `label`: string
- `labelPosition`: 'left' | 'center' | 'right'

---

### Loading

Loading indicators and skeleton placeholders.

```tsx
import {
  Spinner,
  Skeleton,
  SkeletonCard,
  SkeletonList,
  LoadingOverlay
} from '@/components/ui';

// Simple spinner
<Spinner centered />

// Skeleton placeholders
<Skeleton width="100%" height={20} />
<Skeleton variant="circular" width={40} height={40} />

// Skeleton cards (loading state)
<SkeletonCard lines={3} showAvatar />

// Skeleton list
<SkeletonList count={5} />

// Full-screen overlay
<LoadingOverlay visible={isLoading} text="Processing..." />
```

**Props:**
- `Spinner`: size, color, centered
- `Skeleton`: width, height, variant ('text' | 'circular' | 'rectangular'), animated
- `SkeletonCard`: lines, showAvatar
- `SkeletonList`: count, showAvatar
- `LoadingOverlay`: visible, text, color

---

### Chip

Small labeled buttons for filters and tags.

```tsx
import { Chip, ChipGroup } from '@/components/ui';

<Chip label="Active" variant="filled" color="success" />

// With icons
<Chip label="Filter" leftIcon="filter" />

// Deletable
<Chip label="Tag" onDelete={() => removeTag()} />

// Chip group for filters
<ChipGroup
  chips={[
    { id: '1', label: 'Active' },
    { id: '2', label: 'Pending' },
    { id: '3', label: 'Completed' },
  ]}
  selectedIds={selectedFilters}
  onSelect={handleFilterChange}
  multiSelect
/>
```

**Props:**
- `label`: string (required)
- `variant`: 'default' | 'outlined' | 'filled'
- `color`: 'primary' | 'success' | 'warning' | 'error' | 'neutral'
- `size`: 'sm' | 'md'
- `selected`: boolean
- `leftIcon`, `rightIcon`: Ionicons name
- `onDelete`: function

---

### Modal & BottomSheet

Full-screen dialogs and bottom sheets.

```tsx
import { Modal, BottomSheet } from '@/components/ui';

// Full modal
<Modal
  visible={showModal}
  onClose={() => setShowModal(false)}
  title="Confirm Submission"
  subtitle="Please review before submitting"
  size="md"
  footer={
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button variant="outline" onPress={onClose}>Cancel</Button>
      <Button onPress={onSubmit}>Submit</Button>
    </View>
  }
>
  <Typography>Are you sure you want to submit this batch?</Typography>
</Modal>

// Bottom sheet
<BottomSheet
  visible={showSheet}
  onClose={() => setShowSheet(false)}
  title="Select Action"
  snapPoint="50%"
>
  <ListItem title="Scan Student" leftIcon="camera" />
  <ListItem title="Bulk Submit" leftIcon="cloud-upload" />
</BottomSheet>
```

**Props:**
- `visible`: boolean (required)
- `onClose`: function (required)
- `title`, `subtitle`: string
- `size`: 'sm' | 'md' | 'lg' | 'full' (Modal only)
- `snapPoint`: '25%' | '50%' | '75%' | '90%' (BottomSheet only)
- `scrollable`: boolean
- `footer`: React node

---

### ScreenContainer

Safe area wrapper with scroll and pull-to-refresh.

```tsx
import {
  ScreenContainer,
  ScreenHeader,
  Section,
  EmptyState
} from '@/components/ui';

<ScreenContainer
  scrollable
  refreshing={isRefreshing}
  onRefresh={handleRefresh}
>
  <ScreenHeader
    title="My Sessions"
    subtitle="Today's schedule"
    leftAction={<Button variant="ghost" leftIcon="menu" />}
    rightAction={<Button variant="ghost" leftIcon="notifications" />}
  />

  <Section title="Active Sessions" spacing="lg">
    {sessions.map(session => (
      <ListItem key={session.id} {...session} />
    ))}
  </Section>

  {sessions.length === 0 && (
    <EmptyState
      icon="calendar-outline"
      title="No Active Sessions"
      description="You have no exam sessions assigned today"
      action={<Button>Refresh</Button>}
    />
  )}
</ScreenContainer>
```

**Props:**
- `ScreenContainer`: scrollable, refreshing, onRefresh, edges
- `ScreenHeader`: title, subtitle, leftAction, rightAction, variant
- `Section`: title, titleAction, spacing
- `EmptyState`: icon, title, description, action

---

## Design Tokens

Access design tokens directly:

```tsx
import { colors, typography, spacing } from '@/components/ui';

// Colors
const primaryColor = colors.primary[600]; // #2563eb
const errorColor = colors.error[500]; // #ef4444
const textColor = colors.text.primary; // neutral-900

// Typography
const headingStyle = typography.headlineLarge;
// { fontSize: 32, lineHeight: 40, fontWeight: '600' }

// Spacing
const padding = spacing.lg; // 16
const borderRadius = spacing.borderRadius.xl; // 14
const elevation = spacing.elevation.md;
// { shadowColor, shadowOffset, shadowOpacity, shadowRadius, elevation }
```

---

## Best Practices

### 1. Consistent Spacing
Use design tokens for spacing:
```tsx
<View style={{ padding: spacing.md, gap: spacing.sm }}>
```

### 2. Accessibility
Always provide accessibility props:
```tsx
<Button accessibilityLabel="Submit exam scripts">
  Submit
</Button>
```

### 3. Loading States
Show feedback during async operations:
```tsx
<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>
```

### 4. Error Handling
Display clear error messages:
```tsx
<Alert variant="error" dismissible onDismiss={clearError}>
  {errorMessage}
</Alert>
```

### 5. Empty States
Always handle empty data:
```tsx
{items.length === 0 ? (
  <EmptyState
    icon="document-text-outline"
    title="No Items"
    description="There are no items to display"
  />
) : (
  items.map(item => <ListItem key={item.id} {...item} />)
)}
```

---

## Common Patterns

### Form with Validation
```tsx
<View>
  <Input
    label="Student Index"
    value={index}
    onChangeText={setIndex}
    error={errors.index}
    leftIcon="person"
  />

  <Input
    label="Course Code"
    value={courseCode}
    onChangeText={setCourseCode}
    error={errors.courseCode}
    leftIcon="book"
  />

  <Button
    onPress={handleSubmit}
    loading={isSubmitting}
    disabled={!isValid}
  >
    Submit
  </Button>
</View>
```

### List with Empty State
```tsx
<ScreenContainer scrollable onRefresh={refetch}>
  {isLoading ? (
    <SkeletonList count={5} />
  ) : items.length === 0 ? (
    <EmptyState
      icon="document-text-outline"
      title="No Sessions"
      description="You have no active sessions"
      action={<Button onPress={refetch}>Refresh</Button>}
    />
  ) : (
    items.map(item => (
      <ListItem
        key={item.id}
        title={item.name}
        subtitle={item.subtitle}
        onPress={() => navigate(`/session/${item.id}`)}
        showChevron
      />
    ))
  )}
</ScreenContainer>
```

### Card with Actions
```tsx
<Card variant="elevated">
  <CardHeader>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Typography variant="titleMedium">Session Details</Typography>
      <Badge variant="success">Active</Badge>
    </View>
  </CardHeader>

  <CardContent>
    <Typography variant="bodyMedium">CE201 - Data Structures</Typography>
    <Typography variant="bodySmall" color="secondary">
      45 students • Hall A
    </Typography>
  </CardContent>

  <CardFooter>
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Button variant="outline">Cancel</Button>
      <Button>Start Scanning</Button>
    </View>
  </CardFooter>
</Card>
```

---

## Color System

```tsx
// Primary colors
colors.primary[50-900] // Blue scale
colors.primary[600] // Main brand color #2563eb

// Semantic colors
colors.success[500] // #22c55e
colors.warning[500] // #f59e0b
colors.error[500] // #ef4444
colors.info[600] // #0284c7

// Role colors
colors.roles.superAdmin // Red #dc2626
colors.roles.admin // Orange #ea580c
colors.roles.hod // Blue #2563eb
colors.roles.lecturer // Violet #7c3aed
colors.roles.invigilator // Cyan #0891b2
colors.roles.student // Slate #64748b

// Status colors
colors.status.draft // Gray
colors.status.pending // Amber
colors.status.active // Green
colors.status.completed // Blue
colors.status.cancelled // Red
colors.status.archived // Gray
```

---

## Typography Scale

```tsx
// Display (largest)
typography.displayLarge // 57px
typography.displayMedium // 45px
typography.displaySmall // 36px

// Headline
typography.headlineLarge // 32px
typography.headlineMedium // 28px
typography.headlineSmall // 24px

// Title
typography.titleLarge // 22px
typography.titleMedium // 16px
typography.titleSmall // 14px

// Body
typography.bodyLarge // 16px
typography.bodyMedium // 14px
typography.bodySmall // 12px

// Label (smallest)
typography.labelLarge // 14px
typography.labelMedium // 12px
typography.labelSmall // 11px
```

---

## Support

For issues or questions about the component library:
1. Check this guide first
2. Review component source code in `src/components/ui/`
3. Refer to Material Design 3 guidelines
4. Check ELMS_UI_DESIGN_SYSTEM.md for design specifications

---

*Last Updated: November 23, 2025*
*Component Library Version: 1.0*
