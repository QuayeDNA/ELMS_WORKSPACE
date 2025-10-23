import { ReactNode } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
  value?: string | string[] | number | boolean | null;
  onChange?: (value: string | string[] | number | boolean | null) => void;
  customComponent?: ReactNode;
}

export interface SearchAndFilterProps {
  // Search
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;

  // Sort
  sortOptions?: SortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  showSort?: boolean;
  sortLabel?: string;

  // Filters
  filterGroups?: FilterGroup[];
  showFilters?: boolean;
  filterLabel?: string;

  // Actions
  onClearAll?: () => void;
  showClearAll?: boolean;

  // Custom content
  leftContent?: ReactNode;
  rightContent?: ReactNode;

  // Styling
  className?: string;
  searchClassName?: string;
  compact?: boolean;
}

export function SearchAndFilter({
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showSearch = true,
  sortOptions = [],
  sortValue,
  onSortChange,
  showSort = true,
  sortLabel = 'Sort by',
  filterGroups = [],
  showFilters = true,
  filterLabel = 'Filters',
  onClearAll,
  showClearAll = true,
  leftContent,
  rightContent,
  className,
  searchClassName,
  compact = false,
}: SearchAndFilterProps) {
  // Calculate active filters count
  const activeFiltersCount = filterGroups.reduce((count, group) => {
    if (group.value) {
      if (Array.isArray(group.value)) {
        return count + group.value.length;
      }
      return count + 1;
    }
    return count;
  }, 0);

  const hasActiveFilters = activeFiltersCount > 0 || searchValue.length > 0;

  const handleClearAll = () => {
    onSearchChange?.('');
    filterGroups.forEach((group) => {
      if (group.type === 'multiselect') {
        group.onChange?.([]);
      } else {
        group.onChange?.('');
      }
    });
    onClearAll?.();
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'flex flex-col gap-3',
          compact ? 'sm:flex-row sm:items-center' : 'md:flex-row md:items-center'
        )}
      >
        {/* Left Section: Search + Custom Left Content */}
        <div className="flex flex-1 items-center gap-2">
          {leftContent}

          {showSearch && (
            <div className={cn('relative flex-1', searchClassName)}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className={cn('pl-9', searchValue && 'pr-9')}
              />
              {searchValue && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Sort + Filters + Custom Right Content */}
        <div className="flex items-center gap-2">
          {showSort && sortOptions.length > 0 && (
            <Select value={sortValue} onValueChange={onSortChange}>
              <SelectTrigger className={cn(compact ? 'w-[140px]' : 'w-[180px]')}>
                <SelectValue placeholder={sortLabel} />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showFilters && filterGroups.length > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size={compact ? 'sm' : 'default'} className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="hidden sm:inline">{filterLabel}</span>
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm">Filter Options</h4>
                    {hasActiveFilters && showClearAll && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearAll}
                        className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear all
                      </Button>
                    )}
                  </div>

                  {filterGroups.map((group) => (
                    <div key={group.id} className="space-y-2">
                      <label className="text-sm font-medium">{group.label}</label>

                      {group.type === 'select' && group.options && (
                        <Select
                          value={typeof group.value === 'string' ? group.value : ''}
                          onValueChange={group.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${group.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {group.options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center justify-between w-full">
                                  <span>{option.label}</span>
                                  {option.count !== undefined && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      ({option.count})
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {group.type === 'multiselect' && group.options && (
                        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-2">
                          {group.options.map((option) => {
                            const values = Array.isArray(group.value) ? group.value : [];
                            return (
                              <label
                                key={option.value}
                                className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={values.includes(option.value)}
                                  onChange={(e) => {
                                    const newValues = e.target.checked
                                      ? [...values, option.value]
                                      : values.filter((v) => v !== option.value);
                                    group.onChange?.(newValues);
                                  }}
                                  className="rounded border-gray-300"
                                />
                                <span className="text-sm flex-1">{option.label}</span>
                                {option.count !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    ({option.count})
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      )}

                      {group.type === 'radio' && group.options && (
                        <div className="space-y-2">
                          {group.options.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-sm"
                            >
                              <input
                                type="radio"
                                checked={group.value === option.value}
                                onChange={() => group.onChange?.(option.value)}
                                className="border-gray-300"
                              />
                              <span className="text-sm flex-1">{option.label}</span>
                              {option.count !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  ({option.count})
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      )}

                      {group.type === 'custom' && group.customComponent}
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {rightContent}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>

          {searchValue && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchValue}"
              <button
                onClick={() => onSearchChange?.('')}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filterGroups.map((group) => {
            if (!group.value) return null;

            if (Array.isArray(group.value) && group.value.length > 0) {
              return group.value.map((val: string) => {
                const option = group.options?.find((opt) => opt.value === val);
                return (
                  <Badge key={`${group.id}-${val}`} variant="secondary" className="gap-1">
                    {group.label}: {option?.label || val}
                    <button
                      onClick={() => {
                        const newValues = group.value && Array.isArray(group.value)
                          ? group.value.filter((v) => v !== val)
                          : [];
                        group.onChange?.(newValues);
                      }}
                      className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              });
            }

            if (typeof group.value === 'string' && group.value) {
              const option = group.options?.find((opt) => opt.value === group.value);
              return (
                <Badge key={group.id} variant="secondary" className="gap-1">
                  {group.label}: {option?.label || group.value}
                  <button
                    onClick={() => group.onChange?.('')}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            }

            return null;
          })}

          {showClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-6 px-2 text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
