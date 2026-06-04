'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { STATUS_OPTIONS, FILE_TYPES } from '@/lib/constants';

export interface FilterState {
  categories: string[];
  statuses: string[];
  fileTypes: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  categories: string[]; // names only, fetched by the parent
}

function FilterGroup({
  title,
  options,
  selected,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => {
          const id = `filter-${title}-${option}`.replace(/\s+/g, '-').toLowerCase();
          return (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={selected.includes(option)}
                onCheckedChange={() => onToggle(option)}
              />
              <Label
                htmlFor={id}
                className="text-sm text-slate-600 cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {option}
              </Label>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterSidebar({ filters, setFilters, categories }: FilterSidebarProps) {
  const activeCount =
    filters.categories.length + filters.statuses.length + filters.fileTypes.length;

  function toggleCategory(cat: string) {
    setFilters({
      ...filters,
      categories: filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat],
    });
  }

  function toggleStatus(st: string) {
    setFilters({
      ...filters,
      statuses: filters.statuses.includes(st)
        ? filters.statuses.filter((s) => s !== st)
        : [...filters.statuses, st],
    });
  }

  function toggleFileType(ft: string) {
    setFilters({
      ...filters,
      fileTypes: filters.fileTypes.includes(ft)
        ? filters.fileTypes.filter((f) => f !== ft)
        : [...filters.fileTypes, ft],
    });
  }

  function clearAll() {
    setFilters({ categories: [], statuses: [], fileTypes: [] });
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Filters</h2>
          {activeCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5 bg-blue-100 text-blue-700 border-blue-200">
              {activeCount}
            </Badge>
          )}
        </div>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900" onClick={clearAll}>
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="space-y-5">
        {categories.length > 0 && (
          <FilterGroup
            title="Category"
            options={categories}
            selected={filters.categories}
            onToggle={toggleCategory}
          />
        )}

        <Separator />

        <FilterGroup
          title="Status"
          options={STATUS_OPTIONS}
          selected={filters.statuses}
          onToggle={toggleStatus}
        />

        <Separator />

        <FilterGroup
          title="File Type"
          options={FILE_TYPES}
          selected={filters.fileTypes}
          onToggle={toggleFileType}
        />
      </div>
    </div>
  );
}
