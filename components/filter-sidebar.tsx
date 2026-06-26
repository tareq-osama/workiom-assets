'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

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
      {title && <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>}
      <div className="space-y-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              onClick={() => onToggle(option)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors border ${
                isSelected
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FilterSidebar({ filters, setFilters, categories }: FilterSidebarProps) {
  const activeCount = filters.categories.length;

  function toggleCategory(cat: string) {
    setFilters({
      ...filters,
      categories: filters.categories.includes(cat)
        ? filters.categories.filter((c) => c !== cat)
        : [...filters.categories, cat],
    });
  }

  function clearAll() {
    setFilters({ categories: [], statuses: [], fileTypes: [] });
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-slate-900">Filter by Category</h2>
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

      {categories.length > 0 && (
        <FilterGroup
          title=""
          options={categories}
          selected={filters.categories}
          onToggle={toggleCategory}
        />
      )}
    </div>
  );
}
