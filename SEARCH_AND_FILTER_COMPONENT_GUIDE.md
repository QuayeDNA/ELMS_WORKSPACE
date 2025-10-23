# SearchAndFilter Component Documentation

## Overview

The `SearchAndFilter` component is a flexible, reusable component for implementing search, sort, and filter functionality across the application. It provides a consistent UX with support for various filter types and customization options.

## Location

`frontend/src/components/shared/SearchAndFilter.tsx`

## Features

- ✅ **Search** - Text-based search with clear button
- ✅ **Sort** - Dropdown sorting with custom options
- ✅ **Filters** - Multiple filter types (select, multiselect, radio, checkbox, date-range, custom)
- ✅ **Active Filters Display** - Visual badges showing active filters with individual remove buttons
- ✅ **Clear All** - Single button to reset all filters
- ✅ **Custom Content** - Slots for custom left/right content (e.g., view switchers, action buttons)
- ✅ **Responsive** - Mobile-friendly with compact mode
- ✅ **Accessible** - Keyboard navigation and screen reader support

---

## Basic Usage

### Simple Search Only

```tsx
import { SearchAndFilter } from '@/components/shared/SearchAndFilter';

function MyPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SearchAndFilter
      searchPlaceholder="Search users..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      showSort={false}
      showFilters={false}
    />
  );
}
```

### Search + Sort

```tsx
<SearchAndFilter
  searchPlaceholder="Search products..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  sortOptions={[
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Price (Low to High)', value: 'price_asc' },
    { label: 'Price (High to Low)', value: 'price_desc' },
  ]}
  sortValue={sortOrder}
  onSortChange={setSortOrder}
  showFilters={false}
/>
```

### Search + Sort + Filters

```tsx
<SearchAndFilter
  searchPlaceholder="Search academic years..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  sortOptions={[
    { label: 'Newest First', value: 'desc' },
    { label: 'Oldest First', value: 'asc' },
  ]}
  sortValue={sortOrder}
  onSortChange={setSortOrder}
  filterGroups={[
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All', value: '' },
        { label: 'Active', value: 'active', count: 5 },
        { label: 'Inactive', value: 'inactive', count: 12 },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      id: 'institution',
      label: 'Institution',
      type: 'multiselect',
      options: [
        { label: 'University A', value: 'uni_a', count: 45 },
        { label: 'University B', value: 'uni_b', count: 23 },
        { label: 'College C', value: 'college_c', count: 12 },
      ],
      value: selectedInstitutions,
      onChange: setSelectedInstitutions,
    },
  ]}
/>
```

---

## Props API

### Core Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | - | Additional CSS classes |
| `compact` | `boolean` | `false` | Compact mode for smaller screens |

### Search Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSearch` | `boolean` | `true` | Show/hide search input |
| `searchPlaceholder` | `string` | `"Search..."` | Placeholder text |
| `searchValue` | `string` | `""` | Current search value |
| `onSearchChange` | `(value: string) => void` | - | Search change handler |
| `searchClassName` | `string` | - | Additional classes for search input |

### Sort Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSort` | `boolean` | `true` | Show/hide sort dropdown |
| `sortOptions` | `SortOption[]` | `[]` | Array of sort options |
| `sortValue` | `string` | - | Current sort value |
| `onSortChange` | `(value: string) => void` | - | Sort change handler |
| `sortLabel` | `string` | `"Sort by"` | Sort dropdown label |

### Filter Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showFilters` | `boolean` | `true` | Show/hide filters button |
| `filterGroups` | `FilterGroup[]` | `[]` | Array of filter groups |
| `filterLabel` | `string` | `"Filters"` | Filters button label |

### Clear All Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showClearAll` | `boolean` | `true` | Show/hide clear all button |
| `onClearAll` | `() => void` | - | Additional handler when clearing all |

### Custom Content Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftContent` | `ReactNode` | - | Custom content before search |
| `rightContent` | `ReactNode` | - | Custom content after filters |

---

## Filter Types

### 1. Select (Single Selection)

Dropdown with single selection:

```tsx
{
  id: 'category',
  label: 'Category',
  type: 'select',
  options: [
    { label: 'All Categories', value: '' },
    { label: 'Electronics', value: 'electronics', count: 120 },
    { label: 'Clothing', value: 'clothing', count: 85 },
    { label: 'Books', value: 'books', count: 203 },
  ],
  value: categoryFilter,
  onChange: setCategoryFilter,
}
```

### 2. Multiselect (Multiple Checkboxes)

Multiple selection with checkboxes:

```tsx
{
  id: 'tags',
  label: 'Tags',
  type: 'multiselect',
  options: [
    { label: 'New', value: 'new', count: 15 },
    { label: 'Featured', value: 'featured', count: 8 },
    { label: 'Sale', value: 'sale', count: 23 },
  ],
  value: selectedTags, // Array of strings
  onChange: setSelectedTags,
}
```

### 3. Radio (Single Selection with Radio Buttons)

Single selection with radio buttons:

```tsx
{
  id: 'availability',
  label: 'Availability',
  type: 'radio',
  options: [
    { label: 'All Items', value: 'all', count: 450 },
    { label: 'In Stock', value: 'in_stock', count: 320 },
    { label: 'Out of Stock', value: 'out_of_stock', count: 130 },
  ],
  value: availabilityFilter,
  onChange: setAvailabilityFilter,
}
```

### 4. Custom (Your Own Component)

Use custom components for complex filters:

```tsx
{
  id: 'date_range',
  label: 'Date Range',
  type: 'custom',
  customComponent: (
    <div className="space-y-2">
      <Input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        placeholder="Start date"
      />
      <Input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        placeholder="End date"
      />
    </div>
  ),
}
```

---

## Real-World Examples

### Example 1: Academic Calendar (Current Implementation)

```tsx
<SearchAndFilter
  searchPlaceholder="Search academic years..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  sortOptions={[
    { label: 'Newest First', value: 'desc' },
    { label: 'Oldest First', value: 'asc' },
  ]}
  sortValue={sortOrder}
  onSortChange={(value) => setSortOrder(value as 'asc' | 'desc')}
  rightContent={
    <div className="flex gap-1 border rounded-lg p-1 bg-muted/50">
      <Button
        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('grid')}
      >
        <Grid3x3 className="h-4 w-4" />
        Grid
      </Button>
      <Button
        variant={viewMode === 'table' ? 'secondary' : 'ghost'}
        size="sm"
        onClick={() => setViewMode('table')}
      >
        <Table2 className="h-4 w-4" />
        Table
      </Button>
    </div>
  }
/>
```

### Example 2: Students Page with Multiple Filters

```tsx
const [searchTerm, setSearchTerm] = useState('');
const [sortOrder, setSortOrder] = useState('name_asc');
const [programFilter, setProgramFilter] = useState('');
const [statusFilter, setStatusFilter] = useState([]);
const [yearFilter, setYearFilter] = useState('');

<SearchAndFilter
  searchPlaceholder="Search students by name, ID, or email..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  sortOptions={[
    { label: 'Name (A-Z)', value: 'name_asc' },
    { label: 'Name (Z-A)', value: 'name_desc' },
    { label: 'Recently Added', value: 'created_desc' },
    { label: 'Student ID', value: 'id_asc' },
  ]}
  sortValue={sortOrder}
  onSortChange={setSortOrder}
  filterGroups={[
    {
      id: 'program',
      label: 'Program',
      type: 'select',
      options: programs.map(p => ({
        label: p.name,
        value: p.id.toString(),
        count: p.studentCount,
      })),
      value: programFilter,
      onChange: setProgramFilter,
    },
    {
      id: 'status',
      label: 'Status',
      type: 'multiselect',
      options: [
        { label: 'Active', value: 'active', count: 450 },
        { label: 'Inactive', value: 'inactive', count: 23 },
        { label: 'Graduated', value: 'graduated', count: 1205 },
        { label: 'Suspended', value: 'suspended', count: 5 },
      ],
      value: statusFilter,
      onChange: setStatusFilter,
    },
    {
      id: 'year',
      label: 'Academic Year',
      type: 'radio',
      options: [
        { label: 'All Years', value: '', count: 1683 },
        { label: 'Year 1', value: '1', count: 423 },
        { label: 'Year 2', value: '2', count: 398 },
        { label: 'Year 3', value: '3', count: 367 },
        { label: 'Year 4', value: '4', count: 495 },
      ],
      value: yearFilter,
      onChange: setYearFilter,
    },
  ]}
  leftContent={
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" />
      Export
    </Button>
  }
  rightContent={
    <Button size="sm" onClick={handleAddStudent}>
      <Plus className="h-4 w-4 mr-2" />
      Add Student
    </Button>
  }
/>
```

### Example 3: Courses with Custom Date Filter

```tsx
<SearchAndFilter
  searchPlaceholder="Search courses..."
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  sortOptions={[
    { label: 'Course Code', value: 'code_asc' },
    { label: 'Course Name', value: 'name_asc' },
    { label: 'Credits', value: 'credits_desc' },
  ]}
  sortValue={sortOrder}
  onSortChange={setSortOrder}
  filterGroups={[
    {
      id: 'department',
      label: 'Department',
      type: 'select',
      options: departments.map(d => ({
        label: d.name,
        value: d.id.toString(),
        count: d.courseCount,
      })),
      value: departmentFilter,
      onChange: setDepartmentFilter,
    },
    {
      id: 'level',
      label: 'Course Level',
      type: 'multiselect',
      options: [
        { label: '100 Level', value: '100', count: 45 },
        { label: '200 Level', value: '200', count: 38 },
        { label: '300 Level', value: '300', count: 42 },
        { label: '400 Level', value: '400', count: 35 },
      ],
      value: levelFilter,
      onChange: setLevelFilter,
    },
    {
      id: 'semester',
      label: 'Semester Offered',
      type: 'custom',
      customComponent: (
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={semesterFilter.includes('fall')}
              onChange={(e) => {
                setSemesterFilter(prev =>
                  e.target.checked
                    ? [...prev, 'fall']
                    : prev.filter(s => s !== 'fall')
                );
              }}
            />
            <span className="text-sm">Fall Semester</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={semesterFilter.includes('spring')}
              onChange={(e) => {
                setSemesterFilter(prev =>
                  e.target.checked
                    ? [...prev, 'spring']
                    : prev.filter(s => s !== 'spring')
                );
              }}
            />
            <span className="text-sm">Spring Semester</span>
          </label>
        </div>
      ),
    },
  ]}
/>
```

---

## Styling & Customization

### Compact Mode

For pages with limited space:

```tsx
<SearchAndFilter
  compact={true}
  searchPlaceholder="Search..."
  // ... other props
/>
```

### Custom Search Width

```tsx
<SearchAndFilter
  searchClassName="max-w-md"
  // ... other props
/>
```

### Additional Container Styling

```tsx
<SearchAndFilter
  className="bg-muted/30 p-4 rounded-lg"
  // ... other props
/>
```

---

## Active Filters Display

The component automatically displays active filters as removable badges below the search bar:

- **Search term** appears as: `Search: "query"`
- **Single select filters** appear as: `Category: Electronics`
- **Multiselect filters** appear as multiple badges: `Status: Active`, `Status: Pending`
- Each badge has an **X button** to remove that specific filter
- **Clear all button** removes all filters at once

---

## Best Practices

### 1. Use Meaningful Labels

```tsx
// ❌ Bad
filterGroups={[
  { id: 'filter1', label: 'Filter 1', type: 'select', ... }
]}

// ✅ Good
filterGroups={[
  { id: 'department', label: 'Department', type: 'select', ... }
]}
```

### 2. Show Counts When Possible

```tsx
// ✅ Helps users understand data distribution
options: [
  { label: 'Active', value: 'active', count: 450 },
  { label: 'Inactive', value: 'inactive', count: 23 },
]
```

### 3. Provide "All" Option for Select Filters

```tsx
options: [
  { label: 'All Categories', value: '' }, // Empty value = no filter
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
]
```

### 4. Use Appropriate Filter Types

- **Select**: 5-10 options, single choice
- **Radio**: 3-5 options, single choice, need to see all options
- **Multiselect**: 3-15 options, multiple choices
- **Custom**: Complex filters (date ranges, sliders, etc.)

### 5. Debounce Search Input

```tsx
import { useDebounce } from '@/hooks/useDebounce';

const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounce(searchInput, 300);

// Use debouncedSearch for API calls
useEffect(() => {
  fetchData(debouncedSearch);
}, [debouncedSearch]);

// But use searchInput for the component
<SearchAndFilter
  searchValue={searchInput}
  onSearchChange={setSearchInput}
/>
```

---

## Integration with API Calls

### Example with useApiRequest Hook

```tsx
function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('name_asc');
  const [statusFilter, setStatusFilter] = useState([]);
  const [page, setPage] = useState(1);

  const { data, loading, error, execute } = useApiRequest(
    () =>
      studentService.getStudents({
        page,
        limit: 20,
        search: searchTerm,
        sortBy: sortOrder.split('_')[0],
        sortOrder: sortOrder.split('_')[1],
        status: statusFilter.join(','),
      }),
    [page, searchTerm, sortOrder, statusFilter],
    { immediate: true }
  );

  return (
    <div>
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPage(1); // Reset to first page on search
        }}
        sortValue={sortOrder}
        onSortChange={setSortOrder}
        filterGroups={[
          {
            id: 'status',
            label: 'Status',
            type: 'multiselect',
            options: [
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
            value: statusFilter,
            onChange: (value) => {
              setStatusFilter(value);
              setPage(1); // Reset to first page on filter change
            },
          },
        ]}
      />

      {/* Results display */}
      {loading && <LoadingSpinner />}
      {data && <StudentsList students={data.data} />}
    </div>
  );
}
```

---

## TypeScript Types

```typescript
export interface SortOption {
  label: string;
  value: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'checkbox' | 'radio' | 'date-range' | 'custom';
  options?: FilterOption[];
  value?: any;
  onChange?: (value: any) => void;
  customComponent?: ReactNode;
}
```

---

## Migration Guide

### Replacing Old Search/Filter Code

**Before:**
```tsx
<div className="flex gap-4">
  <Input
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
  <Select value={sort} onValueChange={setSort}>
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="asc">A-Z</SelectItem>
      <SelectItem value="desc">Z-A</SelectItem>
    </SelectContent>
  </Select>
</div>
```

**After:**
```tsx
<SearchAndFilter
  searchPlaceholder="Search..."
  searchValue={search}
  onSearchChange={setSearch}
  sortOptions={[
    { label: 'A-Z', value: 'asc' },
    { label: 'Z-A', value: 'desc' },
  ]}
  sortValue={sort}
  onSortChange={setSort}
/>
```

---

## Roadmap

Future enhancements:
- [ ] Date range picker filter type
- [ ] Number range slider filter type
- [ ] Save filter presets
- [ ] URL query parameter sync
- [ ] Export filter state
- [ ] Keyboard shortcuts

---

## Support

For issues or feature requests, please contact the development team or create an issue in the project repository.
