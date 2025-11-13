# 🎨 ELMS UI Design System
## Examination Logistics Management System - Complete Design Documentation

---

## 📑 Table of Contents
1. [Design Philosophy](#design-philosophy)
2. [Brand Identity](#brand-identity)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing & Layout](#spacing--layout)
6. [Component Library](#component-library)
7. [Iconography](#iconography)
8. [Interaction Patterns](#interaction-patterns)
9. [Responsive Design](#responsive-design)
10. [Dark Mode](#dark-mode)
11. [Mobile App Guidelines](#mobile-app-guidelines)
12. [Accessibility](#accessibility)
13. [Implementation Guidelines](#implementation-guidelines)

---

## 🎯 Design Philosophy

### Core Principles

**1. Academic Professionalism**
- Clean, authoritative interface befitting educational institutions
- Professional color palette emphasizing trust and reliability
- Clear hierarchy reflecting institutional structures

**2. Efficiency-First**
- Streamlined workflows for exam coordination
- Quick access to critical information
- Minimal clicks to complete tasks

**3. Clarity & Readability**
- High contrast for extended reading sessions
- Clear typography for data-heavy tables
- Intuitive information architecture

**4. Consistency Across Platforms**
- Unified experience between web and mobile
- Shared design tokens and patterns
- Platform-specific optimizations where necessary

---

## 🏷️ Brand Identity

### System Name
**ELMS** - Examination Logistics Management System

### Brand Personality
- **Professional**: Enterprise-grade reliability
- **Efficient**: Fast, streamlined operations
- **Trustworthy**: Secure handling of academic data
- **Modern**: Contemporary design without sacrificing functionality

### Visual Direction
- Clean, minimalist interface
- Blue as primary color (trust, stability, academia)
- Generous white space
- Data-dense when needed, spacious when possible

---

## 🎨 Color System

### Primary Colors

#### Web (CSS Variables - OKLCH)
```css
/* Light Mode */
--primary: oklch(0.205 0 0);           /* Near Black - #1a1a1a */
--primary-foreground: oklch(0.985 0 0); /* Near White */

/* Recommended Update for Brand Identity */
--primary: oklch(0.51 0.18 252);       /* Blue 600 - #2563eb */
--primary-foreground: oklch(1 0 0);     /* Pure White */
```

#### Mobile (React Native)
```typescript
primary: '#2563eb',           // Blue 600
primaryContainer: '#dbeafe',  // Blue 100
onPrimary: '#ffffff',
```

### Semantic Color Palette

#### Success Colors
```css
/* Web */
--success: oklch(0.646 0.222 41.116);     /* Chart 1 Orange */
--success-foreground: oklch(1 0 0);

/* Mobile */
success: '#22c55e',              // Green 500
successContainer: '#d1fae5',     // Green 100
```

#### Warning Colors
```css
/* Web */
--warning: oklch(0.828 0.189 84.429);     /* Chart 4 Yellow */

/* Mobile */
warning: '#f59e0b',              // Amber 500
warningContainer: '#fef3c7',     // Amber 100
```

#### Error/Destructive Colors
```css
/* Web */
--destructive: oklch(0.577 0.245 27.325);  /* Red */

/* Mobile */
error: '#ef4444',                // Red 500
errorContainer: '#fef2f2',       // Red 50
```

#### Info Colors
```css
/* Mobile */
info: '#0284c7',                 // Sky 600
infoContainer: '#e0f2fe',        // Sky 50
```

### Neutral Colors

#### Web Background & Surfaces
```css
/* Light Mode */
--background: oklch(1 0 0);              /* Pure White */
--foreground: oklch(0.145 0 0);          /* Dark Gray */
--card: oklch(1 0 0);                    /* White */
--muted: oklch(0.97 0 0);               /* Light Gray */
--border: oklch(0.922 0 0);             /* Border Gray */

/* Dark Mode */
--background: oklch(0.145 0 0);          /* Dark */
--foreground: oklch(0.985 0 0);          /* Light */
--card: oklch(0.205 0 0);               /* Dark Card */
--muted: oklch(0.269 0 0);              /* Dark Muted */
--border: oklch(1 0 0 / 10%);           /* Transparent Border */
```

### Role-Based Colors (Academic Hierarchy)

```typescript
const roleColors = {
  SUPER_ADMIN: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200'
  },
  ADMIN: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200'
  },
  DEAN: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200'
  },
  HOD: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-800',
    border: 'border-cyan-200'
  },
  FACULTY_ADMIN: {
    bg: 'bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-200'
  },
  INSTRUCTOR: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200'
  },
  STUDENT: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200'
  }
}
```

### Chart Colors
```css
/* Data Visualization Palette */
--chart-1: oklch(0.646 0.222 41.116);    /* Orange */
--chart-2: oklch(0.6 0.118 184.704);      /* Blue */
--chart-3: oklch(0.398 0.07 227.392);     /* Dark Blue */
--chart-4: oklch(0.828 0.189 84.429);     /* Yellow */
--chart-5: oklch(0.769 0.188 70.08);      /* Green */
```

---

## ✍️ Typography

### Font Families

#### Web Application
```css
/* Primary Font */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans',
             'Droid Sans', 'Helvetica Neue', sans-serif;

/* Recommended: Inter for modern feel */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Monospace for code/IDs */
font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code',
             'Courier New', monospace;
```

#### Mobile Application
```typescript
fontFamily: {
  inter: ['Inter', 'sans-serif'],
  roboto: ['Roboto', 'sans-serif'],
}
```

### Type Scale

#### Web Typography (Tailwind Classes)

```css
/* Display - Large hero text */
.text-display-lg {
  font-size: 3.5rem;      /* 56px */
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
}

/* Headings */
.text-h1 {
  font-size: 2.25rem;     /* 36px */
  line-height: 1.2;
  font-weight: 700;
}

.text-h2 {
  font-size: 1.875rem;    /* 30px */
  line-height: 1.3;
  font-weight: 600;
}

.text-h3 {
  font-size: 1.5rem;      /* 24px */
  line-height: 1.4;
  font-weight: 600;
}

.text-h4 {
  font-size: 1.25rem;     /* 20px */
  line-height: 1.5;
  font-weight: 600;
}

/* Body Text */
.text-body-lg {
  font-size: 1.125rem;    /* 18px */
  line-height: 1.6;
  font-weight: 400;
}

.text-body {
  font-size: 1rem;        /* 16px */
  line-height: 1.5;
  font-weight: 400;
}

.text-body-sm {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.5;
  font-weight: 400;
}

/* Labels & Captions */
.text-label {
  font-size: 0.875rem;    /* 14px */
  line-height: 1.4;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.text-caption {
  font-size: 0.75rem;     /* 12px */
  line-height: 1.4;
  font-weight: 400;
  letter-spacing: 0.01em;
}
```

#### Mobile Typography

```typescript
// Material Design 3 Typography Scale
typography: {
  displayLarge: { fontSize: 57, lineHeight: 64, fontWeight: '400' },
  displayMedium: { fontSize: 45, lineHeight: 52, fontWeight: '400' },
  displaySmall: { fontSize: 36, lineHeight: 44, fontWeight: '400' },

  headlineLarge: { fontSize: 32, lineHeight: 40, fontWeight: '400' },
  headlineMedium: { fontSize: 28, lineHeight: 36, fontWeight: '400' },
  headlineSmall: { fontSize: 24, lineHeight: 32, fontWeight: '400' },

  titleLarge: { fontSize: 22, lineHeight: 28, fontWeight: '500' },
  titleMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  titleSmall: { fontSize: 14, lineHeight: 20, fontWeight: '500' },

  bodyLarge: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyMedium: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  bodySmall: { fontSize: 12, lineHeight: 16, fontWeight: '400' },

  labelLarge: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  labelMedium: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  labelSmall: { fontSize: 11, lineHeight: 16, fontWeight: '500' },
}
```

### Font Weights
```css
--font-light: 300;
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

---

## 📐 Spacing & Layout

### Spacing Scale

#### Web (Tailwind)
```typescript
spacing: {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px

  // Custom
  18: '4.5rem',     // 72px
  88: '22rem',      // 352px
}
```

#### Mobile
```typescript
spacing: {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
}
```

### Border Radius

#### Web
```css
--radius: 0.625rem;         /* 10px - Base radius */
--radius-sm: 0.375rem;      /* 6px */
--radius-md: 0.5rem;        /* 8px */
--radius-lg: 0.625rem;      /* 10px */
--radius-xl: 0.875rem;      /* 14px */
--radius-2xl: 1rem;         /* 16px */
--radius-3xl: 1.5rem;       /* 24px */
--radius-4xl: 2rem;         /* 32px */
--radius-full: 9999px;      /* Pill shape */
```

#### Mobile
```typescript
borderRadius: {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
}
```

### Grid System

#### Web - Responsive Grid
```css
/* Container Max Widths */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
--container-2xl: 1536px;

/* Grid Columns */
.grid-cols-1    /* Mobile */
.grid-cols-2    /* Tablet */
.grid-cols-3    /* Desktop */
.grid-cols-4    /* Large Desktop */
.grid-cols-12   /* Full Grid */
```

### Layout Patterns

#### Dashboard Layout
```typescript
interface DashboardLayout {
  header: '4rem',           // Fixed header
  sidebar: {
    expanded: '16rem',      // 256px
    collapsed: '4rem',      // 64px
  },
  content: {
    maxWidth: '1536px',     // 2xl container
    padding: '1.5rem',      // 24px
  }
}
```

#### Card Layouts
```css
/* Standard Card */
.card-standard {
  padding: 1.5rem;        /* 24px */
  border-radius: 0.75rem; /* 12px */
  gap: 1rem;              /* 16px between elements */
}

/* Compact Card */
.card-compact {
  padding: 1rem;          /* 16px */
  border-radius: 0.5rem;  /* 8px */
  gap: 0.75rem;           /* 12px */
}

/* Feature Card */
.card-feature {
  padding: 2rem;          /* 32px */
  border-radius: 1rem;    /* 16px */
  gap: 1.5rem;            /* 24px */
}
```

---

## 🧩 Component Library

### Button Variants

#### Web Implementation
```tsx
// Primary Button
<Button variant="default" size="default">
  Submit
</Button>

// Secondary Button
<Button variant="outline" size="default">
  Cancel
</Button>

// Ghost Button (Minimal)
<Button variant="ghost" size="sm">
  Edit
</Button>

// Destructive Button
<Button variant="destructive" size="default">
  Delete
</Button>

// Icon Button
<Button variant="ghost" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

#### Button States
```css
/* Default State */
.btn-default {
  background: var(--primary);
  color: var(--primary-foreground);
  shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Hover State */
.btn-default:hover {
  background: var(--primary)/90;
  transform: translateY(-1px);
  shadow: 0 4px 6px rgba(0,0,0,0.1);
}

/* Active/Pressed State */
.btn-default:active {
  transform: translateY(0);
  shadow: 0 1px 2px rgba(0,0,0,0.05);
}

/* Disabled State */
.btn-default:disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Focus State */
.btn-default:focus-visible {
  outline: 3px solid var(--ring)/50;
  outline-offset: 2px;
}
```

### Card Components

#### Standard Card Structure
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Brief description</CardDescription>
    <CardAction>
      <Button variant="ghost" size="sm">Action</Button>
    </CardAction>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

#### Card Variants
```typescript
// Info Card
<Card className="bg-blue-50 border-blue-200">
  <CardContent className="flex items-start gap-3">
    <Info className="h-5 w-5 text-blue-600" />
    <div>Information message</div>
  </CardContent>
</Card>

// Stats Card
<Card>
  <CardHeader>
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Total Students
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">1,234</div>
    <p className="text-xs text-muted-foreground">
      +12% from last semester
    </p>
  </CardContent>
</Card>

// Action Card
<Card className="hover:shadow-lg transition-shadow cursor-pointer">
  <CardContent className="flex items-center gap-4 p-6">
    <Building className="h-10 w-10 text-primary" />
    <div>
      <h3 className="font-semibold">Institutions</h3>
      <p className="text-sm text-muted-foreground">
        Manage institutions
      </p>
    </div>
  </CardContent>
</Card>
```

### Form Components

#### Input Fields
```tsx
// Standard Input
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="user@example.com"
  />
</div>

// Input with Icon
<div className="relative">
  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
  <Input
    className="pl-10"
    placeholder="Search..."
  />
</div>

// Input with Error
<div className="space-y-2">
  <Label htmlFor="password">Password</Label>
  <Input
    id="password"
    type="password"
    aria-invalid="true"
    className="border-destructive"
  />
  <p className="text-sm text-destructive">
    Password is required
  </p>
</div>
```

#### Select Dropdown
```tsx
<Select>
  <SelectTrigger className="w-[200px]">
    <SelectValue placeholder="Select role" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="admin">Admin</SelectItem>
    <SelectItem value="instructor">Instructor</SelectItem>
    <SelectItem value="student">Student</SelectItem>
  </SelectContent>
</Select>
```

### Table Components

#### Data Table Structure
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
      <TableHead>Role</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
      <TableCell>
        <Badge>Student</Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm">Edit</Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Badge Component

#### Badge Variants
```tsx
// Default Badge
<Badge>New</Badge>

// Status Badges
<Badge variant="secondary">Draft</Badge>
<Badge variant="outline">Pending</Badge>
<Badge variant="destructive">Inactive</Badge>

// Role Badges (Custom)
<Badge className="bg-blue-100 text-blue-800">Admin</Badge>
<Badge className="bg-green-100 text-green-800">Instructor</Badge>
<Badge className="bg-amber-100 text-amber-800">Student</Badge>
```

### Dialog/Modal

#### Modal Structure
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here.
      </DialogDescription>
    </DialogHeader>
    {/* Form content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Save Changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

#### Dialog Form Layout Pattern

**Two-Column Responsive Layout:**
All dialog forms should use a consistent two-column layout that provides optimal space utilization and data clarity.

**Layout Rules:**
- **Small screens (< 768px)**: Single column `grid-cols-1`
- **Medium+ screens (≥ 768px)**: Two columns `md:grid-cols-2`
- **Gap**: `gap-4` between grid items (16px)
- **Section gap**: `gap-6` between major sections (24px)
- **Full-width elements**: Use entire grid width for textareas, descriptions, and context-specific fields

**Implementation Example:**
```tsx
<DialogContent className="max-w-4xl max-h-[90vh]">
  <ScrollArea className="max-h-[calc(90vh-180px)]">
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <UserPlus className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-xl font-bold">Add New User</div>
          <DialogDescription>Create a new user account</DialogDescription>
        </div>
      </DialogTitle>
    </DialogHeader>

    <div className="space-y-6 p-6">
      {/* Two-column form layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" placeholder="Doe" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="john.doe@university.edu" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" placeholder="+1 (555) 123-4567" />
        </div>
      </div>

      {/* Full-width element example */}
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea id="address" placeholder="Enter full address" rows={3} />
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button onClick={onSubmit}>Create User</Button>
    </DialogFooter>
  </ScrollArea>
</DialogContent>
```

**Benefits:**
- **Maximum space utilization**: Two columns on larger screens make efficient use of dialog width
- **Clear data display**: Proper spacing prevents visual clutter
- **Responsive without custom breakpoints**: Standard `md:` breakpoint works for all screen sizes
- **Consistent pattern**: Same layout across all forms (create, edit, view)
- **Better UX**: Related fields can be grouped logically in pairs

**Common Field Pairs:**
- First Name / Last Name
- Email / Phone
- Password / Confirm Password
- Date of Birth / Gender
- Institution / Department
- Start Date / End Date

**Full-Width Elements:**
- Address fields
- Description/Notes textareas
- Rich text editors
- File upload areas
- Multi-select components with many options

### Alert Components

```tsx
// Info Alert
<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    Your session will expire in 5 minutes.
  </AlertDescription>
</Alert>

// Warning Alert
<Alert variant="warning" className="border-amber-200 bg-amber-50">
  <AlertTriangle className="h-4 w-4 text-amber-600" />
  <AlertTitle className="text-amber-900">Warning</AlertTitle>
  <AlertDescription className="text-amber-800">
    Please review before submitting.
  </AlertDescription>
</Alert>

// Error Alert
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    Failed to load data. Please try again.
  </AlertDescription>
</Alert>
```

---

## 🎯 Iconography

### Icon Library
**Primary**: Lucide React (Web) / Material Community Icons (Mobile)

### Icon Sizes
```typescript
// Web
iconSizes: {
  xs: 'h-3 w-3',      // 12px
  sm: 'h-4 w-4',      // 16px
  md: 'h-5 w-5',      // 20px
  lg: 'h-6 w-6',      // 24px
  xl: 'h-8 w-8',      // 32px
  xxl: 'h-10 w-10',   // 40px
}
```

### Icon Usage Patterns

#### Navigation Icons
```typescript
const navigationIcons = {
  dashboard: LayoutDashboard,
  institutions: Building,
  users: Users,
  students: GraduationCap,
  faculty: Building2,
  courses: BookOpen,
  exams: FileCheck,
  calendar: Calendar,
  settings: Settings,
  reports: BarChart3,
  incidents: AlertTriangle,
}
```

#### Action Icons
```typescript
const actionIcons = {
  add: Plus,
  edit: Edit,
  delete: Trash2,
  view: Eye,
  search: Search,
  filter: Filter,
  download: Download,
  upload: Upload,
  save: Save,
  close: X,
  more: MoreVertical,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
}
```

#### Status Icons
```typescript
const statusIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  pending: Clock,
  active: CheckCircle2,
  inactive: XCircle,
}
```

---

## 🎬 Interaction Patterns

### Animations

#### Web Animations
```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Slide Up */
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

/* Slide In from Right */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Pulse (Loading) */
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse-slow {
  animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Transition Classes
```css
/* Smooth transitions */
.transition-base {
  transition: all 0.2s ease-in-out;
}

.transition-colors {
  transition: color 0.2s, background-color 0.2s, border-color 0.2s;
}

.transition-transform {
  transition: transform 0.2s ease-in-out;
}

.transition-shadow {
  transition: box-shadow 0.2s ease-in-out;
}
```

### Hover Effects

```css
/* Card Hover */
.card-hover {
  transition: all 0.2s ease-in-out;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

/* Button Hover */
.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

/* Link Hover */
.link-hover {
  position: relative;
}
.link-hover::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: currentColor;
  transition: width 0.3s ease;
}
.link-hover:hover::after {
  width: 100%;
}
```

### Loading States

```tsx
// Skeleton Loader
<div className="space-y-3">
  <Skeleton className="h-4 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>

// Spinner
<div className="flex items-center justify-center">
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
</div>

// Progress Bar
<div className="w-full bg-gray-200 rounded-full h-2">
  <div
    className="bg-primary h-2 rounded-full transition-all duration-300"
    style={{ width: '60%' }}
  ></div>
</div>
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
// Web (Tailwind)
breakpoints: {
  sm: '640px',    // Mobile landscape
  md: '768px',    // Tablet
  lg: '1024px',   // Desktop
  xl: '1280px',   // Large desktop
  '2xl': '1536px' // Extra large
}

// Usage
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Responsive Patterns

#### Sidebar Behavior
```typescript
// Mobile: Hidden by default, overlay when open
// Tablet: Collapsible sidebar
// Desktop: Persistent sidebar, collapsible

<div className="lg:flex">
  {/* Mobile Overlay */}
  <div className="lg:hidden">
    {sidebarOpen && <Sidebar />}
  </div>

  {/* Desktop Sidebar */}
  <div className="hidden lg:block">
    <Sidebar collapsed={collapsed} />
  </div>
</div>
```

#### Grid Layouts
```tsx
// Dashboard Cards
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {dashboardCards.map(card => <Card key={card.id} {...card} />)}
</div>

// Table Responsive
<div className="overflow-x-auto">
  <Table className="min-w-[800px]">
    {/* Table content */}
  </Table>
</div>
```

#### Typography Scaling
```css
/* Responsive heading sizes */
.responsive-h1 {
  @apply text-2xl sm:text-3xl lg:text-4xl;
}

.responsive-h2 {
  @apply text-xl sm:text-2xl lg:text-3xl;
}

.responsive-body {
  @apply text-sm sm:text-base;
}
```

---

## 🌙 Dark Mode

### Implementation Strategy

#### Web - CSS Variables Approach
```tsx
// Theme Provider
import { ThemeProvider } from 'next-themes'

<ThemeProvider attribute="class" defaultTheme="system">
  <App />
</ThemeProvider>

// Toggle Component
<Button
  variant="ghost"
  size="icon"
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
>
  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
</Button>
```

#### Dark Mode Colors
Already defined in CSS variables:
```css
.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  /* ... see Color System section */
}
```

#### Mobile Dark Mode
```typescript
// Uses React Native Paper's theme provider
import { useColorScheme } from 'react-native';

const scheme = useColorScheme();
const theme = scheme === 'dark' ? darkTheme : lightTheme;
```

### Dark Mode Best Practices
1. **Contrast**: Ensure minimum 4.5:1 ratio
2. **Borders**: Use subtle borders (10-15% opacity)
3. **Elevation**: Use shadows sparingly, prefer borders
4. **Colors**: Reduce saturation slightly in dark mode

---

## 📱 Mobile App Guidelines

### Navigation Pattern
**Bottom Tab Navigation** (Material Design 3)

```typescript
// Tab Structure
tabs: [
  { name: 'Dashboard', icon: 'view-dashboard' },
  { name: 'Scripts', icon: 'file-document' },
  { name: 'Exams', icon: 'clipboard-check' },
  { name: 'Incidents', icon: 'alert-circle' },
  { name: 'Profile', icon: 'account' },
]
```

### Mobile-Specific Components

#### List Items
```typescript
// Material Design 3 List Item
<List.Item
  title="Student Name"
  description="ID: STU001"
  left={props => <Avatar.Text {...props} label="SN" />}
  right={props => <List.Icon {...props} icon="chevron-right" />}
/>
```

#### Floating Action Button (FAB)
```typescript
<FAB
  icon="plus"
  style={styles.fab}
  onPress={() => navigation.navigate('CreateExam')}
/>
```

#### Bottom Sheet
```typescript
<BottomSheet
  snapPoints={['25%', '50%', '90%']}
  enablePanDownToClose
>
  {/* Sheet content */}
</BottomSheet>
```

### Touch Targets
- Minimum size: **44x44dp**
- Spacing between targets: **8dp**
- Icon buttons: **48x48dp**

### Mobile Typography Scale
Use the Material Design 3 scale defined in Typography section

---

## ♿ Accessibility

### WCAG 2.1 Level AA Compliance

#### Color Contrast
- Normal text: **4.5:1** minimum
- Large text (18pt+): **3:1** minimum
- UI components: **3:1** minimum

#### Keyboard Navigation
```tsx
// All interactive elements must be keyboard accessible
<Button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
  Action
</Button>
```

#### ARIA Labels
```tsx
// Proper labeling
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Form labels
<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" aria-required="true" />

// Status messages
<div role="alert" aria-live="polite">
  Form submitted successfully
</div>
```

#### Focus States
```css
/* Visible focus indicators */
*:focus-visible {
  outline: 3px solid var(--ring);
  outline-offset: 2px;
}

/* Custom focus styles */
.btn:focus-visible {
  ring: 3px solid var(--ring)/50;
}
```

#### Screen Reader Support
```tsx
// Skip to content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Semantic HTML
<main id="main-content">
  <h1>Page Title</h1>
  <nav aria-label="Primary navigation">
    {/* Navigation */}
  </nav>
</main>
```

---

## 🛠️ Implementation Guidelines

### Component Architecture

#### Component Naming
```typescript
// Page Components: [Feature]Page
LoginPage.tsx
DashboardPage.tsx
InstitutionsPage.tsx

// Feature Components: [Feature][Component]
InstitutionCard.tsx
InstitutionForm.tsx
InstitutionList.tsx

// UI Components: [Component]
Button.tsx
Card.tsx
Dialog.tsx
```

#### File Structure
```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── layout/          # Layout components
│   ├── academic/        # Academic feature components
│   ├── auth/            # Auth components
│   └── [feature]/       # Feature-specific components
├── pages/               # Page components
├── styles/              # Global styles
└── lib/                 # Utilities
```

### Styling Conventions

#### Tailwind Class Order
```tsx
// 1. Layout (display, position)
// 2. Box model (width, height, padding, margin)
// 3. Typography
// 4. Visual (background, border)
// 5. Misc (transform, transition)

<div className="
  flex items-center justify-between
  w-full p-4 mb-4
  text-lg font-semibold
  bg-white border border-gray-200 rounded-lg
  transition-all hover:shadow-lg
">
```

#### Custom Classes via CVA
```typescript
import { cva } from "class-variance-authority";

const cardVariants = cva(
  "rounded-lg border p-6 transition-all",
  {
    variants: {
      variant: {
        default: "bg-white border-gray-200",
        highlighted: "bg-blue-50 border-blue-200",
        error: "bg-red-50 border-red-200",
      },
      size: {
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    }
  }
);
```

### Performance Best Practices

#### Code Splitting
```typescript
// Lazy load pages
const InstitutionsPage = lazy(() => import('@/pages/InstitutionsPage'));

// Suspense boundary
<Suspense fallback={<LoadingSpinner />}>
  <InstitutionsPage />
</Suspense>
```

#### Image Optimization
```tsx
// Use next/image or optimized images
<img
  src="/images/logo.png"
  alt="ELMS Logo"
  loading="lazy"
  width={200}
  height={60}
/>
```

#### Memoization
```typescript
// Expensive computations
const filteredData = useMemo(
  () => data.filter(item => item.status === 'active'),
  [data]
);

// Callbacks
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

---

## 📋 Design Checklist

### Before Starting Design
- [ ] Review brand identity and color palette
- [ ] Set up design tokens in code
- [ ] Configure Tailwind/theme properly
- [ ] Install and configure shadcn/ui
- [ ] Set up typography scale

### For Each Component
- [ ] Follow naming conventions
- [ ] Use design tokens (no hardcoded values)
- [ ] Include all interactive states (hover, focus, active, disabled)
- [ ] Test keyboard navigation
- [ ] Verify color contrast
- [ ] Add ARIA labels where needed
- [ ] Test responsive behavior
- [ ] Test in dark mode

### Before Release
- [ ] Accessibility audit (WAVE, axe)
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance audit (Lighthouse)
- [ ] Design system documentation complete

---

## 🎯 Next Steps

### Immediate Actions

1. **Update Color Palette**
   - Change primary color to blue (#2563eb) for academic feel
   - Ensure all semantic colors are properly defined

2. **Typography Enhancement**
   - Add Inter font to web application
   - Implement responsive typography scale

3. **Component Audit**
   - Review all existing components against this guide
   - Add missing variants and states
   - Ensure consistency across features

4. **Documentation**
   - Create component storybook/showcase
   - Document custom components
   - Add usage examples

5. **Mobile Alignment**
   - Sync color palette with mobile app
   - Ensure consistent spacing and typography
   - Create shared design tokens file

### Future Enhancements

- [ ] Motion design system
- [ ] Illustration library
- [ ] Email templates design
- [ ] Print styles for reports
- [ ] Data visualization guidelines
- [ ] Chart and graph components

---

## 📚 Resources

### Design Tools
- **Figma**: For mockups and prototypes
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **Material Design 3**: https://m3.material.io

### Accessibility
- **WAVE**: https://wave.webaim.org
- **axe DevTools**: https://www.deque.com/axe
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref

### Color Tools
- **Contrast Checker**: https://webaim.org/resources/contrastchecker
- **OKLCH Color Picker**: https://oklch.com
- **Tailwind Color Generator**: https://uicolors.app

---

**Document Version**: 1.0
**Last Updated**: October 21, 2025
**Maintained By**: ELMS Development Team
