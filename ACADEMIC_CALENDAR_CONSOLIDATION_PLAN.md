# Academic Calendar Consolidation Plan

## Overview
Consolidate the scattered Academic Years, Semesters, and Periods pages into a single cohesive Academic Calendar management interface.

## Current State
- **AcademicYearsPage.tsx** - Separate page for managing academic years
- **SemestersPage.tsx** - Separate page for managing semesters
- **AcademicPeriodsPage.tsx** - Separate page for managing academic periods
- **Issue**: Users must navigate between 3 different pages to set up a complete academic calendar

## Proposed Solution

### Single Page Flow: Academic Calendar Page

#### 1. Main View - Academic Years List
```
┌─────────────────────────────────────────────────────┐
│ Academic Calendar                    [+ New Year]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Current Academic Year Card (Highlighted)            │
│  ┌──────────────────────────────────────────┐      │
│  │ 📅 2024/2025               [✓ Current]   │      │
│  │ Sept 1, 2024 - Aug 31, 2025              │      │
│  │ 2 Semesters | View Details →             │      │
│  └──────────────────────────────────────────┘      │
│                                                      │
│  Other Academic Years                               │
│  [Year Cards in Grid/Table View]                    │
└─────────────────────────────────────────────────────┘
```

#### 2. Academic Year Detail View (Modal or Slide-over)
```
┌─────────────────────────────────────────────────────┐
│ ← Back to List    Academic Year 2024/2025           │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Year Information                                     │
│ Code: 2024/2025                                      │
│ Period: Sept 1, 2024 - Aug 31, 2025                 │
│ Status: [✓ Current Year]                            │
│                                                      │
│ ─────────────────────────────────────────────────   │
│                                                      │
│ Semesters & Academic Calendar    [+ Add Semester]   │
│                                                      │
│ ┌─ Semester 1 (Fall 2024) ─────────────────────┐   │
│ │  Sept 1 - Dec 20, 2024    [✓ Current]  [Edit] │   │
│ │                                                 │   │
│ │  📋 Academic Period Configuration               │   │
│ │  ├─ Registration: Aug 15 - Aug 30, 2024        │   │
│ │  ├─ Add/Drop: Sept 1 - Sept 15, 2024           │   │
│ │  ├─ Lectures: Sept 1 - Dec 10, 2024            │   │
│ │  ├─ Exams: Dec 11 - Dec 20, 2024  [📅 Timetable]│   │
│ │  └─ Results Release: Jan 5, 2025                │   │
│ │                                                 │   │
│ │  Credits: Min 12 - Max 18                       │   │
│ │  Late Registration Fee: $50                     │   │
│ └─────────────────────────────────────────────────┘   │
│                                                      │
│ ┌─ Semester 2 (Spring 2025) ──────────────────┐    │
│ │  Jan 6 - May 15, 2025           [Edit]       │    │
│ │  📋 [Configure Academic Period]              │    │
│ └─────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Data Hierarchy

```
Institution
  └─ Academic Year (2024/2025)
      ├─ Semester 1 (Fall)
      │   └─ Academic Period (Calendar configuration)
      │       ├─ Registration Dates
      │       ├─ Add/Drop Period
      │       ├─ Lecture Period
      │       ├─ Exam Period ──┐
      │       └─ Results Date   │
      │                         │
      │       ┌─────────────────┘
      │       └─→ Exam Timetable (linked to exam period)
      │
      └─ Semester 2 (Spring)
          └─ Academic Period
              └─ ...
```

## Implementation Components

### 1. Main Page Component
**File**: `AcademicCalendarPage.tsx`
- Replaces: AcademicYearsPage, SemestersPage, AcademicPeriodsPage
- Features:
  - List view of academic years (grid/table switchable)
  - Current year highlighting
  - Search and filters
  - Create new academic year action

### 2. Academic Year Detail Component
**File**: `AcademicYearDetailView.tsx`
- Modal or drawer for year details
- Semester list with accordion/expandable sections
- Each semester shows its academic period calendar
- Quick actions for add/edit/delete

### 3. Semester Form Component
**File**: `SemesterForm.tsx`
- Create/edit semester
- Basic info: name, number, dates
- Integrated academic period configuration
- All-in-one form

### 4. Academic Period Calendar Component
**File**: `AcademicPeriodCalendar.tsx`
- Visual timeline of periods
- Inline editing of dates
- Status indicators (open/closed registration, etc.)
- Link to exam timetable upload

### 5. Exam Timetable Link
**Component**: Quick action from exam period
- Button: "Upload Exam Timetable"
- Pre-fills exam period dates
- Redirects to exam timetable page with context

## User Permissions
- **SUPER_ADMIN**: Full access to all institutions
- **ADMIN**: Manage their own institution's calendar
- **FACULTY_ADMIN**: View only (read access)
- **Other roles**: View current year/semester only

## API Integration Points

### Academic Years
- GET `/api/academic-periods/academic-years` - List years
- POST `/api/academic-periods/academic-years` - Create year
- PUT `/api/academic-periods/academic-years/:id` - Update year
- DELETE `/api/academic-periods/academic-years/:id` - Delete year
- PATCH `/api/academic-periods/academic-years/:id/set-current` - Set current

### Semesters
- GET `/api/academic-periods/semesters?academicYearId=X` - List semesters for year
- POST `/api/academic-periods/semesters` - Create semester
- PUT `/api/academic-periods/semesters/:id` - Update semester
- DELETE `/api/academic-periods/semesters/:id` - Delete semester
- PATCH `/api/academic-periods/semesters/:id/set-current` - Set current

### Academic Periods
- GET `/api/academic-periods/periods/semester/:semesterId` - Get period for semester
- POST `/api/academic-periods/periods` - Create period
- PUT `/api/academic-periods/periods/:id` - Update period
- DELETE `/api/academic-periods/periods/:id` - Delete period
- POST `/api/academic-periods/periods/:id/open-registration` - Open registration
- POST `/api/academic-periods/periods/:id/close-registration` - Close registration
- POST `/api/academic-periods/periods/:id/open-add-drop` - Open add/drop
- POST `/api/academic-periods/periods/:id/close-add-drop` - Close add/drop

## Response Transformation Strategy

### Current Issue (from ACADEMIC_CALENDAR_FIX_SUMMARY.md)
```typescript
// Backend returns
{
  success: true,
  data: [...],
  pagination: { page: 1, limit: 10, total: 20, pages: 2 }
}

// Frontend expects
{
  success: true,
  data: [...],
  pagination: { page: 1, totalPages: 2, total: 20, hasNext: true, hasPrev: false }
}
```

### Solution Pattern
All academic service methods transform backend `pages` to frontend `totalPages`:

```typescript
const backendPagination = response.pagination || {};
const totalPages = backendPagination.pages || backendPagination.totalPages || 1;
const page = backendPagination.page || query?.page || 1;

return {
  success: response.success,
  data: response.data,
  pagination: {
    page,
    totalPages,
    total: backendPagination.total || response.data.length,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    limit: backendPagination.limit || query?.limit || 10
  }
};
```

## Migration Steps

1. ✅ **Phase 1**: Create new consolidated page
   - Build AcademicCalendarPage with year list
   - Implement year detail view with semesters
   - Add academic period calendar display

2. ✅ **Phase 2**: Forms and CRUD operations
   - Academic year form (create/edit)
   - Semester form with period configuration
   - Period configuration form/inline editing

3. ✅ **Phase 3**: Update routing
   - Replace 3 separate routes with 1
   - Update sidebar navigation
   - Add breadcrumb navigation

4. ✅ **Phase 4**: Delete old pages
   - Remove AcademicYearsPage.tsx
   - Remove SemestersPage.tsx
   - Remove AcademicPeriodsPage.tsx

5. ✅ **Phase 5**: Exam timetable integration
   - Link exam period to timetable upload
   - Pre-fill dates from academic period

## UI/UX Enhancements

### Visual Calendar Timeline
```
Registration  Add/Drop    Lectures           Exams        Results
    │──────────│──────────│─────────────────│──────────│────>
  Aug 15      Sept 1     Sept 15          Dec 10     Dec 20  Jan 5
```

### Status Indicators
- 🟢 Registration Open
- 🟡 Add/Drop Period
- 🔵 Lectures in Progress
- 🔴 Exam Period
- ⚪ Completed

### Quick Actions
- "Set as Current" for year/semester
- "Open/Close Registration" toggle
- "Open/Close Add/Drop" toggle
- "Upload Exam Timetable" → pre-fills dates

## Testing Checklist

- [ ] List academic years with pagination
- [ ] Create new academic year
- [ ] Edit academic year
- [ ] Delete academic year
- [ ] Set current academic year
- [ ] View year details with semesters
- [ ] Create semester within year
- [ ] Edit semester
- [ ] Delete semester
- [ ] Configure academic period for semester
- [ ] Update academic period
- [ ] Open/close registration
- [ ] Open/close add/drop
- [ ] View academic period timeline
- [ ] Link to exam timetable upload
- [ ] Proper response transformation (pages → totalPages)
- [ ] Error handling for all operations
- [ ] Loading states for all operations
- [ ] Toast notifications for actions
- [ ] Mobile responsive design

## Benefits

1. **Simplified Workflow**: Single page for entire calendar setup
2. **Better UX**: Natural hierarchy (Year → Semester → Period)
3. **Reduced Navigation**: No more jumping between 3 pages
4. **Contextual Actions**: Everything in context (e.g., upload timetable from exam period)
5. **Data Consistency**: Clear parent-child relationships
6. **Easier Onboarding**: New admins understand the flow easily
