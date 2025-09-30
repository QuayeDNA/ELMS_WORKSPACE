import { Search, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  InstitutionFilters,
  InstitutionType,
  InstitutionStatus,
  INSTITUTION_TYPE_OPTIONS,
  INSTITUTION_STATUS_OPTIONS,
  DEFAULT_INSTITUTION_FILTERS,
} from '@/types/institution';

// ========================================
// INTERFACE DEFINITIONS
// ========================================

interface InstitutionFiltersProps {
  filters: InstitutionFilters;
  onFiltersChange: (filters: InstitutionFilters) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

// ========================================
// COMPONENT
// ========================================

export const InstitutionFiltersComponent = ({
  filters,
  onFiltersChange,
  onClearFilters,
  loading = false,
}: InstitutionFiltersProps) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({
      ...filters,
      search: value,
    });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      type: value === 'ALL' ? 'ALL' : (value as InstitutionType),
    });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      status: value === 'ALL' ? 'ALL' : (value as InstitutionStatus),
    });
  };

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as 'name' | 'code' | 'createdAt' | 'updatedAt',
    });
  };

  const handleSortOrderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortOrder: value as 'asc' | 'desc',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'ALL') count++;
    if (filters.status !== 'ALL') count++;
    if (filters.sortBy !== DEFAULT_INSTITUTION_FILTERS.sortBy) count++;
    if (filters.sortOrder !== DEFAULT_INSTITUTION_FILTERS.sortOrder) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Search and Main Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search institutions by name, code, or city..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
            disabled={loading}
          />
        </div>
        
        <div className="flex gap-2">
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Institution Type Filter */}
        <div className="flex-1">
          <label htmlFor='institution-type' className="block text-sm font-medium text-gray-700 mb-1">
            Institution Type
          </label>
          <Select
            value={filters.type}
            onValueChange={handleTypeChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {INSTITUTION_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="flex-1">
          <label htmlFor='institution-status' className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            value={filters.status}
            onValueChange={handleStatusChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              {INSTITUTION_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="flex-1">
          <label htmlFor='institution-sort-by' className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <Select
            value={filters.sortBy}
            onValueChange={handleSortByChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="code">Code</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Order */}
        <div className="flex-1">
          <label htmlFor='institution-sort-order' className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <Select
            value={filters.sortOrder}
            onValueChange={handleSortOrderChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600 flex items-center">
            <Filter className="h-3 w-3 mr-1" />
            Active filters:
          </span>
          
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: "{filters.search}"
              <button
                onClick={() => handleSearchChange('')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.type !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Type: {INSTITUTION_TYPE_OPTIONS.find(t => t.value === filters.type)?.label}
              <button
                onClick={() => handleTypeChange('ALL')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.status !== 'ALL' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {INSTITUTION_STATUS_OPTIONS.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleStatusChange('ALL')}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.sortBy !== DEFAULT_INSTITUTION_FILTERS.sortBy && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {filters.sortBy}
              <button
                onClick={() => handleSortByChange(DEFAULT_INSTITUTION_FILTERS.sortBy)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {filters.sortOrder !== DEFAULT_INSTITUTION_FILTERS.sortOrder && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Order: {filters.sortOrder}
              <button
                onClick={() => handleSortOrderChange(DEFAULT_INSTITUTION_FILTERS.sortOrder)}
                className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default InstitutionFiltersComponent;



